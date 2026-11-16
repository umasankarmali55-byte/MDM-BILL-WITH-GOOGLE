import React, { useEffect, useRef } from 'react';
import { Printer, RotateCcw, ImagePlus } from 'lucide-react';
import { MDMState, TabId } from '../types/mdm';

interface EditableSheetWrapperProps {
  tabId: TabId;
  state: MDMState;
  onUpdateState: (updater: (prev: MDMState) => MDMState) => void;
  enableCellEdits?: boolean;
  showLogoUploads?: boolean;
  extraToolbar?: React.ReactNode;
  children: React.ReactNode;
}

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
  const [resetSeq, setResetSeq] = React.useState(0);

  // Apply contenteditable & saved manual overrides (S.m3) when mounted or month/tab changes
  useEffect(() => {
    if (!enableCellEdits || !sheetRef.current) return;
    const root = sheetRef.current.querySelector('.paper-sheet');
    if (!root) return;

    const pre = `${state.cur}|${tabId}|`;
    const m3 = state.m3 || {};
    const cells = root.querySelectorAll('td, th, .fi, .fl b, .ec');

    cells.forEach((el, idx) => {
      const htmlEl = el as HTMLElement;
      if (
        htmlEl.querySelector('table, input, select, button') ||
        htmlEl.classList.contains('noedit')
      ) {
        return;
      }
      const key = pre + idx;
      htmlEl.setAttribute('contenteditable', 'true');
      htmlEl.dataset.e = key;
      if (m3[key] !== undefined && htmlEl.innerText !== m3[key]) {
        htmlEl.innerText = m3[key];
      }
    });
  }, [enableCellEdits, state.cur, tabId, state.m3, children, resetSeq]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const key = target?.dataset?.e;
    if (!key) return;
    const text = target.innerText;
    onUpdateState((prev) => ({
      ...prev,
      m3: { ...(prev.m3 || {}), [key]: text },
    }));
  };

  const resetEdits = () => {
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
            onClick={() => window.print()}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print this sheet (1 page)</span>
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
            Click any cell on the paper to edit manually (auto-saved for this
            month).
          </span>
        )}
      </div>

      {/* Horizontal scroll wrapper on narrow screens */}
      <div
        key={resetSeq}
        ref={sheetRef}
        onInput={handleInput}
        className="overflow-x-auto pb-4"
      >
        {children}
      </div>
    </div>
  );
};
