import { MDMState } from '../types/mdm';
import { DEFAULT_EMBLEM, DEFAULT_LOGO } from './defaultAssets';

export const MNAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const ODIA_MONTHS = [
  'ଜାନୁଆରୀ',
  'ଫେବୃଆରୀ',
  'ମାର୍ଚ୍ଚ',
  'ଅପ୍ରେଲ',
  'ମେ',
  'ଜୁନ',
  'ଜୁଲାଇ',
  'ଅଗଷ୍ଟ',
  'ସେପ୍ଟେମ୍ବର',
  'ଅକ୍ଟୋବର',
  'ନଭେମ୍ବର',
  'ଡିସେମ୍ବର',
];

export const DN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const CLASS_LABELS = [
  'SB',
  'CLASS-1',
  'CLASS-2',
  'CLASS-3',
  'CLASS-4',
  'CLASS-5',
  'CLASS-6',
  'CLASS-7',
  'CLASS-8',
  'CLASS-9',
  'CLASS-10',
];

export function createDefaultState(): MDMState {
  return {
    lad: [
      ['Ragi flour', 12, 150],
      ['Wheat flour', 12, 41.666667],
      ['Sesame', 1, 140],
      ['Raw sugar', 6, 45],
      ['Refined oil', 2, 160],
      ['Groundnut', 1, 150],
      ['Cardamom powder', 0.04, 1500],
    ],
    prep: 0.26,
    ladV: null,
    N: {
      dal: [25, 30, 115, 115],
      soya: [12, 25, 160, 160],
      oil: [5, 7.5, 140, 140],
      veg: [60, 100],
      egg: [1, 1, 7, 7],
      lad: [1, 1],
      fuel: [0.76, 1],
      cond: [0, 0],
      rice: [100, 150, 200],
    },
    N2: {
      rice: 200,
      dal: [30, 115],
      soya: [25, 160],
      oil: [7.5, 140],
      veg: 100,
      egg: [1, 7],
      lad: 1,
      fuel: 1,
      cond: 0,
    },
    pm: [11.15, 14.74],
    menu: {
      1: { e: 1, d: 0, s: 0, l: 0 },
      2: { e: 0, d: 1, s: 1, l: 1 },
      3: { e: 1, d: 0, s: 0, l: 0 },
      4: { e: 0, d: 1, s: 1, l: 1 },
      5: { e: 1, d: 0, s: 0, l: 0 },
      6: { e: 0, d: 1, s: 1, l: 1 },
      0: { e: 0, d: 0, s: 0, l: 0 },
    },
    rolls: [19, 19, 24, 13, 28, 26, 32, 29, 32],
    rolls2: [37, 47],
    hol: { 16: 1, 24: 1, 26: 1 },
    holn: {},
    att: {
      1: [12, 13, 21, 10, 10, 23, 24, 23, 26],
      2: [12, 13, 21, 11, 10, 23, 23, 23, 25],
      3: [12, 13, 22, 10, 23, 21, 23, 23, 23],
      4: [10],
      5: [13, 14, 21, 10, 23, 22, 24, 12, 23],
      6: [13, 14, 12, 12, 23, 22, 23, 12, 24],
      7: [13, 14, 13, 10, 23, 22, 22, 12, 24],
      8: [12, 12, 14, 11, 24, 23, 22, 12, 24],
      9: [12, 13, 15, 10, 25, 23, 22, 12, 24],
      10: [14, 13, 16, 10, 23, 23, 22, 12, 25],
      12: [12, 13, 16, 10, 22, 23, 23, 12, 25],
      13: [13, 13, 16, 10, 22, 23, 23, 12, 26],
      14: [11, 13, 17, 10, 23, 22, 23, 12, 25],
      15: [12, 13, 15, 10, 23, 21, 23, 12, 25],
      17: [13, 12, 15, 10, 23, 21, 23, 1, 25],
      19: [13, 12, 15, 10, 24, 12, 23, 18, 25],
      20: [13, 12, 16, 10, 24, 12, 23, 13, 25],
      21: [12, 12, 15, 10, 25, 23, 23, 23, 26],
      22: [11, 12, 21, 10, 24, 23, 22, 23, 26],
      23: [12, 12, 16, 10, 23, 23, 23, 23, 25],
      27: [12, 12, 18, 13, 22, 22, 23, 25, 25],
      28: [12, 12, 17, 11, 22, 23, 22, 25, 25],
      29: [12, 12, 19, 12, 22, 23, 22, 24, 25],
    },
    open: [193.595, 427.675, 0],
    recv: [0, 0, 0],
    info: {
      school: 'GOVT. UGHS MALDA',
      code: '21290310201',
      village: 'MALDA',
      block: 'BORIGUMMA',
      dist: 'KORAPUT',
      cluster: 'MOHULI',
      acc: '748202010007192',
      bank: 'UGB CHALLANGUDA',
      acc2: '',
      bank2: 'PUNJAB NATIONAL BANK,JEYPORE',
      teacher: 'UMA SANKAR MALI',
      role: 'ASSISTANT TEACHER, GUGHS MALDA',
      sup: '',
      supv: '',
      post: '',
      sup2: '',
      supv2: '',
      post2: '',
    },
    demo: [
      [4, 3, 2, 1, 6, 3],
      [18, 20, 7, 4, 28, 32],
      [11, 13, 7, 9, 25, 26],
    ],
    demo2: [
      [4, 5, 1, 3, 14, 10],
      [5, 9, 3, 5, 9, 16],
    ],
    insp: ['GUNUDHAR PUJARI', 'CRCC', '1 TIME', '12-06-2026', '0'],
    insps: [
      ['GUNUDHAR PUJARI', 'CRCC', '1 TIME', '12-06-2026', '0'],
      ['', '', '', '', ''],
    ],
    cooks: [
      ['BHAGABATI BHATRA', '84004145936', 'UKGB CHALLANGUDA'],
      ['LAXMI BHATRA', '84004145889', 'UKGB CHALLANGUDA'],
      ['SUNAMANI BHAJATI', '84010528240', 'UKGB CHALLANGUDA'],
    ],
    cooks2: [
      ['LAXMI PAIK', '26272882989829', 'UB BORIGUMMA'],
      ['NANDAI MALI', '67788888998989', 'UKGB CHALLANGUDA'],
    ],
    fund: [0, 0, 0, 0, 0, 0],
    logo: DEFAULT_LOGO,
    emblem: DEFAULT_EMBLEM,
    photo: '',
    cur: '2026-9',
    months: {},
  };
}

const STORAGE_KEY = 'mdm26';

export function loadState(): MDMState {
  const def = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    const merged: MDMState = {
      ...def,
      ...parsed,
      info: { ...def.info, ...(parsed.info || {}) },
      N: { ...def.N, ...(parsed.N || {}) },
      N2: { ...def.N2, ...(parsed.N2 || {}) },
      menu: { ...def.menu, ...(parsed.menu || {}) },
    };
    if (!merged.emblem) merged.emblem = DEFAULT_EMBLEM;
    if (!merged.logo) merged.logo = DEFAULT_LOGO;
    if (!merged.rolls2) merged.rolls2 = def.rolls2;
    if (merged.N.rice[2] === undefined) merged.N.rice[2] = 200;
    if (!merged.holn) merged.holn = {};
    if (!merged.demo2) merged.demo2 = def.demo2;
    if (!merged.cooks2) merged.cooks2 = def.cooks2;
    if (!merged.fund) merged.fund = [0, 0, 0, 0, 0, 0];
    while (merged.fund.length < 6) merged.fund.push(0);
    if (!merged.insps) merged.insps = [merged.insp || def.insp, ['', '', '', '', '']];
    if (!merged.cur) merged.cur = '2026-9';
    if (!merged.months) merged.months = {};
    if (merged.open.length < 3) merged.open = [merged.open[0] || 0, merged.open[1] || 0, 0];
    if (merged.recv.length < 3) merged.recv = [merged.recv[0] || 0, merged.recv[1] || 0, 0];
    return merged;
  } catch {
    return def;
  }
}

export function saveState(state: MDMState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}
