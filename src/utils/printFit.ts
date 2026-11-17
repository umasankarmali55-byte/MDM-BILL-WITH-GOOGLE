/**
 * Computes A4 Portrait (5mm narrow margin -> 200mm x 287mm printable area)
 * overflow-only zoom factor and stores it in `--print-zoom`.
 * Screen scale, width, and proportions are never modified.
 */
const A4_MAX_WIDTH_PX = 752;
const A4_MAX_HEIGHT_PX = 1068;

export function applyA4PrintFit(): void {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const root = document.documentElement;
  root.classList.add('a4-measure');

  const sheets = document.querySelectorAll<HTMLElement>('.paper-sheet');
  sheets.forEach((sheet) => {
    const prevZoom = sheet.style.zoom;
    const prevMaxWidth = sheet.style.maxWidth;

    sheet.style.zoom = '1';
    if (!prevMaxWidth) {
      sheet.style.maxWidth = 'none';
    }

    const w = Math.max(sheet.offsetWidth, sheet.scrollWidth);
    const h = sheet.scrollHeight;

    sheet.style.zoom = prevZoom;
    sheet.style.maxWidth = prevMaxWidth;

    const scaleW = w > A4_MAX_WIDTH_PX ? A4_MAX_WIDTH_PX / w : 1;
    const scaleH = h > A4_MAX_HEIGHT_PX ? A4_MAX_HEIGHT_PX / h : 1;
    const scale = Math.min(1, scaleW, scaleH);

    sheet.style.setProperty('--print-zoom', scale < 0.995 ? scale.toFixed(4) : '1');
  });

  root.classList.remove('a4-measure');
}

export function clearA4PrintFit(): void {
  document.documentElement.classList.remove('a4-measure');
  const sheets = document.querySelectorAll<HTMLElement>('.paper-sheet');
  sheets.forEach((sheet) => {
    sheet.style.removeProperty('--print-zoom');
  });
}
