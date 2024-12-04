export enum PerformanceMetric {
    Element = 'element',
    Event = 'event',
    FirstInput = 'first-input',
    LargestContentfulPaint = 'largest-contentful-paint',
    LayoutShift = 'layout-shift',
    LongAnimationFrame = 'long-animation-frame',
    Longtask = 'longtask',
    Navigation = 'navigation',
    Paint = 'paint',
    Resource = 'resource',
    FirstPaint = 'first-paint',
    FirstContentfulPaint = 'first-contentful-paint',
    VisibilityState = 'visibility-state',
}

export const MonitoringPresets = {
    LongRequests: [PerformanceMetric.Resource, PerformanceMetric.Navigation, PerformanceMetric.Longtask],
    InitialLoad: [
        PerformanceMetric.Navigation,
        PerformanceMetric.Paint,
        PerformanceMetric.FirstPaint,
        PerformanceMetric.FirstContentfulPaint,
        PerformanceMetric.LargestContentfulPaint,
        PerformanceMetric.LayoutShift,
        PerformanceMetric.FirstInput,
    ],
    PageLoads: [
        PerformanceMetric.Navigation,
        PerformanceMetric.Paint,
        PerformanceMetric.LargestContentfulPaint,
        PerformanceMetric.Longtask,
    ],
    UserInteractions: [PerformanceMetric.FirstInput, PerformanceMetric.Event, PerformanceMetric.Longtask],
    NetworkPerformance: [PerformanceMetric.Resource, PerformanceMetric.Navigation, PerformanceMetric.Longtask],
    Animations: [PerformanceMetric.LongAnimationFrame, PerformanceMetric.LayoutShift, PerformanceMetric.Event],
    SPA: [
        PerformanceMetric.Navigation,
        PerformanceMetric.LargestContentfulPaint,
        PerformanceMetric.FirstInput,
        PerformanceMetric.Resource,
        PerformanceMetric.Longtask,
    ],
};
