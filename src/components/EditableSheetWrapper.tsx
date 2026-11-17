import React, { useLayoutEffect, useRef, useState } from 'react';
import { Printer, RotateCcw, ImagePlus, FileDown, Loader2 } from 'lucide-react';
import { MDMState, TabId } from '../types/mdm';
import { TAB_TITLES } from './Sidebar';
import { downloadSheetsAsPdf } from '../utils/pdfExport';

interface EditableSheetWrapperProps {
  tabId: TabId;
  state: MDMState;
  onUpdateState: (updater: (prev: MDMState) => MDMState) => void;
  enableCellEdits?: boolean;
  showLogoUploads?: boolean;
  extraToolbar?: React.ReactNode;
  children: React.ReactNode;
}

const EDITABLE_SELECTOR = 'td, th, .fi, .fl b, .ec';

export const EditableSheetWrapper: React.FC<EditableSheetWrapperProps> = ({
  tabId,
  state,
  onUpdateState,
  enableCellEdits = false,
  showLogoUploads = false,
  extraToolbar,
  children,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const m3Ref = useRef<Record<string, string>>(state.m3 || {});
  const pendingRef = useRef<Record<string, string>>({});
  const onUpdateRef = useRef(onUpdateState);
  const [resetSeq, setResetSeq] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  m3Ref.current = state.m3 || {};
  onUpdateRef.current = onUpdateState;

  // Apply contenteditable & saved manual overrides only on mount / month / tab / reset
  // Never run on every keystroke so cursor/caret never jumps back to the front.
  useLayoutEffect(() => {
    if (!enableCellEdits || !sheetRef.current) return;
    const root = sheetRef.current.querySelector('.paper-sheet');
    if (!root) return;

    const pre = `${state.cur}|${tabId}|`;
    const m3 = m3Ref.current;
    const cells = root.querySelectorAll(EDITABLE_SELECTOR);
    let idx = 0;

    cells.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (
        htmlEl.querySelector('table, input, select, button') ||
        htmlEl.classList.contains('noedit')
      ) {
        return;
      }
      // Prevent nested contenteditable elements inside another editable cell
      const parentEditable = htmlEl.parentElement?.closest(EDITABLE_SELECTOR);
      if (parentEditable && root.contains(parentEditable)) {
        return;
      }

      const key = pre + idx;
      idx++;
      htmlEl.setAttribute('contenteditable', 'true');
      htmlEl.setAttribute('spellcheck', 'false');
      htmlEl.dataset.e = key;

      const isFocused =
        document.activeElement === htmlEl ||
        htmlEl.contains(document.activeElement);
      if (!isFocused && m3[key] !== undefined) {
        const currentText = (htmlEl.textContent ?? '').replace(/\u00A0/g, ' ');
        if (currentText !== m3[key]) {
          htmlEl.textContent = m3[key];
        }
      }
    });
  }, [enableCellEdits, state.cur, tabId, resetSeq]);

  // Flush any pending edits if the user switches tabs while a cell is still focused
  useLayoutEffect(() => {
    return () => {
      const pending = pendingRef.current;
      const keys = Object.keys(pending);
      if (keys.length === 0) return;
      pendingRef.current = {};
      onUpdateRef.current((prev) => ({
        ...prev,
        m3: { ...(prev.m3 || {}), ...pending },
      }));
    };
  }, [state.cur, tabId]);

  const readCleanText = (el: HTMLElement) =>
    (el.textContent ?? '').replace(/\u00A0/g, ' ');

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const key = target?.dataset?.e;
    if (!key) return;
    // Buffer in ref without triggering React re-render during typing
    pendingRef.current[key] = readCleanText(target);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const key = target?.dataset?.e;
    if (!key) return;
    const text = readCleanText(target);
    delete pendingRef.current[key];
    if (m3Ref.current[key] === text) return;
    onUpdateState((prev) => ({
      ...prev,
      m3: { ...(prev.m3 || {}), [key]: text },
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const target = e.target as HTMLElement;
      if (target?.dataset?.e) {
        e.preventDefault();
        target.blur();
      }
    }
  };

  const handlePrint = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const pending = pendingRef.current;
    if (Object.keys(pending).length > 0) {
      pendingRef.current = {};
      onUpdateState((prev) => ({
        ...prev,
        m3: { ...(prev.m3 || {}), ...pending },
      }));
    }
    setTimeout(() => window.print(), 20);
  };

  const handleDownloadPdf = async () => {
    if (!sheetRef.current || downloadingPdf) return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const pending = pendingRef.current;
    if (Object.keys(pending).length > 0) {
      pendingRef.current = {};
      onUpdateState((prev) => ({
        ...prev,
        m3: { ...(prev.m3 || {}), ...pending },
      }));
    }
    setDownloadingPdf(true);
    try {
      const slug = (TAB_TITLES[tabId] || `Sheet_${tabId}`)
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      await downloadSheetsAsPdf(`${slug}_${state.cur}.pdf`, sheetRef.current);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const resetEdits = () => {
    pendingRef.current = {};
    const pre = `${state.cur}|${tabId}|`;
    onUpdateState((prev) => {
      const nextM3 = { ...(prev.m3 || {}) };
      Object.keys(nextM3).forEach((k) => {
        if (k.startsWith(pre)) delete nextM3[k];
      });
      return { ...prev, m3: nextM3 };
    });
    setResetSeq((s) => s + 1);
  };

  const handleUploadImage = (
    field: 'logo' | 'emblem',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      onUpdateState((prev) => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const hasCustomEdits = Object.keys(state.m3 || {}).some((k) =>
    k.startsWith(`${state.cur}|${tabId}|`)
  );

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-indigo-200/80 dark:border-slate-800 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 no-print shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print this sheet (1 page)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-60 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
            title="Directly download this sheet as an A4 narrow-margin PDF"
          >
            {downloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{downloadingPdf ? 'Creating PDF...' : 'Download PDF'}</span>
          </button>

          {showLogoUploads && (
            <>
              <label className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 cursor-pointer whitespace-nowrap transition-colors">
                <ImagePlus className="w-3.5 h-3.5" />
                <span>Upload logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadImage('logo', e)}
                />
              </label>
              <label className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer whitespace-nowrap transition-colors">
                <ImagePlus className="w-3.5 h-3.5" />
                <span>Upload emblem</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadImage('emblem', e)}
                />
              </label>
            </>
          )}

          {enableCellEdits && (
            <button
              type="button"
              onClick={resetEdits}
              disabled={!hasCustomEdits}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset edited cells</span>
            </button>
          )}
        </div>

        {extraToolbar}

        {enableCellEdits && (
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
            Click any cell on the paper to edit manually (auto-saved on blur).
          </span>
        )}
      </div>

      {/* Horizontal scroll wrapper on narrow screens */}
      <div
        key={`${state.cur}-${tabId}-${resetSeq}`}
        ref={sheetRef}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="print-scroll overflow-x-auto pb-4"
      >
        {children}
      </div>
    </div>
  );
};
