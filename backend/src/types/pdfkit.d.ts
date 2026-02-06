declare module 'pdfkit' {
  import { Readable } from 'stream';

  export interface PDFDocument extends Readable {
    page: {
      width: number;
      height: number;
      margins: { top: number; right: number; bottom: number; left: number };
    };

    // Minimal API we use (add as needed)
    font(name: string): this;
    fontSize(size: number): this;
    fillColor(color: string): this;

    text(
      text: string,
      x?: number,
      y?: number,
      options?: { width?: number; align?: 'left' | 'right' | 'center' }
    ): this;

    moveDown(lines?: number): this;

    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    lineWidth(width: number): this;

    strokeColor(color: string): this;
    stroke(): this;

    rect(x: number, y: number, w: number, h: number): this;
    roundedRect(x: number, y: number, w: number, h: number, r: number): this;

    fillOpacity(opacity: number): this;
    fillAndStroke(fill: string, stroke: string): this;
    end(): void;
  }

  export interface PDFDocumentOptions {
    size?: string;
    margin?: number;
    info?: { Title?: string; Author?: string };
  }

  export default class PDFDocumentImpl extends Readable implements PDFDocument {
    constructor(options?: PDFDocumentOptions);
  }
}