import { PerformanceMetricsObserver } from './PerformanceMetricsObserver';
import { PerformanceConfig, PerformanceMonitorConfig } from './PerformanceConfig';

const isProduction = process.env.NODE_ENV === 'production';

export class PerformanceMonitor {
    private metricsObserver: PerformanceMetricsObserver;

    public constructor(config: PerformanceMonitorConfig) {
        const performanceConfig = new PerformanceConfig({ enabled: !isProduction, ...config });
        this.metricsObserver = new PerformanceMetricsObserver(performanceConfig);
    }

    public start(): void {
        this.metricsObserver.start();
    }
}
