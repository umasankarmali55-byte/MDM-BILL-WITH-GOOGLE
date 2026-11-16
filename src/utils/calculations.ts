import {
  AbstractTierGroup,
  MDMState,
  NormsConfig,
  PrimaryCalcResult,
  SecondaryCalcResult,
} from '../types/mdm';
import { ODIA_MONTHS } from '../data/defaultState';

export const num = (v: unknown): number => {
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

export const r2 = (n: number): number => Math.round(n * 100 + 1e-9) / 100;
export const f2 = (n: number): string => r2(n).toFixed(2);
export const f3 = (n: number): string => (+n || 0).toFixed(3);

export const od = (n: number | string): string =>
  String(n).replace(/\d/g, (c) => '୦୧୨୩୪୫୬୭୮୯'[Number(c)]);

export function parseMonthKey(cur: string): { year: number; month: number; daysInMonth: number } {
  const [yStr, mStr] = (cur || '2026-9').split('-');
  const year = parseInt(yStr, 10) || 2026;
  const month = parseInt(mStr, 10);
  const safeMonth = Number.isFinite(month) && month >= 0 && month <= 11 ? month : 9;
  const daysInMonth = new Date(year, safeMonth + 1, 0).getDate();
  return { year, month: safeMonth, daysInMonth };
}

export const getWeekday = (year: number, month: number, day: number): number =>
  new Date(year, month, day).getDay();

export function ingCost(state: MDMState): number {
  return state.lad.reduce((acc, row) => acc + (row[1] * row[2]) / 1000, 0) + state.prep;
}

export function ladCost(state: MDMState): number {
  return state.ladV ?? r2(ingCost(state));
}

export function cpc(state: MDMState, tier: 0 | 1) {
  const N = state.N;
  const lCost = ladCost(state);
  return {
    dal: (N.dal[tier] * N.dal[2 + tier]) / 1000,
    soya: (N.soya[tier] * N.soya[2 + tier]) / 1000,
    oil: (N.oil[tier] * N.oil[2 + tier]) / 1000,
    egg: N.egg[tier] * N.egg[2 + tier],
    lad: N.lad[tier] * lCost,
    fuel: N.fuel[tier],
    cond: N.cond[tier],
  };
}

export function vegCost(state: MDMState, tier: 0 | 1): number {
  const c = cpc(state, tier);
  return state.pm[tier] - c.dal - c.soya - c.oil - c.egg - c.lad - c.fuel - c.cond;
}

export function dayTot(state: MDMState, day: number): [number, number, number, number, number] {
  if (state.hol[day]) return [0, 0, 0, 0, 0];
  const a = state.att[day] || [];
  const g = (i: number) => num(a[i]);
  const sb = g(0);
  const ps = g(1) + g(2) + g(3) + g(4) + g(5);
  const up = g(6) + g(7) + g(8);
  const sec = g(9) + g(10);
  return [sb, ps, up, sb + ps + up, sec];
}

export function dayCells(state: MDMState, day: number): number[] {
  const a = state.att[day] || [];
  const h = state.hol[day];
  const g = (i: number) => (h ? 0 : num(a[i]));
  const t = dayTot(state, day);
  return [g(0), g(1), g(2), g(3), g(4), g(5), t[1], g(6), g(7), g(8), t[2], t[3]];
}

export function calcPrimary(state: MDMState): PrimaryCalcResult {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const N = state.N;
  const lCost = ladCost(state);
  const R: PrimaryCalcResult = {
    days: 0,
    meals: 0,
    np: 0,
    nu: 0,
    eggs: 0,
    dal: 0,
    soya: 0,
    oil: 0,
    veg: 0,
    fuel: 0,
    vegAmt: 0,
    rice: 0,
    lad: 0,
    eggDays: [],
    dalA: 0,
    soyaA: 0,
    oilA: 0,
    eggA: 0,
    total: 0,
  };

  for (let d = 1; d <= daysInMonth; d++) {
    const [sb, ps, up, totalMeals] = dayTot(state, d);
    if (!totalMeals) continue;
    const m = state.menu[getWeekday(year, month, d)] || { e: 0, d: 0, s: 0, l: 0 };
    const n: [number, number] = [sb + ps, up];
    R.days++;
    R.meals += totalMeals;
    R.np += n[0];
    R.nu += n[1];

    const on = (x: 'r' | 'v' | 'o' | 'f') => m[x] !== 0;

    for (let k = 0; k < 2; k++) {
      const tier = k as 0 | 1;
      const c = cpc(state, tier);
      const q = n[k];
      R.dal += m.d ? (q * N.dal[k]) / 1000 : 0;
      R.soya += m.s ? (q * N.soya[k]) / 1000 : 0;
      R.oil += on('o') ? (q * N.oil[k]) / 1000 : 0;
      R.oilA += on('o') ? ((q * N.oil[k]) / 1000) * N.oil[2 + k] : 0;
      R.dalA += m.d ? ((q * N.dal[k]) / 1000) * N.dal[2 + k] : 0;
      R.soyaA += m.s ? ((q * N.soya[k]) / 1000) * N.soya[2 + k] : 0;
      R.eggA += m.e ? q * N.egg[k] * N.egg[2 + k] : 0;
      R.veg += on('v') ? (q * N.veg[k]) / 1000 : 0;
      R.fuel += on('f') ? q * c.fuel : 0;
      R.rice += on('r') ? (q * (N.rice[k] ?? 0)) / 1000 : 0;
      if (m.e) R.eggs += q * N.egg[k];
      if (m.l) R.lad += q * N.lad[k];
      R.vegAmt += on('v')
        ? q *
          Math.max(
            0,
            state.pm[k] -
              (m.d ? c.dal : 0) -
              (m.s ? c.soya : 0) -
              (on('o') ? c.oil : 0) -
              (m.e ? c.egg : 0) -
              (m.l ? c.lad : 0) -
              (on('f') ? c.fuel : 0) -
              c.cond
          )
        : 0;
    }
    if (m.e) R.eggDays.push(d);
  }

  R.dalA = R.dal ? (+R.dal.toFixed(3) * R.dalA) / R.dal : 0;
  R.soyaA = R.soya ? (+R.soya.toFixed(3) * R.soyaA) / R.soya : 0;
  R.oilA = R.oil ? (+R.oil.toFixed(3) * R.oilA) / R.oil : 0;
  const cn = N.cond[0] * R.np + N.cond[1] * R.nu;
  R.vegAmt = R.np * state.pm[0] + R.nu * state.pm[1] - R.lad * lCost - R.dalA - R.soyaA - R.oilA - R.eggA - R.fuel - cn;
  R.total = r2(R.dalA) + r2(R.soyaA) + r2(R.oilA) + r2(R.eggA) + r2(R.fuel) + r2(cn) + r2(R.vegAmt);
  return R;
}

export function calcAbsTiers(state: MDMState): [AbstractTierGroup, AbstractTierGroup] {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const N = state.N;
  const groups: [AbstractTierGroup, AbstractTierGroup] = [0, 1].map(() => ({
    q: 0,
    dal: 0,
    soya: 0,
    oil: 0,
    veg: 0,
    vegA: 0,
    egg: 0,
    lad: 0,
    fuel: 0,
    cond: 0,
    rice: 0,
  })) as [AbstractTierGroup, AbstractTierGroup];

  for (let d = 1; d <= daysInMonth; d++) {
    const t = dayTot(state, d);
    if (!t[3]) continue;
    const m = state.menu[getWeekday(year, month, d)] || { e: 0, d: 0, s: 0, l: 0 };
    const on = (x: 'r' | 'v' | 'o' | 'f') => m[x] !== 0;
    const n: [number, number] = [t[0] + t[1], t[2]];

    for (let k = 0; k < 2; k++) {
      const q = n[k];
      const c = cpc(state, k as 0 | 1);
      const G = groups[k];
      G.q += q;
      if (m.d) G.dal += (q * N.dal[k]) / 1000;
      if (m.s) G.soya += (q * N.soya[k]) / 1000;
      if (on('o')) G.oil += (q * N.oil[k]) / 1000;
      if (on('v')) {
        G.veg += (q * N.veg[k]) / 1000;
        G.vegA +=
          q *
          Math.max(
            0,
            state.pm[k] -
              (m.d ? c.dal : 0) -
              (m.s ? c.soya : 0) -
              (on('o') ? c.oil : 0) -
              (m.e ? c.egg : 0) -
              (m.l ? c.lad : 0) -
              (on('f') ? c.fuel : 0) -
              c.cond
          );
      }
      if (m.e) G.egg += q * N.egg[k];
      if (m.l) G.lad += q * N.lad[k];
      if (on('f')) G.fuel += q * c.fuel;
      G.cond += q * c.cond;
      if (on('r')) G.rice += (q * (N.rice[k] ?? 0)) / 1000;
    }
  }
  return groups;
}

export function pm2(state: MDMState): number {
  return state.pm2 !== undefined ? state.pm2 : state.pm[1];
}

export function secN(state: MDMState): NormsConfig {
  const n = state.N2;
  return {
    dal: [0, n.dal[0], 0, n.dal[1]],
    soya: [0, n.soya[0], 0, n.soya[1]],
    oil: [0, n.oil[0], 0, n.oil[1]],
    veg: [0, n.veg],
    egg: [0, n.egg[0], 0, n.egg[1]],
    lad: [0, n.lad],
    fuel: [0, n.fuel],
    cond: [0, n.cond],
    rice: [0, 0, n.rice],
  };
}

export function calcSecondary(state: MDMState): SecondaryCalcResult {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const N = secN(state);
  const lCost = ladCost(state);
  const p2 = pm2(state);
  const R: SecondaryCalcResult = {
    days: 0,
    meals: 0,
    eggs: 0,
    dal: 0,
    soya: 0,
    oil: 0,
    veg: 0,
    fuel: 0,
    rice: 0,
    lad: 0,
    dalA: 0,
    soyaA: 0,
    oilA: 0,
    eggA: 0,
    cn: 0,
    vegAmt: 0,
    total: 0,
  };

  for (let d = 1; d <= daysInMonth; d++) {
    const q = dayTot(state, d)[4];
    if (!q) continue;
    const m = state.menu[getWeekday(year, month, d)] || { e: 0, d: 0, s: 0, l: 0 };
    const on = (x: 'r' | 'v' | 'o' | 'f') => m[x] !== 0;
    R.days++;
    R.meals += q;
    if (m.d) {
      R.dal += (q * N.dal[1]) / 1000;
      R.dalA += ((q * N.dal[1]) / 1000) * N.dal[3];
    }
    if (m.s) {
      R.soya += (q * N.soya[1]) / 1000;
      R.soyaA += ((q * N.soya[1]) / 1000) * N.soya[3];
    }
    if (on('o')) {
      R.oil += (q * N.oil[1]) / 1000;
      R.oilA += ((q * N.oil[1]) / 1000) * N.oil[3];
    }
    if (on('v')) R.veg += (q * N.veg[1]) / 1000;
    if (on('f')) R.fuel += q * state.N2.fuel;
    if (on('r')) R.rice += (q * (N.rice[2] === undefined ? 200 : N.rice[2])) / 1000;
    if (m.e) {
      R.eggs += q * N.egg[1];
      R.eggA += q * N.egg[1] * N.egg[3];
    }
    if (m.l) R.lad += q * N.lad[1];
  }

  R.dalA = R.dal ? (+R.dal.toFixed(3) * R.dalA) / R.dal : 0;
  R.soyaA = R.soya ? (+R.soya.toFixed(3) * R.soyaA) / R.soya : 0;
  R.oilA = R.oil ? (+R.oil.toFixed(3) * R.oilA) / R.oil : 0;
  R.cn = N.cond[1] * R.meals;
  R.vegAmt = R.meals * p2 - R.lad * lCost - R.dalA - R.soyaA - R.oilA - R.eggA - R.fuel - R.cn;
  R.total = r2(R.dalA) + r2(R.soyaA) + r2(R.oilA) + r2(R.eggA) + r2(R.fuel) + r2(R.cn) + r2(R.vegAmt);
  return R;
}

export function words(n: number): string {
  const o = 'One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen'.split(
    ' '
  );
  const t = 'Twenty Thirty Forty Fifty Sixty Seventy Eighty Ninety'.split(' ');
  const b = (x: number) =>
    x < 20 ? o[x - 1] || '' : t[Math.floor(x / 10) - 2] + (x % 10 ? ' ' + o[(x % 10) - 1] : '');
  const h = (x: number) => (x > 99 ? o[Math.floor(x / 100) - 1] + ' Hundred ' + b(x % 100) : b(x)).trim();

  let r = Math.floor(Math.max(0, n));
  const p = Math.round((Math.max(0, n) - r) * 100);
  let s = '';
  const L = Math.floor(r / 1e5);
  r %= 1e5;
  const T = Math.floor(r / 1e3);
  r %= 1e3;
  if (L) s += h(L) + ' Lakh ';
  if (T) s += h(T) + ' Thousand ';
  if (r) s += h(r);
  return 'Rupees ' + (s.trim() || 'Zero') + (p ? ' ' + h(p) + ' Paise' : '') + ' Only';
}

export function ingCalc(state: MDMState, L: number) {
  const nm = ['ମାଣ୍ଡିଆ ଚୁନା', 'ଅଟା', 'ରାଶି', 'ଗୁଡ', 'ଘିଅ', 'ବାଦାମ', 'ଅଳେଇଚି'];
  const ing = state.lad.map((r, i): [string, number, number, number] => {
    const kg = (L * r[1]) / 1000;
    return [nm[i] || r[0], kg, r[2], r2(kg * r[2])];
  });
  const B = r2(L * state.prep);
  const bill = r2(L * ladCost(state));
  let T = ing.reduce((a, r) => a + r[3], 0);
  const adj = bill - B - T;
  if (Math.abs(adj) > 0.0001 && Math.abs(adj) <= 0.15 && ing[0]) {
    ing[0][3] = r2(ing[0][3] + adj);
    T = T + adj;
  }
  return { ing, T: r2(T), B, bill };
}

export function getReceiptData(state: MDMState, sec: boolean) {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const mm = String(month + 1).padStart(2, '0');
  const d2 = `${String(daysInMonth).padStart(2, '0')}-${mm}-${year}`;
  const mon = `${ODIA_MONTHS[month]} ${year}`;
  const I = state.info;

  if (!sec) {
    const R = calcPrimary(state);
    const g = calcAbsTiers(state);
    const N = state.N;
    let L = 0;
    let nd = 0;
    let mt = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const t = dayTot(state, d);
      if ((state.menu[getWeekday(year, month, d)] || {}).l && t[3]) {
        nd++;
        mt += t[3];
        L += (t[0] + t[1]) * N.lad[0] + t[2] * N.lad[1];
      }
    }
    return {
      I,
      d2,
      mon,
      sec: false as const,
      R,
      g,
      L,
      nd,
      mt,
      cn: N.cond[0] * R.np + N.cond[1] * R.nu,
      cols: ['ପ୍ରାଥମିକ', 'ଉ.ପ୍ରା.'] as [string, string],
      sch: 'ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ',
      sup: I.sup,
      supv: I.supv,
      post: I.post,
      cooks: state.cooks.map((c) => c[0]).join(', '),
      fuelRate: `${f2(N.fuel[0])} / ${f2(N.fuel[1])}`,
      vr: ['01', '02'] as [string, string],
    };
  }

  const R = calcSecondary(state);
  const n2 = state.N2;
  const g: [
    { fuel: number; dal: number; soya: number; oil: number; veg: number; egg: number },
    { fuel: number; dal: number; soya: number; oil: number; veg: number; egg: number }
  ] = [
    { fuel: 0, dal: 0, soya: 0, oil: 0, veg: 0, egg: 0 },
    { fuel: 0, dal: 0, soya: 0, oil: 0, veg: 0, egg: 0 },
  ];
  let L = 0;
  let nd = 0;
  let mt = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    if (state.hol[d]) continue;
    const a = state.att[d] || [];
    const q = [num(a[9]), num(a[10])];
    const tt = q[0] + q[1];
    if (!tt) continue;
    const m = state.menu[getWeekday(year, month, d)] || { e: 0, d: 0, s: 0, l: 0 };
    const on = (x: 'r' | 'v' | 'o' | 'f') => m[x] !== 0;
    [0, 1].forEach((k) => {
      const c = q[k];
      const G = g[k];
      if (m.d) G.dal += (c * n2.dal[0]) / 1000;
      if (m.s) G.soya += (c * n2.soya[0]) / 1000;
      if (on('o')) G.oil += (c * n2.oil[0]) / 1000;
      if (on('v')) G.veg += (c * n2.veg) / 1000;
      if (on('f')) G.fuel += c * n2.fuel;
      if (m.e) G.egg += c * n2.egg[0];
    });
    if (m.l) {
      nd++;
      mt += tt;
      L += tt * n2.lad;
    }
  }

  return {
    I,
    d2,
    mon,
    sec: true as const,
    R,
    g,
    L,
    nd,
    mt,
    cn: R.cn,
    cols: ['ନବମ', 'ଦଶମ'] as [string, string],
    sch: 'ମାଧ୍ୟମିକ (ନବମ ଓ ଦଶମ ଶ୍ରେଣୀ) ବିଦ୍ୟାଳୟ',
    sup: I.sup2 || I.sup,
    supv: I.supv2 || I.supv,
    post: I.post2 || I.post,
    cooks: state.cooks2.map((c) => c[0]).join(', '),
    fuelRate: f2(n2.fuel),
    vr: ['S01', 'S02'] as [string, string],
  };
}

export function distributeTotal(total: number, rolls: number[]): number[] {
  const sum = rolls.reduce((a, b) => a + b, 0);
  if (!sum) return rolls.map(() => 0);
  const raw = rolls.map((r) => (total * r) / sum);
  const fl = raw.map(Math.floor);
  const rem = total - fl.reduce((a, b) => a + b, 0);
  const idx = raw.map((r, i) => [r - fl[i], i] as [number, number]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < rem; k++) {
    fl[idx[k % idx.length][1]]++;
  }
  return fl;
}

export function proportionalSplit(enrollRow: number[], servedTotal: number): number[] {
  const s = enrollRow.reduce((a, b) => a + b, 0);
  const f = s ? servedTotal / s : 0;
  const x = enrollRow.map((v) => Math.round(v * f));
  x[5] = s ? servedTotal - (x[0] + x[1] + x[2] + x[3] + x[4]) : 0;
  return x;
}
