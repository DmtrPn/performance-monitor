import { performance } from 'perf_hooks';

export function performanceDecorator(name?: string): MethodDecorator {
    return function (target, propertyKey, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const start = performance.now();
            const result = originalMethod.apply(this, args);
            const duration = performance.now() - start;

            console.info(`[INFO] Method ${name || propertyKey.toString()} executed in ${duration.toFixed(2)}ms`);
            return result;
        };

        return descriptor;
    };
}

export function performanceWrapper<T extends (...args: any[]) => any>(fn: T, name?: string): T {
    return function (...args: Parameters<T>): ReturnType<T> {
        const start = performance.now();
        const result = fn(...args);
        const duration = performance.now() - start;

        console.info(`[INFO] Function ${name || fn.name} executed in ${duration.toFixed(2)}ms`);
        return result;
    } as T;
}
