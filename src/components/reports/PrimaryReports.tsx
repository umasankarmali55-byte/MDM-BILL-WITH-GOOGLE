import React from 'react';
import { MDMState } from '../../types/mdm';
import { DN, MNAMES } from '../../data/defaultState';
import {
  calcAbsTiers,
  calcPrimary,
  calcSecondary,
  dayCells,
  dayTot,
  f2,
  f3,
  getWeekday,
  ladCost,
  num,
  od,
  parseMonthKey,
  pm2,
  proportionalSplit,
  r2,
  words,
} from '../../utils/calculations';

interface SheetProps {
  state: MDMState;
  onUpdateState?: (updater: (prev: MDMState) => MDMState) => void;
}

/* ---------------- Tab 2: Form-15 (Odia Primary) ---------------- */
export const Form15PrimarySheet: React.FC<SheetProps> = ({ state }) => {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const mm = String(month + 1).padStart(2, '0');
  const monName = MNAMES[month];
  const dStart = `01-${mm}-${year}`;
  const dEnd = `${String(daysInMonth).padStart(2, '0')}-${mm}-${year}`;

  const R = calcPrimary(state);
  const ro = state.rolls;
  const rp = ro.slice(1, 6).reduce((a, b) => a + b, 0);
  const ru = ro.slice(6).reduce((a, b) => a + b, 0);
  const sum = Array(12).fill(0);

  const lay = (c: number[]) => [
    c[0],
    c[0],
    c[1],
    c[2],
    c[3],
    c[4],
    c[5],
    c[6],
    c[7],
    c[8],
    c[9],
    c[10],
    c[11],
  ];
  const cl = (i: number) => (i === 1 || i === 7 || i === 12 ? 'r' : '');
  const gy = (i: number) => (i === 11 || i === 12 ? 'g' : '');

  for (let d = 1; d <= daysInMonth; d++) {
    const c = dayCells(state, d);
    c.forEach((v, i) => (sum[i] += v));
  }

  const con = state.N.cond[0] * R.np + state.N.cond[1] * R.nu;
  const sg = [
    'ଏସ. ହେଚ. ଜି/ ଏସ ଏମ ସି ସଭ୍ୟ ସ୍ୱାକ୍ଷର ଓ ମୋହର',
    'ଏସ. ହେଚ. ଜି/ ଏସ ଏମ ସି ସଭ୍ୟ/ ସଭ୍ୟା ସ୍ୱାକ୍ଷର',
  ];

  const items: [number, string, string, number | ''][] = [
    [1, 'ଡାଲି', `${f3(R.dal)} kg`, R.dalA],
    [2, 'ସୋୟାବିନ ବଡି', `${f3(R.soya)} kg`, R.soyaA],
    [3, 'ତେଲ', `${f3(R.oil)} kg`, R.oilA],
    [4, 'ମସଲା, ଲୁଣ', '', con || ''],
    [5, 'ଜାଳେଣୀ', f2(R.fuel), R.fuel],
    [6, 'ଅଣ୍ଡା', String(R.eggs), R.eggs * state.N.egg[2]],
    [7, 'ପନିପରିବା', `${f3(R.veg)} kg`, R.vegAmt],
    [8, 'ଉଦ୍ଧାରକ', '', ''],
  ];

  return (
    <div className="paper-sheet f15-sheet">
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>
        ଫର୍ମ ନଂ -୧୫ (ପ୍ରାଥମିକ)
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(min-content, 1.55fr) minmax(0, 1fr)',
          gap: '10px',
          alignItems: 'start',
          marginTop: '4px',
        }}
      >
        <table className="f15-att" style={{ border: '2px solid #000' }}>
          <thead>
            <tr>
              <th colSpan={14} style={{ fontSize: '15px', height: '30px' }}>
                ଦୈନିକ ଉପସ୍ଥାନ ସବିଶେଷ ବିବରଣୀ (ଛାତ୍ରଛାତ୍ରୀ ସଂଖ୍ୟା)
              </th>
            </tr>
            <tr style={{ fontSize: '11px' }}>
              {[
                'ଶ୍ରେଣୀ',
                'ଶିଶୁବାଟିକା',
                'ମୋଟ',
                '୧ମ',
                '୨ୟ',
                '୩ୟ',
                '୪ର୍ଥ',
                '୫ମ',
                'ମୋଟ',
                '୬ଷ୍ଠ',
                '୭ମ',
                '୮ମ',
                'ମୋଟ',
                'ସର୍ବ ମୋଟ',
              ].map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
            <tr style={{ backgroundColor: '#000', color: '#fff' }}>
              <td style={{ backgroundColor: '#000', color: '#fff' }}>ନାମ</td>
              {lay([
                ro[0],
                ...ro.slice(1, 6),
                rp,
                ...ro.slice(6),
                ru,
                rp + ru + ro[0],
              ]).map((v, i) => (
                <td
                  key={i}
                  style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                >
                  {v}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, idx) => {
              const d = idx + 1;
              const c = dayCells(state, d);
              const isSun = getWeekday(year, month, d) === 0;
              const isHol = !!state.hol[d];
              const holName = state.holn[d];

              if (isHol && holName) {
                return (
                  <tr key={d} className={isSun ? 'z' : ''}>
                    <td style={isSun ? { color: '#fff' } : undefined}>
                      {od(d)}
                    </td>
                    <td
                      colSpan={13}
                      style={{
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '11px',
                        padding: '1px 4px',
                        backgroundColor: isSun ? '#000' : '#fdeaea',
                        color: isSun ? '#fff' : '#8a1020',
                      }}
                    >
                      ଛୁଟି · {holName}
                    </td>
                  </tr>
                );
              }

              if (isSun && !c[11]) {
                return (
                  <tr key={d} className="z">
                    <td style={{ color: '#fff' }}>{od(d)}</td>
                    <td />
                    <td className="r">{c[0]}</td>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td className="r">{c[6]}</td>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td className="r">{c[11]}</td>
                  </tr>
                );
              }

              return (
                <tr key={d}>
                  <td>{od(d)}</td>
                  {lay(c).map((v, i) => (
                    <td key={i} className={`${cl(i)} ${gy(i)}`.trim()}>
                      {v}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <td>ମୋଟ</td>
              {lay(sum).map((v, i) => (
                <td key={i} className={`${cl(i)} ${gy(i)}`.trim()}>
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div>
          <div
            style={{
              border: '2px solid #000',
              padding: '6px',
              fontSize: '13px',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            ଚଳିତ ମାସରେ ନିମ୍ନ ଖାଦ୍ୟ ସାମଗ୍ରୀ କ୍ରୟ କମିଟି ଅନୁମତି କ୍ରମେ କିଣାଯାଇ-
            {dStart}-ଠାରୁ-{dEnd}-ପର୍ଯ୍ୟନ୍ତ ଖର୍ଚ୍ଚ କରାଗଲା ।
          </div>

          <table className="f15-items" style={{ border: '2px solid #000', marginTop: '6px' }}>
            <thead>
              <tr style={{ fontSize: '11px' }}>
                <th style={{ width: '9%' }}>କ୍ରମ ନଂ</th>
                <th>ଖାଦ୍ୟ ସାମଗ୍ରୀ</th>
                <th style={{ width: '30%' }}>
                  ମାସ ମଧ୍ୟରେ କ୍ରୟ କରାଯାଇଥିବା ସାମଗ୍ରୀର ପରିମାଣ/ ମୂଲ୍ୟ
                </th>
                <th style={{ width: '26%' }}>ଖାଦ୍ୟ ସାମଗ୍ରୀର ମୂଲ୍ୟ</th>
              </tr>
            </thead>
            <tbody>
              {items.map(([i, n, q, a]) => (
                <tr key={i}>
                  <td>{od(i)}</td>
                  <td className="l">{n}</td>
                  <td>{q}</td>
                  <td>{a === '' ? '' : f2(a)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>
                  ମୋଟ
                </td>
                <td>{f2(R.total)}</td>
              </tr>
              <tr>
                <td colSpan={4}>&nbsp;</td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              border: '2px solid #000',
              marginTop: '24px',
              padding: '8px',
            }}
          >
            <div className="ec" style={{ textAlign: 'center', fontWeight: 700 }}>
              ଟଙ୍କା-{f2(R.total)}
            </div>
            <div
              className="ec"
              style={{
                fontSize: '14px',
                fontWeight: 700,
                lineHeight: 1.5,
                textDecoration: 'underline',
              }}
            >
              ଅଙ୍କରେ-{words(R.total)}
            </div>
            <div
              className="ec"
              style={{
                borderTop: '1px solid #000',
                marginTop: '6px',
                paddingTop: '6px',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              ଉପରୋକ୍ତ ଖାଦ୍ୟ ସାମଗ୍ରୀ ନଗଦ/ଧାର ସ୍ତରରେ କିଣାଯାଇ ମଧ୍ୟାହ୍ନ ଭୋଜନ
              କାର୍ଯ୍ୟକ୍ରମରେ ଚଳିତ ମାସ-{monName}-ତାରିଖ-{dStart}-ଠାରୁ-{dEnd}-ମଧ୍ୟରେ
              ଖର୍ଚ୍ଚ କରାଯାଇଥିଲା ।
            </div>
          </div>

          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              lineHeight: 1.5,
              margin: '18px 0 0 16px',
              textAlign: 'left',
            }}
          >
            ୧) ମୋଟ ଉପସ୍ଥାନ:-<span className="ec">{R.meals}</span>
            <br />
            ୨) ଭୋଜନ ଦିବସ:-<span className="ec">{R.days}</span>
          </div>

          <div
            style={{ fontSize: '11px', marginTop: '10px', textAlign: 'left' }}
          >
            ୩) ଗ୍ରାମ ଶିକ୍ଷା କମିଟି ସଭାପତି ଙ୍କ ନାମ, ସାକ୍ଷର ସହ ମୋହର:-{' '}
            <span className="fi" style={{ minWidth: '100px' }} />
            <br />
            ୪) ଦାଖଲ ତାରିଖ:-{' '}
            <span
              className="ec"
              style={{ border: '1px solid #000', padding: '2px 8px' }}
            >
              {dEnd}
            </span>
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontWeight: 700, margin: '14px 0 0' }}>
        ଏହା ଦ୍ୱାରା ପ୍ରମାଣ କରୁଛି ଉପର ଲିଖିତ ସମସ୍ତ ତଥ୍ୟ ସତ୍ୟ ଅଟେ ଓ ଆମ ବିଦ୍ୟାଳୟ
        ଭୋଜନ ନିୟମିତ ସୁଚାରୁ ରୂପେ ପରିଚାଳିତ କରାଯାଇଛି ।
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '32px',
          fontSize: '11px',
          fontWeight: 700,
          gap: '10px',
        }}
      >
        <span>{sg[0]}</span>
        <span>{sg[1]}</span>
        <span style={{ alignSelf: 'flex-end' }}>
          ପ୍ରଧାନ ଶିକ୍ଷକଙ୍କ ସ୍ୱାକ୍ଷର ଓ ମୋହର
        </span>
      </div>
    </div>
  );
};

/* ---------------- Tab 3: 1. PM POSHAN Report ---------------- */
export const PMPoshanReportSheet: React.FC<SheetProps> = ({ state }) => {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const mm = String(month + 1).padStart(2, '0');
  const monLabel = `${MNAMES[month].toUpperCase()}-${year}`;

  const R = calcPrimary(state);
  const I = state.info;
  const D = state.demo;
  const pad = (n: number) => String(n).padStart(2, '0');

  const m = [0, 0, 0];
  for (let d = 1; d <= daysInMonth; d++) {
    const t = dayTot(state, d);
    m[0] += t[0];
    m[1] += t[1];
    m[2] += t[2];
  }

  const open = state.open[0] + state.open[1];
  const recv = state.recv[0] + state.recv[1];
  const bal = open + recv - R.rice;
  const con = state.N.cond[0] * R.np + state.N.cond[1] * R.nu;

  const lv = ['ଶିଶୁବାଟିକା', 'ପ୍ରାଥମିକ', 'ଉଚ୍ଚ ପ୍ରାଥମିକ'];
  const renderCells = (v: number[]) => {
    const b = v[0] + v[2] + v[4];
    const g = v[1] + v[3] + v[5];
    return (
      <>
        {v.map((x, idx) => (
          <td key={idx}>{x}</td>
        ))}
        <td>{b}</td>
        <td>{g}</td>
        <td>{b + g}</td>
      </>
    );
  };

  const ed: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const wd = getWeekday(year, month, d);
    if ((state.menu[wd] || {}).e && (wd || dayTot(state, d)[3])) {
      ed.push(d);
    }
  }
  const nRows = Math.max(7, Math.ceil(ed.length / 2));

  const fl = (a: string, b: string) => (
    <div className="fl">
      <span>{a}</span>
      <b>{b}</b>
    </div>
  );

  return (
    <div className="paper-sheet report-sheet" style={{ fontSize: '12px' }}>
      <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {state.emblem ? (
          <img
            src={state.emblem}
            alt="Government Emblem"
            referrerPolicy="no-referrer"
            style={{ width: '76px', height: '76px', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ width: '76px' }} />
        )}
        <h3 style={{ fontSize: '19px', textAlign: 'center', margin: 0, flex: 1 }}>
          ପ୍ରାଥମିକ ମଧ୍ୟାହ୍ନ ଭୋଜନ କାର୍ଯ୍ୟକ୍ରମ ମାସିକ ବିବରଣୀ
        </h3>
        <span style={{ width: '76px' }} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 140px',
          gap: '10px',
          alignItems: 'start',
          marginTop: '6px',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
            ୧) ସାଧାରଣ ବିବରଣୀ:-
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0 14px',
            }}
          >
            {fl('ବିଦ୍ୟାଳୟର ନାମ:-', I.school)}
            {fl('ମାସର ନାମ:-', monLabel)}
            {fl('ଗ୍ରାମ ପଞ୍ଚାୟତ ନାମ:-', I.village)}
            {fl('ବ୍ଲକ ନାମ:-', I.block)}
            {fl('ଜିଲ୍ଲାର ନାମ:-', I.dist)}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0 14px',
            }}
          >
            {fl('ମଧ୍ୟାହ୍ନ ଭୋଜନ ସଂଯୁକ୍ତ ଖାତା ନମ୍ବର:-', I.acc)}
            {fl('ବ୍ୟାଙ୍କ ନାମ:-', I.bank)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {state.logo && (
            <img
              src={state.logo}
              alt="PM POSHAN Logo"
              referrerPolicy="no-referrer"
              style={{ width: '108px', height: '88px', objectFit: 'contain' }}
            />
          )}
        </div>
      </div>
      </div>

      <div>
      <h4 style={{ margin: '10px 0 3px', fontSize: '14px' }}>
        ୨) ଛାତ୍ରଛାତ୍ରୀଙ୍କ ବିବରଣୀ
      </h4>
      <table className="stu-table">
        <colgroup>
          <col style={{ width: '11%' }} />
          {Array.from({ length: 8 }, (_, idx) => (
            <col key={`c1-${idx}`} style={{ width: '4.75%' }} />
          ))}
          <col style={{ width: '6.5%' }} />
          {Array.from({ length: 8 }, (_, idx) => (
            <col key={`c2-${idx}`} style={{ width: '4.75%' }} />
          ))}
          <col style={{ width: '6.5%' }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={3}>ସ୍ତର</th>
            <th colSpan={9}>ବିଦ୍ୟାଳୟରେ ମୋଟ ଛାତ୍ରଛାତ୍ରୀଙ୍କ ସଂଖ୍ୟା</th>
            <th colSpan={9}>ମୋଟ ହିତାଧିକାରୀଙ୍କ ସଂଖ୍ୟା</th>
          </tr>
          <tr>
            {[0, 1].map((g) => (
              <React.Fragment key={g}>
                <th colSpan={2}>ଆଦିବାସୀ</th>
                <th colSpan={2}>ହରିଜନ</th>
                <th colSpan={2}>ଅନ୍ୟାନ୍ୟ</th>
                <th colSpan={2}>ମୋଟ</th>
                <th rowSpan={2}>ସର୍ବ ମୋଟ</th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            {Array.from({ length: 16 }, (_, idx) => (
              <th key={idx}>{idx % 2 === 0 ? 'ବାଳକ' : 'ବାଳିକା'}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {D.map((r, i) => {
            const x = proportionalSplit(r, m[i]);
            return (
              <tr key={i}>
                <td className="l" style={{ fontSize: '11px' }}>
                  {lv[i]}
                </td>
                {renderCells(r)}
                {renderCells(x)}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      <div>
      <table style={{ marginTop: '4px' }}>
        <tbody>
          <tr>
            <td className="l">୩) ମାସିକ କାର୍ଯ୍ୟ ଦିବସ:-</td>
            <td style={{ border: '1.5px solid #000' }}>{R.days}</td>
            <td>ଖାଦ୍ୟ ଖୁଆଯାଇଥିବା ଦିବସ</td>
            <td>{R.days}</td>
            <td>ମୋଟ ଉପସ୍ଥାନ</td>
            <td>{R.meals}</td>
            <td>ମୋଟ ହିତାଧିକାରୀଙ୍କ ସଂଖ୍ୟା</td>
            <td>{R.meals}</td>
          </tr>
        </tbody>
      </table>
      </div>

      <div>
      <h4 style={{ margin: '10px 0 3px', fontSize: '14px' }}>
        ୪) ଖାଦ୍ୟ ଶସ୍ୟ ଓ ଅନ୍ୟାନ୍ୟ ବିବରଣୀ
      </h4>
      <table>
        <thead>
          <tr>
            <th colSpan={2}>ଚାଉଳ</th>
            <th />
            <th>ଡାଲି</th>
            <th>ସୋୟା</th>
            <th>ଅଣ୍ଡା</th>
            <th>ତେଲ</th>
            <th>ପନିପରିବା</th>
            <th>ଲୁଣ ମସଲା</th>
            <th>ଜାଳେଣୀ</th>
            <th>ମୋଟ ମୂଲ୍ୟ ଖର୍ଚ୍ଚ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="l">ପୂର୍ବ ଜମା</td>
            <td>{f3(open)}</td>
            <td className="l">ପୂର୍ବ ଜମା</td>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td className="l">ଚଳିତ ମାସର ପ୍ରାପ୍ତ</td>
            <td>{f3(recv)}</td>
            <td className="l">ଚଳିତ ମାସ କ୍ରୟ</td>
            {[f3(R.dal), f3(R.soya), R.eggs, f3(R.oil), f3(R.veg)].map(
              (t, i) => (
                <td key={i} style={{ color: '#c0007a' }}>
                  {t}
                </td>
              )
            )}
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td className="l">ମୋଟ</td>
            <td>{f3(open + recv)}</td>
            <td className="l">ମୋଟ</td>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
          </tr>
          <tr className="tall-amt-row" style={{ height: '56px' }}>
            <td className="l">ଖର୍ଚ୍ଚ</td>
            <td style={{ fontSize: '14px' }}>{f3(R.rice)}</td>
            <td className="l">ଖର୍ଚ୍ଚ</td>
            {[
              R.dalA,
              R.soyaA,
              R.eggA,
              R.oilA,
              R.vegAmt,
              con,
              R.fuel,
            ].map((val, i) => (
              <td key={i} style={{ color: '#c0007a' }}>
                {val ? f2(val) : ''}
              </td>
            ))}
            <td style={{ fontSize: '18px', border: '2px solid #000' }}>
              {f2(R.total)}
            </td>
          </tr>
          <tr>
            <td className="l">ବଳକା</td>
            <td>{f3(bal)}</td>
            <td className="l">ବଳକା</td>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
          </tr>
        </tbody>
      </table>
      </div>

      <div>
      <h4 style={{ margin: '6px 0 2px', fontSize: '13px' }}>
        ୫) ଆବଶ୍ୟକ ଚାଉଳ:-{' '}
        <span style={{ borderBottom: '1px solid #000', padding: '0 6px' }}>
          {bal < 0 ? `${f3(-bal)} kg` : 'NIL'}
        </span>
      </h4>
      </div>

      <div>
      <h4 style={{ margin: '10px 0 3px', fontSize: '14px' }}>
        ୬) ଚଳିତ ମାସରେ ହିତାଧିକାରୀଙ୍କୁ ଦିଆଯାଇଥିବା ଅଣ୍ଡାର ବିବରଣୀ:-
      </h4>
      <table>
        <thead>
          <tr>
            <th>କ୍ର. ନଂର</th>
            <th>ତାରିଖ</th>
            <th>ବାରର ନାମ</th>
            <th>ପରିମାଣ</th>
            <th>କ୍ର. ନଂର</th>
            <th>ତାରିଖ</th>
            <th>ବାରର ନାମ</th>
            <th>ପରିମାଣ</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: nRows }, (_, i) => {
            const dA = ed[i];
            const dB = ed[i + nRows];
            return (
              <tr key={i}>
                <td>{od(i + 1)}</td>
                <td>{dA ? `${pad(dA)}-${mm}-${year}` : ''}</td>
                <td>{dA ? DN[getWeekday(year, month, dA)] : ''}</td>
                <td>{dA ? dayTot(state, dA)[3] : ''}</td>
                <td>{od(i + 1 + nRows)}</td>
                <td>{dB ? `${pad(dB)}-${mm}-${year}` : ''}</td>
                <td>{dB ? DN[getWeekday(year, month, dB)] : ''}</td>
                <td>{dB ? dayTot(state, dB)[3] : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ textAlign: 'center', margin: '3px 0 0', fontWeight: 700 }}>
        PS AND UPS TOTAL EGG:- {R.eggs}
      </p>
      </div>

      <div>
      <h4 style={{ margin: '8px 0 3px', fontSize: '14px' }}>
        ୭) ପଦାଧିକାରୀଙ୍କ ଦ୍ୱାରା ପରିଦର୍ଶନ:-
      </h4>
      <table>
        <thead>
          <tr>
            <th>କ୍ର. ନଂର</th>
            <th>ପଦାଧିକାରୀଙ୍କ ନାମ</th>
            <th>ପଦବୀ</th>
            <th>କେତେ ଥର</th>
            <th>ତାରିଖ</th>
            <th>ମନ୍ତବ୍ୟ</th>
          </tr>
        </thead>
        <tbody>
          {state.insps.map((r, i) => (
            <tr key={i}>
              <td>{od(i + 1)}</td>
              {r.map((c, ci) => (
                <td key={ci}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div>
      <h4 style={{ margin: '8px 0 3px', fontSize: '14px' }}>
        ୮) ରୋଷେୟା/ ପାଚିକାଙ୍କ ବିବରଣୀ:-
      </h4>
      <table>
        <thead>
          <tr>
            <th style={{ width: '7%' }}>କ୍ର. ନଂର</th>
            <th>ରୋଷେୟାଙ୍କ ନାମ</th>
            <th>ସଞ୍ଚୟ ଖାତା ନମ୍ବର</th>
            <th>ବ୍ୟାଙ୍କ ନାମ</th>
          </tr>
        </thead>
        <tbody>
          {state.cooks.map((c, i) => (
            <tr key={i}>
              <td>{od(i + 1)}</td>
              {c.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

/* ---------------- Tab 5 & Tab 14: Laddoo Report (Primary & Secondary) ---------------- */
export const LaddooReportSheet: React.FC<{
  state: MDMState;
  secondary?: boolean;
}> = ({ state, secondary = false }) => {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const monLabel = `${MNAMES[month].toUpperCase()}-${year}`;
  const I = state.info;
  const lCost = ladCost(state);
  const pr = state.prep;
  const ic = lCost - pr;

  let D: number[][];
  let lv: string[];
  let m: number[];
  let nd = 0;
  let days: number;
  let cnt: number;
  let cooks: string[][];
  let cls: string;

  if (!secondary) {
    D = state.demo;
    lv = ['ଶିଶୁବାଟିକା', 'ପ୍ରାଥମିକ', 'ଉଚ୍ଚ ପ୍ରାଥମିକ'];
    m = [0, 0, 0];
    days = calcPrimary(state).days;
    for (let d = 1; d <= daysInMonth; d++) {
      const t = dayTot(state, d);
      if ((state.menu[getWeekday(year, month, d)] || {}).l && t[3]) {
        nd++;
        m[0] += t[0];
        m[1] += t[1];
        m[2] += t[2];
      }
    }
    cnt = (m[0] + m[1]) * state.N.lad[0] + m[2] * state.N.lad[1];
    cooks = state.cooks;
    cls = ' ( ଶିଶୁବାଟିକା ଠାରୁ ଅଷ୍ଟମ)';
  } else {
    D = state.demo2;
    lv = ['ନବମ', 'ଦଶମ'];
    m = [0, 0];
    days = calcSecondary(state).days;
    for (let d = 1; d <= daysInMonth; d++) {
      if (state.hol[d] || !(state.menu[getWeekday(year, month, d)] || {}).l) {
        continue;
      }
      const a = state.att[d] || [];
      const c9 = num(a[9]);
      const c10 = num(a[10]);
      if (c9 + c10) {
        nd++;
        m[0] += c9;
        m[1] += c10;
      }
    }
    cnt = (m[0] + m[1]) * state.N2.lad;
    cooks = state.cooks2;
    cls = ' ( ନବମ ଓ ଦଶମ ଶ୍ରେଣୀ)';
  }

  const mt = m.reduce((a, b) => a + b, 0);
  const A = r2(cnt * ic);
  const B = r2(cnt * pr);
  const T = r2(A + B);
  const en = D.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0);

  const rw = (v: number[]) => [
    ...v,
    v[0] + v[2] + v[4],
    v[1] + v[3] + v[5],
    v.reduce((a, b) => a + b, 0),
  ];
  const Lr = D.map(rw);
  const Xr = D.map((r, i) => rw(proportionalSplit(r, m[i])));
  const sc = (Z: number[][]) =>
    Z[0].map((_, j) => Z.reduce((a, r) => a + r[j], 0));

  const fl = (a: string, b: string) => (
    <div className="fl">
      <span>{a}</span>
      <b>{b}</b>
    </div>
  );

  const hd = [
    'ସାମଗ୍ରୀ ଆବେଦନ କରିବା ତାରିଖ',
    'ରସିଦ ନମ୍ବର',
    'ବିଦ୍ୟାଳୟରେ ମୋଟ ଛାତ୍ରଛାତ୍ରୀ ସଂଖ୍ୟା' + cls,
    'ମାସ ମଧ୍ୟରେ ଛାତ୍ରଛାତ୍ରୀ ଉପସ୍ଥିତ ଥିବା ସଂଖ୍ୟା' + cls,
    'ମାସ ମଧ୍ୟରେ ହିତାଧିକାରୀଙ୍କ ସଂଖ୍ୟା' + cls,
    `ମାସ ମଧ୍ୟରେ ଲଡୁ ସାମଗ୍ରୀ କ୍ରୟ କରାଯାଇଥିବା ସମୁଦାୟ ପରିମାଣର ମୂଲ୍ୟ (@${od(f2(ic))})`,
    'ଲଡୁ ପ୍ରସ୍ତୁତ କରିବାରେ ନିଯୋଜିତ ଥିବା ରୋଷେୟା ସଂଖ୍ୟା (ମାସ ମଧ୍ୟରେ)',
    `ମାସ ମଧ୍ୟରେ ଲଡୁ ପ୍ରସ୍ତୁତ କରିବା ନିମନ୍ତେ ରୋଷେୟାଙ୍କୁ ପ୍ରଧାନ କରାଯାଇଥିବା ମୂଲ୍ୟ (@${od(f2(pr))})`,
    'ମୋଟ ମୂଲ୍ୟ (୬+୮)',
  ];
  const vals = ['', '', en, mt, mt, f2(A), cooks.length, f2(B), f2(T)];

  return (
    <div
      className="paper-sheet laddoo-sheet"
      style={{
        fontSize: '13px',
        lineHeight: 1.35,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #000',
          paddingBottom: '8px',
        }}
      >
        {state.emblem ? (
          <img
            src={state.emblem}
            alt="Emblem"
            referrerPolicy="no-referrer"
            style={{ width: '74px', height: '74px', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ width: '74px' }} />
        )}
        <h3 style={{ fontSize: '22px', textAlign: 'center', margin: 0, flex: 1 }}>
          ପୋଷଣ ଲଡୁ କାର୍ଯ୍ୟକ୍ରମ ମାସିକ ବିବରଣୀ
          {secondary && (
            <>
              <br />
              <span style={{ fontSize: '15px' }}>
                (ମାଧ୍ୟମିକ - ନବମ ଓ ଦଶମ ଶ୍ରେଣୀ)
              </span>
            </>
          )}
        </h3>
        {state.logo ? (
          <img
            src={state.logo}
            alt="PM POSHAN Logo"
            referrerPolicy="no-referrer"
            style={{ width: '92px', height: '74px', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ width: '92px' }} />
        )}
      </div>

      <div>
      <h4 style={{ fontSize: '15px', margin: '8px 0 4px' }}>
        ୧) ସାଧାରଣ ବିବରଣୀ-
      </h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0 22px',
        }}
      >
        {fl('ବିଦ୍ୟାଳୟର ନାମ-', I.school)}
        {fl('ମାସର ନାମ-', monLabel)}
        {fl('ବ୍ଲକର ନାମ-', I.block)}
        {fl('ଗ୍ରାମ ପଞ୍ଚାୟତ-', I.village)}
        {fl('କ୍ଲଷ୍ଟର ର ନାମ-', I.cluster || 'MOHULI')}
        {fl('ଜିଲ୍ଲା ର ନାମ-', I.dist)}
      </div>
      </div>

      <div>
      <h4 style={{ fontSize: '15px', margin: '8px 0 4px' }}>
        ୨) ଛାତ୍ରଛାତ୍ରୀଙ୍କ ବିବରଣୀ-
      </h4>
      <table className="stu-table">
        <colgroup>
          <col style={{ width: '11%' }} />
          {Array.from({ length: 8 }, (_, idx) => (
            <col key={`l1-${idx}`} style={{ width: '4.75%' }} />
          ))}
          <col style={{ width: '6.5%' }} />
          {Array.from({ length: 8 }, (_, idx) => (
            <col key={`l2-${idx}`} style={{ width: '4.75%' }} />
          ))}
          <col style={{ width: '6.5%' }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={3} style={{ width: '11%' }}>
              ସ୍ତର
            </th>
            <th colSpan={9}>ବିଦ୍ୟାଳୟରେ ମୋଟ ଛାତ୍ରଛାତ୍ରୀ ସଂଖ୍ୟା</th>
            <th colSpan={9}>ମୋଟ ହିତାଧିକାରୀଙ୍କ ସଂଖ୍ୟା</th>
          </tr>
          <tr>
            {[0, 1].map((g) => (
              <React.Fragment key={g}>
                <th colSpan={2}>ଆଦିବାସୀ</th>
                <th colSpan={2}>ହରିଜନ</th>
                <th colSpan={2}>ଅନ୍ୟାନ୍ୟ</th>
                <th colSpan={2}>ମୋଟ</th>
                <th rowSpan={2}>
                  ସର୍ବ
                  <br />
                  ମୋଟ
                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            {Array.from({ length: 16 }, (_, idx) => (
              <th key={idx}>{idx % 2 === 0 ? 'B' : 'G'}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {D.map((_, i) => (
            <tr key={i}>
              <td className="l" style={{ paddingLeft: '6px' }}>
                {lv[i]}
              </td>
              {Lr[i].map((c, ci) => (
                <td key={`l-${ci}`}>{c}</td>
              ))}
              {Xr[i].map((c, ci) => (
                <td key={`x-${ci}`}>{c}</td>
              ))}
            </tr>
          ))}
          {secondary && (
            <tr>
              <td className="l" style={{ paddingLeft: '6px' }}>
                ମୋଟ
              </td>
              {sc(Lr).map((c, ci) => (
                <td key={`sl-${ci}`}>{c}</td>
              ))}
              {sc(Xr).map((c, ci) => (
                <td key={`sx-${ci}`}>{c}</td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
      </div>

      <table style={{ marginTop: '6px' }}>
        <tbody>
          <tr>
            <td className="l" style={{ border: 0 }}>
              ୩) ମାସିକ କାର୍ଯ୍ୟ ଦିବସ:-
            </td>
            <td style={{ border: '2px solid #000', fontSize: '16px' }}>
              {days}
            </td>
            <td style={{ border: 0 }}>ଲଡୁ ଖୁଆଯାଇଥିବା ଦିବସ</td>
            <td style={{ border: '2px solid #000', fontSize: '16px' }}>{nd}</td>
            <td style={{ border: 0 }}>ମୋଟ ଉପସ୍ଥାନ</td>
            <td style={{ border: '2px solid #000', fontSize: '16px' }}>{mt}</td>
            <td style={{ border: 0 }}>ମୋଟ ହିତାଧିକାରୀଙ୍କ ସଂଖ୍ୟା</td>
            <td style={{ border: '2px solid #000', fontSize: '16px' }}>{mt}</td>
          </tr>
        </tbody>
      </table>

      <div>
      <h4 style={{ fontSize: '15px', margin: '8px 0 4px' }}>
        ୪) ପୋଷଣ ଲଡୁ ପ୍ରସ୍ତୁତ ଓ ବଣ୍ଟନ ବିବରଣୀ -
      </h4>
      <table style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ fontSize: '11px', lineHeight: 1.3 }}>
            {hd.map((h, i) => (
              <th key={i} style={{ padding: '6px 3px' }}>
                {h}
              </th>
            ))}
          </tr>
          <tr style={{ fontSize: '10px' }}>
            {hd.map((_, i) => (
              <td key={i} style={{ padding: '2px' }}>
                {od(i + 1)}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="tall-amt-row">
            {vals.map((v, i) => (
              <td key={i} style={{ fontSize: '18px', height: '68px' }}>
                {v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      </div>

      <div style={{ width: '62%', marginTop: '14px' }}>
        <table className="laddoo-exp-tbl">
          <thead>
            <tr>
              <th colSpan={2} style={{ fontSize: '15px' }}>
                ଖର୍ଚ୍ଚର ବିବରଣୀ
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="l" style={{ width: '46%' }}>
                ପୂର୍ବ ଜମା
              </td>
              <td>Rs-0.00</td>
            </tr>
            <tr>
              <td className="l">ଚଳିତ ମାସର ପ୍ରାପ୍ତି</td>
              <td>Rs-0.00</td>
            </tr>
            <tr>
              <td className="l">ମୋଟ</td>
              <td>Rs-0.00</td>
            </tr>
            <tr>
              <td className="l">ଖର୍ଚ୍ଚ</td>
              <td>Rs-{f2(T)}</td>
            </tr>
            <tr>
              <td className="l">ବଳକା</td>
              <td style={{ border: '2.5px solid #0a7a3d' }}>NIL</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: '42px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '70px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            flex: 1,
            borderTop: '2.5px solid #000',
            paddingTop: '6px',
            fontSize: '14px',
          }}
        >
          ପ୍ରଧାନ ଶିକ୍ଷକଙ୍କ ସ୍ୱାକ୍ଷର ଓ ମୋହର
        </div>
        <div
          style={{
            flex: 1,
            borderTop: '2.5px solid #000',
            paddingTop: '6px',
            fontSize: '14px',
          }}
        >
          ଏସ.ଏମ.ସି ସଭାପତିଙ୍କ ସ୍ୱାକ୍ଷର ଓ ମୋହର
        </div>
      </div>
    </div>
  );
};

/* ---------------- Tab 6: Laddoo Form-15 (Primary) ---------------- */
export const LaddooForm15PrimarySheet: React.FC<SheetProps> = ({ state }) => {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const mm = String(month + 1).padStart(2, '0');
  const monName = MNAMES[month];
  const dStart = `01-${mm}-${year}`;
  const dEnd = `${String(daysInMonth).padStart(2, '0')}-${mm}-${year}`;

  const ro = state.rolls;
  const rp = ro.slice(1, 6).reduce((a, b) => a + b, 0);
  const ru = ro.slice(6).reduce((a, b) => a + b, 0);
  const sum = Array(12).fill(0);

  const lay = (c: number[]) => [
    c[0],
    c[0],
    c[1],
    c[2],
    c[3],
    c[4],
    c[5],
    c[6],
    c[7],
    c[8],
    c[9],
    c[10],
    c[11],
  ];
  const gy = (i: number) => i === 1 || i === 7 || i === 11 || i === 12;

  let L = 0;
  let nd = 0;
  let mt = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const lad = (state.menu[getWeekday(year, month, d)] || {}).l;
    const c = dayCells(state, d);
    if (!state.hol[d] && lad) {
      c.forEach((v, i) => (sum[i] += v));
      if (c[11]) {
        nd++;
        mt += c[11];
        L += (c[0] + c[6]) * state.N.lad[0] + c[10] * state.N.lad[1];
      }
    }
  }

  const nm = [
    'ମାଣ୍ଡିଆ ଆଟା',
    'ଗହମ ଆଟା',
    'ତିଲ',
    'ଗୁଡ଼ ଚିନି',
    'ତେଲ',
    'ଚିନାବାଦାମ',
    'ଅଳେଇଚି ଗୁଣ୍ଡ',
  ];
  const total = r2(L * ladCost(state));

  return (
    <div className="paper-sheet f15-sheet">
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>
        ଫର୍ମ ନଂ -୧୫ (ପ୍ରାଥମିକ)
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(min-content, 1.55fr) minmax(0, 1fr)',
          gap: '10px',
          alignItems: 'start',
          marginTop: '4px',
        }}
      >
        <table className="f15-att" style={{ border: '2px solid #000' }}>
          <thead>
            <tr>
              <th colSpan={15} style={{ fontSize: '14px', height: '28px' }}>
                ଦୈନିକ ଉପସ୍ଥାନ ସବିଶେଷ ବିବରଣୀ (ଛାତ୍ରଛାତ୍ରୀ ସଂଖ୍ୟା)
              </th>
            </tr>
            <tr style={{ fontSize: '11px' }}>
              {[
                'ଶ୍ରେଣୀ',
                '',
                'ଶିଶୁବାଟିକା',
                'ମୋଟ',
                '୧ମ',
                '୨ୟ',
                '୩ୟ',
                '୪ର୍ଥ',
                '୫ମ',
                'ମୋଟ',
                '୬ଷ୍ଠ',
                '୭ମ',
                '୮ମ',
                'ମୋଟ',
                'ସର୍ବ ମୋଟ',
              ].map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
            <tr className="blk">
              <td colSpan={2}>ନାମ</td>
              {lay([
                ro[0],
                ...ro.slice(1, 6),
                rp,
                ...ro.slice(6),
                ru,
                rp + ru + ro[0],
              ]).map((v, i) => (
                <td key={i} style={{ fontSize: '13px' }}>
                  {v}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, idx) => {
              const d = idx + 1;
              const wd = getWeekday(year, month, d);
              const lad = (state.menu[wd] || {}).l;
              const c = dayCells(state, d);
              const isHol = !!state.hol[d];
              const holName = state.holn[d];

              if (isHol && holName) {
                return (
                  <tr key={d} className={!lad ? 'k' : ''}>
                    <td>{od(d)}</td>
                    <td>{DN[wd]}</td>
                    <td
                      colSpan={13}
                      style={{
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '11px',
                        padding: '1px 4px',
                        backgroundColor: !lad ? '#000' : '#fdeaea',
                        color: !lad ? '#fff' : '#8a1020',
                      }}
                    >
                      ଛୁଟି · {holName}
                    </td>
                  </tr>
                );
              }

              if (!lad) {
                return (
                  <tr key={d} className="k">
                    <td>{od(d)}</td>
                    <td>{DN[wd]}</td>
                    {Array.from({ length: 13 }, (_, i) => (
                      <td key={i} className={gy(i) ? 'g' : ''} />
                    ))}
                  </tr>
                );
              }

              return (
                <tr key={d}>
                  <td>{od(d)}</td>
                  <td>{DN[wd]}</td>
                  {lay(c).map((v, i) => (
                    <td
                      key={i}
                      className={`${gy(i) ? 'g' : ''} ${
                        i === 1 || i === 7 || i === 12 ? 'r' : ''
                      }`.trim()}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="blk">
              <td colSpan={2}>ମୋଟ</td>
              {lay(sum).map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
          </tbody>
        </table>

        <div>
          <div
            style={{
              border: '2px solid #000',
              padding: '6px',
              fontSize: '13px',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            ଚଳିତ ମାସରେ ନିମ୍ନ ଲଡୁ ସାମଗ୍ରୀ କ୍ରୟ କମିଟି ଅନୁମତି କ୍ରମେ କିଣାଯାଇ-
            {dStart}-ଠାରୁ-{dEnd}-ପର୍ଯ୍ୟନ୍ତ ଖର୍ଚ୍ଚ କରାଗଲା ।
          </div>
          <table className="f15-items" style={{ border: '2px solid #000', marginTop: '6px' }}>
            <thead>
              <tr style={{ fontSize: '11px' }}>
                <th style={{ width: '9%' }}>କ୍ର. ନଂ</th>
                <th>ଖାଦ୍ୟ ସାମଗ୍ରୀ</th>
                <th style={{ width: '30%' }}>
                  ମାସ ମଧ୍ୟରେ ଖାଦ୍ୟ ସାମଗ୍ରୀ କ୍ରୟ କରାଯାଇଥିବା ସମୁଦାୟ ପରିମାଣ
                </th>
                <th style={{ width: '26%' }}>ଖାଦ୍ୟ ସାମଗ୍ରୀର ମୂଲ୍ୟ</th>
              </tr>
            </thead>
            <tbody>
              {state.lad.map((r, i) => (
                <tr key={i}>
                  <td>{od(i + 1)}</td>
                  <td className="l">{nm[i] || r[0]}</td>
                  <td>{f3((L * r[1]) / 1000)} kg</td>
                  <td>{f2(r2(((L * r[1]) / 1000) * r[2]))}</td>
                </tr>
              ))}
              <tr>
                <td>{od(8)}</td>
                <td className="l">ପ୍ରସ୍ତୁତି ମୂଲ୍ୟ</td>
                <td />
                <td>{f2(r2(L * state.prep))}</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>
                  ମୋଟ
                </td>
                <td style={{ border: '2px solid #0a7a3d' }}>{f2(total)}</td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              border: '2px solid #000',
              marginTop: '22px',
              padding: '8px',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 700 }}>
              ଟଙ୍କା-{Math.round(total)}
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                textDecoration: 'underline',
              }}
            >
              ଅକ୍ଷରେ- ({words(total)} )
            </div>
            <div style={{ fontSize: '11px', marginTop: '6px' }}>
              ଉପରୋକ୍ତ ଲଡୁ ସାମଗ୍ରୀ ନଗଦ/ଧାର ସ୍ତରରେ କିଣାଯାଇ ମଧ୍ୟାହ୍ନ ଭୋଜନ
              କାର୍ଯ୍ୟକ୍ରମରେ ଚଳିତ ମାସ-{monName}-ତାରିଖ-{dStart}-ଠାରୁ-{dEnd}-ମଧ୍ୟରେ
              ଖର୍ଚ୍ଚ କରାଯାଇଥିଲା ।
            </div>
          </div>

          <table className="f15-sum" style={{ width: '100%', marginTop: '18px', border: '2px solid #000' }}>
            <tbody>
              <tr>
                <td className="l">୧) ମୋଟ ଉପସ୍ଥାନ:-</td>
                <td style={{ width: '30%', fontSize: '15px', fontWeight: 700 }}>
                  {mt}
                </td>
              </tr>
              <tr>
                <td className="l">୨) ଭୋଜନ ଦିବସ:-</td>
                <td style={{ fontSize: '15px', fontWeight: 700 }}>{nd}</td>
              </tr>
              <tr>
                <td colSpan={2} className="l" style={{ fontSize: '11px' }}>
                  ୩) ଗ୍ରାମ ଶିକ୍ଷା କମିଟି ସଭାପତିଙ୍କ ନାମ, ସାକ୍ଷର ସହ ମୋହର
                </td>
              </tr>
              <tr>
                <td className="l">୪) ଦାଖଲ ତାରିଖ</td>
                <td style={{ fontSize: '15px', fontWeight: 700 }}>{dEnd}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontWeight: 700, margin: '14px 0 0' }}>
        ଏହା ଦ୍ୱାରା ପ୍ରମାଣ କରୁଛି ଉପର ଲିଖିତ ସମସ୍ତ ତଥ୍ୟ ସତ୍ୟ ଅଟେ ଓ ଆମ ବିଦ୍ୟାଳୟ
        ଭୋଜନ ନିୟମିତ ସୁଚାରୁ ରୂପେ ପରିଚାଳିତ କରାଯାଇଛି ।
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '32px',
          fontSize: '11px',
          fontWeight: 700,
          gap: '10px',
        }}
      >
        <span>ଏସ. ହେଚ. ଜି/ ଏସ ଏମ ସି ସଭ୍ୟ ସ୍ୱାକ୍ଷର ଓ ମୋହର</span>
        <span>ଏସ. ହେଚ. ଜି/ ଏସ ଏମ ସି ସଭ୍ୟ/ ସଭ୍ୟା ସ୍ୱାକ୍ଷର</span>
        <span style={{ alignSelf: 'flex-end' }}>
          ପ୍ରଧାନ ଶିକ୍ଷକଙ୍କ ସ୍ୱାକ୍ଷର ଓ ମୋହର
        </span>
      </div>
    </div>
  );
};

/* ---------------- Tab 8: 5. MDCF Page 1 ---------------- */
export const MDCFPage1Sheet: React.FC<SheetProps> = ({ state }) => {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const g = calcAbsTiers(state);
  const I = state.info;
  const D = state.demo;
  const F = state.fund || [0, 0, 0, 0, 0, 0];
  const cs = calcSecondary(state);

  const m = [0, 0, 0];
  const dy = [0, 0, 0];
  for (let d = 1; d <= daysInMonth; d++) {
    const t = dayTot(state, d);
    for (let i = 0; i < 3; i++) {
      m[i] += t[i];
      if (t[i] > 0) dy[i]++;
    }
  }

  const m2 = [0, 0];
  for (let d = 1; d <= daysInMonth; d++) {
    if (state.hol[d]) continue;
    const a = state.att[d] || [];
    m2[0] += num(a[9]);
    m2[1] += num(a[10]);
  }

  const E2 = Array(6).fill(0);
  const X2 = Array(6).fill(0);
  state.demo2.forEach((r, i) => {
    const x = proportionalSplit(r, m2[i]);
    r.forEach((v, j) => {
      E2[j] += v;
      X2[j] += x[j];
    });
  });

  const lv = ['Bal Vatika', 'Primary(i-v)', 'Upper Pri.(vi-viii)'];
  const ex = [g[0].q * state.pm[0], g[1].q * state.pm[1]];
  const cb = [F[0] + F[1] - ex[0], F[2] + F[3] - ex[1]];
  const nl = (v: number) => (v > 0.004 ? f2(v) : 'NIL');
  const rc = [
    state.open[0] + state.recv[0] - g[0].rice,
    state.open[1] + state.recv[1] - g[1].rice,
  ];
  const nr = (v: number) => (v > 0.0004 ? f3(v) : 'NIL');

  const renderCells = (v: number[]) => (
    <>
      {v.map((x, idx) => (
        <td key={idx}>{x}</td>
      ))}
      <td>{v.reduce((a, b) => a + b, 0)}</td>
    </>
  );

  return (
    <div
      className="paper-sheet mdcf-p1-sheet"
      style={{ fontSize: '12px' }}
    >
      <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {state.emblem ? (
          <img
            src={state.emblem}
            alt="Emblem"
            referrerPolicy="no-referrer"
            style={{ width: '62px', height: '62px', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ width: '62px' }} />
        )}
        <div
          style={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '17px',
            lineHeight: 1.3,
          }}
        >
          Mid Day Meal Scheme
          <br />
          School Monthly Data Capture Format (MDCF)
        </div>
        {state.logo ? (
          <img
            src={state.logo}
            alt="Logo"
            referrerPolicy="no-referrer"
            style={{ width: '70px', height: '62px', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ width: '62px' }} />
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1.5fr auto 1fr',
          gap: '10px',
          alignItems: 'end',
          marginTop: '10px',
        }}
      >
        <span style={{ fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap' }}>
          Name of the School-
        </span>
        <b
          style={{
            borderBottom: '2px solid #000',
            textAlign: 'center',
            fontSize: '15px',
          }}
        >
          {I.school}
        </b>
        <span style={{ fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap' }}>
          Name of the GP-
        </span>
        <b
          style={{
            borderBottom: '2px solid #000',
            textAlign: 'center',
            fontSize: '15px',
          }}
        >
          {I.village}
        </b>
        <span style={{ fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap' }}>
          School Code No-
        </span>
        <b
          style={{
            borderBottom: '2px solid #000',
            textAlign: 'center',
            fontSize: '15px',
          }}
        >
          {I.code}
        </b>
        <span style={{ fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap' }}>
          Month-
        </span>
        <b
          style={{
            borderBottom: '2px solid #000',
            textAlign: 'center',
            fontSize: '15px',
          }}
        >
          {MNAMES[month].toUpperCase()}-{year}
        </b>
      </div>

      <p style={{ margin: '8px 0 4px', fontWeight: 800, fontSize: '12px' }}>
        Instruction keeps following register at the time of filling the form
        <br />
        1)Enrollment Register, 2)Account, 3)Bank Account Pass Book, 4)Cooking
        Cost Details, etc.
      </p>
      </div>

      <div>
      <table style={{ marginBottom: '4px' }}>
        <thead>
          <tr>
            <th colSpan={5}>Meal Available Status-</th>
          </tr>
          <tr>
            <th style={{ width: '34%' }} />
            <th>Bal Vatika</th>
            <th>Primary(i-v)</th>
            <th>Upper Pri(vi-viii)</th>
            <th>High School(ix-x)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="l">I) Number of School days during this month-</td>
            <td>{dy[0]}</td>
            <td>{dy[1]}</td>
            <td>{dy[2]}</td>
            <td>{cs.days || ''}</td>
          </tr>
          <tr>
            <td className="l">II) Actual number of days MDM served-</td>
            <td>{dy[0]}</td>
            <td>{dy[1]}</td>
            <td>{dy[2]}</td>
            <td>{cs.days || ''}</td>
          </tr>
          <tr>
            <td className="l">III) Total meals served during the month-</td>
            <td>{m[0]}</td>
            <td>{m[1]}</td>
            <td>{m[2]}</td>
            <td>{cs.meals || ''}</td>
          </tr>
        </tbody>
      </table>
      <p style={{ margin: '0', fontWeight: 700 }}>
        *Total meals served during the month:- Total students (-minus) total
        children not availed Mid Day Meal during the month.
      </p>
      </div>

      <table style={{ marginBottom: '4px' }}>
        <thead>
          <tr>
            <th colSpan={15} style={{ fontSize: '14px' }}>
              Students Enrollment and Beneficiary-
            </th>
          </tr>
          <tr>
            <th rowSpan={3} />
            <th colSpan={7} style={{ fontSize: '15px' }}>
              Enrollment
            </th>
            <th colSpan={7} style={{ fontSize: '15px' }}>
              Beneficiary
            </th>
          </tr>
          <tr>
            {[0, 1].map((gIdx) => (
              <React.Fragment key={gIdx}>
                <th colSpan={2}>ST</th>
                <th colSpan={2}>SC</th>
                <th colSpan={2}>Others</th>
                <th rowSpan={2}>Total</th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            {Array.from({ length: 6 }, (_, i) => (
              <React.Fragment key={i}>
                <th>B</th>
                <th>G</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {D.map((r, i) => {
            const x = proportionalSplit(r, m[i]);
            return (
              <tr key={i}>
                <td className="l">{lv[i]}</td>
                {renderCells(r)}
                {renderCells(x)}
              </tr>
            );
          })}
          <tr style={{ height: '24px' }}>
            <td className="l">High School(ix-x)</td>
            {renderCells(E2)}
            {renderCells(X2)}
          </tr>
        </tbody>
      </table>

      <div>
      <div
        style={{
          fontWeight: 700,
          fontSize: '12px',
          textAlign: 'center',
          margin: '4px 0 4px',
        }}
      >
        MDM Fund details (in Rs) MDM A/C No. (PS+UPS)-{I.acc} &nbsp;|&nbsp;
        Secondary (IX-X)-{I.acc2 || '-'}
      </div>
      <table>
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Component</th>
            <th>Opening Balance</th>
            <th>Received During the month</th>
            <th>Expenditure during the month</th>
            <th>Closing Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="l">Cooking cost Bal Vatika</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
          <tr>
            <td className="l">Cooking cost Primary(i-v)</td>
            <td>{f2(F[0])}</td>
            <td>{f2(F[1])}</td>
            <td>{f2(ex[0])}</td>
            <td>{nl(cb[0])}</td>
          </tr>
          <tr>
            <td className="l">Cooking Cost Upper Pri.(vi-viii)</td>
            <td>{f2(F[2])}</td>
            <td>{f2(F[3])}</td>
            <td>{f2(ex[1])}</td>
            <td>{nl(cb[1])}</td>
          </tr>
          <tr style={{ height: '24px' }}>
            <td className="l">Cooking Cost High School(ix-x)</td>
            <td>{f2(F[4] || 0)}</td>
            <td>{f2(F[5] || 0)}</td>
            <td>{f2(cs.meals * pm2(state))}</td>
            <td>{nl((F[4] || 0) + (F[5] || 0) - cs.meals * pm2(state))}</td>
          </tr>
        </tbody>
      </table>
      </div>

      <div>
      <div
        style={{
          fontWeight: 700,
          fontSize: '13px',
          textAlign: 'center',
          margin: '4px 0 4px',
        }}
      >
        Details Foodgrain ( In Kilogram)
      </div>
      <table>
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Component</th>
            <th>Rice Opening Balance</th>
            <th>Rice Received During the month</th>
            <th>Rice Expenditure during the month</th>
            <th>Rice Closing Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="l">Rice Bal Vatika</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
          <tr>
            <td className="l">Rice Primary(i-v)</td>
            <td>{f3(state.open[0])}</td>
            <td>{f3(state.recv[0])}</td>
            <td>{f3(g[0].rice)}</td>
            <td>{nr(rc[0])}</td>
          </tr>
          <tr>
            <td className="l">Rice Upper Pri.(vi-viii)</td>
            <td>{f3(state.open[1])}</td>
            <td>{f3(state.recv[1])}</td>
            <td>{f3(g[1].rice)}</td>
            <td>{nr(rc[1])}</td>
          </tr>
          <tr style={{ height: '24px' }}>
            <td className="l">Rice High School(ix-x)</td>
            <td>{f3(state.open[2] || 0)}</td>
            <td>{f3(state.recv[2] || 0)}</td>
            <td>{f3(cs.rice)}</td>
            <td>{nr((state.open[2] || 0) + (state.recv[2] || 0) - cs.rice)}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
};

/* ---------------- Tab 9: 6. MDCF Page 2 ---------------- */
export const MDCFPage2Sheet: React.FC<SheetProps> = ({
  state,
  onUpdateState,
}) => {
  const M = state.m2 || {};
  const g = calcAbsTiers(state);
  const F = calcSecondary(state);
  const autoExp =
    g[0].q * state.pm[0] + g[1].q * state.pm[1] + F.meals * state.pm[1];

  const getVal = (k: string, def = '') =>
    M[k] !== undefined ? String(M[k]) : def;

  const setField = (k: string, val: string | boolean) => {
    if (!onUpdateState) return;
    onUpdateState((prev) => ({
      ...prev,
      m2: { ...(prev.m2 || {}), [k]: val },
    }));
  };

  const EditableTd: React.FC<{
    k: string;
    def?: string;
    colSpan?: number;
    style?: React.CSSProperties;
  }> = ({ k, def = '', colSpan, style }) => (
    <td
      contentEditable
      suppressContentEditableWarning
      colSpan={colSpan}
      style={{ backgroundColor: '#fffbe6', height: '24px', ...style }}
      onBlur={(e) => setField(k, e.currentTarget.innerText)}
    >
      {getVal(k, def)}
    </td>
  );

  const AC = [...state.cooks, ...state.cooks2];
  const nc = Math.max(4, AC.length + 1);
  const wl = [
    'Multi Tap',
    'Well',
    'Tube Well',
    'Water Harvesting',
    'Dysfunctional Tubewell',
    'Tubewell Having Inadequate Yield',
  ];

  return (
    <div
      className="paper-sheet mdcf-p2-sheet"
      style={{ fontSize: '12px' }}
    >
      <table style={{ marginBottom: '8px' }}>
        <thead>
          <tr>
            <th colSpan={4} className="l" style={{ fontSize: '13px' }}>
              School Expenses: Management, Monitoring, Evaluation Expenses (MME)
            </th>
          </tr>
          <tr>
            <th>Opening Balance</th>
            <th>Received during the month</th>
            <th>Total Expenditure during the month</th>
            <th>Closing Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <EditableTd k="mme0" />
            <EditableTd k="mme1" />
            <EditableTd
              k="mme2"
              def={autoExp ? f2(autoExp) : ''}
            />
            <EditableTd k="mme3" />
          </tr>
        </tbody>
      </table>

      <table style={{ marginBottom: '8px' }}>
        <thead>
          <tr>
            <th colSpan={3} className="l" style={{ fontSize: '13px' }}>
              School Inspection-
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="l" style={{ width: '42%' }}>
              School inspection done during the month
            </td>
            <EditableTd k="si_y" def="Yes" />
            <EditableTd k="si_n" def="No" />
          </tr>
          {[
            'Inspected by',
            'Members of task force',
            'Districts Officials',
            'Block/Taluks Level Officials',
            'SMC Members',
          ].map((lbl, i) => (
            <tr key={lbl}>
              <td className="l">{lbl}</td>
              <EditableTd k={`in${i}`} colSpan={2} />
            </tr>
          ))}
        </tbody>
      </table>

      <table style={{ marginBottom: '8px' }}>
        <thead>
          <tr>
            <th colSpan={2} className="l" style={{ fontSize: '13px' }}>
              Untoward incident during the month (If any)-
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="l" style={{ width: '42%' }}>
              Number of incident occurred during the month-
            </td>
            <EditableTd k="inc" />
          </tr>
        </tbody>
      </table>

      <table style={{ marginBottom: '8px' }}>
        <thead>
          <tr>
            <th colSpan={6} className="l" style={{ fontSize: '13px' }}>
              Water facility in the school (Please Tick)-
            </th>
          </tr>
          <tr>
            {wl.map((x) => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{ height: '30px' }}>
            {wl.map((_, i) => (
              <td key={i}>
                <input
                  type="checkbox"
                  checked={!!M[`w${i}`]}
                  onChange={(e) => setField(`w${i}`, e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#005A9C' }}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <table style={{ marginBottom: '8px' }}>
        <thead>
          <tr>
            <th colSpan={7} className="l" style={{ fontSize: '13px' }}>
              Cook-cum-Helpers Details
            </th>
          </tr>
          <tr>
            <th style={{ width: '6%' }}>SL.No</th>
            <th>Name of the cook-cum-helpers</th>
            <th>Gender</th>
            <th>Category</th>
            <th>Below Poverty</th>
            <th>Mode of Payment</th>
            <th>Honorarium Per Month</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: nc }, (_, i) => {
            const c = AC[i];
            const d = (x: string) => (c ? x : '');
            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <EditableTd k={`c${i}n`} def={c ? c[0] : ''} />
                <EditableTd k={`c${i}g`} def={d('FEMALE')} />
                <EditableTd k={`c${i}c`} def={d('ST')} />
                <EditableTd k={`c${i}b`} def={d('BPL')} />
                <EditableTd k={`c${i}m`} def={d('DBT')} />
                <EditableTd k={`c${i}h`} def={d('3000')} />
              </tr>
            );
          })}
          <tr>
            <td colSpan={4} style={{ textAlign: 'center' }}>
              Number Cook-cum-helpers during the month-
            </td>
            <EditableTd k="cn" def={String(AC.length)} colSpan={3} />
          </tr>
        </tbody>
      </table>

      <table style={{ marginBottom: '8px' }}>
        <thead>
          <tr>
            <th colSpan={3} className="l" style={{ fontSize: '13px' }}>
              Children Health Status-
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            'No. of children class from 1 to 5 and 6 to 10 who had received 4 IFA Tablet (Boys)',
            'No. of children class from 1 to 5 and 6 to 10 who had received 4 IFA Tablet (Girls)',
            'No. of children referred mobile health team (RBSK)-',
            'No. of children Screened mobile health team (RBSK)-',
          ].map((l, i) => (
            <tr key={i}>
              <td style={{ width: '6%' }}>{i + 1}</td>
              <td className="l">{l}</td>
              <EditableTd k={`h${i}`} def="0" style={{ width: '18%' }} />
            </tr>
          ))}
        </tbody>
      </table>

      <table>
        <tbody>
          {[
            '*Ration cost utilised upto-',
            '*Remuneration to cook & helper paid upto-',
            '*U.C Submitted up to-',
            '*Utensil requirement-',
            '*M.D.M Managed by HM & SHG/HM & SMC :NGO-',
            '*Name and Phone number of the HM-',
          ].map((l, i) => (
            <tr key={i}>
              <td className="l" style={{ width: '50%' }}>
                {l}
              </td>
              <EditableTd k={`b${i}`} />
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '14px',
          fontWeight: 800,
        }}
      >
        <span>Signature of SMC chairperson</span>
        <span>Signature of Headmaster</span>
      </div>
    </div>
  );
};
