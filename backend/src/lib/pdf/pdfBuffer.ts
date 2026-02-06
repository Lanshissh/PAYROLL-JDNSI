export async function pdfDocToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: unknown) => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
        return;
      }
      // PDFKit should always emit Buffer chunks in Node.
      reject(new Error('Unexpected PDF chunk type'));
    });

    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on('error', (err: unknown) => {
      reject(err instanceof Error ? err : new Error('PDF generation error'));
    });
  });
}