declare module 'gif.js' {
    export interface GIFOptions {
        workers?: number;
        quality?: number;
        width?: number;
        height?: number;
        workerScript?: string;
        background?: string;
        transparent?: string;
        dither?: boolean;
        debug?: boolean;
        repeat?: number; // -1 for no repeat, 0 for loop
    }

    export interface AddFrameOptions {
        delay?: number;
        copy?: boolean;
        dispose?: number;
    }

    export class GIF {
        constructor(options?: GIFOptions);
        addFrame(image: HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D, options?: AddFrameOptions): void;
        on(event: 'finished', callback: (blob: Blob) => void): void;
        on(event: 'start' | 'progress' | 'abort', callback: (progress?: number) => void): void;
        render(): void;
    }
    export default GIF;
}
