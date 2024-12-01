import { PerformanceConfig } from './PerformanceConfig';
import { PerformanceMetric } from './types';

interface LogData {
    type: string;
    name?: string;
    duration: number;
    threshold: number;
    details?: string;
}

export class PerformanceMetricsObserver {
    private config: PerformanceConfig;
    private observer?: PerformanceObserver;

    public constructor(config: PerformanceConfig) {
        this.config = config;
    }

    public start(): void {
        const isEnabled = this.isEnabled();

        if (isEnabled) {
            this.initObserver();

            this.observer!.observe({
                entryTypes: this.config.availableMetrics.filter(
                    metric => ![PerformanceMetric.FirstContentfulPaint, PerformanceMetric.FirstPaint].includes(metric),
                ),
            });

            console.info('[INFO] Performance metrics collection started.');
        }
    }

    public stop(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
            console.info('[INFO] Performance metrics collection stopped.');
        }
    }

    private isEnabled(): boolean {
        let isEnabled = true;
        if (!('PerformanceObserver' in window)) {
            isEnabled = false;
            console.warn('[WARNING] PerformanceObserver is not supported in this environment.');
        } else if (!this.config.enabled && this.config.availableMetrics.length === 0) {
            isEnabled = false;
            console.info('[INFO] Performance metrics collection is disabled.');
        }

        return isEnabled;
    }

    private initObserver(): void {
        this.observer = new PerformanceObserver(list => {
            const entries = list.getEntries();
            const filteredEntries = entries.filter(
                entry =>
                    this.config.isMetricEnabled(entry.entryType as PerformanceMetric) &&
                    this.config.getThreshold(entry.entryType as PerformanceMetric) !== undefined,
            );

            filteredEntries.forEach(entry => {
                this.monitorEntry(entry);
            });
        });
    }

    private monitorEntry(entry: PerformanceEntry): void {
        const entryType = entry.entryType as PerformanceMetric;

        const enityMonitors: Record<PerformanceMetric, (entry: PerformanceEntry) => void> = {
            [PerformanceMetric.Paint]: this.monitorPaintMetric.bind(this),
            [PerformanceMetric.Longtask]: this.monitorLongtaskMetric.bind(this),
            [PerformanceMetric.Resource]: this.defaultMonitor.bind(this),
            [PerformanceMetric.Navigation]: this.defaultMonitor.bind(this),
            [PerformanceMetric.FirstPaint]: this.defaultMonitor.bind(this),
            [PerformanceMetric.FirstContentfulPaint]: this.defaultMonitor.bind(this),
            [PerformanceMetric.FirstInput]: this.defaultMonitor.bind(this),
            [PerformanceMetric.LayoutShift]: this.defaultMonitor.bind(this),
            [PerformanceMetric.Event]: this.defaultMonitor.bind(this),
            [PerformanceMetric.LargestContentfulPaint]: this.defaultMonitor.bind(this),
            [PerformanceMetric.Element]: this.defaultMonitor.bind(this),
            [PerformanceMetric.LongAnimationFrame]: this.defaultMonitor.bind(this),
            [PerformanceMetric.VisibilityState]: this.defaultMonitor.bind(this),
        };

        const monitor = enityMonitors[entryType];

        monitor(entry);
    }

    private defaultMonitor(entry: PerformanceEntry): void {
        const entryType = entry.entryType as PerformanceMetric;
        const threshold = this.config.getThreshold(entryType);
        if (threshold && entry.duration > threshold) {
            this.logExceededThreshold({
                threshold,
                type: entryType,
                name: entry.name,
                duration: entry.duration,
            });
        } else if (this.config.logInfo) {
            this.logInfo({ type: entryType, name: entry.name, duration: entry.duration });
        }
    }

    private monitorPaintMetric(entry: PerformanceEntry): void {
        const paintName = entry.name as PerformanceMetric;
        if (
            [PerformanceMetric.FirstPaint, PerformanceMetric.FirstContentfulPaint].includes(paintName) &&
            this.config.isMetricEnabled(paintName)
        ) {
            const threshold = this.config.getThreshold(paintName);
            if (threshold && entry.startTime > threshold) {
                this.logExceededThreshold({
                    threshold,
                    type: PerformanceMetric.Paint,
                    name: paintName,
                    duration: entry.duration,
                });
            } else if (this.config.logInfo) {
                this.logInfo({ type: PerformanceMetric.Paint, name: paintName, duration: entry.duration });
            }
        }
    }

    private monitorLongtaskMetric(entry: PerformanceEntry): void {
        const entryType = entry.entryType as PerformanceMetric;
        const threshold = this.config.getThreshold(entryType);

        const attribution = (entry as any).attribution || [];
        const details = attribution
            .map((attr: any) => {
                return `Name: ${attr.name || 'Unknown'}, Container: ${
                    attr.containerType || 'N/A'
                }, Source: ${attr.containerSrc || 'N/A'}`;
            })
            .join('; ');

        if (threshold && entry.duration > threshold) {
            this.logExceededThreshold({
                threshold,
                details,
                type: PerformanceMetric.Longtask,
                name: entry.name,
                duration: entry.duration,
            });
        } else if (this.config.logInfo) {
            this.logInfo({ details, type: entryType, name: entry.name, duration: entry.duration });
        }
    }

    private logExceededThreshold({ type, name, duration, threshold, details }: LogData): void {
        console.warn(
            `[WARNING] ${type}${
                !name || type === name ? ' ' : `: "${name}" `
            }exceeded the threshold: ${duration.toFixed(2)}ms (threshold: ${threshold}ms).${!!details ? `\nDetails: ${details}` : ''}`,
        );
    }

    private logInfo({ type, name, duration, details }: Omit<LogData, 'threshold'>): void {
        console.info(
            `[INFO] ${type}${!name || type === name ? ' ' : `: "${name}" `}completed in ${duration.toFixed(2)}ms.${!!details ? `\nDetails: ${details}` : ''}`,
        );
    }
}
