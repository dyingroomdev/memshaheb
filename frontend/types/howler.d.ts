declare module 'howler' {
  type HowlEventHandler = (...args: any[]) => void;

  interface HowlOptions {
    src: string[];
    volume?: number;
    loop?: boolean;
    autoplay?: boolean;
  }

  export class Howl {
    constructor(options: HowlOptions);
    play(id?: number): number;
    pause(id?: number): void;
    stop(id?: number): void;
    unload(): void;
    volume(): number;
    volume(value: number, id?: number): number;
    playing(id?: number): boolean;
    fade(from: number, to: number, duration: number, id?: number): void;
    once(event: string, handler: HowlEventHandler, id?: number): this;
    on(event: string, handler: HowlEventHandler, id?: number): this;
  }

  export const Howler: {
    volume(value?: number): number;
    mute(muted: boolean): void;
  };
}
