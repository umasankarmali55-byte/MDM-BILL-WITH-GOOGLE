/**
 * Ensures every .paper-sheet fits cleanly onto 1 full A4 Portrait page
 * with narrow margins (5mm -> 200mm x 287mm printable area = 756px x 1084px at 96dpi)
 * and keeps a comfortable bottom safety buffer so Chromium never spills to Page 2.
 */
const A4_DESIGN_WIDTH_PX = 794;
const A4_PRINT_WIDTH_PX = 756; // 200mm at 96dpi
const A4_SAFE_HEIGHT_PX = 1036; // ~274mm safe inside 287mm (leaves ~13mm safety margin)

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
    sheet.dataset.origMinHeight = sheet.style.minHeight || '';

    // Measure natural content height at standard 794px sheet width
    sheet.style.zoom = '1';
    sheet.style.width = `${A4_DESIGN_WIDTH_PX}px`;
    sheet.style.maxWidth = 'none';
    sheet.style.minHeight = '0px';

    const contentH = sheet.scrollHeight;
    const contentW = Math.max(A4_DESIGN_WIDTH_PX, sheet.scrollWidth);

    const scaleW = A4_PRINT_WIDTH_PX / contentW;
    const scaleH = A4_SAFE_HEIGHT_PX / contentH;
    const scale = Math.min(scaleW, scaleH);

    // Widen layout box by (100 / scale)% so zoom * width = 100% full page width
    sheet.style.zoom = scale.toFixed(4);
    sheet.style.width = `${(100 / scale).toFixed(2)}%`;
    // Stretch shorter sheets to cover the full A4 page height cleanly (~271mm inside 287mm)
    sheet.style.minHeight = `${Math.floor(1024 / scale)}px`;
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
    sheet.style.minHeight = sheet.dataset.origMinHeight ?? '';
    delete sheet.dataset.origZoom;
    delete sheet.dataset.origWidth;
    delete sheet.dataset.origMaxWidth;
    delete sheet.dataset.origMinHeight;
  });
}
