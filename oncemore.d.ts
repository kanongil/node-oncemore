import type { EventEmitter } from 'events';

interface Oncemored<T extends EventEmitter> {
    once<E extends (string | symbol)[]>(...args: [...E, (...args: any[]) => void]): Oncemored<T>;
    oncemore<E extends (string | symbol)[]>(...args: [...E, (event: string | symbol, ...args: any[]) => void]): Oncemored<T>;
}

declare function oncemore<T extends EventEmitter>(emitter: T): Oncemored<T>;

export = oncemore;
