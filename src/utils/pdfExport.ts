import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Captures one or more .paper-sheet elements and downloads a single-file
 * A4 Portrait PDF with narrow margins (5mm left/right, 4mm top/bottom).
 * Each .paper-sheet is automatically scaled to fit cleanly onto 1 A4 page.
 */
export async function downloadSheetsAsPdf(
  filename: string,
  rootEl: ParentNode = document
): Promise<void> {
  const sheets = Array.from(
    rootEl.querySelectorAll<HTMLElement>('.paper-sheet')
  );
  if (sheets.length === 0) return;

  // Blur any active contenteditable cell so focus ring isn't captured
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const html = document.documentElement;
  html.classList.add('a4-measure');

  const savedStyles = sheets.map((s) => ({
    el: s,
    width: s.style.width,
    maxWidth: s.style.maxWidth,
    zoom: s.style.zoom,
    border: s.style.border,
    boxShadow: s.style.boxShadow,
    padding: s.style.padding,
  }));

  try {
    // Wait two frames for layout styles to settle
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
    const marginY = 4;
    const maxW = pageW - marginX * 2; // 200mm
    const maxH = pageH - marginY * 2; // 289mm

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      sheet.style.zoom = '1';
      sheet.style.width = '780px';
      sheet.style.maxWidth = '780px';
      sheet.style.padding = '4px';

      const canvas = await html2canvas(sheet, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: 900,
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
      s.el.style.width = s.width;
      s.el.style.maxWidth = s.maxWidth;
      s.el.style.zoom = s.zoom;
      s.el.style.border = s.border;
      s.el.style.boxShadow = s.boxShadow;
      s.el.style.padding = s.padding;
    });
  }
}
