const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

const perf = isNode ? require('perf_hooks').performance : performance;

export function performanceDecorator(name?: string): MethodDecorator {
    return function (target, propertyKey, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const start = perf.now();
            const result = originalMethod.apply(this, args);

            if (result instanceof Promise) {
                return result.finally(() => {
                    const duration = perf.now() - start;
                    console.info(
                        `[INFO] Method ${name || propertyKey.toString()} executed in ${duration.toFixed(2)}ms`,
                    );
                });
            }

            const duration = perf.now() - start;
            console.info(`[INFO] Method ${name || propertyKey.toString()} executed in ${duration.toFixed(2)}ms`);
            return result;
        };

        return descriptor;
    };
}

export function performanceWrapper<T extends (...args: any[]) => any>(fn: T, name?: string): T {
    return function (...args: Parameters<T>): ReturnType<T> {
        const start = perf.now();
        const result = fn(...args);

        if (result instanceof Promise) {
            return result.finally(() => {
                const duration = perf.now() - start;
                console.info(`[INFO] Function ${name || fn.name} executed in ${duration.toFixed(2)}ms`);
            }) as ReturnType<T>;
        }

        const duration = perf.now() - start;
        console.info(`[INFO] Function ${name || fn.name} executed in ${duration.toFixed(2)}ms`);
        return result;
    } as T;
}
