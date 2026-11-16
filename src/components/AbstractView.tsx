import React, { useState } from 'react';
import { Copy, Check, Printer } from 'lucide-react';
import { MDMState } from '../types/mdm';
import { MNAMES } from '../data/defaultState';
import {
  calcAbsTiers,
  calcSecondary,
  f2,
  f3,
  ladCost,
  parseMonthKey,
  pm2,
  r2,
  secN,
} from '../utils/calculations';

interface AbstractViewProps {
  state: MDMState;
  secondary?: boolean;
}

export const AbstractView: React.FC<AbstractViewProps> = ({
  state,
  secondary = false,
}) => {
  const { year, month } = parseMonthKey(state.cur);
  const [copied, setCopied] = useState(false);

  const handleCopyExcel = () => {
    const tableId = secondary ? 'abs2' : 'abt';
    const rows = Array.from(
      document.querySelectorAll(`#${tableId} tr`)
    ).map((tr) =>
      Array.from(tr.children)
        .map((c) => (c as HTMLElement).innerText.trim())
        .join('\t')
    );
    navigator.clipboard
      ?.writeText(rows.join('\n'))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {});
  };

  if (secondary) {
    const R = calcSecondary(state);
    const N = secN(state);
    const L = R.lad;
    const lCost = ladCost(state);
    const ladAmt = L * lCost;
    const T = R.total + ladAmt;
    const ing = state.lad.map((r) => {
      const kg = (L * r[1]) / 1000;
      return [r[0], kg, r2(kg * r[2]), r[2]] as const;
    });
    const iT = ing.reduce((s, r) => s + r[2], 0);
    const pc = r2(L * state.prep);
    const open = state.open[2] || 0;
    const recv = state.recv[2] || 0;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
          <div className="bg-violet-50/90 dark:bg-violet-950/45 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
            <div className="text-xs font-semibold text-violet-700 dark:text-violet-300">
              Meals served · Secondary (9–10)
            </div>
            <div className="text-3xl font-bold font-mono-num text-violet-950 dark:text-violet-100 mt-1">
              {R.meals}
            </div>
          </div>
          <div className="bg-sky-50/90 dark:bg-sky-950/45 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-300">
              Meal days
            </div>
            <div className="text-3xl font-bold font-mono-num text-sky-950 dark:text-sky-100 mt-1">
              {R.days}
            </div>
          </div>
          <div className="bg-amber-50/90 dark:bg-amber-950/45 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Per meal cost (₹)
            </div>
            <div className="text-3xl font-bold font-mono-num text-amber-950 dark:text-amber-100 mt-1">
              {f2(pm2(state))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-800 border border-emerald-600 dark:border-emerald-500 rounded-lg p-4 text-white shadow-sm">
            <div className="text-xs font-semibold text-emerald-100">
              Total amount (₹)
            </div>
            <div className="text-3xl font-bold font-mono-num text-white mt-1">
              {f2(T)}
            </div>
            <div className="text-xs text-emerald-100/90 mt-0.5">
              Includes laddoo &amp; auto vegetables
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-violet-200/80 dark:border-slate-800 rounded-lg p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {state.info.school}
              </h2>
              <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">
                {MNAMES[month]} {year} · Secondary (Class 9 and 10) Abstract
                Consumption
              </p>
            </div>
            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={handleCopyExcel}
                className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'Copied TSV' : 'Copy for Excel'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table
              id="abs2"
              className="w-full border-collapse text-sm min-w-[640px]"
            >
              <thead>
                <tr className="bg-violet-700 dark:bg-violet-900 text-white text-xs font-semibold">
                  <th className="border border-violet-600 dark:border-violet-800 px-3 py-2.5 text-left">
                    Item
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-3 py-2.5 text-center">
                    Unit
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-3 py-2.5 text-right">
                    Price / kg (₹)
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-3 py-2.5 text-right">
                    Total Qty
                  </th>
                  <th className="border border-violet-600 dark:border-violet-800 px-3 py-2.5 text-right">
                    Total Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono-num">
                <tr className="bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-sans font-bold text-xs">
                  <td
                    colSpan={5}
                    className="border border-slate-300 dark:border-slate-700 px-3 py-2"
                  >
                    A. Daily meal items
                  </td>
                </tr>
                {[
                  ['Meals served', 'nos', '', String(R.meals), ''],
                  ['Rice', 'kg', '', f3(R.rice), 'Free'],
                  ['Dal', 'kg', f2(N.dal[3]), f3(R.dal), f2(R.dalA)],
                  ['Soya chunks', 'kg', f2(N.soya[3]), f3(R.soya), f2(R.soyaA)],
                  ['Oil', 'kg', f2(N.oil[3]), f3(R.oil), f2(R.oilA)],
                  [
                    'Vegetables (auto adjust)',
                    'kg',
                    '',
                    f3(R.veg),
                    f2(R.vegAmt),
                  ],
                  ['Egg', 'pieces', f2(N.egg[3]), String(R.eggs), f2(R.eggA)],
                  ['Laddoo', 'pieces', f2(lCost), String(L), f2(ladAmt)],
                  ['Fuel', '₹', '', '', f2(R.fuel)],
                  ['Salt & condiment', '₹', '', '', f2(R.cn)],
                ].map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 font-sans font-semibold text-slate-900 dark:text-slate-100">
                      {r[0]}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-center font-sans text-slate-600 dark:text-slate-400">
                      {r[1]}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right">
                      {r[2]}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-bold">
                      {r[3]}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-bold">
                      {r[4]}
                    </td>
                  </tr>
                ))}

                <tr className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold">
                  <td
                    colSpan={4}
                    className="border border-slate-300 dark:border-slate-700 px-3 py-2.5 font-sans"
                  >
                    TOTAL AMOUNT
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-right">
                    {f2(T)}
                  </td>
                </tr>
                <tr className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold">
                  <td
                    colSpan={4}
                    className="border border-slate-300 dark:border-slate-700 px-3 py-2.5 font-sans"
                  >
                    TOTAL MDM COST (WITHOUT LADDOO)
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-right">
                    {f2(R.total)}
                  </td>
                </tr>

                <tr className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-sans font-bold text-xs">
                  <td
                    colSpan={5}
                    className="border border-slate-300 dark:border-slate-700 px-3 py-2"
                  >
                    B. Millet laddoo ingredients
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 font-sans font-semibold">
                    Laddoos prepared
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-center font-sans">
                    pieces
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2" />
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-bold">
                    {L}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-bold">
                    {f2(ladAmt)}
                  </td>
                </tr>
                {ing.map((r, i) => (
                  <tr key={i}>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 font-sans font-semibold">
                      {r[0]}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-center font-sans">
                      kg
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right">
                      {f2(r[3])}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-bold">
                      {f3(r[1])}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-bold">
                      {f2(r[2])}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 font-sans font-semibold">
                    Preparation cost
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-center font-sans">
                    ₹
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2" />
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2" />
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-bold">
                    {f2(pc)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 font-sans font-semibold">
                    Total laddoo cost (ingredients + preparation)
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-center font-sans">
                    ₹
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2" />
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2" />
                  <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-bold">
                    {f2(iT + pc)}
                  </td>
                </tr>

                <tr className="bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-sans font-bold text-xs">
                  <td
                    colSpan={5}
                    className="border border-slate-300 dark:border-slate-700 px-3 py-2"
                  >
                    C. Rice stock
                  </td>
                </tr>
                {[
                  ['Opening stock', f3(open)],
                  ['Rice received', f3(recv)],
                  ['Rice consumed', f3(R.rice)],
                  ['Closing balance', f3(open + recv - R.rice)],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 font-sans font-semibold">
                      {r[0]}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-center font-sans">
                      kg
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2" />
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-right font-bold">
                      {r[1]}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Primary Abstract Sheet
  const g = calcAbsTiers(state);
  const N = state.N;
  const lCost = ladCost(state);
  const sumVals = (o: Record<string, number>) =>
    Object.values(o).reduce((x, y) => x + y, 0);

  const a = [0, 1].map((k) => {
    const G = g[k];
    return {
      dal: +G.dal.toFixed(3) * N.dal[2 + k],
      soya: +G.soya.toFixed(3) * N.soya[2 + k],
      oil: +G.oil.toFixed(3) * N.oil[2 + k],
      veg: G.vegA,
      egg: G.egg * N.egg[2 + k],
      lad: G.lad * lCost,
      fuel: G.fuel,
      cond: G.cond,
    };
  });

  (['dal', 'soya', 'oil'] as const).forEach((key) => {
    const q0 = g[0][key];
    const q1 = g[1][key];
    const q = q0 + q1;
    if (!q) return;
    const p = [N[key][2], N[key][3]];
    const totAmt = (+q.toFixed(3) * (q0 * p[0] + q1 * p[1])) / q;
    a[0][key] = +q0.toFixed(3) * p[0];
    a[1][key] = totAmt - a[0][key];
  });

  a.forEach((o, k) => {
    o.veg =
      g[k].q * state.pm[k] -
      (o.dal + o.soya + o.oil + o.egg + o.lad + o.fuel + o.cond);
  });

  const tt = a.map(sumVals);
  const T = r2(tt[0]) + r2(tt[1]);
  const pf = (x: number, y: number) =>
    x === y ? f2(x) : `${f2(x)} / ${f2(y)}`;
  const PR: Record<string, string> = {
    dal: pf(N.dal[2], N.dal[3]),
    soya: pf(N.soya[2], N.soya[3]),
    oil: pf(N.oil[2], N.oil[3]),
    egg: pf(N.egg[2], N.egg[3]),
    lad: f2(lCost),
  };

  const L = g[0].lad + g[1].lad;
  const ing = state.lad.map((r) => {
    const kg = (L * r[1]) / 1000;
    return [r[0], kg, r2(kg * r[2]), r[2]] as const;
  });
  const iT = ing.reduce((s, r) => s + r[2], 0);
  const pc = r2(L * state.prep);
  const open = state.open[0] + state.open[1];
  const recv = state.recv[0] + state.recv[1];
  const rc = g[0].rice + g[1].rice;

  const itemRow = (
    label: string,
    unit: string,
    key: keyof typeof a[0],
    dp: number
  ) => {
    const has = key !== 'fuel' && key !== 'cond';
    const fmt = (x: number) => (dp === 3 ? f3(x) : String(Math.round(x)));
    return {
      label,
      unit,
      pr: PR[key] || '',
      q0: has ? fmt(g[0][key]) : '',
      a0: f2(a[0][key]),
      q1: has ? fmt(g[1][key]) : '',
      a1: f2(a[1][key]),
      tq: has ? fmt(g[0][key] + g[1][key]) : '',
      ta: f2(a[0][key] + a[1][key]),
    };
  };

  const mealRows = [
    itemRow('Dal', 'kg', 'dal', 3),
    itemRow('Soya chunks', 'kg', 'soya', 3),
    itemRow('Oil', 'kg', 'oil', 3),
    itemRow('Vegetables (auto adjust)', 'kg', 'veg', 3),
    itemRow('Egg', 'pieces', 'egg', 0),
    itemRow('Laddoo', 'pieces', 'lad', 0),
    itemRow('Fuel', '₹', 'fuel', 0),
    itemRow('Salt & condiment', '₹', 'cond', 0),
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-sky-50/90 dark:bg-sky-950/45 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
          <div className="text-xs font-semibold text-sky-700 dark:text-sky-300">
            Meals served · SB + Primary
          </div>
          <div className="text-3xl font-bold font-mono-num text-sky-950 dark:text-sky-100 mt-1">
            {g[0].q}
          </div>
        </div>
        <div className="bg-teal-50/90 dark:bg-teal-950/45 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-300">
            Meals served · Upper Primary
          </div>
          <div className="text-3xl font-bold font-mono-num text-teal-950 dark:text-teal-100 mt-1">
            {g[1].q}
          </div>
        </div>
        <div className="bg-indigo-50/90 dark:bg-indigo-950/45 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            Total Primary meals
          </div>
          <div className="text-3xl font-bold font-mono-num text-indigo-950 dark:text-indigo-100 mt-1">
            {g[0].q + g[1].q}
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-800 border border-emerald-600 dark:border-emerald-500 rounded-lg p-4 text-white shadow-sm">
          <div className="text-xs font-semibold text-emerald-100">
            Total amount (₹)
          </div>
          <div className="text-3xl font-bold font-mono-num text-white mt-1">
            {f2(T)}
          </div>
          <div className="text-xs text-emerald-100/90 mt-0.5">
            All items, vegetables auto-adjusted
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              {state.info.school}
            </h2>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
              {MNAMES[month]} {year} · Abstract Consumption · Item-wise Monthly
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={handleCopyExcel}
              className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Copied TSV' : 'Copy for Excel'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            id="abt"
            className="w-full border-collapse text-sm min-w-[780px]"
          >
            <thead>
              <tr className="text-white text-xs font-semibold">
                <th className="border border-indigo-600 dark:border-indigo-800 bg-indigo-700 dark:bg-indigo-900 px-2.5 py-2.5 text-left">
                  Item
                </th>
                <th className="border border-indigo-600 dark:border-indigo-800 bg-indigo-700 dark:bg-indigo-900 px-2 py-2.5 text-center">
                  Unit
                </th>
                <th className="border border-indigo-600 dark:border-indigo-800 bg-indigo-700 dark:bg-indigo-900 px-2 py-2.5 text-right">
                  Price / kg (₹)
                </th>
                <th className="border border-sky-600 dark:border-sky-800 bg-sky-700 dark:bg-sky-900 px-2 py-2.5 text-right">
                  SB+PS Qty
                </th>
                <th className="border border-sky-600 dark:border-sky-800 bg-sky-700 dark:bg-sky-900 px-2 py-2.5 text-right">
                  SB+PS Amt (₹)
                </th>
                <th className="border border-teal-600 dark:border-teal-800 bg-teal-700 dark:bg-teal-900 px-2 py-2.5 text-right">
                  UPS Qty
                </th>
                <th className="border border-teal-600 dark:border-teal-800 bg-teal-700 dark:bg-teal-900 px-2 py-2.5 text-right">
                  UPS Amt (₹)
                </th>
                <th className="border border-emerald-600 dark:border-emerald-800 bg-emerald-700 dark:bg-emerald-900 px-2 py-2.5 text-right">
                  Total Qty
                </th>
                <th className="border border-emerald-600 dark:border-emerald-800 bg-emerald-700 dark:bg-emerald-900 px-2 py-2.5 text-right">
                  Total Amt (₹)
                </th>
              </tr>
            </thead>
            <tbody className="font-mono-num">
              <tr className="bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-sans font-bold text-xs">
                <td
                  colSpan={9}
                  className="border border-slate-300 dark:border-slate-700 px-3 py-2"
                >
                  A. Daily meal items (Sheet 1 and Sheet 2)
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 font-sans font-semibold">
                  Meals served
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center font-sans">
                  nos
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                  {g[0].q}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                  {g[1].q}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                  {g[0].q + g[1].q}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2" />
              </tr>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 font-sans font-semibold">
                  Rice
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center font-sans">
                  kg
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                  {f3(g[0].rice)}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                  0.00
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                  {f3(g[1].rice)}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                  0.00
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                  {f3(rc)}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-sans font-bold">
                  Free
                </td>
              </tr>
              {mealRows.map((r) => (
                <tr
                  key={r.label}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 font-sans font-semibold">
                    {r.label}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center font-sans text-slate-600 dark:text-slate-400">
                    {r.unit}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                    {r.pr}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                    {r.q0}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                    {r.a0}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                    {r.q1}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                    {r.a1}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                    {r.tq}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                    {r.ta}
                  </td>
                </tr>
              ))}
              <tr className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold">
                <td
                  colSpan={3}
                  className="border border-slate-300 dark:border-slate-700 px-2.5 py-2.5 font-sans"
                >
                  TOTAL AMOUNT
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5 text-right">
                  {f2(tt[0])}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5 text-right">
                  {f2(tt[1])}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5 text-right">
                  {f2(T)}
                </td>
              </tr>
              <tr className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold">
                <td
                  colSpan={3}
                  className="border border-slate-300 dark:border-slate-700 px-2.5 py-2.5 font-sans"
                >
                  TOTAL MDM COST (WITHOUT LADDOO)
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5 text-right">
                  {f2(r2(tt[0]) - r2(a[0].lad))}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5 text-right">
                  {f2(r2(tt[1]) - r2(a[1].lad))}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5" />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2.5 text-right">
                  {f2(T - r2(a[0].lad) - r2(a[1].lad))}
                </td>
              </tr>

              <tr className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-sans font-bold text-xs">
                <td
                  colSpan={9}
                  className="border border-slate-300 dark:border-slate-700 px-3 py-2"
                >
                  B. Millet laddoo ingredients (Sheet 3)
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 font-sans font-semibold">
                  Laddoos prepared
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center font-sans">
                  pieces
                </td>
                <td
                  colSpan={5}
                  className="border border-slate-300 dark:border-slate-700 px-2 py-2"
                />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                  {L}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                  {f2(L * lCost)}
                </td>
              </tr>
              {ing.map((r, i) => (
                <tr key={i}>
                  <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 font-sans font-semibold">
                    {r[0]}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center font-sans">
                    kg
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right">
                    {f2(r[3])}
                  </td>
                  <td
                    colSpan={4}
                    className="border border-slate-300 dark:border-slate-700 px-2 py-2"
                  />
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                    {f3(r[1])}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                    {f2(r[2])}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 font-sans font-semibold">
                  Preparation cost
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center font-sans">
                  ₹
                </td>
                <td
                  colSpan={6}
                  className="border border-slate-300 dark:border-slate-700 px-2 py-2"
                />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                  {f2(pc)}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 font-sans font-semibold">
                  Total laddoo cost (ingredients + preparation)
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center font-sans">
                  ₹
                </td>
                <td
                  colSpan={6}
                  className="border border-slate-300 dark:border-slate-700 px-2 py-2"
                />
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                  {f2(iT + pc)}
                </td>
              </tr>

              <tr className="bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-sans font-bold text-xs">
                <td
                  colSpan={9}
                  className="border border-slate-300 dark:border-slate-700 px-3 py-2"
                >
                  C. Rice stock (Sheet 4)
                </td>
              </tr>
              {[
                ['Opening stock', f3(open)],
                ['Rice received', f3(recv)],
                ['Rice consumed', f3(rc)],
                ['Closing balance', f3(open + recv - rc)],
              ].map((r, i) => (
                <tr key={i}>
                  <td className="border border-slate-300 dark:border-slate-700 px-2.5 py-2 font-sans font-semibold">
                    {r[0]}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-center font-sans">
                    kg
                  </td>
                  <td
                    colSpan={5}
                    className="border border-slate-300 dark:border-slate-700 px-2 py-2"
                  />
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-right font-bold">
                    {r[1]}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 px-2 py-2" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Quantities come from attendance, norms, and weekly menu. Amount =
          quantity × price per kg; vegetables take whatever is left of the per
          meal cost. The total includes laddoo, unlike the Form-15 bill.
        </p>
      </div>
    </div>
  );
};
