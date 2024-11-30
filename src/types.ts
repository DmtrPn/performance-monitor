// returns ["element' | 'event' | 'first-input' | 'largest-contentful-paint' | 'layout-shift' | 'long-animation-frame' | 'longtask' | 'mark' | 'measure' | 'navigation' | 'paint' | 'resource' | 'visibility-state"] in the main thread in Chrome 129
// returns ["mark' | 'measure' | 'resource"] in a worker thread in Chrome 129

export type MetricName =
    | 'element'
    | 'event'
    | 'first-input'
    | 'largest-contentful-paint'
    | 'layout-shift'
    | 'long-animation-frame'
    | 'longtask'
    | 'mark'
    | 'measure'
    | 'navigation'
    | 'paint'
    | 'resource'
    | 'visibility-state';

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
