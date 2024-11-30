import { PerformanceConfig } from './PerformanceConfig';
import { PerformanceMetric } from './types';

export class PerformanceMetricsObserver {
    private config: PerformanceConfig;
    private observer?: PerformanceObserver;

    public constructor(config: PerformanceConfig) {
        this.config = config;
    }

    public start(): void {
        if (!this.config.enabled && this.config.availableMetrics.length === 0) {
            console.info('[INFO] Performance metrics collection is disabled.');
        } else {
            this.initObserver();

            this.observer!.observe({
                entryTypes: this.config.availableMetrics,
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
                const threshold: number = this.config.getThreshold(entry.entryType as PerformanceMetric)!;

                if (entry.duration > threshold) {
                    console.warn(
                        `[WARNING] ${entry.entryType} "${entry.name}" exceeded the threshold: ${entry.duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
                    );
                } else if (this.config.logInfo) {
                    console.info(
                        `[INFO] ${entry.entryType} "${entry.name}" completed in ${entry.duration.toFixed(2)}ms`,
                    );
                }
            });
        });
    }
}
