import { PerformanceMetric } from './types';

export type MetricThresholds = Partial<Record<PerformanceMetric, number>>;

export interface PerformanceMonitorConfig {
    thresholds?: MetricThresholds;
    disabledMetrics?: PerformanceMetric[];
    enabled?: boolean;
    logInfo?: boolean;
}

const defaultThresholds: Record<PerformanceMetric, number> = {
    [PerformanceMetric.Resource]: 300,
    [PerformanceMetric.Navigation]: 2000,
    [PerformanceMetric.Paint]: 100,
    [PerformanceMetric.FirstPaint]: 100,
    [PerformanceMetric.FirstContentfulPaint]: 150,
    [PerformanceMetric.Longtask]: 50,
    [PerformanceMetric.FirstInput]: 100,
    [PerformanceMetric.LayoutShift]: 0.1,
    [PerformanceMetric.Event]: 50,
    [PerformanceMetric.LargestContentfulPaint]: 2500,
    [PerformanceMetric.Element]: 10,
    [PerformanceMetric.LongAnimationFrame]: 10,
    [PerformanceMetric.VisibilityState]: 10,
};

export class PerformanceConfig {
    public readonly logInfo: boolean;
    public readonly enabled: boolean;

    private thresholds: MetricThresholds;
    private disabledMetrics: Set<PerformanceMetric>;

    public constructor({
        thresholds = {},
        disabledMetrics = [],
        enabled = true,
        logInfo = false,
    }: PerformanceMonitorConfig = {}) {
        this.thresholds = { ...defaultThresholds, ...thresholds };
        this.disabledMetrics = new Set(disabledMetrics);
        this.enabled = enabled;
        this.logInfo = logInfo;
    }

    public get availableMetrics(): PerformanceMetric[] {
        return Object.values(PerformanceMetric).filter(metric => !this.disabledMetrics.has(metric));
    }

    public isMetricEnabled(metric: PerformanceMetric): boolean {
        return this.enabled && !this.disabledMetrics.has(metric);
    }

    public getThreshold(metric: PerformanceMetric): number | undefined {
        return this.thresholds[metric];
    }
}
