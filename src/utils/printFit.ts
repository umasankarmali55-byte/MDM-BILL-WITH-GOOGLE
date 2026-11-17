/**
 * Ensures every .paper-sheet fits cleanly inside 1 A4 Portrait page
 * with narrow margins (4mm top/bottom, 5mm left/right -> ~200mm x 289mm).
 */
const A4_MAX_WIDTH_PX = 755;
const A4_MAX_HEIGHT_PX = 1055;

export function applyA4PrintFit(): void {
  const root = document.documentElement;
  root.classList.add('a4-measure');

  const sheets = document.querySelectorAll<HTMLElement>('.paper-sheet');
  sheets.forEach((sheet) => {
    sheet.dataset.origZoom = sheet.style.zoom || '';
    sheet.dataset.origWidth = sheet.style.width || '';

    sheet.style.zoom = '1';
    sheet.style.width = `${A4_MAX_WIDTH_PX}px`;

    const h = sheet.scrollHeight;
    const w = sheet.scrollWidth;

    const scaleH = h > A4_MAX_HEIGHT_PX ? A4_MAX_HEIGHT_PX / h : 1;
    const scaleW = w > A4_MAX_WIDTH_PX ? A4_MAX_WIDTH_PX / w : 1;
    const scale = Math.min(1, scaleH, scaleW);

    if (scale < 0.995) {
      sheet.style.zoom = scale.toFixed(4);
      sheet.style.width = `${(100 / scale).toFixed(2)}%`;
    } else {
      sheet.style.zoom = '';
      sheet.style.width = '100%';
    }
  });

  root.classList.remove('a4-measure');
}

export function clearA4PrintFit(): void {
  document.documentElement.classList.remove('a4-measure');
  const sheets = document.querySelectorAll<HTMLElement>('.paper-sheet');
  sheets.forEach((sheet) => {
    sheet.style.zoom = sheet.dataset.origZoom ?? '';
    sheet.style.width = sheet.dataset.origWidth ?? '';
    delete sheet.dataset.origZoom;
    delete sheet.dataset.origWidth;
  });
}
