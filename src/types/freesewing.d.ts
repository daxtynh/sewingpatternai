declare module '@freesewing/core' {
  export class Design {
    constructor(config: DesignConfig);
    draft(): void;
    render(): string;
    parts: Record<string, unknown>;
  }

  export class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
    attr(name: string, value: string | number): Point;
  }

  export class Path {
    constructor();
    move(point: Point): Path;
    line(point: Point): Path;
    curve(cp1: Point, cp2: Point, end: Point): Path;
    close(): Path;
    attr(name: string, value: string | number): Path;
  }

  export class Snippet {
    constructor(name: string, point: Point);
  }

  interface DesignConfig {
    name: string;
    parts: unknown[];
    measurements?: string[];
    options?: Record<string, unknown>;
  }
}

declare module '@freesewing/config' {
  export const logoPath: string;
}
