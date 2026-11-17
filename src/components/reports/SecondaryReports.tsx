import React from 'react';
import { MDMState } from '../../types/mdm';
import { DN, MNAMES } from '../../data/defaultState';
import {
  calcSecondary,
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
}

/* ---------------- Tab 10: Form-15 Secondary (Odia) ---------------- */
export const Form15SecondarySheet: React.FC<SheetProps> = ({ state }) => {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const mm = String(month + 1).padStart(2, '0');
  const mon = MNAMES[month];
  const d1 = `01-${mm}-${year}`;
  const d2 = `${String(daysInMonth).padStart(2, '0')}-${mm}-${year}`;

  const R = calcSecondary(state);
  const ro = state.rolls2;
  const bud = R.meals * pm2(state);
  const sum = [0, 0, 0];

  for (let d = 1; d <= daysInMonth; d++) {
    if (state.hol[d]) continue;
    const a = state.att[d] || [];
    const c9 = num(a[9]);
    const c10 = num(a[10]);
    sum[0] += c9;
    sum[1] += c10;
    sum[2] += c9 + c10;
  }

  const items: [number, string, string, number | ''][] = [
    [1, 'ଡାଲି', `${f3(R.dal)} kg`, R.dalA],
    [2, 'ସୋୟାବିନ ବଡି', `${f3(R.soya)} kg`, R.soyaA],
    [3, 'ତେଲ', `${f3(R.oil)} kg`, R.oilA],
    [4, 'ମସଲା, ଲୁଣ', '', R.cn || ''],
    [5, 'ଜାଳେଣୀ', f2(R.fuel), R.fuel],
    [6, 'ଅଣ୍ଡା', String(R.eggs), R.eggA],
    [7, 'ପନିପରିବା', `${f3(R.veg)} kg`, R.vegAmt],
    [8, 'ଉଦ୍ଧାରକ', '', ''],
  ];

  return (
    <div className="paper-sheet f15-sheet">
      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '16px' }}>
        ଫର୍ମ ନଂ -୧୫ (ମାଧ୍ୟମିକ)
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(min-content, 1fr) minmax(0, 1.35fr)',
          gap: '14px',
          alignItems: 'start',
          marginTop: '4px',
        }}
      >
        <table className="f15-att" style={{ border: '2px solid #000' }}>
          <thead>
            <tr>
              <th colSpan={5} style={{ fontSize: '13px' }}>
                ଦୈନିକ ଉପସ୍ଥାନ ସବିଶେଷ ବିବରଣୀ (ଛାତ୍ରଛାତ୍ରୀ ସଂଖ୍ୟା)
              </th>
            </tr>
            <tr>
              <th>ଶ୍ରେଣୀ</th>
              <th>ନବମ</th>
              <th>ଦଶମ</th>
              <th>ମୋଟ</th>
              <th>ସର୍ବ ମୋଟ</th>
            </tr>
            <tr className="blk">
              <td>ମୋଟ ଛାତ୍ରଛାତ୍ରୀ</td>
              <td>{ro[0]}</td>
              <td>{ro[1]}</td>
              <td>{ro[0] + ro[1]}</td>
              <td>{ro[0] + ro[1]}</td>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, idx) => {
              const d = idx + 1;
              const a = state.att[d] || [];
              const isHol = !!state.hol[d];
              const isSun = getWeekday(year, month, d) === 0;
              const c9 = isHol ? 0 : num(a[9]);
              const c10 = isHol ? 0 : num(a[10]);
              const t = c9 + c10;
              const holName = state.holn[d];

              if (isHol && holName) {
                return (
                  <tr key={d} className={isSun ? 'k' : ''}>
                    <td style={isSun ? { color: '#fff' } : undefined}>
                      {od(d)}
                    </td>
                    <td
                      colSpan={4}
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

              if (isSun && !t) {
                return (
                  <tr key={d} className="k">
                    <td style={{ color: '#fff' }}>{od(d)}</td>
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                );
              }

              return (
                <tr key={d}>
                  <td>{od(d)}</td>
                  <td>{c9}</td>
                  <td>{c10}</td>
                  <td className="g">{t}</td>
                  <td className="g">{t}</td>
                </tr>
              );
            })}
            <tr>
              <td>ମୋଟ</td>
              <td>{sum[0]}</td>
              <td>{sum[1]}</td>
              <td className="g">{sum[2]}</td>
              <td className="g">{sum[2]}</td>
            </tr>
          </tbody>
        </table>

        <div>
          <div
            className="ec"
            style={{
              border: '2px solid #000',
              padding: '6px',
              fontSize: '13px',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            ଚଳିତ ମାସରେ ନିମ୍ନ ଖାଦ୍ୟ ସାମଗ୍ରୀ କ୍ରୟ କମିଟି ଅନୁମତି କ୍ରମେ କିଣାଯାଇ -
            {d1}-ଠାରୁ-{d2}-ଖର୍ଚ୍ଚ କରାଗଲା
          </div>

          <table className="f15-items" style={{ border: '2px solid #000', marginTop: '8px' }}>
            <thead>
              <tr>
                <th style={{ width: '9%' }}>କ୍ର. ନଂ</th>
                <th>ଖାଦ୍ୟ ସାମଗ୍ରୀ</th>
                <th style={{ width: '30%' }}>
                  ମାସ ମଧ୍ୟରେ ଖାଦ୍ୟ ସାମଗ୍ରୀ କ୍ରୟ କରାଯାଇଥିବା ସମୁଦାୟ ପରିମାଣ/ ମୂଲ୍ୟ
                </th>
                <th style={{ width: '28%' }}>ଖାଦ୍ୟ ସାମଗ୍ରୀର ମୂଲ୍ୟ</th>
              </tr>
            </thead>
            <tbody>
              {items.map(([i, n, q, a]) => (
                <tr key={i}>
                  <td>{od(i)}</td>
                  <td className="l">{n}</td>
                  <td>
                    <b>{q}</b>
                  </td>
                  <td>
                    <b>{a === '' ? '' : `Rs- ${f2(a)}`}</b>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>
                  ମୋଟ ମଧ୍ୟାନ ଭୋଜନ ମୂଲ୍ୟ
                </td>
                <td style={{ fontSize: '15px', fontWeight: 800 }}>
                  {f2(R.total)}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 800,
              margin: '6px 6px 14px',
            }}
          >
            <span className="ec">MDM AND LADOO COST-</span>
            <span className="ec">{f2(bud)}</span>
          </div>

          <div style={{ border: '2px solid #000', padding: '6px' }}>
            <div className="ec" style={{ fontSize: '15px', fontWeight: 800 }}>
              ଟଙ୍କା-{f2(R.total)}
            </div>
            <div
              className="ec"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'underline',
              }}
            >
              ଅକ୍ଷରେ- ({words(R.total)} )
            </div>
            <div
              className="ec"
              style={{
                borderTop: '1px solid #000',
                marginTop: '4px',
                paddingTop: '4px',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              ଉପରୋକ୍ତ ଖାଦ୍ୟ ସାମଗ୍ରୀ ନଗଦ/ଧାର ସ୍ତରରେ କିଣାଯାଇ ମଧ୍ୟାହ୍ନ ଭୋଜନ
              କାର୍ଯ୍ୟକ୍ରମରେ ଚଳିତ ମାସ-{mon}-ତାରିଖ -{d1}-ଠାରୁ-{d2}-ଖର୍ଚ୍ଚ କରାଗଲା
            </div>
          </div>

          <table
            className="f15-sum"
            style={{ width: '68%', marginTop: '16px', border: '2px solid #000' }}
          >
            <thead>
              <tr>
                <th colSpan={3}>ଖର୍ଚ୍ଚର ବିବରଣୀ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="l">ପୂର୍ବ ଜମା</td>
                <td>₹</td>
                <td style={{ textAlign: 'right' }}>-</td>
              </tr>
              <tr>
                <td className="l">ଚଳିତ ମାସର ପ୍ରାପ୍ତି</td>
                <td>₹</td>
                <td style={{ textAlign: 'right' }}>-</td>
              </tr>
              <tr>
                <td className="l">ମୋଟ</td>
                <td>₹</td>
                <td style={{ textAlign: 'right' }}>-</td>
              </tr>
              <tr>
                <td className="l">ଖର୍ଚ୍ଚ</td>
                <td>₹</td>
                <td style={{ textAlign: 'right' }}>
                  {R.total.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
              <tr>
                <td className="l">ବଳକା</td>
                <td colSpan={2} style={{ border: '2px solid #0a7a3d' }}>
                  NIL
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              margin: '8px 0 0 6px',
              textAlign: 'left',
            }}
          >
            ୧) ମୋଟ ଉପସ୍ଥାନ:-<span className="ec">{R.meals}</span>
            <br />
            ୨) ଭୋଜନ ଦିବସ:-<span className="ec">{R.days}</span>
          </div>
          <div style={{ fontSize: '11px', marginTop: '6px', textAlign: 'left' }}>
            ୩) ଗ୍ରାମ୍ୟ ଶିକ୍ଷା କମିଟି ସଭାପତି ଙ୍କ ନାମ, ସାକ୍ଷର ସହ ମୋହର:-{' '}
            <span className="fi" style={{ minWidth: '120px' }} />
            <br />
            ୪) ଦାଖଲ ତାରିଖ-{' '}
            <span
              className="ec"
              style={{
                border: '1px solid #000',
                padding: '2px 8px',
                fontWeight: 800,
              }}
            >
              {d2}
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
        <span>ଏସ. ହେଚ. ଜି/ ଏସ ଏମ ସି ସଭାପତିଙ୍କ ସ୍ୱାକ୍ଷର ଓ ମୋହର</span>
        <span>ଏସ. ହେଚ. ଜି/ ଏସ ଏମ ସି ସଭ୍ୟ/ ସଭ୍ୟାଙ୍କ ସ୍ୱାକ୍ଷର</span>
        <span style={{ alignSelf: 'flex-end' }}>
          ପ୍ରଧାନ ଶିକ୍ଷକଙ୍କ ସ୍ୱାକ୍ଷର ଓ ମୋହର
        </span>
      </div>
    </div>
  );
};

/* ---------------- Tab 11: Secondary Report ---------------- */
export const SecondaryReportSheet: React.FC<SheetProps> = ({ state }) => {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const pad = (n: number) => String(n).padStart(2, '0');
  const mm = pad(month + 1);
  const monLabel = `${MNAMES[month].toUpperCase()}-${year}`;

  const R = calcSecondary(state);
  const I = state.info;
  const D = state.demo2;

  const m = [0, 0];
  for (let d = 1; d <= daysInMonth; d++) {
    if (state.hol[d]) continue;
    const a = state.att[d] || [];
    m[0] += num(a[9]);
    m[1] += num(a[10]);
  }

  const rw = (v: number[]) => [
    ...v,
    v[0] + v[2] + v[4],
    v[1] + v[3] + v[5],
    v.reduce((a, b) => a + b, 0),
  ];
  const lv = ['ନବମ', 'ଦଶମ'];
  const L = D.map(rw);
  const X = D.map((r, i) => rw(proportionalSplit(r, m[i])));
  const sc = (A: number[][]) =>
    A[0].map((_, j) => A.reduce((a, r) => a + r[j], 0));

  const open = state.open[2] || 0;
  const recv = state.recv[2] || 0;
  const bal = open + recv - R.rice;
  const nu = R.meals;

  const ed: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if ((state.menu[getWeekday(year, month, d)] || {}).e) ed.push(d);
  }
  const nRows = Math.max(7, Math.ceil(ed.length / 2));

  const valForDay = (d: number) => {
    const a = state.att[d] || [];
    const t = state.hol[d] ? 0 : num(a[9]) + num(a[10]);
    return t || 'school close';
  };

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
            alt="Emblem"
            referrerPolicy="no-referrer"
            style={{ width: '80px', height: '80px', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ width: '80px' }} />
        )}
        <h3 style={{ fontSize: '20px', textAlign: 'center', margin: 0, flex: 1 }}>
          ମାଧ୍ୟମିକ ମଧ୍ୟାହ୍ନ ଭୋଜନ କାର୍ଯ୍ୟକ୍ରମ ମାସିକ ବିବରଣୀ
        </h3>
        {state.logo ? (
          <img
            src={state.logo}
            alt="Logo"
            referrerPolicy="no-referrer"
            style={{ width: '104px', height: '86px', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ width: '90px' }} />
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0 16px',
          marginTop: '6px',
        }}
      >
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: '14px' }}>
            ୧) ସାଧାରଣ ବିବରଣୀ:-
          </h4>
          {fl('ବିଦ୍ୟାଳୟର ନାମ:-', I.school)}
          {fl('ବ୍ଲକ ନାମ:-', I.block)}
          {fl('ମଧ୍ୟାହ୍ନ ଭୋଜନ ସଂଯୁକ୍ତ ଖାତା ନମ୍ବର:-', I.acc2)}
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: '14px', visibility: 'hidden' }}>
            .
          </h4>
          {fl('ମାସର ନାମ:-', monLabel)}
          {fl('ଗ୍ରାମ ପଞ୍ଚାୟତ:-', I.village)}
          {fl('ଜିଲ୍ଲାର ନାମ:-', I.dist)}
          {fl('ବ୍ୟାଙ୍କ ନାମ:-', I.bank2)}
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
            <col key={`s1-${idx}`} style={{ width: '4.75%' }} />
          ))}
          <col style={{ width: '6.5%' }} />
          {Array.from({ length: 8 }, (_, idx) => (
            <col key={`s2-${idx}`} style={{ width: '4.75%' }} />
          ))}
          <col style={{ width: '6.5%' }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={3}>ସ୍ତର</th>
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
          {D.map((_, i) => (
            <tr key={i}>
              <td className="l" style={{ fontSize: '11px' }}>
                {lv[i]}
              </td>
              {L[i].map((c, ci) => (
                <td key={`l-${ci}`}>{c}</td>
              ))}
              {X[i].map((c, ci) => (
                <td key={`x-${ci}`}>{c}</td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="l" style={{ fontSize: '11px' }}>
              ମୋଟ
            </td>
            {sc(L).map((c, ci) => (
              <td key={`sl-${ci}`}>{c}</td>
            ))}
            {sc(X).map((c, ci) => (
              <td key={`sx-${ci}`}>{c}</td>
            ))}
          </tr>
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
            <td>{nu}</td>
            <td>ମୋଟ ହିତାଧିକାରୀଙ୍କ ସଂଖ୍ୟା</td>
            <td>{nu}</td>
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
            <th colSpan={2}>ଚାଉଳ (kg)</th>
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
              R.cn,
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
        <span className="ec">{bal < 0 ? `${f3(-bal)} kg` : 'Nil'}</span>
      </h4>
      </div>

      <div>
      <h4 style={{ margin: '10px 0 3px', fontSize: '14px' }}>
        ୬) ଚଳିତ ମାସରେ ହିତାଧିକାରୀଙ୍କୁ ଦିଆଯାଇଥିବା ଅଣ୍ଡାର ବିବରଣୀ:-
      </h4>
      <table>
        <thead>
          <tr>
            <th>କ୍ର. ନଂ</th>
            <th>ତାରିଖ</th>
            <th>ବାରର ନାମ</th>
            <th>ପରିମାଣ</th>
            <th>କ୍ର. ନଂ</th>
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
                <td>{dA ? valForDay(dA) : ''}</td>
                <td>{od(i + 1 + nRows)}</td>
                <td>{dB ? `${pad(dB)}-${mm}-${year}` : ''}</td>
                <td>{dB ? DN[getWeekday(year, month, dB)] : ''}</td>
                <td>{dB ? valForDay(dB) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ margin: '3px 0 0', textAlign: 'left', fontWeight: 700 }}>
        TOTAL EGG CONSUMPTION :- <span className="ec">{R.eggs}</span>
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
            <th style={{ width: '7%' }}>କ୍ର. ନଂ</th>
            <th>ରୋଷେୟାଙ୍କ ନାମ</th>
            <th>ସଞ୍ଚୟ ଖାତା ନମ୍ବର</th>
            <th>ବ୍ୟାଙ୍କ ନାମ</th>
          </tr>
        </thead>
        <tbody>
          {state.cooks2.map((c, i) => (
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

/* ---------------- Tab 13: Laddoo Form-15 Secondary ---------------- */
export const LaddooForm15SecondarySheet: React.FC<SheetProps> = ({ state }) => {
  const { year, month, daysInMonth } = parseMonthKey(state.cur);
  const mm = String(month + 1).padStart(2, '0');
  const mon = MNAMES[month];
  const d1 = `01-${mm}-${year}`;
  const d2 = `${String(daysInMonth).padStart(2, '0')}-${mm}-${year}`;

  const ro = state.rolls2;
  const sum = [0, 0, 0];
  let L = 0;
  let nd = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const lad = (state.menu[getWeekday(year, month, d)] || {}).l;
    if (state.hol[d] || !lad) continue;
    const a = state.att[d] || [];
    const c9 = num(a[9]);
    const c10 = num(a[10]);
    const t = c9 + c10;
    sum[0] += c9;
    sum[1] += c10;
    sum[2] += t;
    if (t) {
      nd++;
      L += t * state.N2.lad;
    }
  }

  const nm = [
    'ମାଣ୍ଡିଆ ଚୁନା',
    'ଅଟା',
    'ତିଲ',
    'ଗୁଡ଼',
    'ତେଲ',
    'ଚିନାବାଦାମ',
    'ଅଳେଇଚି',
  ];
  const total = r2(L * ladCost(state));

  return (
    <div className="paper-sheet f15-sheet">
      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '15px' }}>
        ଫର୍ମ ନଂ -୧୫(ମାଧ୍ୟମିକ)
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(min-content, 1fr) minmax(0, 1.25fr)',
          gap: '12px',
          alignItems: 'start',
          marginTop: '4px',
        }}
      >
        <table className="f15-att" style={{ border: '2px solid #000' }}>
          <thead>
            <tr>
              <th colSpan={6} style={{ fontSize: '13px' }}>
                ଦୈନିକ ଉପସ୍ଥାନ ସବିଶେଷ ବିବରଣୀ (ଛାତ୍ରଛାତ୍ରୀ ସଂଖ୍ୟା)
              </th>
            </tr>
            <tr>
              <th>ଶ୍ରେଣୀ</th>
              <th />
              <th>ନବମ</th>
              <th>ଦଶମ</th>
              <th>ମୋଟ</th>
              <th>ସର୍ବ ମୋଟ</th>
            </tr>
            <tr className="blk">
              <td colSpan={2}>ମୋଟ ଛାତ୍ରଛାତ୍ରୀ</td>
              <td>{ro[0]}</td>
              <td>{ro[1]}</td>
              <td>{ro[0] + ro[1]}</td>
              <td>{ro[0] + ro[1]}</td>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, idx) => {
              const d = idx + 1;
              const wd = getWeekday(year, month, d);
              const lad = (state.menu[wd] || {}).l;
              const a = state.att[d] || [];
              const isHol = !!state.hol[d];
              const isSun = wd === 0;
              const c9 = isHol ? 0 : num(a[9]);
              const c10 = isHol ? 0 : num(a[10]);
              const t = c9 + c10;
              const holName = state.holn[d];

              if (isHol && holName) {
                return (
                  <tr key={d} className={isSun ? 'k' : ''}>
                    <td style={isSun ? { color: '#fff' } : undefined}>
                      {od(d)}
                    </td>
                    <td style={isSun ? { color: '#fff' } : undefined}>
                      {DN[wd]}
                    </td>
                    <td
                      colSpan={4}
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

              if (isSun && !t) {
                return (
                  <tr key={d} className="k">
                    <td style={{ color: '#fff' }}>{od(d)}</td>
                    <td style={{ color: '#fff' }}>{DN[wd]}</td>
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                );
              }

              if (!lad) {
                return (
                  <tr key={d}>
                    <td>{od(d)}</td>
                    <td>{DN[wd]}</td>
                    <td />
                    <td />
                    <td className="g">-</td>
                    <td className="g">-</td>
                  </tr>
                );
              }

              return (
                <tr key={d}>
                  <td>{od(d)}</td>
                  <td>{DN[wd]}</td>
                  <td>{c9}</td>
                  <td>{c10}</td>
                  <td className="g">{t}</td>
                  <td className="g">{t}</td>
                </tr>
              );
            })}
            <tr className="blk">
              <td colSpan={2}>ମୋଟ</td>
              <td>{sum[0]}</td>
              <td>{sum[1]}</td>
              <td>{sum[2]}</td>
              <td>{sum[2]}</td>
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
            {d1}-ଠାରୁ-{d2}-ପର୍ଯ୍ୟନ୍ତ ଖର୍ଚ୍ଚ କରାଗଲା ।
          </div>

          <table className="f15-items" style={{ border: '2px solid #000', marginTop: '6px' }}>
            <thead>
              <tr>
                <th style={{ width: '9%' }}>କ୍ର. ନଂ</th>
                <th>ଖାଦ୍ୟ ସାମଗ୍ରୀ</th>
                <th style={{ width: '30%' }}>
                  ମାସ ମଧ୍ୟରେ ଖାଦ୍ୟ ସାମଗ୍ରୀ କ୍ରୟ କରାଯାଇଥିବା ସମୁଦାୟ ପରିମାଣ/ ମୂଲ୍ୟ
                </th>
                <th style={{ width: '26%' }}>ଖାଦ୍ୟ ସାମଗ୍ରୀର ମୂଲ୍ୟ</th>
              </tr>
            </thead>
            <tbody>
              {state.lad.map((r, i) => (
                <tr key={i}>
                  <td>{od(i + 1)}</td>
                  <td className="l">{nm[i] || r[0]}</td>
                  <td>
                    <b>{f3((L * r[1]) / 1000)} kg</b>
                  </td>
                  <td>
                    <b>{f2(r2(((L * r[1]) / 1000) * r[2]))}</b>
                  </td>
                </tr>
              ))}
              <tr>
                <td>{od(8)}</td>
                <td className="l">ପ୍ରସ୍ତୁତି ମୂଲ୍ୟ</td>
                <td />
                <td>
                  <b>{f2(r2(L * state.prep))}</b>
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="l">
                  ମୋଟ
                </td>
                <td style={{ fontSize: '15px', fontWeight: 800 }}>
                  {f2(total)}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              border: '2px solid #000',
              marginTop: '18px',
              padding: '8px',
            }}
          >
            <div className="ec" style={{ fontSize: '15px', fontWeight: 800 }}>
              ଟଙ୍କା-{total}
            </div>
            <div
              className="ec"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'underline',
              }}
            >
              ଅକ୍ଷରେ- ({words(total)} )
            </div>
            <div
              className="ec"
              style={{
                borderTop: '1px solid #000',
                marginTop: '6px',
                paddingTop: '6px',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              ଉପରୋକ୍ତ ଖାଦ୍ୟ ସାମଗ୍ରୀ ନଗଦ/ଧାର ସ୍ତରରେ କିଣାଯାଇ ମଧ୍ୟାହ୍ନ ଭୋଜନ
              କାର୍ଯ୍ୟକ୍ରମରେ ଚଳିତ ମାସ-{mon}-ତାରିଖ-{d1}-ଠାରୁ-{d2}-ମଧ୍ୟରେ ଖର୍ଚ୍ଚ
              କରାଯାଇଥିଲା ।
            </div>
          </div>

          <table className="f15-sum" style={{ width: '100%', marginTop: '18px', border: '2px solid #000' }}>
            <tbody>
              <tr>
                <td className="l">୧) ମୋଟ ଉପସ୍ଥାନ:-</td>
                <td style={{ width: '34%', fontSize: '15px', fontWeight: 800 }}>
                  {sum[2]}
                </td>
              </tr>
              <tr>
                <td className="l">୨) ଭୋଜନ ଦିବସ:-</td>
                <td style={{ fontSize: '15px', fontWeight: 800 }}>{nd}</td>
              </tr>
              <tr>
                <td colSpan={2} className="l" style={{ fontSize: '11px' }}>
                  ୩) ଗ୍ରାମ୍ୟ ଶିକ୍ଷା କମିଟି ସଭାପତି ଙ୍କ ନାମ, ସାକ୍ଷର ସହ ମୋହର:-
                </td>
              </tr>
              <tr>
                <td className="l">୪) ଦାଖଲ ତାରିଖ-</td>
                <td style={{ fontSize: '15px', fontWeight: 800 }}>{d2}</td>
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
        <span>ଏସ. ହେଚ. ଜି/ ଏସ ଏମ ସି ସଭାପତିଙ୍କ ସ୍ୱାକ୍ଷର ଓ ମୋହର</span>
        <span>ଏସ. ହେଚ. ଜି/ ଏସ ଏମ ସି ସଭ୍ୟ/ ସଭ୍ୟାଙ୍କ ସ୍ୱାକ୍ଷର</span>
        <span style={{ alignSelf: 'flex-end' }}>
          ପ୍ରଧାନ ଶିକ୍ଷକଙ୍କ ସ୍ୱାକ୍ଷର ଓ ମୋହର
        </span>
      </div>
    </div>
  );
};
