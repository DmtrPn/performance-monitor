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
            [PerformanceMetric.LargestContentfulPaint]: this.monitorLCPMetric.bind(this),
            [PerformanceMetric.LayoutShift]: this.monitorLayoutShiftMetric.bind(this),
            [PerformanceMetric.FirstPaint]: this.monitorByStartTimeMetric.bind(this),
            [PerformanceMetric.FirstContentfulPaint]: this.monitorByStartTimeMetric.bind(this),
            [PerformanceMetric.FirstInput]: this.monitorByStartTimeMetric.bind(this),
            [PerformanceMetric.VisibilityState]: this.monitorByStartTimeMetric.bind(this),
            [PerformanceMetric.Resource]: this.monitorByDuration.bind(this),
            [PerformanceMetric.Navigation]: this.monitorByDuration.bind(this),
            [PerformanceMetric.Event]: this.monitorByDuration.bind(this),
            [PerformanceMetric.Element]: this.monitorByDuration.bind(this),
            [PerformanceMetric.LongAnimationFrame]: this.monitorByDuration.bind(this),
        };

        const monitor = enityMonitors[entryType];

        monitor?.(entry);
    }

    private monitorByDuration(entry: PerformanceEntry): void {
        this.processEntry({
            entry,
            duration: entry.duration,
        });
    }

    private monitorByStartTimeMetric(entry: PerformanceEntry): void {
        this.processEntry({
            entry,
            duration: entry.startTime,
        });
    }

    private monitorLCPMetric(entry: PerformanceEntry & { renderTime?: number; loadTime?: number }): void {
        const duration = entry.renderTime || entry.loadTime || entry.startTime;

        this.processEntry({
            entry,
            duration,
        });
    }

    private monitorLayoutShiftMetric(entry: PerformanceEntry & { value?: number }): void {
        const duration = entry.value || entry.duration;
        this.processEntry({
            entry,
            duration,
        });
    }

    private monitorPaintMetric(entry: PerformanceEntry): void {
        this.processEntry({
            entry,
            duration: entry.startTime,
            thresholdName: entry.name as PerformanceMetric,
        });
    }

    private monitorLongtaskMetric(entry: PerformanceEntry): void {
        const attribution = (entry as any).attribution || [];
        const details = attribution
            .map(
                (attr: any) =>
                    `Name: ${attr.name || 'Unknown'}, Container: ${
                        attr.containerType || 'N/A'
                    }, Source: ${attr.containerSrc || 'N/A'}`,
            )
            .join('; ');

        this.processEntry({
            entry,
            details,
            duration: entry.duration,
        });
    }

    private processEntry({
        entry,
        duration,
        details,
        thresholdName,
    }: {
        entry: PerformanceEntry;
        duration: number;
        details?: string;
        thresholdName?: PerformanceMetric;
    }): void {
        const entryType = entry.entryType as PerformanceMetric;
        const threshold = this.config.getThreshold(thresholdName ?? entryType);

        if (threshold && duration > threshold) {
            this.logExceededThreshold({
                threshold,
                duration,
                type: entryType,
                name: entry.name,
                details,
            });
        } else if (this.config.logInfo) {
            this.logInfo({ type: entryType, name: entry.name, duration, details });
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
