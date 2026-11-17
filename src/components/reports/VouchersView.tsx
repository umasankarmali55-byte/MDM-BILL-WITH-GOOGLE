import React from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { MDMState } from '../../types/mdm';
import {
  calcAbsTiers,
  f2,
  f3,
  getReceiptData,
  ingCalc,
  ladCost,
  od,
  parseMonthKey,
  r2,
  words,
} from '../../utils/calculations';

interface VoucherProps {
  state: MDMState;
  secondary?: boolean;
}

export const VoucherReconciliationBar: React.FC<{
  state: MDMState;
  secondary?: boolean;
  onAutoFillAll: () => void;
}> = ({ state, secondary = false, onAutoFillAll }) => {
  const D = getReceiptData(state, secondary);
  const { R, L, cn } = D;
  const gT =
    r2(R.dalA) + r2(R.soyaA) + r2(R.oilA) + r2(cn) + r2(R.eggA);
  const V = r2(R.fuel) + gT + r2(R.vegAmt);
  const C = ingCalc(state, L);
  const ok = Math.abs(V - R.total) < 0.011;
  const dif = Math.abs(C.T + C.B - C.bill);

  let headText: string;
  if (secondary) {
    headText = `Filled from Secondary (Class 9–10) bill ₹${f2(R.total)}.`;
  } else {
    const g = calcAbsTiers(state);
    const b0 = g[0].q * state.pm[0] - g[0].lad * ladCost(state);
    const b1 = R.total - b0;
    headText = `Primary bill ₹${f2(b0)} + Upper Primary bill ₹${f2(
      b1
    )} = ₹${f2(b0 + b1)}.`;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      <button
        type="button"
        onClick={onAutoFillAll}
        className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
        title="Clears hand-typed cell overrides and refills all vouchers from current bills"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Auto-fill all vouchers</span>
      </button>
      <div className="text-xs text-slate-600 dark:text-slate-300 flex-1 leading-relaxed">
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {headText}
        </span>{' '}
        Fuel ₹{f2(R.fuel)} + Grocery ₹{f2(gT)} + Vegetables ₹{f2(R.vegAmt)} ={' '}
        <strong className="font-mono-num">₹{f2(V)}</strong>{' '}
        {ok ? (
          <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 inline" /> matches Form-15
          </span>
        ) : (
          <span>(Form-15 ₹{f2(R.total)})</span>
        )}{' '}
        · Laddoo ingredients ₹{f2(C.T)} + cook wage ₹{f2(C.B)} ={' '}
        <strong className="font-mono-num">₹{f2(C.T + C.B)}</strong>{' '}
        {dif < 0.005 ? (
          <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 inline" /> matches Laddoo
            Form-15 ₹{f2(C.bill)}
          </span>
        ) : (
          <span>(Laddoo Form-15 ₹{f2(C.bill)})</span>
        )}
      </div>
    </div>
  );
};

const rpx = (a: number) => r2(a).toFixed(2).split('.');

const ReceiptFoot: React.FC<{ a: number; d2: string; sig: string }> = ({
  a,
  d2,
  sig,
}) => (
  <div style={{ marginTop: '6px' }}>
    <div style={{ textAlign: 'right', margin: '8px 0 2px', fontWeight: 700 }}>
      {sig}
    </div>
    <div
      style={{
        display: 'flex',
        gap: '5px',
        alignItems: 'baseline',
        whiteSpace: 'nowrap',
        fontSize: '10.5px',
      }}
    >
      <span>ତା-</span>
      <span className="fi" style={{ minWidth: '72px' }}>
        {d2}
      </span>
      <span style={{ marginLeft: '4px' }}>ଅକ୍ଷରେ ଉପରୋକ୍ତ ଟ.</span>
      <span className="fi" style={{ minWidth: '58px' }}>
        {f2(a)}
      </span>
      <span>/(</span>
      <span
        className="fi"
        data-ph=""
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: '10px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {words(a)}
      </span>
      <span style={{ whiteSpace: 'nowrap' }}>) ପୈଠ କରାଗଲା</span>
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        marginTop: '12px',
        fontWeight: 700,
      }}
    >
      <span>SHG/SMC</span>
      <span>H.M.</span>
      <span>{sig}</span>
    </div>
  </div>
);

/* ---------------- Tabs 15 & 18: Fuel, Grocery, Veg Receipts ---------------- */
export const FuelGroceryVegReceiptSheet: React.FC<VoucherProps> = ({
  state,
  secondary = false,
}) => {
  const D = getReceiptData(state, secondary);
  const { R, g, I, d2, mon, cn } = D;

  const intro = (item: string) => (
    <div className="v-intro" style={{ lineHeight: 1.8 }}>
      ମୁଁ ଶ୍ରୀ/ଶ୍ରୀମତୀ{' '}
      <span
        className="fi"
        data-ph="supplier name"
        style={{ minWidth: '150px' }}
      >
        {D.sup}
      </span>{' '}
      ଗ୍ରାମ{' '}
      <span className="fi" data-ph="village" style={{ minWidth: '120px' }}>
        {D.supv}
      </span>{' '}
      {D.sch}{' '}
      <span className="fi" style={{ minWidth: '170px' }}>
        {I.school}
      </span>{' '}
      ର ମଧ୍ୟାହ୍ନ ଭୋଜନ କାର୍ଯ୍ୟକ୍ରମ ନିମନ୍ତେ{' '}
      <span className="fi" style={{ minWidth: '120px' }}>
        {mon}
      </span>{' '}
      ମାସ ପାଇଁ ଆବଶ୍ୟକ ହେଉଥିବା ନିମ୍ନଲିଖିତ ପରିମାଣର {item} ଧାର ସୂତ୍ରରେ ଯୋଗାଇ
      ଅଛି ।
    </div>
  );

  const pr = (a: number, q: number) => (q ? f2(a / q) : '');
  const money = (a: number) => {
    const x = rpx(a);
    return (
      <>
        <td>{x[0]}</td>
        <td>{x[1]}</td>
      </>
    );
  };

  const eg = R.eggs;
  const gi: [string, 'dal' | 'soya' | 'oil' | 'egg' | '', number, number, number][] = [
    ['ଡାଲି', 'dal', R.dal, R.dalA, 3],
    ['ସୋୟାବଡି', 'soya', R.soya, R.soyaA, 3],
    ['ତେଲ', 'oil', R.oil, R.oilA, 3],
    ['ମସଲା, ଲୁଣ, ପିଆଜ', '', 0, cn, 0],
    ['ଅଣ୍ଡା', 'egg', eg, R.eggA, 0],
  ];
  const gT =
    r2(R.dalA) + r2(R.soyaA) + r2(R.oilA) + r2(cn) + r2(R.eggA);
  const sig = 'ଯୋଗାଣ କାରୀଙ୍କ ସ୍ୱାକ୍ଷର';

  return (
    <div
      className="paper-sheet voucher-3up"
      style={{
        fontSize: '13px',
        lineHeight: 1.75,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      {/* 1. Fuel Receipt */}
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: '15px' }}>
          ରସିଦ
        </h3>
        {intro('କାଠ')}
        <table style={{ marginTop: '4px' }}>
          <thead>
            <tr>
              <th rowSpan={2}>କ୍ର.ନଂ</th>
              <th rowSpan={2}>ତାରିଖ</th>
              <th colSpan={2}>କାଠ</th>
              <th rowSpan={2}>ମୋଟ ପରିମାଣ</th>
              <th rowSpan={2}>ଦର</th>
              <th colSpan={2}>ମୋଟମୂଲ୍ୟ</th>
            </tr>
            <tr>
              <th>{D.cols[0]}</th>
              <th>{D.cols[1]}</th>
              <th>ଟ.</th>
              <th>ପ.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>୧</td>
              <td>{d2}</td>
              <td>{f2(g[0].fuel)}</td>
              <td>{f2(g[1].fuel)}</td>
              <td>{f2(R.fuel)}</td>
              <td>{D.fuelRate}</td>
              {money(R.fuel)}
            </tr>
            <tr>
              <td colSpan={2}>ମୋଟ</td>
              <td>{f2(g[0].fuel)}</td>
              <td>{f2(g[1].fuel)}</td>
              <td>{f2(R.fuel)}</td>
              <td />
              {money(R.fuel)}
            </tr>
          </tbody>
        </table>
        <ReceiptFoot a={R.fuel} d2={d2} sig={sig} />
      </div>

      {/* 2. Grocery Receipt */}
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: '15px' }}>
          ରସିଦ
        </h3>
        {intro('ସାମଗ୍ରୀ')}
        <table style={{ marginTop: '4px' }}>
          <thead>
            <tr>
              <th rowSpan={2}>କ୍ର.ନଂ</th>
              <th rowSpan={2}>ତାରିଖ</th>
              <th rowSpan={2}>କିନିଷର ନାମ</th>
              <th colSpan={2}>ସାମଗ୍ରୀ ପରିମାଣ</th>
              <th rowSpan={2}>ମୋଟ ପରିମାଣ</th>
              <th rowSpan={2}>ଦର</th>
              <th colSpan={2}>ମୋଟମୂଲ୍ୟ</th>
            </tr>
            <tr>
              <th>{D.cols[0]}</th>
              <th>{D.cols[1]}</th>
              <th>ଟ.</th>
              <th>ପ.</th>
            </tr>
          </thead>
          <tbody>
            {gi.map(([name, key, qt, amt, dp], idx) => (
              <tr key={name}>
                <td>{od(idx + 1)}</td>
                <td>{d2}</td>
                <td className="l">{name}</td>
                {key ? (
                  <>
                    <td>{dp ? f3(g[0][key]) : g[0][key]}</td>
                    <td>{dp ? f3(g[1][key]) : g[1][key]}</td>
                    <td>{dp ? f3(qt) : qt}</td>
                    <td>{pr(amt, qt)}</td>
                  </>
                ) : (
                  <>
                    <td />
                    <td />
                    <td />
                    <td />
                  </>
                )}
                {money(amt)}
              </tr>
            ))}
            <tr>
              <td colSpan={3}>ମୋଟ</td>
              <td />
              <td />
              <td />
              <td />
              {money(gT)}
            </tr>
          </tbody>
        </table>
        <ReceiptFoot a={gT} d2={d2} sig={sig} />
      </div>

      {/* 3. Fresh Vegetables Receipt */}
      <div>
        <h3 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: '15px' }}>
          ରସିଦ
        </h3>
        {intro('ସଜ ପରିବା')}
        <table style={{ marginTop: '4px' }}>
          <thead>
            <tr>
              <th rowSpan={2}>କ୍ର.ନଂ</th>
              <th rowSpan={2}>ତାରିଖ</th>
              <th colSpan={2}>ସଜ ପରିବା (kg)</th>
              <th rowSpan={2}>ମୋଟ ପରିମାଣ</th>
              <th rowSpan={2}>ଦର</th>
              <th colSpan={2}>ମୋଟମୂଲ୍ୟ</th>
            </tr>
            <tr>
              <th>{D.cols[0]}</th>
              <th>{D.cols[1]}</th>
              <th>ଟ.</th>
              <th>ପ.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>୧</td>
              <td>{d2}</td>
              <td>{f3(g[0].veg)}</td>
              <td>{f3(g[1].veg)}</td>
              <td>{f3(R.veg)}</td>
              <td>{pr(R.vegAmt, R.veg)}</td>
              {money(R.vegAmt)}
            </tr>
            <tr>
              <td colSpan={2}>ମୋଟ</td>
              <td>{f3(g[0].veg)}</td>
              <td>{f3(g[1].veg)}</td>
              <td>{f3(R.veg)}</td>
              <td />
              {money(R.vegAmt)}
            </tr>
          </tbody>
        </table>
        <ReceiptFoot a={R.vegAmt} d2={d2} sig={sig} />
      </div>
    </div>
  );
};

/* ---------------- Tabs 16 & 19: Laddoo Ingredients Receipt ---------------- */
export const LaddooIngredientsReceiptSheet: React.FC<VoucherProps> = ({
  state,
  secondary = false,
}) => {
  const { year } = parseMonthKey(state.cur);
  const D = getReceiptData(state, secondary);
  const { L, I, d2, mon } = D;
  const C = ingCalc(state, L);

  return (
    <div
      className="paper-sheet voucher-1up"
      style={{
        fontSize: '13.5px',
        lineHeight: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '15px',
            fontWeight: 700,
          }}
        >
          <span>
            Vr.No :-{' '}
            <span className="fi" style={{ minWidth: '90px' }}>
              {d2.slice(3, 5)}/{year}/{D.vr[0]}
            </span>
          </span>
          <span>
            Date :-{' '}
            <span className="fi" style={{ minWidth: '100px' }}>
              {d2}
            </span>
          </span>
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: '26px',
            fontWeight: 800,
            borderBottom: '3px solid #000',
            paddingBottom: '6px',
            margin: '6px 0 10px',
          }}
        >
          ପୋଷଣ ଯୁକ୍ତ ମାଣ୍ଡିଆ ଲଡୁ ରସିଦ
        </div>

        <div className="v-body" style={{ fontSize: '17px', lineHeight: 2.2 }}>
          ଲିଖିତଂ ରସିଦ ଏହିକି ମୁଁ ଶ୍ରୀ / ଶ୍ରୀମତୀ{' '}
          <span
            className="fi"
            data-ph="supplier name"
            style={{ minWidth: '170px' }}
          >
            {D.sup}
          </span>
          , ଗ୍ରାମ:-{' '}
          <span className="fi" data-ph="village" style={{ minWidth: '120px' }}>
            {D.supv}
          </span>
          , ପୋଷ୍ଟ:-{' '}
          <span
            className="fi"
            data-ph="post office"
            style={{ minWidth: '120px' }}
          >
            {D.post}
          </span>
          , ଜିଲ୍ଲା:-{' '}
          <span className="fi" style={{ minWidth: '100px' }}>
            {I.dist}
          </span>{' '}
          ଲେଖିଦେବା ରସିଦ ଏହିକି{' '}
          <span className="fi" style={{ minWidth: '180px' }}>
            {I.school}
          </span>{' '}
          ବିଦ୍ୟାଳୟ {secondary ? '(ନବମ ଓ ଦଶମ ଶ୍ରେଣୀ) ' : ''}କୁ{' '}
          <span className="fi" style={{ minWidth: '120px' }}>
            {mon}
          </span>{' '}
          ମାସର ମଧ୍ୟାହ୍ନ ଭୋଜନ ପାଇଁ ଲଡୁ ପ୍ରସ୍ତୁତି ନିମନ୍ତେ ନିମ୍ନମତେ ଜିନିଷ
          ଯୋଗାଇଦେଇ ଅଛି ।
        </div>
      </div>

      <table style={{ fontSize: '16px', lineHeight: 1.7 }}>
        <thead>
          <tr>
            <th style={{ width: '9%' }}>କ୍ର.ନଂ</th>
            <th>ବିବରଣୀ</th>
            <th>ପରିମାଣ</th>
            <th>ଦର</th>
            <th>ମୂଲ୍ୟ</th>
          </tr>
        </thead>
        <tbody>
          {C.ing.map((r, i) => (
            <tr key={i}>
              <td>{od(i + 1)}</td>
              <td className="l">{r[0]}</td>
              <td>{f3(r[1])} kg</td>
              <td>{f2(r[2])}</td>
              <td>{f2(r[3])}</td>
            </tr>
          ))}
          <tr>
            <td />
            <td className="l">ମୋଟ</td>
            <td />
            <td />
            <td>{f2(C.T)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ borderTop: '2px solid #000', paddingTop: '8px' }}>
        <ReceiptFoot a={C.T} d2={d2} sig="ଯୋଗାଣ କାରୀଙ୍କ ସ୍ୱାକ୍ଷର" />
      </div>
    </div>
  );
};

/* ---------------- Tabs 17 & 20: Laddoo Cook Wage Receipt ---------------- */
export const LaddooCookWageReceiptSheet: React.FC<VoucherProps> = ({
  state,
  secondary = false,
}) => {
  const { year } = parseMonthKey(state.cur);
  const D = getReceiptData(state, secondary);
  const { L, mt, I, d2, mon } = D;
  const B = r2(L * state.prep);

  return (
    <div
      className="paper-sheet voucher-1up"
      style={{
        fontSize: '13.5px',
        lineHeight: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '15px',
            fontWeight: 700,
          }}
        >
          <span>
            Vr.No :-{' '}
            <span className="fi" style={{ minWidth: '90px' }}>
              {d2.slice(3, 5)}/{year}/{D.vr[1]}
            </span>
          </span>
          <span>
            Date :-{' '}
            <span className="fi" style={{ minWidth: '100px' }}>
              {d2}
            </span>
          </span>
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: '26px',
            fontWeight: 800,
            borderBottom: '3px solid #000',
            paddingBottom: '6px',
            margin: '6px 0 10px',
          }}
        >
          ପୋଷଣ ଯୁକ୍ତ ମାଣ୍ଡିଆ ଲଡୁ ପ୍ରସ୍ତୁତ କରିବା ରସିଦ
        </div>

        <div className="v-body" style={{ fontSize: '17px', lineHeight: 2.4 }}>
          ଲିଖିତଂ ରସିଦ ଏହିକି ଆମ୍ଭେ ଶ୍ରୀମତୀ{' '}
          <span className="fi" style={{ minWidth: '300px' }}>
            {D.cooks}
          </span>
          , ପୋଷ୍ଟ:-{' '}
          <span
            className="fi"
            data-ph="post office"
            style={{ minWidth: '130px' }}
          >
            {D.post}
          </span>
          , ଜିଲ୍ଲା:-{' '}
          <span className="fi" style={{ minWidth: '100px' }}>
            {I.dist}
          </span>{' '}
          ଲେଖି ଦେବା ରସିଦ ଏହିକି{' '}
          <span className="fi" style={{ minWidth: '190px' }}>
            {I.school}
          </span>{' '}
          ବିଦ୍ୟାଳୟ {secondary ? '(ନବମ ଓ ଦଶମ ଶ୍ରେଣୀ) ' : ''}ପାଇଁ{' '}
          <span className="fi" style={{ minWidth: '120px' }}>
            {mon}
          </span>{' '}
          ମାସ ର ମଧ୍ୟାହ୍ନ ଭୋଜନ ନିମନ୍ତେ ପୋଷଣଯୁକ୍ତ ଲଡୁ ପ୍ରସ୍ତୁତ କରି{' '}
          <span className="fi" style={{ minWidth: '60px' }}>
            {mt}
          </span>{' '}
          ଜଣ ପିଲାଙ୍କ ପାଇଁ{' '}
          <span className="fi" style={{ minWidth: '60px' }}>
            {L}
          </span>{' '}
          ଟି ଲଡୁ ପ୍ରସ୍ତୁତ କରି ଆମ୍ଭର ମଜୁରୀ ବାବଦକୁ ଲଡୁ ପିଛା{' '}
          <span className="fi" style={{ minWidth: '40px' }}>
            {od(Math.round(state.prep * 100))}
          </span>{' '}
          ପଇସା ହିସାବରେ ମୋଟ{' '}
          <span className="fi" style={{ minWidth: '90px' }}>
            {f2(B)}
          </span>{' '}
          ଟଙ୍କା ଅକ୍ଷରେ({' '}
          <span className="fi" style={{ minWidth: '260px' }}>
            {words(B)}
          </span>{' '}
          ) ବୁଝିନେଇ ଏହି ରସିଦ ଲେଖିଦେଲି ଦରକାର ବେଳେ କର୍ମରେ ଆସିବ ।
        </div>
      </div>

      <div style={{ borderTop: '2px solid #000', paddingTop: '8px' }}>
        <ReceiptFoot a={B} d2={d2} sig="ପ୍ରସ୍ତୁତକାରୀଣୀଙ୍କ ସ୍ୱାକ୍ଷର" />
      </div>
    </div>
  );
};
