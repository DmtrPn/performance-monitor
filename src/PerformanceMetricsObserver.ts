import { PerformanceConfig } from './PerformanceConfig';
import { PerformanceMetric } from './types';

export class PerformanceMetricsObserver {
    private config: PerformanceConfig;
    private observer?: PerformanceObserver;

    public constructor(config: PerformanceConfig) {
        this.config = config;
    }

    public start(): void {
        if (!('PerformanceObserver' in window)) {
            console.warn('[WARNING] PerformanceObserver or Paint Timing API is not supported in this environment.');
            return;
        }
        if (!this.config.enabled && this.config.availableMetrics.length === 0) {
            console.info('[INFO] Performance metrics collection is disabled.');
        } else {
            this.initObserver();

            this.observer!.observe({
                entryTypes: this.config.availableMetrics.filter(
                    metrinc =>
                        ![PerformanceMetric.FirstContentfulPaint, PerformanceMetric.FirstPaint].includes(metrinc),
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

        if (entryType === PerformanceMetric.Paint) {
            const paintName = entry.name as PerformanceMetric;
            if (
                [PerformanceMetric.FirstPaint, PerformanceMetric.FirstContentfulPaint].includes(paintName) &&
                this.config.isMetricEnabled(paintName)
            ) {
                const threshold = this.config.getThreshold(paintName);
                if (threshold && entry.startTime > threshold) {
                    console.warn(
                        `[WARNING] ${paintName} exceeded the threshold: ${entry.startTime.toFixed(
                            2,
                        )}ms (threshold: ${threshold}ms)`,
                    );
                } else if (this.config.logInfo) {
                    console.info(`[INFO] ${paintName} completed in ${entry.startTime.toFixed(2)}ms`);
                }
            }
            return;
        }

        if (this.config.isMetricEnabled(entryType)) {
            const threshold = this.config.getThreshold(entryType);
            if (threshold && entry.duration > threshold) {
                if (entryType === 'longtask') {
                    const attribution = (entry as any).attribution || [];
                    const details = attribution
                        .map((attr: any) => {
                            return `Name: ${attr.name || 'Unknown'}, Container: ${
                                attr.containerType || 'N/A'
                            }, Source: ${attr.containerSrc || 'N/A'}`;
                        })
                        .join('; ');

                    console.warn(
                        `[WARNING] Longtask "${entry.name}" exceeded the threshold: ${entry.duration.toFixed(
                            2,
                        )}ms (threshold: ${threshold}ms). Details: ${details}`,
                    );
                } else {
                    console.warn(
                        `[WARNING] ${entryType}${
                            entryType === entry.name ? ' ' : `: "${entry.name}" `
                        }exceeded the threshold: ${entry.duration.toFixed(2)}ms (threshold: ${threshold}m s)`,
                    );
                }
            } else if (this.config.logInfo) {
                console.info(`[INFO] ${entryType} "${entry.name}" completed in ${entry.duration.toFixed(2)}ms`);
            }
        }
    }
}
