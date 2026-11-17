import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Captures one or more .paper-sheet elements and downloads a single-file
 * A4 Portrait PDF with narrow margins (5mm left/right, 5mm top/bottom).
 * Each .paper-sheet fills the full A4 page cleanly without clipping borders.
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
    width: s.style.width,
    maxWidth: s.style.maxWidth,
    minHeight: s.style.minHeight,
    zoom: s.style.zoom,
    border: s.style.border,
    boxShadow: s.style.boxShadow,
    padding: s.style.padding,
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
    const targetAspect = maxH / maxW; // 1.435

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      sheet.style.zoom = '1';
      sheet.style.padding = '8px 10px';
      sheet.style.minHeight = '0px';

      let captureW = 794;
      sheet.style.width = `${captureW}px`;
      sheet.style.maxWidth = `${captureW}px`;

      // Prevent horizontal clipping if any wide multi-column table exceeds 794px
      if (sheet.scrollWidth > captureW) {
        captureW = sheet.scrollWidth;
        sheet.style.width = `${captureW}px`;
        sheet.style.maxWidth = `${captureW}px`;
      }

      const naturalH = sheet.scrollHeight;
      const targetFullH = Math.round(captureW * (targetAspect - 0.01));

      if (naturalH > targetFullH) {
        captureW = Math.min(1100, Math.ceil(naturalH / (targetAspect - 0.02)));
        sheet.style.width = `${captureW}px`;
        sheet.style.maxWidth = `${captureW}px`;
      }

      const fullPageH = Math.round(captureW * (targetAspect - 0.01));
      sheet.style.minHeight = `${Math.max(sheet.scrollHeight, fullPageH)}px`;

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
      const y = marginY + Math.max(0, (maxH - drawH) / 2);

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
      s.el.style.minHeight = s.minHeight;
      s.el.style.zoom = s.zoom;
      s.el.style.border = s.border;
      s.el.style.boxShadow = s.boxShadow;
      s.el.style.padding = s.padding;
    });
  }
}
