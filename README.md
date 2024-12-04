[![npm version](https://img.shields.io/npm/v/perfomance-monitor.svg)](https://www.npmjs.com/package/perfomance-monitor)

# Performance Monitoring Library

This library is designed for monitoring the performance of websites and browser-based applications. It leverages the native Performance API, making it lightweight and efficient. Ideal for local or individual use, it provides immediate insights into performance during development, without the need for additional tools like Sentry or GlitchTip.
## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Usage](#usage)
    - [Decorators](#decorators)
    - [Performance Monitoring Wrapper](#performance-monitoring-wrapper)
    - [Metrics Observer](#metrics-observer)
    - [Configuration](#configuration)
5. [Examples](#examples)
    - [React Integration](#react-integration)
    - [API Monitoring](#api-monitoring)
6. [API Documentation](#api-documentation)
    - [`performanceDecorator`](#performancedecorator)
    - [`performanceWrapper`](#performancewrapper)
    - [`PerformanceMetricsObserver`](#performancemetricsobserver)
7. [License](#license)

---

## Features

- Configurable threshold for logging warnings on slow executions.
- Metrics observer for tracking key performance metrics.
- Easy-to-use decorators and wrappers for monitoring function performance.
- Supports synchronous and asynchronous functions.

---

## Installation

```bash
   npm install perfomance-monitor
```
```bash
   yarn add perfomance-monitor
```

---

## Quick Start

### Using Metrics Observer

```typescript
import { monitor, MonitoringPresets } from 'perfomance-monitor';

monitor({
   enabledMetrics: [MonitoringPresets.InitialLoad]
});
```
#### Or using PerformanceMonitor class

```typescript
import { PerformanceMonitor } from 'perfomance-monitor';

const monitor = new PerformanceMonitor({
    logInfo: true,
});

monitor.start();

// Stop monitor when not needed
monitor.stop();
```



### Using a Decorator

```typescript
import { performanceDecorator } from 'perfomance-monitor';

class Example {
    @performanceDecorator('Example Method', 100)
    exampleMethod() {
        // Code to measure
    }
}
```

### Using a Wrapper

```typescript
import { performanceWrapper } from 'perfomance-monitor';

const wrappedFunction = performanceWrapper(() => {
    // Code to measure
}, 'Wrapped Function', 50);

wrappedFunction();
```

---

## Usage

### Metrics Observer

`PerformanceMonitor` provides detailed monitoring of browser performance metrics like `paint`, `navigation`, and `resource`. You can configure thresholds and enable or disable specific metrics.

### Configuration

You can define the metrics to observe, their thresholds, and logging preferences. Below are the configuration options and their types:

#### Default Thresholds

The library uses the following default thresholds for metrics. These values are based on general performance best practices and recommendations, ensuring reasonable limits for detecting performance issues:

```typescript
const defaultThresholds: Record<PerformanceMetric, number> = {
    [PerformanceMetric.Resource]: 300, // Resources (e.g., scripts, images) should load within 300ms for optimal performance.
    [PerformanceMetric.Navigation]: 2000, // Page navigation should ideally complete within 2 seconds for good UX.
    [PerformanceMetric.Paint]: 100, // Paint events (e.g., first paint) should occur quickly to show initial feedback.
    [PerformanceMetric.FirstPaint]: 100, // First paint is expected to happen within 100ms.
    [PerformanceMetric.FirstContentfulPaint]: 1000, // FCP should ideally occur within 1 second for a fast user experience.
    [PerformanceMetric.Longtask]: 50, // Tasks longer than 50ms are considered "long tasks" and can impact responsiveness.
    [PerformanceMetric.FirstInput]: 100, // The first user interaction should be processed within 100ms.
    [PerformanceMetric.LayoutShift]: 0.1, // A Cumulative Layout Shift (CLS) of 0.1 or less is considered good for visual stability.
    [PerformanceMetric.Event]: 50, // Event handling should ideally complete within 50ms to ensure responsiveness.
    [PerformanceMetric.LargestContentfulPaint]: 2500, // LCP under 2.5 seconds is key for good perceived load speed.
    [PerformanceMetric.Element]: 50, // Element timing for specific elements should be fast.
    [PerformanceMetric.LongAnimationFrame]: 20, // Animation frames longer than 20ms may cause visual stuttering.
    [PerformanceMetric.VisibilityState]: 50, // State changes (e.g., visibility change) should be handled within 50ms.
};
```

#### Available Options

1. **`availableMetrics`**
   - **Type**: `PerformanceMetric[]`
   - **Description**: Specifies the list of metrics to observe. Metrics include:
      - `paint`: Tracks paint-related metrics like `FirstPaint` and `FirstContentfulPaint`.
      - `navigation`: Measures page navigation performance (e.g., `DOMContentLoaded`, `loadEventEnd`).
      - `resource`: Tracks resource loading times (e.g., images, scripts).
      - `longtask`: Captures tasks that exceed 50ms.
      - `layout-shift`: Measures visual stability (Cumulative Layout Shift or CLS).
      - `largest-contentful-paint`: Measures the time taken to render the largest visible content.

2. **`thresholds`**
   - **Type**: `Partial<Record<PerformanceMetric, number>>`
   - **Description**: Defines the thresholds (in milliseconds or other relevant units) for logging warnings. For example:
     ```typescript
     thresholds: {
         paint: 100,
         navigation: 2000,
         resource: 500,
     }
     ```

3. **`logInfo`**
   - **Type**: `boolean`
   - **Description**: If set to `true`, logs all metric results to the console, even when they are within the thresholds. Defaults to `false`.

4. **`enabled`**
   - **Type**: `boolean`
   - **Description**: Determines if performance monitoring is enabled. Defaults to `true`.

5. **`ignoreMetrics`**
   - **Type**: `PerformanceMetric[]`
   - **Description**: Specifies a list of metrics to ignore, even if they are included in `availableMetrics`.

---

#### Example Configuration

```typescript
import { PerformanceConfig } from 'performance-monitoring-library';

const config = new PerformanceConfig({
    availableMetrics: ['paint', 'navigation', 'resource', 'largest-contentful-paint'],
    thresholds: {
        paint: 100,
        navigation: 2000,
        resource: 500,
        'largest-contentful-paint': 2500,
    },
    logInfo: true,
    enabled: true,
    ignoreMetrics: ['layout-shift'], // CLS is not being monitored in this example
});


```typescript
import { PerformanceMonitor, PerformanceMetric } from 'perfomance-monitor';

const config = new PerformanceMonitor({
    availableMetrics: [PerformanceMetric.Resource],
    thresholds: { 
        [PerformanceMetric.Resource]: 500,
    },
    logInfo: true,
});


```

### Decorators

Decorators allow you to measure the execution time of class methods. They support optional threshold values, which will log warnings if exceeded.

### Performance Monitoring Wrapper

Wrap any function with `performanceWrapper` to measure its execution time. Works with both synchronous and asynchronous functions.


---

## Examples

### React Integration

```typescript
import React, { useEffect } from 'react';
import { performanceWrapper } from 'perfomance-monitor';

function ExamplePage() {
    const monitoredEffect = performanceWrapper(() => {
        // Simulate page load
        console.log('Page loaded');
    }, 'Page Load', 1000);

    useEffect(() => {
        monitoredEffect();
    }, []);

    return <div>Example Page</div>;
}
```

### API Monitoring

```typescript
import { performanceWrapper } from 'perfomance-monitor';

const fetchData = performanceWrapper(async () => {
    const response = await fetch('https://api.example.com/data');
    return response.json();
}, 'API Fetch', 500);

fetchData().then(data => console.log(data));
```

---

## API Documentation

### `PerformanceMonitor`

A class for monitoring browser performance metrics.

**Constructor Parameters:**
- `config: PerformanceConfig` - The configuration object.

**Methods:**
- `start()` - Starts observing metrics.
- `stop()` - Stops observing metrics.


### `monitor`

Wrapper under PerformanceMonitor

**Constructor Parameters:**
- `config: PerformanceConfig` - The configuration object.

**Usage:**
- `monitor()` - Starts observing metrics.

### `performanceDecorator`

A decorator for measuring method execution time.

**Parameters:**
- `name?: string` - A custom name for the method.
- `threshold?: number` - A threshold in milliseconds for logging warnings.

### `performanceWrapper`

A wrapper for measuring function execution time.

**Parameters:**
- `fn: Function` - The function to wrap.
- `name?: string` - A custom name for the function.
- `threshold?: number` - A threshold in milliseconds for logging warnings.



---

## License

This library is licensed under the Apache 2.0 License. See [LICENSE](./LICENSE) for more details.
