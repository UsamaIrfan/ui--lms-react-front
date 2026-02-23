import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Captures an HTML element and generates a downloadable PDF from it.
 * Uses html2canvas to render the element as an image, then places it in a PDF.
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  filename: string,
  options?: { orientation?: "portrait" | "landscape"; margin?: number }
): Promise<void> {
  const { orientation = "portrait", margin = 10 } = options ?? {};

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = (canvas.height * contentWidth) / canvas.width;

  const yOffset = margin;

  if (contentHeight <= pageHeight - margin * 2) {
    pdf.addImage(imgData, "PNG", margin, yOffset, contentWidth, contentHeight);
  } else {
    // Multi-page: split the canvas into page-sized chunks
    const pageContentHeight = pageHeight - margin * 2;
    const totalPages = Math.ceil(contentHeight / pageContentHeight);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      const sourceY = (page * pageContentHeight * canvas.width) / contentWidth;
      const sourceHeight = (pageContentHeight * canvas.width) / contentWidth;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(sourceHeight, canvas.height - sourceY);

      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          canvas.width,
          pageCanvas.height
        );
      }

      const pageImgData = pageCanvas.toDataURL("image/png");
      const renderedHeight = (pageCanvas.height * contentWidth) / canvas.width;

      pdf.addImage(
        pageImgData,
        "PNG",
        margin,
        margin,
        contentWidth,
        renderedHeight
      );
    }
  }

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

/**
 * Downloads a Blob as a file with the given filename.
 * Useful for server-generated PDFs (e.g. receipt PDFs, report cards).
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
