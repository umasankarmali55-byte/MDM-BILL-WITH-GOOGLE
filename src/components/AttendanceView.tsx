import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Trash2,
  Maximize2,
  Minimize2,
  Split,
  Grid3X3,
} from 'lucide-react';
import { MDMState } from '../types/mdm';
import { CLASS_LABELS, DN, MNAMES } from '../data/defaultState';
import {
  dayTot,
  distributeTotal,
  getWeekday,
  num,
  parseMonthKey,
} from '../utils/calculations';

interface AttendanceViewProps {
  state: MDMState;
  onUpdateState: (updater: (prev: MDMState) => MDMState) => void;
  onChangeMonth: (year: number, month: number) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  state,
  onUpdateState,
  onChangeMonth,
}) => {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const mm = String(month + 1).padStart(2, '0');
  const [clearArmed, setClearArmed] = useState(false);

  const isQuick = !!state.attQuick;
  const isBig = !!state.big;

  const navigateMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y--;
    }
    if (m > 11) {
      m = 0;
      y++;
    }
    onChangeMonth(y, m);
  };

  const setCell = (day: number, colIdx: number, raw: string) => {
    onUpdateState((prev) => {
      const nextAtt = { ...prev.att };
      const row = [...(nextAtt[day] || [])];
      row[colIdx] = raw === '' ? '' : Math.max(0, Math.round(num(raw)));
      nextAtt[day] = row;
      return { ...prev, att: nextAtt };
    });
  };

  const setQuickGroup = (
    day: number,
    group: 'sb' | 'ps' | 'up' | 'sec',
    raw: string
  ) => {
    onUpdateState((prev) => {
      const nextAtt = { ...prev.att };
      const row = [...(nextAtt[day] || [])];
      const blank = raw.trim() === '';
      const total = Math.max(0, Math.round(num(raw)));

      const apply = (from: number, rolls: number[]) => {
        const split = blank ? rolls.map(() => '') : distributeTotal(total, rolls);
        split.forEach((val, idx) => {
          row[from + idx] = val;
        });
      };

      if (group === 'sb') apply(0, [1]);
      else if (group === 'ps') apply(1, prev.rolls.slice(1, 6));
      else if (group === 'up') apply(6, prev.rolls.slice(6, 9));
      else apply(9, prev.rolls2);

      nextAtt[day] = row;
      return { ...prev, att: nextAtt };
    });
  };

  const toggleHoliday = (day: number) => {
    onUpdateState((prev) => {
      const nextHol = { ...prev.hol };
      nextHol[day] = nextHol[day] ? 0 : 1;
      return { ...prev, hol: nextHol };
    });
  };

  const setHolidayName = (day: number, name: string) => {
    onUpdateState((prev) => ({
      ...prev,
      holn: { ...prev.holn, [day]: name },
    }));
  };

  const setRoll = (index: number, isSec: boolean, val: number) => {
    onUpdateState((prev) => {
      if (isSec) {
        const nextR2: [number, number] = [...prev.rolls2] as [number, number];
        nextR2[index] = Math.max(0, Math.round(val));
        return { ...prev, rolls2: nextR2 };
      }
      const nextR = [...prev.rolls];
      nextR[index] = Math.max(0, Math.round(val));
      return { ...prev, rolls: nextR };
    });
  };

  const handleClearMonth = () => {
    if (!clearArmed) {
      setClearArmed(true);
      setTimeout(() => setClearArmed(false), 4000);
      return;
    }
    setClearArmed(false);
    onUpdateState((prev) => ({
      ...prev,
      att: {},
      hol: {},
      holn: {},
    }));
  };

  // Compute summary totals across the month
  const colSums = Array(11).fill(0);
  const groupSums = [0, 0, 0, 0, 0]; // sb, ps, up, totalPrimary, sec
  let mealDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    if (state.hol[d]) continue;
    const row = state.att[d] || [];
    for (let i = 0; i < 11; i++) colSums[i] += num(row[i]);
    const t = dayTot(state, d);
    for (let i = 0; i < 5; i++) groupSums[i] += t[i];
    if (t[3] || t[4]) mealDays++;
  }

  return (
    <div className="space-y-4">
      {/* Month Controls & Actions Toolbar */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-indigo-200/80 dark:border-slate-800 rounded-lg p-4 no-print shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="h-10 px-3 inline-flex items-center gap-1.5 rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            <label className="flex flex-col gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <span>Month</span>
              <select
                value={month}
                onChange={(e) => onChangeMonth(year, Number(e.target.value))}
                className="h-10 px-3 rounded-md border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {MNAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <span>Year</span>
              <input
                type="number"
                value={year}
                min={2000}
                max={2100}
                onChange={(e) => {
                  const y = parseInt(e.target.value, 10);
                  if (y >= 2000 && y <= 2100) onChangeMonth(y, month);
                }}
                className="h-10 w-24 px-3 rounded-md border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold font-mono-num text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="h-10 px-3 inline-flex items-center gap-1.5 rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors whitespace-nowrap"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onUpdateState((prev) => ({ ...prev, big: !prev.big }))
              }
              className={`h-10 px-3.5 inline-flex items-center gap-2 rounded-md border text-sm font-semibold transition-colors whitespace-nowrap ${
                isBig
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 border-sky-600 text-white shadow-sm'
                  : 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50'
              }`}
              title="Toggle larger input cells for easier typing"
            >
              {isBig ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              <span>{isBig ? 'Compact cells' : 'Larger cells'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateState((prev) => ({ ...prev, attQuick: !prev.attQuick }))
              }
              className={`h-10 px-3.5 inline-flex items-center gap-2 rounded-md border text-sm font-semibold transition-colors whitespace-nowrap ${
                isQuick
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 border-violet-600 text-white shadow-sm'
                  : 'bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50'
              }`}
              title="Enter group totals (SB, Primary, Upper Primary, Secondary) to auto-split proportionally by roll strength"
            >
              {isQuick ? (
                <Split className="w-4 h-4" />
              ) : (
                <Grid3X3 className="w-4 h-4" />
              )}
              <span>
                {isQuick ? 'Group auto-split' : 'Class-wise entry'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleClearMonth}
              className={`h-10 px-3.5 inline-flex items-center gap-2 rounded-md border text-sm font-semibold transition-colors whitespace-nowrap ${
                clearArmed
                  ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/35 border-rose-300 dark:border-rose-900/70 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{clearArmed ? 'Confirm clear month' : 'Clear month'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Print register</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6-Metric Color-Coded Summary Bar & Rice Stock Strip */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 no-print">
        <div className="xl:col-span-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="bg-indigo-50/90 dark:bg-indigo-950/45 border border-indigo-200 dark:border-indigo-800/80 rounded-lg p-3.5">
            <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Meal Days
            </div>
            <div className="text-2xl font-bold font-mono-num text-indigo-950 dark:text-indigo-100 mt-1">
              {mealDays}
            </div>
          </div>
          <div className="bg-violet-50/90 dark:bg-violet-950/45 border border-violet-200 dark:border-violet-800/80 rounded-lg p-3.5">
            <div className="text-xs font-semibold text-violet-700 dark:text-violet-300">
              SB Meals
            </div>
            <div className="text-2xl font-bold font-mono-num text-violet-950 dark:text-violet-100 mt-1">
              {groupSums[0]}
            </div>
          </div>
          <div className="bg-sky-50/90 dark:bg-sky-950/45 border border-sky-200 dark:border-sky-800/80 rounded-lg p-3.5">
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-300">
              Primary (1–5)
            </div>
            <div className="text-2xl font-bold font-mono-num text-sky-950 dark:text-sky-100 mt-1">
              {groupSums[1]}
            </div>
          </div>
          <div className="bg-teal-50/90 dark:bg-teal-950/45 border border-teal-200 dark:border-teal-800/80 rounded-lg p-3.5">
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-300">
              Upper Primary
            </div>
            <div className="text-2xl font-bold font-mono-num text-teal-950 dark:text-teal-100 mt-1">
              {groupSums[2]}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 border border-blue-600 dark:border-blue-500 rounded-lg p-3.5 text-white shadow-sm">
            <div className="text-xs font-semibold text-blue-100">
              Total Primary
            </div>
            <div className="text-2xl font-bold font-mono-num text-white mt-1">
              {groupSums[3]}
            </div>
          </div>
          <div className="bg-fuchsia-50/90 dark:bg-fuchsia-950/45 border border-fuchsia-200 dark:border-fuchsia-800/80 rounded-lg p-3.5">
            <div className="text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-300">
              Secondary (9–10)
            </div>
            <div className="text-2xl font-bold font-mono-num text-fuchsia-950 dark:text-fuchsia-100 mt-1">
              {groupSums[4]}
            </div>
          </div>
        </div>

        {/* Rice Stock Entry */}
        <div className="xl:col-span-5 bg-emerald-50/75 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-lg p-3.5">
          <div className="grid grid-cols-4 gap-2 items-center text-xs">
            <div className="font-bold text-emerald-800 dark:text-emerald-300">
              Rice Stock (kg)
            </div>
            <div className="text-center font-bold text-sky-700 dark:text-sky-300">
              Primary
            </div>
            <div className="text-center font-bold text-teal-700 dark:text-teal-300">
              Upper Pri.
            </div>
            <div className="text-center font-bold text-purple-700 dark:text-purple-300">
              Secondary
            </div>

            <div className="font-semibold text-emerald-900 dark:text-emerald-200">
              Opening bal.
            </div>
            {[0, 1, 2].map((idx) => (
              <input
                key={`open-${idx}`}
                type="number"
                step="any"
                value={state.open[idx] ?? 0}
                onChange={(e) => {
                  const v = num(e.target.value);
                  onUpdateState((prev) => {
                    const nextOpen = [...prev.open] as [number, number, number];
                    nextOpen[idx] = v;
                    return { ...prev, open: nextOpen };
                  });
                }}
                className="h-8 w-full px-1.5 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center font-mono-num text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ))}

            <div className="font-semibold text-emerald-900 dark:text-emerald-200">
              Received
            </div>
            {[0, 1, 2].map((idx) => (
              <input
                key={`recv-${idx}`}
                type="number"
                step="any"
                value={state.recv[idx] ?? 0}
                onChange={(e) => {
                  const v = num(e.target.value);
                  onUpdateState((prev) => {
                    const nextRecv = [...prev.recv] as [number, number, number];
                    nextRecv[idx] = v;
                    return { ...prev, recv: nextRecv };
                  });
                }}
                className="h-8 w-full px-1.5 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center font-mono-num text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ))}
          </div>
        </div>
      </div>

      {isQuick && (
        <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-900 dark:text-violet-200 rounded-md px-4 py-2.5 text-sm no-print">
          Group auto-split mode is active: type totals into the highlighted{' '}
          <strong>SB</strong>, <strong>PS</strong>, <strong>UPS</strong>, or{' '}
          <strong>SEC 9–10</strong> columns on the right, and individual classes
          auto-fill proportionally to class roll strength.
        </div>
      )}

      {/* Attendance Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[72vh] overflow-y-auto">
          <table className="w-full border-collapse text-left min-w-[1160px]">
            <thead className="sticky top-0 z-20">
              <tr className="text-white text-xs font-semibold">
                <th className="sticky left-0 z-30 bg-indigo-950 dark:bg-slate-950 px-3 py-2.5 border-b border-r border-indigo-800 dark:border-slate-800 w-28">
                  Date
                </th>
                <th className="bg-indigo-950 dark:bg-slate-950 px-2 py-2.5 border-b border-r border-indigo-800 dark:border-slate-800 text-center w-16 no-print">
                  Holiday
                </th>
                <th className="bg-indigo-950 dark:bg-slate-950 px-2.5 py-2.5 border-b border-r border-indigo-800 dark:border-slate-800 w-28">
                  Day
                </th>
                {CLASS_LABELS.map((lbl, idx) => {
                  const colHdrBg =
                    idx === 0
                      ? 'bg-violet-700 dark:bg-violet-900 border-violet-600 dark:border-violet-800'
                      : idx <= 5
                      ? 'bg-sky-700 dark:bg-sky-900 border-sky-600 dark:border-sky-800'
                      : idx <= 8
                      ? 'bg-teal-700 dark:bg-teal-900 border-teal-600 dark:border-teal-800'
                      : 'bg-purple-700 dark:bg-purple-900 border-purple-600 dark:border-purple-800';
                  return (
                    <th
                      key={lbl}
                      className={`px-1.5 py-2.5 border-b border-r text-center font-mono-num ${colHdrBg}`}
                    >
                      {lbl}
                    </th>
                  );
                })}
                <th className="px-2 py-2.5 border-b border-r border-violet-700 text-center bg-violet-800 dark:bg-violet-950">
                  SB
                </th>
                <th className="px-2 py-2.5 border-b border-r border-sky-700 text-center bg-sky-800 dark:bg-sky-950">
                  PS
                </th>
                <th className="px-2 py-2.5 border-b border-r border-teal-700 text-center bg-teal-800 dark:bg-teal-950">
                  UPS
                </th>
                <th className="px-2 py-2.5 border-b border-r border-blue-500 text-center bg-blue-600 dark:bg-blue-800">
                  Total
                </th>
                <th className="px-2 py-2.5 border-b border-purple-700 text-center bg-purple-800 dark:bg-purple-950">
                  SEC 9–10
                </th>
              </tr>

              {/* Class Roll Strength Row */}
              <tr className="bg-amber-50 dark:bg-amber-950/75 text-amber-950 dark:text-amber-100 text-xs font-semibold border-b-2 border-amber-300 dark:border-amber-800">
                <th
                  colSpan={3}
                  className="sticky left-0 z-30 bg-amber-100/95 dark:bg-amber-950 px-3 py-2 border-r border-amber-200 dark:border-amber-800 text-left"
                >
                  Class Roll Strength
                </th>
                {state.rolls.map((val, idx) => (
                  <th
                    key={`roll1-${idx}`}
                    className="p-1 border-r border-amber-200 dark:border-amber-800 text-center"
                  >
                    <input
                      type="number"
                      min={0}
                      value={val}
                      onChange={(e) => setRoll(idx, false, num(e.target.value))}
                      className="w-12 h-7 rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center font-mono-num text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </th>
                ))}
                {state.rolls2.map((val, idx) => (
                  <th
                    key={`roll2-${idx}`}
                    className="p-1 border-r border-amber-200 dark:border-amber-800 text-center"
                  >
                    <input
                      type="number"
                      min={0}
                      value={val}
                      onChange={(e) => setRoll(idx, true, num(e.target.value))}
                      className="w-12 h-7 rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center font-mono-num text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </th>
                ))}
                <th
                  colSpan={5}
                  className="px-2 py-2 text-center text-xs font-medium text-amber-900 dark:text-amber-200"
                >
                  Primary Roll:{' '}
                  <span className="font-mono-num font-bold">
                    {state.rolls.reduce((a, b) => a + b, 0)}
                  </span>{' '}
                  · Sec Roll:{' '}
                  <span className="font-mono-num font-bold">
                    {state.rolls2[0] + state.rolls2[1]}
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {Array.from({ length: daysInMonth }, (_, idx) => {
                const d = idx + 1;
                const w = getWeekday(year, month, d);
                const isHol = !!state.hol[d];
                const isSun = w === 0;
                const isSat = w === 6;
                const dateStr = `${String(d).padStart(2, '0')}-${mm}-${year}`;
                const row = state.att[d] || [];
                const t = dayTot(state, d);

                let rowBg =
                  idx % 2 === 0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50/70 dark:bg-slate-800/40';
                let stickyBg =
                  idx % 2 === 0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50 dark:bg-slate-800';

                if (isHol) {
                  rowBg = 'bg-red-50 dark:bg-red-950/35';
                  stickyBg = 'bg-red-50 dark:bg-red-950/70';
                } else if (isSun) {
                  rowBg = 'bg-slate-100 dark:bg-slate-800/80';
                  stickyBg = 'bg-slate-100 dark:bg-slate-800';
                } else if (isSat) {
                  rowBg = 'bg-amber-50/60 dark:bg-amber-950/20';
                  stickyBg = 'bg-amber-50 dark:bg-amber-950/40';
                }

                const inputSizeClass = isBig
                  ? 'h-11 w-16 text-base'
                  : 'h-8 w-12 text-xs';

                return (
                  <tr
                    key={d}
                    className={`${rowBg} hover:bg-sky-50/60 dark:hover:bg-sky-950/20 transition-colors`}
                  >
                    <td
                      className={`sticky left-0 z-10 ${stickyBg} px-3 py-1.5 border-r border-slate-200 dark:border-slate-800 font-mono-num font-semibold text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap`}
                    >
                      {dateStr}
                    </td>

                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-800 text-center no-print">
                      <button
                        type="button"
                        onClick={() => toggleHoliday(d)}
                        className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${
                          isHol
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-400'
                        }`}
                      >
                        {isHol ? 'HOL' : 'Hol'}
                      </button>
                    </td>

                    <td className="px-2.5 py-1.5 border-r border-slate-200 dark:border-slate-800 text-xs font-semibold whitespace-nowrap">
                      <span
                        className={
                          isHol
                            ? 'text-red-700 dark:text-red-400'
                            : isSun
                            ? 'text-red-600 dark:text-red-400'
                            : isSat
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }
                      >
                        {DN[w]}
                        {isSun ? ' (Off)' : ''}
                      </span>
                    </td>

                    {isHol ? (
                      <td
                        colSpan={11}
                        className="px-3 py-1.5 border-r border-slate-200 dark:border-slate-800"
                      >
                        <input
                          type="text"
                          maxLength={40}
                          placeholder="Holiday reason (optional), e.g. Gandhi Jayanti"
                          value={state.holn[d] || ''}
                          onChange={(e) => setHolidayName(d, e.target.value)}
                          className="w-full h-8 px-3 rounded border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 text-red-900 dark:text-red-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </td>
                    ) : (
                      CLASS_LABELS.map((_, colIdx) => (
                        <td
                          key={colIdx}
                          className="p-1 border-r border-slate-200 dark:border-slate-800 text-center"
                        >
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={row[colIdx] ?? ''}
                            readOnly={isQuick}
                            tabIndex={isQuick ? -1 : 0}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setCell(d, colIdx, e.target.value)}
                            className={`${inputSizeClass} rounded border font-mono-num font-semibold text-center focus:outline-none focus:ring-2 focus:ring-[#005A9C] ${
                              isQuick
                                ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                            }`}
                          />
                        </td>
                      ))
                    )}

                    {/* Group Summary / Quick Entry Columns */}
                    {(
                      [
                        ['sb', t[0], 'text-violet-700 dark:text-violet-300 bg-violet-50/60 dark:bg-violet-950/30', 'border-violet-500 text-violet-700 dark:text-violet-300 focus:ring-violet-500'],
                        ['ps', t[1], 'text-sky-700 dark:text-sky-300 bg-sky-50/60 dark:bg-sky-950/30', 'border-sky-500 text-sky-700 dark:text-sky-300 focus:ring-sky-500'],
                        ['up', t[2], 'text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/30', 'border-teal-500 text-teal-700 dark:text-teal-300 focus:ring-teal-500'],
                      ] as const
                    ).map(([grp, val, cellCls, inputCls]) => (
                      <td
                        key={grp}
                        className={`px-1.5 py-1 border-r border-slate-200 dark:border-slate-800 text-center font-mono-num font-bold ${cellCls}`}
                      >
                        {isQuick && !isHol ? (
                          <input
                            type="number"
                            min={0}
                            value={val || ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              setQuickGroup(d, grp, e.target.value)
                            }
                            className={`${inputSizeClass} rounded border-2 bg-white dark:bg-slate-900 font-mono-num font-bold text-center focus:outline-none focus:ring-2 ${inputCls}`}
                          />
                        ) : (
                          <span>{val}</span>
                        )}
                      </td>
                    ))}

                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-800 text-center font-mono-num font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40">
                      {t[3]}
                    </td>

                    <td className="px-1.5 py-1 text-center font-mono-num font-bold text-purple-700 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/30">
                      {isQuick && !isHol ? (
                        <input
                          type="number"
                          min={0}
                          value={t[4] || ''}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            setQuickGroup(d, 'sec', e.target.value)
                          }
                          className={`${inputSizeClass} rounded border-2 border-purple-500 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 font-mono-num font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                      ) : (
                        <span>{t[4]}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot className="sticky bottom-0 z-20">
              <tr className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 dark:from-emerald-900 dark:via-teal-900 dark:to-emerald-950 text-white font-mono-num font-bold text-sm">
                <td
                  colSpan={3}
                  className="sticky left-0 z-30 bg-emerald-800 dark:bg-emerald-950 px-3 py-2.5 border-r border-emerald-600/70 font-sans"
                >
                  TOTAL ({mealDays} Meal Days)
                </td>
                {colSums.map((s, idx) => (
                  <td
                    key={idx}
                    className="px-2 py-2.5 border-r border-emerald-600/70 text-center"
                  >
                    {s}
                  </td>
                ))}
                {groupSums.map((s, idx) => (
                  <td
                    key={`g-${idx}`}
                    className={`px-2 py-2.5 text-center ${
                      idx < 4 ? 'border-r border-emerald-600/70' : ''
                    } ${idx === 3 ? 'bg-blue-700/80 dark:bg-blue-900/80' : ''}`}
                  >
                    {s}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
