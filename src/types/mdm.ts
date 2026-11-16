export type LaddooIngredient = [name: string, gramsPerLaddoo: number, pricePerKg: number];

export interface NormsConfig {
  dal: [number, number, number, number];
  soya: [number, number, number, number];
  oil: [number, number, number, number];
  veg: [number, number];
  egg: [number, number, number, number];
  lad: [number, number];
  fuel: [number, number];
  cond: [number, number];
  rice: [number, number, number?];
}

export interface SecondaryNormsConfig {
  rice: number;
  dal: [number, number];
  soya: [number, number];
  oil: [number, number];
  veg: number;
  egg: [number, number];
  lad: number;
  fuel: number;
  cond: number;
}

export interface MenuDay {
  r?: number;
  v?: number;
  o?: number;
  f?: number;
  e: number;
  d: number;
  s: number;
  l: number;
}

export interface SchoolInfo {
  school: string;
  code: string;
  village: string;
  block: string;
  dist: string;
  cluster?: string;
  acc: string;
  bank: string;
  acc2: string;
  bank2: string;
  teacher: string;
  role: string;
  sup: string;
  supv: string;
  post: string;
  sup2: string;
  supv2: string;
  post2: string;
}

export interface MonthArchive {
  att: Record<number, (number | string)[]>;
  hol: Record<number, number>;
  holn: Record<number, string>;
  open: [number, number, number];
  recv: [number, number, number];
}

export interface MDMState {
  lad: LaddooIngredient[];
  prep: number;
  ladV: number | null;
  N: NormsConfig;
  N2: SecondaryNormsConfig;
  pm: [number, number];
  pm2?: number;
  menu: Record<number, MenuDay>;
  rolls: number[];
  rolls2: [number, number];
  hol: Record<number, number>;
  holn: Record<number, string>;
  att: Record<number, (number | string)[]>;
  open: [number, number, number];
  recv: [number, number, number];
  info: SchoolInfo;
  demo: number[][];
  demo2: number[][];
  insp: string[];
  insps: string[][];
  cooks: string[][];
  cooks2: string[][];
  fund: number[];
  logo: string;
  emblem: string;
  photo: string;
  cur: string;
  months: Record<string, MonthArchive>;
  big?: boolean;
  attQuick?: boolean;
  m2?: Record<string, string | boolean>;
  m3?: Record<string, string>;
}

export interface PrimaryCalcResult {
  days: number;
  meals: number;
  np: number;
  nu: number;
  eggs: number;
  dal: number;
  soya: number;
  oil: number;
  veg: number;
  fuel: number;
  vegAmt: number;
  rice: number;
  lad: number;
  eggDays: number[];
  dalA: number;
  soyaA: number;
  oilA: number;
  eggA: number;
  total: number;
}

export interface AbstractTierGroup {
  q: number;
  dal: number;
  soya: number;
  oil: number;
  veg: number;
  vegA: number;
  egg: number;
  lad: number;
  fuel: number;
  cond: number;
  rice: number;
}

export interface SecondaryCalcResult {
  days: number;
  meals: number;
  eggs: number;
  dal: number;
  soya: number;
  oil: number;
  veg: number;
  fuel: number;
  rice: number;
  lad: number;
  dalA: number;
  soyaA: number;
  oilA: number;
  eggA: number;
  cn: number;
  vegAmt: number;
  total: number;
}

export type TabId =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;
