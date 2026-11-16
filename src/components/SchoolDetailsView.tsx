import React, { useRef, useState } from 'react';
import { Download, Upload, Plus, Trash2, RotateCcw } from 'lucide-react';
import { MDMState, SchoolInfo } from '../types/mdm';
import { createDefaultState } from '../data/defaultState';
import { num } from '../utils/calculations';

interface SchoolDetailsViewProps {
  state: MDMState;
  onUpdateState: (updater: (prev: MDMState) => MDMState) => void;
}

const INFO_FIELDS: { key: keyof SchoolInfo; label: string }[] = [
  { key: 'school', label: 'School name' },
  { key: 'code', label: 'School UDISE code' },
  { key: 'village', label: 'Gram panchayat' },
  { key: 'block', label: 'Block' },
  { key: 'dist', label: 'District' },
  { key: 'cluster', label: 'Cluster' },
  { key: 'acc', label: 'MDM account no. (PS + UPS)' },
  { key: 'bank', label: 'Bank (PS + UPS)' },
  { key: 'acc2', label: 'MDM account no. (Secondary)' },
  { key: 'bank2', label: 'Bank (Secondary)' },
  { key: 'sup', label: 'Supplier name (receipts)' },
  { key: 'supv', label: 'Supplier village (receipts)' },
  { key: 'post', label: 'Post office (receipts)' },
  { key: 'sup2', label: 'Supplier name (secondary receipts)' },
  { key: 'supv2', label: 'Supplier village (secondary receipts)' },
  { key: 'post2', label: 'Post office (secondary receipts)' },
  { key: 'teacher', label: 'Teacher name' },
  { key: 'role', label: 'Designation' },
];

export const SchoolDetailsView: React.FC<SchoolDetailsViewProps> = ({
  state,
  onUpdateState,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const setInfo = (key: keyof SchoolInfo, value: string) => {
    onUpdateState((prev) => ({
      ...prev,
      info: { ...prev.info, [key]: value },
    }));
  };

  const setDemo = (isSec: boolean, row: number, col: number, val: number) => {
    onUpdateState((prev) => {
      const target = isSec ? prev.demo2 : prev.demo;
      const next = target.map((r, ri) =>
        ri === row ? r.map((v, ci) => (ci === col ? val : v)) : r
      );
      return isSec ? { ...prev, demo2: next } : { ...prev, demo: next };
    });
  };

  const setInsp = (row: number, col: number, val: string) => {
    onUpdateState((prev) => {
      const next = prev.insps.map((r, ri) =>
        ri === row ? r.map((v, ci) => (ci === col ? val : v)) : r
      );
      return { ...prev, insps: next, insp: next[0] || prev.insp };
    });
  };

  const setCook = (isSec: boolean, row: number, col: number, val: string) => {
    onUpdateState((prev) => {
      const target = isSec ? prev.cooks2 : prev.cooks;
      const next = target.map((r, ri) =>
        ri === row ? r.map((v, ci) => (ci === col ? val : v)) : r
      );
      return isSec ? { ...prev, cooks2: next } : { ...prev, cooks: next };
    });
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mdm-backup-${state.cur}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== 'object' || !parsed.info || !parsed.N) {
          setImportMsg('Invalid backup JSON file.');
          return;
        }
        onUpdateState(() => parsed as MDMState);
        setImportMsg('Backup restored successfully.');
        setTimeout(() => setImportMsg(null), 3500);
      } catch {
        setImportMsg('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSample = () => {
    if (!resetArmed) {
      setResetArmed(true);
      setTimeout(() => setResetArmed(false), 4000);
      return;
    }
    setResetArmed(false);
    onUpdateState(() => createDefaultState());
  };

  return (
    <div className="space-y-4">
      {/* School Info */}
      <div className="bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 rounded-lg overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-sky-600 text-white">
          <h2 className="font-display font-bold text-base text-white">
            School, Bank &amp; Supplier Details
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INFO_FIELDS.map(({ key, label }) => (
            <label
              key={key}
              className="flex flex-col gap-1 text-xs font-semibold text-indigo-800 dark:text-indigo-300"
            >
              <span>{label}</span>
              <input
                type="text"
                value={state.info[key] ?? ''}
                onChange={(e) => setInfo(key, e.target.value)}
                className="h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Student Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900/60 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-sky-50 dark:bg-sky-950/50 border-b border-sky-200 dark:border-sky-900/60">
            <h2 className="font-display font-bold text-base text-sky-950 dark:text-sky-200">
              Primary Enrollment Breakdown
            </h2>
          </div>
          <div className="p-5 overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[460px]">
              <thead>
                <tr className="bg-sky-700 dark:bg-sky-900 text-white font-semibold">
                  <th className="border border-sky-600 dark:border-sky-800 px-2.5 py-2 text-left">
                    Level
                  </th>
                  <th className="border border-sky-600 dark:border-sky-800 px-2 py-2">
                    ST B
                  </th>
                  <th className="border border-sky-600 dark:border-sky-800 px-2 py-2">
                    ST G
                  </th>
                  <th className="border border-sky-600 dark:border-sky-800 px-2 py-2">
                    SC B
                  </th>
                  <th className="border border-sky-600 dark:border-sky-800 px-2 py-2">
                    SC G
                  </th>
                  <th className="border border-sky-600 dark:border-sky-800 px-2 py-2">
                    Oth B
                  </th>
                  <th className="border border-sky-600 dark:border-sky-800 px-2 py-2">
                    Oth G
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.demo.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="border border-slate-200 dark:border-slate-700 px-2.5 py-2 font-semibold">
                      {['SB', 'Primary', 'Upper primary'][rIdx]}
                    </td>
                    {row.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        className="border border-slate-200 dark:border-slate-700 p-1 text-center"
                      >
                        <input
                          type="number"
                          min={0}
                          value={val}
                          onChange={(e) =>
                            setDemo(false, rIdx, cIdx, Math.max(0, num(e.target.value)))
                          }
                          className="w-12 h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-900/60 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-violet-50 dark:bg-violet-950/50 border-b border-violet-200 dark:border-violet-900/60">
            <h2 className="font-display font-bold text-base text-violet-950 dark:text-violet-200">
              Secondary (Class 9–10) Enrollment Breakdown
            </h2>
          </div>
          <div className="p-5 overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[460px]">
              <thead>
                <tr className="bg-violet-700 dark:bg-violet-900 text-white font-semibold">
                  <th className="border border-violet-600 dark:border-violet-800 px-2.5 py-2 text-left">
                    Class
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-2 py-2">
                    ST B
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-2 py-2">
                    ST G
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-2 py-2">
                    SC B
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-2 py-2">
                    SC G
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-2 py-2">
                    Oth B
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-2 py-2">
                    Oth G
                  </th>
                </tr>
              </thead>
            <tbody>
              {state.demo2.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="border border-slate-200 dark:border-slate-700 px-2.5 py-2 font-semibold">
                    Class {rIdx + 9}
                  </td>
                  {row.map((val, cIdx) => (
                    <td
                      key={cIdx}
                      className="border border-slate-200 dark:border-slate-700 p-1 text-center"
                    >
                      <input
                        type="number"
                        min={0}
                        value={val}
                        onChange={(e) =>
                          setDemo(true, rIdx, cIdx, Math.max(0, num(e.target.value)))
                        }
                        className="w-12 h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Inspection by Officials */}
      <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-lg overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-teal-50 dark:bg-teal-950/50 border-b border-teal-200 dark:border-teal-900/60">
          <h2 className="font-display font-bold text-base text-teal-950 dark:text-teal-200">
            Inspection by Officials
          </h2>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full border-collapse text-xs min-w-[640px]">
            <thead>
              <tr className="bg-teal-700 dark:bg-teal-900 text-white font-semibold">
                <th className="border border-teal-600 dark:border-teal-800 px-2.5 py-2 w-12">
                  No.
                </th>
                <th className="border border-teal-600 dark:border-teal-800 px-2.5 py-2 text-left">
                  Official Name
                </th>
                <th className="border border-teal-600 dark:border-teal-800 px-2.5 py-2 text-left">
                  Designation
                </th>
                <th className="border border-teal-600 dark:border-teal-800 px-2.5 py-2 text-left">
                  Times
                </th>
                <th className="border border-teal-600 dark:border-teal-800 px-2.5 py-2 text-left">
                  Date
                </th>
                <th className="border border-teal-600 dark:border-teal-800 px-2.5 py-2 text-left">
                  Remark
                </th>
              </tr>
            </thead>
          <tbody>
            {state.insps.map((row, rIdx) => (
              <tr key={rIdx}>
                <td className="border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-center font-semibold">
                  {rIdx + 1}
                </td>
                {row.map((val, cIdx) => (
                  <td
                    key={cIdx}
                    className="border border-slate-200 dark:border-slate-700 p-1"
                  >
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setInsp(rIdx, cIdx, e.target.value)}
                      className="w-full h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Cooks Details */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[
          {
            title: 'Primary Cook-cum-Helpers',
            isSec: false,
            list: state.cooks,
            cardBorder: 'border-amber-200 dark:border-amber-900/60',
            hdrBg: 'bg-amber-50 dark:bg-amber-950/45 border-amber-200 dark:border-amber-900/60',
            hdrText: 'text-amber-950 dark:text-amber-200',
            thBg: 'bg-amber-600 dark:bg-amber-900 text-white',
            thBorder: 'border-amber-500 dark:border-amber-800',
          },
          {
            title: 'Secondary Cook-cum-Helpers (Class 9–10)',
            isSec: true,
            list: state.cooks2,
            cardBorder: 'border-rose-200 dark:border-rose-900/60',
            hdrBg: 'bg-rose-50 dark:bg-rose-950/45 border-rose-200 dark:border-rose-900/60',
            hdrText: 'text-rose-950 dark:text-rose-200',
            thBg: 'bg-rose-600 dark:bg-rose-900 text-white',
            thBorder: 'border-rose-500 dark:border-rose-800',
          },
        ].map(({ title, isSec, list, cardBorder, hdrBg, hdrText, thBg, thBorder }) => (
          <div
            key={title}
            className={`bg-white dark:bg-slate-900 border ${cardBorder} rounded-lg overflow-hidden shadow-sm`}
          >
            <div className={`px-5 py-3 border-b ${hdrBg} flex items-center justify-between gap-2`}>
              <h2 className={`font-display font-bold text-base ${hdrText}`}>
                {title}
              </h2>
              <button
                type="button"
                onClick={() =>
                  onUpdateState((prev) => {
                    const next = isSec
                      ? [...prev.cooks2, ['', '', '']]
                      : [...prev.cooks, ['', '', 'UKGB CHALLANGUDA']];
                    return isSec
                      ? { ...prev, cooks2: next }
                      : { ...prev, cooks: next };
                  })
                }
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add cook</span>
              </button>
            </div>
            <div className="p-5 overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[460px]">
              <thead>
                <tr className={`${thBg} font-semibold`}>
                  <th className={`border ${thBorder} px-2 py-2 w-10`}>
                    No.
                  </th>
                  <th className={`border ${thBorder} px-2 py-2 text-left`}>
                    Cook Name
                  </th>
                  <th className={`border ${thBorder} px-2 py-2 text-left`}>
                    Savings A/C No.
                  </th>
                  <th className={`border ${thBorder} px-2 py-2 text-left`}>
                    Bank
                  </th>
                  <th className={`border ${thBorder} px-2 py-2 w-10`} />
                </tr>
              </thead>
              <tbody>
                {list.map((cook, rIdx) => (
                  <tr key={rIdx}>
                    <td className="border border-slate-200 dark:border-slate-700 px-2 py-2 text-center font-semibold">
                      {rIdx + 1}
                    </td>
                    {[0, 1, 2].map((cIdx) => (
                      <td
                        key={cIdx}
                        className="border border-slate-200 dark:border-slate-700 p-1"
                      >
                        <input
                          type="text"
                          value={cook[cIdx] ?? ''}
                          onChange={(e) =>
                            setCook(isSec, rIdx, cIdx, e.target.value)
                          }
                          className="w-full h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                        />
                      </td>
                    ))}
                    <td className="border border-slate-200 dark:border-slate-700 p-1 text-center">
                      {list.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateState((prev) => {
                              const next = (isSec
                                ? prev.cooks2
                                : prev.cooks
                              ).filter((_, i) => i !== rIdx);
                              return isSec
                                ? { ...prev, cooks2: next }
                                : { ...prev, cooks: next };
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          aria-label="Remove cook"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ))}
      </div>

      {/* MDM Fund for MDCF */}
      <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-lg overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-900/60">
          <h2 className="font-display font-bold text-base text-emerald-950 dark:text-emerald-200">
            MDM Fund Balances (₹) for MDCF
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'Primary opening balance',
            'Primary received this month',
            'Upper primary opening balance',
            'Upper primary received this month',
            'Secondary (9–10) opening balance',
            'Secondary (9–10) received this month',
          ].map((label, idx) => (
            <label
              key={label}
              className="flex flex-col gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
            >
              <span>{label}</span>
              <input
                type="number"
                step="any"
                value={state.fund[idx] ?? 0}
                onChange={(e) => {
                  const val = num(e.target.value);
                  onUpdateState((prev) => {
                    const nextFund = [...prev.fund];
                    nextFund[idx] = val;
                    return { ...prev, fund: nextFund };
                  });
                }}
                className="h-9 px-3 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono-num text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Local Backup &amp; Data Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All changes auto-save in your browser. Export a JSON backup to
              transfer across devices.
            </p>
            {importMsg && (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                {importMsg}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON backup</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportBackup}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON backup</span>
            </button>

            <button
              type="button"
              onClick={handleResetSample}
              className={`h-9 px-3.5 inline-flex items-center gap-2 rounded-md border text-xs font-semibold transition-colors ${
                resetArmed
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/35 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {resetArmed ? 'Confirm reset all data' : 'Reset to sample data'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
