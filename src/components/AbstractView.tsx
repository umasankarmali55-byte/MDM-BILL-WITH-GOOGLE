import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
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
import { EditableSheetWrapper } from './EditableSheetWrapper';

interface AbstractViewProps {
  state: MDMState;
  secondary?: boolean;
  onUpdateState?: (updater: (prev: MDMState) => MDMState) => void;
}

export const AbstractSheet: React.FC<{
  state: MDMState;
  secondary?: boolean;
}> = ({ state, secondary = false }) => {
  const { year, month } = parseMonthKey(state.cur);
  const monLabel = `${MNAMES[month].toUpperCase()} ${year}`;
  const I = state.info;

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
      <div className="paper-sheet abs-sheet">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '6px' }}>
          <div className="ec" style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.02em' }}>
            {I.school}
          </div>
          <div className="ec" style={{ fontSize: '10.5px', fontWeight: 700, marginTop: '1px' }}>
            Block: {I.block} · District: {I.dist} · UDISE: {I.code}
          </div>
          <div className="ec" style={{ fontSize: '12.5px', fontWeight: 800, marginTop: '3px' }}>
            SECONDARY (CLASS 9 &amp; 10) ABSTRACT CONSUMPTION STATEMENT — {monLabel}
          </div>
        </div>

        <table style={{ marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td className="l" style={{ width: '25%' }}>
                Meals Served (9–10): <b>{R.meals}</b>
              </td>
              <td className="c" style={{ width: '22%' }}>
                Meal Days: <b>{R.days}</b>
              </td>
              <td className="c" style={{ width: '25%' }}>
                Per Meal Cost: <b>₹{f2(pm2(state))}</b>
              </td>
              <td className="r" style={{ width: '28%' }}>
                Total Payable: <b>₹{f2(T)}</b>
              </td>
            </tr>
          </tbody>
        </table>

        <table id="abs2">
          <colgroup>
            <col style={{ width: '36%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '19%' }} />
          </colgroup>
          <thead>
            <tr>
              <th className="l">Item Description</th>
              <th className="c">Unit</th>
              <th className="r">Price / Unit (₹)</th>
              <th className="r">Total Qty</th>
              <th className="r">Total Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="abs-sec">
              <td colSpan={5}>A. Daily Meal Items (Class 9 &amp; 10)</td>
            </tr>
            {[
              ['Meals served', 'nos', '', String(R.meals), ''],
              ['Rice', 'kg', '', f3(R.rice), 'Free'],
              ['Dal', 'kg', f2(N.dal[3]), f3(R.dal), f2(R.dalA)],
              ['Soya chunks', 'kg', f2(N.soya[3]), f3(R.soya), f2(R.soyaA)],
              ['Oil', 'kg', f2(N.oil[3]), f3(R.oil), f2(R.oilA)],
              ['Vegetables (auto adjust)', 'kg', '', f3(R.veg), f2(R.vegAmt)],
              ['Egg', 'pieces', f2(N.egg[3]), String(R.eggs), f2(R.eggA)],
              ['Laddoo', 'pieces', f2(lCost), String(L), f2(ladAmt)],
              ['Fuel', '₹', '', '', f2(R.fuel)],
              ['Salt & condiment', '₹', '', '', f2(R.cn)],
            ].map((r, i) => (
              <tr key={i}>
                <td className="l">{r[0]}</td>
                <td className="c">{r[1]}</td>
                <td className="r">{r[2]}</td>
                <td className="r">{r[3]}</td>
                <td className="r">{r[4]}</td>
              </tr>
            ))}

            <tr className="abs-tot">
              <td colSpan={4} className="l">
                TOTAL AMOUNT (MDM + LADDOO)
              </td>
              <td className="r">{f2(T)}</td>
            </tr>
            <tr className="abs-tot">
              <td colSpan={4} className="l">
                TOTAL MDM COST (WITHOUT LADDOO)
              </td>
              <td className="r">{f2(R.total)}</td>
            </tr>

            <tr className="abs-sec">
              <td colSpan={5}>B. Millet Laddoo Ingredients</td>
            </tr>
            <tr>
              <td className="l">Laddoos prepared</td>
              <td className="c">pieces</td>
              <td className="r" />
              <td className="r">{L}</td>
              <td className="r">{f2(ladAmt)}</td>
            </tr>
            {ing.map((r, i) => (
              <tr key={i}>
                <td className="l">{r[0]}</td>
                <td className="c">kg</td>
                <td className="r">{f2(r[3])}</td>
                <td className="r">{f3(r[1])}</td>
                <td className="r">{f2(r[2])}</td>
              </tr>
            ))}
            <tr>
              <td className="l">Preparation cost</td>
              <td className="c">₹</td>
              <td className="r" />
              <td className="r" />
              <td className="r">{f2(pc)}</td>
            </tr>
            <tr className="abs-tot">
              <td colSpan={4} className="l">
                TOTAL LADDOO COST (INGREDIENTS + PREPARATION)
              </td>
              <td className="r">{f2(iT + pc)}</td>
            </tr>

            <tr className="abs-sec">
              <td colSpan={5}>C. Rice Stock Summary</td>
            </tr>
            {[
              ['Opening stock', f3(open)],
              ['Rice received', f3(recv)],
              ['Rice consumed', f3(R.rice)],
              ['Closing balance', f3(open + recv - R.rice)],
            ].map((r, i) => (
              <tr key={i}>
                <td className="l">{r[0]}</td>
                <td className="c">kg</td>
                <td className="r" />
                <td className="r">{r[1]}</td>
                <td className="r" />
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ec" style={{ fontSize: '9.5px', marginTop: '5px', fontWeight: 600 }}>
          Note: Quantities are derived from daily attendance, statutory norms, and weekly menu. Vegetables adjust automatically to match exact per-meal entitlement.
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '28px',
            fontSize: '10.5px',
            fontWeight: 800,
          }}
        >
          <span className="ec">SHG / SMC President Signature</span>
          <span className="ec">MDM In-Charge Signature</span>
          <span className="ec">Headmaster / Headmistress (Seal &amp; Sign)</span>
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
    <div className="paper-sheet abs-sheet">
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '6px' }}>
        <div className="ec" style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.02em' }}>
          {I.school}
        </div>
        <div className="ec" style={{ fontSize: '10.5px', fontWeight: 700, marginTop: '1px' }}>
          Block: {I.block} · District: {I.dist} · UDISE: {I.code}
        </div>
        <div className="ec" style={{ fontSize: '12.5px', fontWeight: 800, marginTop: '3px' }}>
          PRIMARY &amp; UPPER PRIMARY ABSTRACT CONSUMPTION STATEMENT — {monLabel}
        </div>
      </div>

      <table style={{ marginBottom: '6px' }}>
        <tbody>
          <tr>
            <td className="l" style={{ width: '25%' }}>
              SB + Primary Meals: <b>{g[0].q}</b>
            </td>
            <td className="c" style={{ width: '25%' }}>
              Upper Primary Meals: <b>{g[1].q}</b>
            </td>
            <td className="c" style={{ width: '24%' }}>
              Total Meals: <b>{g[0].q + g[1].q}</b>
            </td>
            <td className="r" style={{ width: '26%' }}>
              Total Payable: <b>₹{f2(T)}</b>
            </td>
          </tr>
        </tbody>
      </table>

      <table id="abt">
        <colgroup>
          <col style={{ width: '22%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '9.5%' }} />
          <col style={{ width: '10.5%' }} />
          <col style={{ width: '9.5%' }} />
          <col style={{ width: '10.5%' }} />
          <col style={{ width: '9.5%' }} />
          <col style={{ width: '10.5%' }} />
        </colgroup>
        <thead>
          <tr>
            <th className="l">Item</th>
            <th className="c">Unit</th>
            <th className="r">Rate (₹)</th>
            <th className="r">SB+PS Qty</th>
            <th className="r">SB+PS Amt</th>
            <th className="r">UPS Qty</th>
            <th className="r">UPS Amt</th>
            <th className="r">Total Qty</th>
            <th className="r">Total Amt</th>
          </tr>
        </thead>
        <tbody>
          <tr className="abs-sec">
            <td colSpan={9}>A. Daily Meal Items (Sheet 1 and Sheet 2)</td>
          </tr>
          <tr>
            <td className="l">Meals served</td>
            <td className="c">nos</td>
            <td className="r" />
            <td className="r">{g[0].q}</td>
            <td className="r" />
            <td className="r">{g[1].q}</td>
            <td className="r" />
            <td className="r">{g[0].q + g[1].q}</td>
            <td className="r" />
          </tr>
          <tr>
            <td className="l">Rice</td>
            <td className="c">kg</td>
            <td className="r" />
            <td className="r">{f3(g[0].rice)}</td>
            <td className="r">0.00</td>
            <td className="r">{f3(g[1].rice)}</td>
            <td className="r">0.00</td>
            <td className="r">{f3(rc)}</td>
            <td className="r">Free</td>
          </tr>
          {mealRows.map((r) => (
            <tr key={r.label}>
              <td className="l">{r.label}</td>
              <td className="c">{r.unit}</td>
              <td className="r">{r.pr}</td>
              <td className="r">{r.q0}</td>
              <td className="r">{r.a0}</td>
              <td className="r">{r.q1}</td>
              <td className="r">{r.a1}</td>
              <td className="r">{r.tq}</td>
              <td className="r">{r.ta}</td>
            </tr>
          ))}
          <tr className="abs-tot">
            <td colSpan={3} className="l">
              TOTAL AMOUNT (MDM + LADDOO)
            </td>
            <td className="r" />
            <td className="r">{f2(tt[0])}</td>
            <td className="r" />
            <td className="r">{f2(tt[1])}</td>
            <td className="r" />
            <td className="r">{f2(T)}</td>
          </tr>
          <tr className="abs-tot">
            <td colSpan={3} className="l">
              TOTAL MDM COST (WITHOUT LADDOO)
            </td>
            <td className="r" />
            <td className="r">{f2(r2(tt[0]) - r2(a[0].lad))}</td>
            <td className="r" />
            <td className="r">{f2(r2(tt[1]) - r2(a[1].lad))}</td>
            <td className="r" />
            <td className="r">{f2(T - r2(a[0].lad) - r2(a[1].lad))}</td>
          </tr>

          <tr className="abs-sec">
            <td colSpan={9}>B. Millet Laddoo Ingredients (Sheet 3)</td>
          </tr>
          <tr>
            <td className="l">Laddoos prepared</td>
            <td className="c">pieces</td>
            <td colSpan={5} className="r" />
            <td className="r">{L}</td>
            <td className="r">{f2(L * lCost)}</td>
          </tr>
          {ing.map((r, i) => (
            <tr key={i}>
              <td className="l">{r[0]}</td>
              <td className="c">kg</td>
              <td className="r">{f2(r[3])}</td>
              <td colSpan={4} className="r" />
              <td className="r">{f3(r[1])}</td>
              <td className="r">{f2(r[2])}</td>
            </tr>
          ))}
          <tr>
            <td className="l">Preparation cost</td>
            <td className="c">₹</td>
            <td colSpan={6} className="r" />
            <td className="r">{f2(pc)}</td>
          </tr>
          <tr className="abs-tot">
            <td colSpan={8} className="l">
              TOTAL LADDOO COST (INGREDIENTS + PREPARATION)
            </td>
            <td className="r">{f2(iT + pc)}</td>
          </tr>

          <tr className="abs-sec">
            <td colSpan={9}>C. Rice Stock Summary (Sheet 4)</td>
          </tr>
          {[
            ['Opening stock', f3(open)],
            ['Rice received', f3(recv)],
            ['Rice consumed', f3(rc)],
            ['Closing balance', f3(open + recv - rc)],
          ].map((r, i) => (
            <tr key={i}>
              <td className="l">{r[0]}</td>
              <td className="c">kg</td>
              <td colSpan={5} className="r" />
              <td className="r">{r[1]}</td>
              <td className="r" />
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ec" style={{ fontSize: '9.5px', marginTop: '5px', fontWeight: 600 }}>
        Note: Quantities come from attendance, norms, and weekly menu. Amount = quantity × price per kg; vegetables take the remaining per-meal entitlement. Total includes laddoo.
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '26px',
          fontSize: '10.5px',
          fontWeight: 800,
        }}
      >
        <span className="ec">SHG / SMC President Signature</span>
        <span className="ec">MDM In-Charge Signature</span>
        <span className="ec">Headmaster / Headmistress (Seal &amp; Sign)</span>
      </div>
    </div>
  );
};

export const AbstractView: React.FC<AbstractViewProps> = ({
  state,
  secondary = false,
  onUpdateState,
}) => {
  const [copied, setCopied] = useState(false);

  // When rendered inside ExportPackView (no onUpdateState), output pure A4 sheet directly
  if (!onUpdateState) {
    return <AbstractSheet state={state} secondary={secondary} />;
  }

  const handleCopyExcel = () => {
    const tableId = secondary ? 'abs2' : 'abt';
    const rows = Array.from(document.querySelectorAll(`#${tableId} tr`)).map(
      (tr) =>
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

  const tabId = secondary ? 12 : 7;

  const kpiCards = secondary
    ? (() => {
        const R = calcSecondary(state);
        const lCost = ladCost(state);
        const T = R.total + R.lad * lCost;
        return (
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
        );
      })()
    : (() => {
        const g = calcAbsTiers(state);
        const N = state.N;
        const lCost = ladCost(state);
        const a = [0, 1].map((k) => {
          const G = g[k];
          const dal = +G.dal.toFixed(3) * N.dal[2 + k];
          const soya = +G.soya.toFixed(3) * N.soya[2 + k];
          const oil = +G.oil.toFixed(3) * N.oil[2 + k];
          const egg = G.egg * N.egg[2 + k];
          const lad = G.lad * lCost;
          const fuel = G.fuel;
          const cond = G.cond;
          const veg = G.q * state.pm[k] - (dal + soya + oil + egg + lad + fuel + cond);
          return dal + soya + oil + veg + egg + lad + fuel + cond;
        });
        const T = r2(a[0]) + r2(a[1]);
        return (
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
        );
      })();

  return (
    <div className="space-y-4">
      {kpiCards}
      <EditableSheetWrapper
        tabId={tabId}
        state={state}
        onUpdateState={onUpdateState}
        enableCellEdits
        extraToolbar={
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
        }
      >
        <AbstractSheet state={state} secondary={secondary} />
      </EditableSheetWrapper>
    </div>
  );
};
