import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Captures one or more .paper-sheet elements at their natural 794px scale
 * and downloads a single-file A4 Portrait PDF with narrow margins (5mm).
 * Each .paper-sheet fits cleanly onto 1 A4 page without forced height stretching.
 */
export async function downloadSheetsAsPdf(
  filename: string,
  rootEl: ParentNode = document
): Promise<void> {
  const sheets = Array.from(
    rootEl.querySelectorAll<HTMLElement>('.paper-sheet')
  );
  if (sheets.length === 0) return;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const html = document.documentElement;
  html.classList.add('a4-measure');

  const savedStyles = sheets.map((s) => ({
    el: s,
    maxWidth: s.style.maxWidth,
    zoom: s.style.zoom,
  }));

  try {
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    );

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageW = 210;
    const pageH = 297;
    const marginX = 5;
    const marginY = 5;
    const maxW = pageW - marginX * 2; // 200mm
    const maxH = pageH - marginY * 2; // 287mm

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      sheet.style.zoom = '1';
      if (!sheet.style.maxWidth) {
        sheet.style.maxWidth = 'none';
      }

      const captureW = Math.max(sheet.offsetWidth, sheet.scrollWidth);

      const canvas = await html2canvas(sheet, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: captureW,
        windowWidth: Math.max(960, captureW + 60),
      });

      const imgData = canvas.toDataURL('image/png');
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const drawW = canvas.width * ratio;
      const drawH = canvas.height * ratio;
      const x = (pageW - drawW) / 2;
      const y = marginY;

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(imgData, 'PNG', x, y, drawW, drawH, undefined, 'FAST');
    }

    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeName);
  } finally {
    html.classList.remove('a4-measure');
    savedStyles.forEach((s) => {
      s.el.style.maxWidth = s.maxWidth;
      s.el.style.zoom = s.zoom;
    });
  }
}
