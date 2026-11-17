/**
 * Ensures every .paper-sheet fits cleanly inside 1 A4 Portrait page
 * with narrow margins (5mm all sides -> ~200mm x 287mm printable area).
 * Uses conservative thresholds (960px height) to account for Chromium print font metrics.
 */
const A4_MAX_WIDTH_PX = 748;
const A4_MAX_HEIGHT_PX = 960;

export function applyA4PrintFit(): void {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const root = document.documentElement;
  root.classList.add('a4-measure');

  const sheets = document.querySelectorAll<HTMLElement>('.paper-sheet');
  sheets.forEach((sheet) => {
    sheet.dataset.origZoom = sheet.style.zoom || '';
    sheet.dataset.origWidth = sheet.style.width || '';
    sheet.dataset.origMaxWidth = sheet.style.maxWidth || '';

    // Measure natural compact print-CSS height at standard A4 printable width
    sheet.style.zoom = '1';
    sheet.style.width = `${A4_MAX_WIDTH_PX}px`;
    sheet.style.maxWidth = 'none';

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
    sheet.style.maxWidth = sheet.dataset.origMaxWidth ?? '';
    delete sheet.dataset.origZoom;
    delete sheet.dataset.origWidth;
    delete sheet.dataset.origMaxWidth;
  });
}
