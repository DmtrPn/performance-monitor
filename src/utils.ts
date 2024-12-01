function logPerformance(name: string, duration: number, threshold?: number) {
    if (threshold && duration > threshold) {
        console.warn(
            `[WARNING] Method ${name} exceeded the threshold: ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
        );
    } else {
        console.info(`[INFO] Method ${name} executed in ${duration.toFixed(2)}ms`);
    }
}

export function performanceDecorator(name?: string, threshold?: number): MethodDecorator {
    return function (target, propertyKey, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const start = performance.now();
            const result = originalMethod.apply(this, args);

            if (result instanceof Promise) {
                return result.finally(() => {
                    const duration = performance.now() - start;
                    logPerformance(name || propertyKey.toString(), duration, threshold);
                });
            }

            const duration = performance.now() - start;
            logPerformance(name || propertyKey.toString(), duration, threshold);
            return result;
        };

        return descriptor;
    };
}

export function performanceWrapper<T extends (...args: any[]) => any>(fn: T, name?: string, threshold?: number): T {
    return function (...args: Parameters<T>): ReturnType<T> {
        const start = performance.now();
        const result = fn(...args);

        if (result instanceof Promise) {
            return result.finally(() => {
                const duration = performance.now() - start;
                logPerformance(name || fn.name, duration, threshold);
            }) as ReturnType<T>;
        }

        const duration = performance.now() - start;
        logPerformance(name || fn.name, duration, threshold);
        return result;
    } as T;
}
