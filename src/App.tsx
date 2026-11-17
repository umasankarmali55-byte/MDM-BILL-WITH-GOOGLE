import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download,
  FileDown,
  Menu,
  Moon,
  Printer,
  Sun,
  ChevronDown,
} from 'lucide-react';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MDMState, TabId } from './types/mdm';
import { MNAMES, loadState, saveState } from './data/defaultState';
import {
  calcPrimary,
  calcSecondary,
  parseMonthKey,
} from './utils/calculations';
import { Sidebar, TAB_TITLES } from './components/Sidebar';
import { applyA4PrintFit, clearA4PrintFit } from './utils/printFit';
import { AttendanceView } from './components/AttendanceView';
import { NormsMenuView } from './components/NormsMenuView';
import { SchoolDetailsView } from './components/SchoolDetailsView';
import { AbstractView } from './components/AbstractView';
import { EditableSheetWrapper } from './components/EditableSheetWrapper';
import {
  Form15PrimarySheet,
  LaddooForm15PrimarySheet,
  LaddooReportSheet,
  MDCFPage1Sheet,
  MDCFPage2Sheet,
  PMPoshanReportSheet,
} from './components/reports/PrimaryReports';
import {
  Form15SecondarySheet,
  LaddooForm15SecondarySheet,
  SecondaryReportSheet,
} from './components/reports/SecondaryReports';
import {
  FuelGroceryVegReceiptSheet,
  LaddooCookWageReceiptSheet,
  LaddooIngredientsReceiptSheet,
  VoucherReconciliationBar,
} from './components/reports/VouchersView';
import { ExportPackType, ExportPackView } from './components/ExportPackView';

const PRINTABLE_TABS = new Set<TabId>([
  2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
]);

export default function App() {
  const [state, setState] = useState<MDMState>(() => loadState());
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const q = new URLSearchParams(window.location.search).get('tab');
    const n = q !== null ? Number(q) : 1;
    return Number.isInteger(n) && n >= 0 && n <= 20 ? (n as TabId) : 1;
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mdm_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches
      );
    } catch {
      return false;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportPack, setExportPack] = useState<ExportPackType | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    try {
      localStorage.setItem('mdm_theme', darkMode ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [darkMode]);

  useEffect(() => {
    window.addEventListener('beforeprint', applyA4PrintFit);
    window.addEventListener('afterprint', clearA4PrintFit);
    return () => {
      window.removeEventListener('beforeprint', applyA4PrintFit);
      window.removeEventListener('afterprint', clearA4PrintFit);
    };
  }, []);

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const updateState = useCallback((updater: (prev: MDMState) => MDMState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const handleChangeMonth = useCallback((newYear: number, newMonth: number) => {
    setState((prev) => {
      const { year: curY, month: curM } = parseMonthKey(prev.cur);
      if (!newYear || (newYear === curY && newMonth === curM)) return prev;

      const R = calcPrimary(prev);
      const Rsec = calcSecondary(prev);
      const isNextSequential =
        newYear * 12 + newMonth === curY * 12 + curM + 1;

      const c0 = prev.open[0] + prev.recv[0] - (R.np * prev.N.rice[0]) / 1000;
      const c1 = prev.open[1] + prev.recv[1] - (R.nu * prev.N.rice[1]) / 1000;
      const c2 = (prev.open[2] || 0) + (prev.recv[2] || 0) - Rsec.rice;

      const updatedMonths = {
        ...prev.months,
        [prev.cur]: {
          att: prev.att,
          hol: prev.hol,
          holn: prev.holn,
          open: prev.open,
          recv: prev.recv,
        },
      };

      const nextKey = `${newYear}-${newMonth}`;
      const archived = updatedMonths[nextKey];

      const nextState: MDMState = {
        ...prev,
        cur: nextKey,
        months: updatedMonths,
        att: archived ? archived.att : {},
        hol: archived ? archived.hol : {},
        holn: archived ? archived.holn || {} : {},
        recv: archived ? archived.recv : [0, 0, 0],
        open: archived
          ? archived.open
          : isNextSequential
          ? [
              Math.max(0, Math.round(c0 * 1000) / 1000),
              Math.max(0, Math.round(c1 * 1000) / 1000),
              Math.max(0, Math.round(c2 * 1000) / 1000),
            ]
          : [0, 0, 0],
      };

      saveState(nextState);
      return nextState;
    });
  }, []);

  const handleAutoFillVouchers = useCallback(
    (sec: boolean) => {
      const tabs = sec ? [18, 19, 20] : [15, 16, 17];
      updateState((prev) => {
        const nextM3 = { ...(prev.m3 || {}) };
        tabs.forEach((t) => {
          const pre = `${prev.cur}|${t}|`;
          Object.keys(nextM3).forEach((k) => {
            if (k.startsWith(pre)) delete nextM3[k];
          });
        });
        return { ...prev, m3: nextM3 };
      });
    },
    [updateState]
  );

  if (exportPack) {
    return (
      <ExportPackView
        pack={exportPack}
        state={state}
        onDone={() => setExportPack(null)}
      />
    );
  }

  const { year, month } = parseMonthKey(state.cur);
  const monthLabel = `${MNAMES[month]} ${year}`;

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <NormsMenuView state={state} onUpdateState={updateState} />;
      case 1:
        return (
          <AttendanceView
            state={state}
            onUpdateState={updateState}
            onChangeMonth={handleChangeMonth}
          />
        );
      case 4:
        return <SchoolDetailsView state={state} onUpdateState={updateState} />;
      case 7:
        return <AbstractView state={state} onUpdateState={updateState} />;
      case 12:
        return (
          <AbstractView state={state} secondary onUpdateState={updateState} />
        );

      case 2:
        return (
          <EditableSheetWrapper
            tabId={2}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
          >
            <Form15PrimarySheet state={state} />
          </EditableSheetWrapper>
        );
      case 3:
        return (
          <EditableSheetWrapper
            tabId={3}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
            showLogoUploads
          >
            <PMPoshanReportSheet state={state} />
          </EditableSheetWrapper>
        );
      case 5:
        return (
          <EditableSheetWrapper
            tabId={5}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
            showLogoUploads
          >
            <LaddooReportSheet state={state} />
          </EditableSheetWrapper>
        );
      case 6:
        return (
          <EditableSheetWrapper
            tabId={6}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
          >
            <LaddooForm15PrimarySheet state={state} />
          </EditableSheetWrapper>
        );
      case 8:
        return (
          <EditableSheetWrapper
            tabId={8}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
          >
            <MDCFPage1Sheet state={state} />
          </EditableSheetWrapper>
        );
      case 9:
        return (
          <EditableSheetWrapper
            tabId={9}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
          >
            <MDCFPage2Sheet state={state} onUpdateState={updateState} />
          </EditableSheetWrapper>
        );
      case 10:
        return (
          <EditableSheetWrapper
            tabId={10}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
          >
            <Form15SecondarySheet state={state} />
          </EditableSheetWrapper>
        );
      case 11:
        return (
          <EditableSheetWrapper
            tabId={11}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
            showLogoUploads
          >
            <SecondaryReportSheet state={state} />
          </EditableSheetWrapper>
        );
      case 13:
        return (
          <EditableSheetWrapper
            tabId={13}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
          >
            <LaddooForm15SecondarySheet state={state} />
          </EditableSheetWrapper>
        );
      case 14:
        return (
          <EditableSheetWrapper
            tabId={14}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
            showLogoUploads
          >
            <LaddooReportSheet state={state} secondary />
          </EditableSheetWrapper>
        );

      case 15:
      case 16:
      case 17:
        return (
          <EditableSheetWrapper
            tabId={activeTab}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
            extraToolbar={
              <VoucherReconciliationBar
                state={state}
                onAutoFillAll={() => handleAutoFillVouchers(false)}
              />
            }
          >
            {activeTab === 15 && <FuelGroceryVegReceiptSheet state={state} />}
            {activeTab === 16 && (
              <LaddooIngredientsReceiptSheet state={state} />
            )}
            {activeTab === 17 && <LaddooCookWageReceiptSheet state={state} />}
          </EditableSheetWrapper>
        );

      case 18:
      case 19:
      case 20:
        return (
          <EditableSheetWrapper
            tabId={activeTab}
            state={state}
            onUpdateState={updateState}
            enableCellEdits
            extraToolbar={
              <VoucherReconciliationBar
                state={state}
                secondary
                onAutoFillAll={() => handleAutoFillVouchers(true)}
              />
            }
          >
            {activeTab === 18 && (
              <FuelGroceryVegReceiptSheet state={state} secondary />
            )}
            {activeTab === 19 && (
              <LaddooIngredientsReceiptSheet state={state} secondary />
            )}
            {activeTab === 20 && (
              <LaddooCookWageReceiptSheet state={state} secondary />
            )}
          </EditableSheetWrapper>
        );
    }
  };

  return (
    <div className="print-shell min-h-screen flex bg-gradient-to-br from-sky-50/70 via-slate-50 to-indigo-50/70 dark:from-[#070B14] dark:via-[#0B1221] dark:to-[#0E172A] text-slate-900 dark:text-slate-100">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        schoolName={state.info.school}
        monthLabel={monthLabel}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="print-shell flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb on Left, Actions on Right */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
          <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 via-purple-500 to-emerald-500" />
          <div className="h-14 px-4 lg:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sm min-w-0 truncate">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300 truncate hidden sm:inline">
                  {state.info.school}
                </span>
                <span
                  className="text-slate-300 dark:text-slate-700 hidden sm:inline"
                  aria-hidden="true"
                >
                  /
                </span>
                <span className="font-display font-bold text-slate-900 dark:text-white truncate">
                  {TAB_TITLES[activeTab]}
                </span>
                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                  ·
                </span>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 whitespace-nowrap">
                  {monthLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <PWAInstallButton />

              <a
                href="/mdm-pwa-app.zip"
                download="mdm-pwa-app.zip"
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors whitespace-nowrap"
                title="Download complete PWA app ZIP (build + source)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">PWA ZIP</span>
              </a>

              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-md border text-xs font-semibold transition-colors whitespace-nowrap ${
                  darkMode
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
                aria-label={
                  darkMode ? 'Switch to light theme' : 'Switch to dark theme'
                }
                title={
                  darkMode ? 'Switch to light theme' : 'Switch to dark theme'
                }
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                )}
              </button>

              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setExportMenuOpen((o) => !o)}
                  className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors whitespace-nowrap"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export PDF Packs</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1.5 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        setExportPack('primary');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    >
                      Export PDF · Primary (7 sheets)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        setExportPack('secondary');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50"
                    >
                      Export PDF · Secondary (5 sheets)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        setExportPack('vouchers');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                    >
                      Export PDF · Vouchers (3 sheets)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        setExportPack('sec_vouchers');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      Export PDF · Secondary Vouchers
                    </button>
                  </div>
                )}
              </div>

              {PRINTABLE_TABS.has(activeTab) && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden sm:inline-flex h-9 px-3.5 items-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="print-main flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          {renderContent()}
        </main>
      </div>
      <OfflineIndicator />
    </div>
  );
}
