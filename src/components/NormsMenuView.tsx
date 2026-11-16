import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, RotateCcw } from 'lucide-react';
import { MDMState, MenuDay, NormsConfig } from '../types/mdm';
import { DN } from '../data/defaultState';
import {
  cpc,
  f2,
  ingCost,
  ladCost,
  num,
  pm2,
  r2,
  vegCost,
} from '../utils/calculations';

interface NormsMenuViewProps {
  state: MDMState;
  onUpdateState: (updater: (prev: MDMState) => MDMState) => void;
}

type SectionKey = 'lad' | 'norm' | 'sec' | 'pm' | 'menu';

const RationInput: React.FC<{
  value: number;
  onChange: (val: number) => void;
  title?: string;
}> = ({ value, onChange, title }) => {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  return (
    <input
      type="number"
      step="any"
      min={0}
      title={title || 'Edit ration per child to auto-calculate price per kg'}
      value={focused ? draft : f2(value)}
      onFocus={(e) => {
        setFocused(true);
        setDraft(f2(value));
        e.target.select();
      }}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        const parsed = parseFloat(raw);
        if (Number.isFinite(parsed) && parsed >= 0) {
          onChange(parsed);
        } else if (raw === '') {
          onChange(0);
        }
      }}
      className="w-20 h-8 px-2 rounded border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/30 text-slate-900 dark:text-slate-100 text-center font-mono-num text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
    />
  );
};

export const NormsMenuView: React.FC<NormsMenuViewProps> = ({
  state,
  onUpdateState,
}) => {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    lad: false,
    norm: true,
    sec: false,
    pm: true,
    menu: true,
  });

  const allOpen = Object.values(openSections).every(Boolean);

  const toggleAll = () => {
    const nextVal = !allOpen;
    setOpenSections({
      lad: nextVal,
      norm: nextVal,
      sec: nextVal,
      pm: nextVal,
      menu: nextVal,
    });
  };

  const toggleOne = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const N = state.N;
  const c0 = cpc(state, 0);
  const c1 = cpc(state, 1);
  const lCost = ladCost(state);
  const ingTotal = ingCost(state);

  const setNormVal = (
    key: keyof NormsConfig,
    idx: number,
    val: number
  ) => {
    onUpdateState((prev) => {
      const arr = [...(prev.N[key] as number[])];
      arr[idx] = val;
      return { ...prev, N: { ...prev.N, [key]: arr } };
    });
  };

  const setLadItem = (rowIdx: number, colIdx: 1 | 2, val: number) => {
    onUpdateState((prev) => {
      const nextLad = prev.lad.map((r, i) =>
        i === rowIdx
          ? ([r[0], colIdx === 1 ? val : r[1], colIdx === 2 ? val : r[2]] as [
              string,
              number,
              number
            ])
          : r
      );
      return { ...prev, lad: nextLad };
    });
  };

  const copyFromUPS = () => {
    onUpdateState((prev) => ({
      ...prev,
      N2: {
        rice: prev.N2.rice,
        dal: [prev.N.dal[1], prev.N.dal[3]],
        soya: [prev.N.soya[1], prev.N.soya[3]],
        oil: [prev.N.oil[1], prev.N.oil[3]],
        veg: prev.N.veg[1],
        egg: [prev.N.egg[1], prev.N.egg[3]],
        lad: prev.N.lad[1],
        fuel: prev.N.fuel[1],
        cond: prev.N.cond[1],
      },
      pm2: undefined,
    }));
  };

  const setMenuTick = (day: number, field: keyof MenuDay, checked: boolean) => {
    onUpdateState((prev) => ({
      ...prev,
      menu: {
        ...prev.menu,
        [day]: {
          ...prev.menu[day],
          [field]: checked ? 1 : 0,
        },
      },
    }));
  };

  const numInput = (
    value: number,
    onChange: (val: number) => void,
    wClass = 'w-20'
  ) => (
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(num(e.target.value))}
      className={`${wClass} h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center font-mono-num text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005A9C]`}
    />
  );

const SECTION_ACCENTS: Record<
  SectionKey,
  { cardBorder: string; headerBg: string; titleColor: string; actionColor: string }
> = {
  lad: {
    cardBorder: 'border-amber-200 dark:border-amber-900/70',
    headerBg: 'bg-amber-50/75 dark:bg-amber-950/35 hover:bg-amber-100/70 dark:hover:bg-amber-950/55',
    titleColor: 'text-amber-950 dark:text-amber-200',
    actionColor: 'text-amber-700 dark:text-amber-400',
  },
  norm: {
    cardBorder: 'border-sky-200 dark:border-sky-900/70',
    headerBg: 'bg-sky-50/75 dark:bg-sky-950/35 hover:bg-sky-100/70 dark:hover:bg-sky-950/55',
    titleColor: 'text-sky-950 dark:text-sky-200',
    actionColor: 'text-sky-700 dark:text-sky-400',
  },
  sec: {
    cardBorder: 'border-violet-200 dark:border-violet-900/70',
    headerBg: 'bg-violet-50/75 dark:bg-violet-950/35 hover:bg-violet-100/70 dark:hover:bg-violet-950/55',
    titleColor: 'text-violet-950 dark:text-violet-200',
    actionColor: 'text-violet-700 dark:text-violet-400',
  },
  pm: {
    cardBorder: 'border-rose-200 dark:border-rose-900/70',
    headerBg: 'bg-rose-50/75 dark:bg-rose-950/35 hover:bg-rose-100/70 dark:hover:bg-rose-950/55',
    titleColor: 'text-rose-950 dark:text-rose-200',
    actionColor: 'text-rose-700 dark:text-rose-400',
  },
  menu: {
    cardBorder: 'border-emerald-200 dark:border-emerald-900/70',
    headerBg: 'bg-emerald-50/75 dark:bg-emerald-950/35 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/55',
    titleColor: 'text-emerald-950 dark:text-emerald-200',
    actionColor: 'text-emerald-700 dark:text-emerald-400',
  },
};

  const SectionCard: React.FC<{
    sKey: SectionKey;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }> = ({ sKey, title, subtitle, children }) => {
    const isOpen = openSections[sKey];
    const theme = SECTION_ACCENTS[sKey];
    return (
      <div className={`bg-white dark:bg-slate-900 border ${theme.cardBorder} rounded-lg overflow-hidden shadow-sm`}>
        <button
          type="button"
          onClick={() => toggleOne(sKey)}
          className={`w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-colors ${theme.headerBg}`}
        >
          <div className="min-w-0">
            <h2 className={`font-display font-bold text-base ${theme.titleColor}`}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${theme.actionColor} shrink-0`}>
            {isOpen ? (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                <span>Expand</span>
              </>
            )}
          </span>
        </button>
        {isOpen && (
          <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {children}
          </div>
        )}
      </div>
    );
  };

  const normRow = (
    label: string,
    key: 'dal' | 'soya' | 'oil' | 'veg' | 'egg',
    unit: string
  ) => {
    const hasPrice = key !== 'veg';
    const isPerKg = key === 'dal' || key === 'soya' || key === 'oil';
    const setRation = (tier: 0 | 1, rationVal: number) => {
      const qty = N[key][tier];
      if (qty <= 0) return;
      const computedPrice = isPerKg
        ? r2((rationVal * 1000) / qty)
        : r2(rationVal / qty);
      setNormVal(key, 2 + tier, computedPrice);
    };

    return (
      <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
        <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </td>
        <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-sky-50/40 dark:bg-sky-950/20">
          <div className="inline-flex items-center gap-1.5">
            {numInput(N[key][0], (v) => setNormVal(key, 0, v))}
            {unit && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </td>
        <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-sky-50/40 dark:bg-sky-950/20">
          {hasPrice ? (
            <RationInput
              value={c0[key]}
              onChange={(r) => setRation(0, r)}
            />
          ) : (
            <span className="text-xs text-slate-500">Auto adjust</span>
          )}
        </td>
        <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-sky-50/40 dark:bg-sky-950/20">
          {hasPrice ? (
            numInput(N[key][2] ?? 0, (v) => setNormVal(key, 2, v))
          ) : (
            <span className="text-xs text-slate-500">Auto adjust</span>
          )}
        </td>
        <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="inline-flex items-center gap-1.5">
            {numInput(N[key][1], (v) => setNormVal(key, 1, v))}
            {unit && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </td>
        <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-emerald-50/40 dark:bg-emerald-950/20">
          {hasPrice ? (
            <RationInput
              value={c1[key]}
              onChange={(r) => setRation(1, r)}
            />
          ) : (
            <span className="text-xs text-slate-500">Auto adjust</span>
          )}
        </td>
        <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-emerald-50/40 dark:bg-emerald-950/20">
          {hasPrice ? (
            numInput(N[key][3] ?? 0, (v) => setNormVal(key, 3, v))
          ) : (
            <span className="text-xs text-slate-500">Auto adjust</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-600 text-white rounded-lg p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <h1 className="font-display font-bold text-base text-white">
            Ingredients, Norms, Per-Meal Cost &amp; Weekly Menu
          </h1>
          <p className="text-xs text-sky-100 mt-0.5">
            Changes update all Form-15 bills, Abstracts, MDCF, and Vouchers
            automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="h-9 px-4 rounded-md bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold transition-colors whitespace-nowrap"
        >
          {allOpen ? 'Collapse all sections' : 'Expand all sections'}
        </button>
      </div>

      {/* 1. Millet Laddoo Ingredients */}
      <SectionCard
        sKey="lad"
        title="Millet Laddoo Ingredients"
        subtitle={`Computed cost: ₹${f2(ingTotal)} per laddoo (incl. ₹${f2(
          state.prep
        )} preparation)`}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[540px]">
            <thead>
              <tr className="bg-amber-600 dark:bg-amber-900/90 text-white text-xs font-semibold">
                <th className="border border-amber-500 dark:border-amber-800 px-3 py-2 text-left">
                  Item
                </th>
                <th className="border border-amber-500 dark:border-amber-800 px-3 py-2 text-center">
                  Amount (gram)
                </th>
                <th className="border border-amber-500 dark:border-amber-800 px-3 py-2 text-center">
                  Tentative cost (₹ / laddoo)
                </th>
                <th className="border border-amber-500 dark:border-amber-800 px-3 py-2 text-center">
                  Price per kg (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {state.lad.map((row, idx) => (
                <tr
                  key={row[0]}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                    {row[0]}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                    {numInput(row[1], (v) => setLadItem(idx, 1, v))}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num font-bold">
                    <RationInput
                      value={(row[1] * row[2]) / 1000}
                      title="Edit tentative cost per laddoo to auto-calculate price per kg"
                      onChange={(cost) => {
                        if (row[1] > 0) {
                          setLadItem(idx, 2, r2((cost * 1000) / row[1]));
                        }
                      }}
                    />
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                    {numInput(row[2], (v) => setLadItem(idx, 2, v))}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Preparation cost (cook wage per laddoo)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2" />
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.prep, (v) =>
                    onUpdateState((prev) => ({ ...prev, prep: v }))
                  )}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2" />
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 px-4 py-2.5 rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sm font-semibold text-[#005A9C] dark:text-sky-300 text-center">
          Per laddoo cost is ₹{f2(ingTotal)} including preparation cost
        </div>
      </SectionCard>

      {/* 2. Primary & Upper Primary Norms */}
      <SectionCard
        sKey="norm"
        title="Primary &amp; Upper Primary Norms and Price per kg"
        subtitle={`SB+PS: ₹${f2(state.pm[0])}/meal (Veg ₹${f2(
          vegCost(state, 0)
        )}) · UPS: ₹${f2(state.pm[1])}/meal (Veg ₹${f2(vegCost(state, 1))})`}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[720px]">
            <thead>
              <tr className="text-xs font-semibold text-white">
                <th className="border border-slate-700 bg-slate-800 dark:bg-slate-950 px-3 py-2.5 text-left">
                  Item
                </th>
                <th className="border border-sky-600 dark:border-sky-800 px-3 py-2.5 text-center bg-sky-700 dark:bg-sky-900">
                  SB + Primary
                </th>
                <th className="border border-sky-600 dark:border-sky-800 px-3 py-2.5 text-center bg-sky-700 dark:bg-sky-900">
                  Ration PS (₹/child)
                </th>
                <th className="border border-sky-600 dark:border-sky-800 px-3 py-2.5 text-center bg-sky-700 dark:bg-sky-900">
                  Price / kg
                </th>
                <th className="border border-emerald-600 dark:border-emerald-800 px-3 py-2.5 text-center bg-emerald-700 dark:bg-emerald-900">
                  Upper Primary
                </th>
                <th className="border border-emerald-600 dark:border-emerald-800 px-3 py-2.5 text-center bg-emerald-700 dark:bg-emerald-900">
                  Ration UPS (₹/child)
                </th>
                <th className="border border-emerald-600 dark:border-emerald-800 px-3 py-2.5 text-center bg-emerald-700 dark:bg-emerald-900">
                  Price / kg
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Rice
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-sky-50/40 dark:bg-sky-950/20">
                  <div className="inline-flex items-center gap-1.5">
                    {numInput(N.rice[0], (v) => setNormVal('rice', 0, v))}
                    <span className="text-xs text-slate-500">gm</span>
                  </div>
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-sky-50/40 dark:bg-sky-950/20">
                  FREE
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-sky-50/40 dark:bg-sky-950/20" />
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="inline-flex items-center gap-1.5">
                    {numInput(N.rice[1], (v) => setNormVal('rice', 1, v))}
                    <span className="text-xs text-slate-500">gm</span>
                  </div>
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20">
                  FREE
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-emerald-50/40 dark:bg-emerald-950/20" />
              </tr>
              {normRow('Dal', 'dal', 'gm')}
              {normRow('Soya', 'soya', 'gm')}
              {normRow('Oil', 'oil', 'ml')}
              {normRow('Vegetables', 'veg', 'gm')}
              {normRow('Egg (count)', 'egg', '')}
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Laddoo (count)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-sky-50/40 dark:bg-sky-950/20">
                  {numInput(N.lad[0], (v) => setNormVal('lad', 0, v))}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-sky-50/40 dark:bg-sky-950/20">
                  <RationInput
                    value={c0.lad}
                    title="Edit ration per child to update per-laddoo cost"
                    onChange={(r) => {
                      if (N.lad[0] > 0) {
                        onUpdateState((p) => ({
                          ...p,
                          ladV: r2(r / N.lad[0]),
                        }));
                      }
                    }}
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-sky-50/40 dark:bg-sky-950/20">
                  {numInput(lCost, (v) =>
                    onUpdateState((p) => ({ ...p, ladV: v }))
                  )}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-emerald-50/40 dark:bg-emerald-950/20">
                  {numInput(N.lad[1], (v) => setNormVal('lad', 1, v))}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-emerald-50/40 dark:bg-emerald-950/20">
                  <RationInput
                    value={c1.lad}
                    title="Edit ration per child to update per-laddoo cost"
                    onChange={(r) => {
                      if (N.lad[1] > 0) {
                        onUpdateState((p) => ({
                          ...p,
                          ladV: r2(r / N.lad[1]),
                        }));
                      }
                    }}
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-emerald-50/40 dark:bg-emerald-950/20">
                  {numInput(lCost, (v) =>
                    onUpdateState((p) => ({ ...p, ladV: v }))
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Fuel (₹/child)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-sky-50/40 dark:bg-sky-950/20">
                  {numInput(N.fuel[0], (v) => setNormVal('fuel', 0, v))}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-sky-50/40 dark:bg-sky-950/20">
                  <RationInput
                    value={N.fuel[0]}
                    onChange={(r) => setNormVal('fuel', 0, r)}
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-sky-50/40 dark:bg-sky-950/20" />
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-emerald-50/40 dark:bg-emerald-950/20">
                  {numInput(N.fuel[1], (v) => setNormVal('fuel', 1, v))}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-emerald-50/40 dark:bg-emerald-950/20">
                  <RationInput
                    value={N.fuel[1]}
                    onChange={(r) => setNormVal('fuel', 1, r)}
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-emerald-50/40 dark:bg-emerald-950/20" />
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Salt &amp; condiment (₹/child)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-sky-50/40 dark:bg-sky-950/20">
                  {numInput(N.cond[0], (v) => setNormVal('cond', 0, v))}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-sky-50/40 dark:bg-sky-950/20">
                  <RationInput
                    value={N.cond[0]}
                    onChange={(r) => setNormVal('cond', 0, r)}
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-sky-50/40 dark:bg-sky-950/20" />
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center bg-emerald-50/40 dark:bg-emerald-950/20">
                  {numInput(N.cond[1], (v) => setNormVal('cond', 1, v))}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs bg-emerald-50/40 dark:bg-emerald-950/20">
                  <RationInput
                    value={N.cond[1]}
                    onChange={(r) => setNormVal('cond', 1, r)}
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-emerald-50/40 dark:bg-emerald-950/20" />
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Edit either <strong>Price / kg</strong> or{' '}
          <strong>Ration (₹/child)</strong> to auto-calculate the other.
          Vegetables auto-adjust to whatever remains from the per-meal cost:
          Primary ₹{f2(vegCost(state, 0))}, Upper Primary ₹
          {f2(vegCost(state, 1))} on a day with every item.
        </p>
      </SectionCard>

      {/* 3. Secondary Norms */}
      <SectionCard
        sKey="sec"
        title="Secondary (Class 9–10) Norms"
        subtitle={`Rice ${state.N2.rice}g · Per meal cost ₹${f2(pm2(state))}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[540px]">
            <thead>
              <tr className="bg-violet-700 dark:bg-violet-900 text-xs font-semibold text-white">
                <th className="border border-violet-600 dark:border-violet-800 px-3 py-2 text-left">
                  Item
                </th>
                <th className="border border-violet-600 dark:border-violet-800 px-3 py-2 text-center">
                  Quantity per child
                </th>
                <th className="border border-violet-600 dark:border-violet-800 px-3 py-2 text-center">
                  Ration (₹ / child)
                </th>
                <th className="border border-violet-600 dark:border-violet-800 px-3 py-2 text-center">
                  Price per kg (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Rice
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.N2.rice, (v) =>
                    onUpdateState((p) => ({
                      ...p,
                      N2: { ...p.N2, rice: v },
                    }))
                  )}{' '}
                  <span className="text-xs text-slate-500">gm</span>
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  FREE
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2" />
              </tr>
              {(
                [
                  ['Dal', 'dal', 'gm'],
                  ['Soya', 'soya', 'gm'],
                  ['Oil', 'oil', 'ml'],
                ] as const
              ).map(([label, key, unit]) => (
                <tr key={key}>
                  <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                    {label}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                    {numInput(state.N2[key][0], (v) =>
                      onUpdateState((p) => ({
                        ...p,
                        N2: { ...p.N2, [key]: [v, p.N2[key][1]] },
                      }))
                    )}{' '}
                    <span className="text-xs text-slate-500">{unit}</span>
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs">
                    <RationInput
                      value={(state.N2[key][0] * state.N2[key][1]) / 1000}
                      onChange={(r) => {
                        const qty = state.N2[key][0];
                        if (qty <= 0) return;
                        onUpdateState((p) => ({
                          ...p,
                          N2: {
                            ...p.N2,
                            [key]: [p.N2[key][0], r2((r * 1000) / qty)],
                          },
                        }));
                      }}
                    />
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                    {numInput(state.N2[key][1], (v) =>
                      onUpdateState((p) => ({
                        ...p,
                        N2: { ...p.N2, [key]: [p.N2[key][0], v] },
                      }))
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Vegetables
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.N2.veg, (v) =>
                    onUpdateState((p) => ({ ...p, N2: { ...p.N2, veg: v } }))
                  )}{' '}
                  <span className="text-xs text-slate-500">gm</span>
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center text-xs text-slate-500">
                  Auto adjust
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center text-xs text-slate-500">
                  Auto adjust
                </td>
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Egg (count)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.N2.egg[0], (v) =>
                    onUpdateState((p) => ({
                      ...p,
                      N2: { ...p.N2, egg: [v, p.N2.egg[1]] },
                    }))
                  )}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs">
                  <RationInput
                    value={state.N2.egg[0] * state.N2.egg[1]}
                    onChange={(r) => {
                      const qty = state.N2.egg[0];
                      if (qty <= 0) return;
                      onUpdateState((p) => ({
                        ...p,
                        N2: { ...p.N2, egg: [p.N2.egg[0], r2(r / qty)] },
                      }));
                    }}
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.N2.egg[1], (v) =>
                    onUpdateState((p) => ({
                      ...p,
                      N2: { ...p.N2, egg: [p.N2.egg[0], v] },
                    }))
                  )}{' '}
                  <span className="text-xs text-slate-500">per piece</span>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Laddoo (count)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.N2.lad, (v) =>
                    onUpdateState((p) => ({ ...p, N2: { ...p.N2, lad: v } }))
                  )}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs">
                  <RationInput
                    value={state.N2.lad * lCost}
                    title="Edit ration per child to update per-laddoo cost"
                    onChange={(r) => {
                      if (state.N2.lad > 0) {
                        onUpdateState((p) => ({
                          ...p,
                          ladV: r2(r / state.N2.lad),
                        }));
                      }
                    }}
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs">
                  <div className="inline-flex items-center gap-1.5">
                    {numInput(lCost, (v) =>
                      onUpdateState((p) => ({ ...p, ladV: v }))
                    )}
                    <span className="text-xs text-slate-500">per laddoo</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Fuel (₹/child)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.N2.fuel, (v) =>
                    onUpdateState((p) => ({ ...p, N2: { ...p.N2, fuel: v } }))
                  )}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs">
                  <RationInput
                    value={state.N2.fuel}
                    onChange={(r) =>
                      onUpdateState((p) => ({ ...p, N2: { ...p.N2, fuel: r } }))
                    }
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2" />
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Salt &amp; condiment (₹/child)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.N2.cond, (v) =>
                    onUpdateState((p) => ({ ...p, N2: { ...p.N2, cond: v } }))
                  )}
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center font-mono-num text-xs">
                  <RationInput
                    value={state.N2.cond}
                    onChange={(r) =>
                      onUpdateState((p) => ({ ...p, N2: { ...p.N2, cond: r } }))
                    }
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2" />
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Per meal cost (₹ per child)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(pm2(state), (v) =>
                    onUpdateState((p) => ({ ...p, pm2: v }))
                  )}
                </td>
                <td
                  colSpan={2}
                  className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-500"
                >
                  Vegetables get whatever is left of this amount
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={copyFromUPS}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>
              Copy all values from Upper Primary (keeps rice as entered)
            </span>
          </button>
        </div>
      </SectionCard>

      {/* 4. Per Meal Cost */}
      <SectionCard
        sKey="pm"
        title="Per Meal Cost &amp; Laddoo Cost"
        subtitle={`Primary ₹${f2(state.pm[0])} · Upper Primary ₹${f2(
          state.pm[1]
        )} · Laddoo ₹${f2(lCost)}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm max-w-2xl">
            <thead>
              <tr className="bg-rose-700 dark:bg-rose-900 text-xs font-semibold text-white">
                <th className="border border-rose-600 dark:border-rose-800 px-3 py-2 text-left">
                  Item
                </th>
                <th className="border border-rose-600 dark:border-rose-800 px-3 py-2 text-center">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Per meal cost · SB + Primary (per child)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.pm[0], (v) =>
                    onUpdateState((p) => ({ ...p, pm: [v, p.pm[1]] }))
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Per meal cost · Upper Primary (per child)
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  {numInput(state.pm[1], (v) =>
                    onUpdateState((p) => ({ ...p, pm: [p.pm[0], v] }))
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold">
                  Per laddoo cost
                </td>
                <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
                  <div className="inline-flex items-center gap-2">
                    {numInput(lCost, (v) =>
                      onUpdateState((p) => ({ ...p, ladV: v }))
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateState((p) => ({ ...p, ladV: null }))
                      }
                      className="h-8 px-2.5 inline-flex items-center gap-1 rounded border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Use ingredient total</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 5. Weekly Menu */}
      <SectionCard
        sKey="menu"
        title="Weekly Menu Matrix"
        subtitle="Shared by all classes (Primary, Upper Primary, and Secondary)"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[600px]">
            <thead>
              <tr className="text-xs font-semibold text-white">
                <th className="border border-slate-700 bg-slate-800 dark:bg-slate-950 px-3 py-2 text-left">
                  Day
                </th>
                {[
                  { label: 'Rice', bg: 'bg-teal-700 dark:bg-teal-900 border-teal-600 dark:border-teal-800' },
                  { label: 'Vegetable', bg: 'bg-emerald-700 dark:bg-emerald-900 border-emerald-600 dark:border-emerald-800' },
                  { label: 'Oil', bg: 'bg-amber-600 dark:bg-amber-900 border-amber-500 dark:border-amber-800' },
                  { label: 'Fuel cost', bg: 'bg-orange-600 dark:bg-orange-900 border-orange-500 dark:border-orange-800' },
                  { label: 'Egg', bg: 'bg-yellow-600 dark:bg-yellow-900 border-yellow-500 dark:border-yellow-800' },
                  { label: 'Dal', bg: 'bg-rose-600 dark:bg-rose-900 border-rose-500 dark:border-rose-800' },
                  { label: 'Soya', bg: 'bg-sky-700 dark:bg-sky-900 border-sky-600 dark:border-sky-800' },
                  { label: 'Laddoo', bg: 'bg-purple-700 dark:bg-purple-900 border-purple-600 dark:border-purple-800' },
                ].map((col) => (
                  <th
                    key={col.label}
                    className={`border px-2 py-2 text-center ${col.bg}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const m = state.menu[d] || { e: 0, d: 0, s: 0, l: 0 };
                return (
                  <tr
                    key={d}
                    className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                  >
                    <td className={`border border-slate-200 dark:border-slate-700 px-3 py-2 font-semibold ${d === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {DN[d]}
                    </td>
                    {(['r', 'v', 'o', 'f', 'e', 'd', 's', 'l'] as const).map(
                      (k) => {
                        const checked = 'rvof'.includes(k)
                          ? m[k] !== 0
                          : !!m[k];
                        return (
                          <td
                            key={k}
                            className={`border border-slate-200 dark:border-slate-700 px-2 py-2 text-center ${checked ? 'bg-emerald-50/50 dark:bg-emerald-950/25' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                setMenuTick(d, k, e.target.checked)
                              }
                              className="w-4 h-4 accent-emerald-600 cursor-pointer"
                            />
                          </td>
                        );
                      }
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Tick every item served on that day. Sunday counts only on dates where
          you enter attendance (observation days).
        </p>
      </SectionCard>
    </div>
  );
};
