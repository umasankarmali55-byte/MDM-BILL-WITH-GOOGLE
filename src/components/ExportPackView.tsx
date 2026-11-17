import React, { useEffect, useRef, useState } from 'react';
import { FileDown, Loader2, Printer } from 'lucide-react';
import { MDMState } from '../types/mdm';
import {
  Form15PrimarySheet,
  LaddooForm15PrimarySheet,
  LaddooReportSheet,
  MDCFPage1Sheet,
  MDCFPage2Sheet,
  PMPoshanReportSheet,
} from './reports/PrimaryReports';
import {
  Form15SecondarySheet,
  LaddooForm15SecondarySheet,
  SecondaryReportSheet,
} from './reports/SecondaryReports';
import {
  FuelGroceryVegReceiptSheet,
  LaddooCookWageReceiptSheet,
  LaddooIngredientsReceiptSheet,
} from './reports/VouchersView';
import { AbstractView } from './AbstractView';
import { applyA4PrintFit, clearA4PrintFit } from '../utils/printFit';
import { downloadSheetsAsPdf } from '../utils/pdfExport';

export type ExportPackType = 'primary' | 'secondary' | 'vouchers' | 'sec_vouchers';

interface ExportPackViewProps {
  pack: ExportPackType;
  state: MDMState;
  onDone: () => void;
}

export const ExportPackView: React.FC<ExportPackViewProps> = ({
  pack,
  state,
  onDone,
}) => {
  const packRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handleAfterPrint = () => {
      clearA4PrintFit();
      onDone();
    };
    window.addEventListener('beforeprint', applyA4PrintFit);
    window.addEventListener('afterprint', handleAfterPrint, { once: true });
    const timer = setTimeout(() => {
      applyA4PrintFit();
      window.print();
    }, 250);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeprint', applyA4PrintFit);
      window.removeEventListener('afterprint', handleAfterPrint);
      clearA4PrintFit();
    };
  }, [onDone]);

  const handleDownloadPackPdf = async () => {
    if (!packRef.current || downloading) return;
    setDownloading(true);
    try {
      await downloadSheetsAsPdf(`MDM_${pack}_${state.cur}.pdf`, packRef.current);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div ref={packRef} className="bg-white min-h-screen p-0">
      <div className="no-print fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium">
        <span>Preparing PDF export pack...</span>
        <button
          type="button"
          disabled={downloading}
          onClick={handleDownloadPackPdf}
          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-xs font-semibold inline-flex items-center gap-1.5"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileDown className="w-3.5 h-3.5" />
          )}
          <span>{downloading ? 'Saving...' : 'Download PDF'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            applyA4PrintFit();
            window.print();
          }}
          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold inline-flex items-center gap-1"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs font-semibold"
        >
          Return to app
        </button>
      </div>

      {pack === 'primary' && (
        <>
          <div className="exp-page">
            <PMPoshanReportSheet state={state} />
          </div>
          <div className="exp-page">
            <Form15PrimarySheet state={state} />
          </div>
          <div className="exp-page">
            <LaddooReportSheet state={state} />
          </div>
          <div className="exp-page">
            <LaddooForm15PrimarySheet state={state} />
          </div>
          <div className="exp-page">
            <MDCFPage1Sheet state={state} />
          </div>
          <div className="exp-page">
            <MDCFPage2Sheet state={state} />
          </div>
          <div className="exp-page">
            <AbstractView state={state} />
          </div>
        </>
      )}

      {pack === 'secondary' && (
        <>
          <div className="exp-page">
            <Form15SecondarySheet state={state} />
          </div>
          <div className="exp-page">
            <SecondaryReportSheet state={state} />
          </div>
          <div className="exp-page">
            <LaddooForm15SecondarySheet state={state} />
          </div>
          <div className="exp-page">
            <LaddooReportSheet state={state} secondary />
          </div>
          <div className="exp-page">
            <AbstractView state={state} secondary />
          </div>
        </>
      )}

      {pack === 'vouchers' && (
        <>
          <div className="exp-page">
            <FuelGroceryVegReceiptSheet state={state} />
          </div>
          <div className="exp-page">
            <LaddooIngredientsReceiptSheet state={state} />
          </div>
          <div className="exp-page">
            <LaddooCookWageReceiptSheet state={state} />
          </div>
        </>
      )}

      {pack === 'sec_vouchers' && (
        <>
          <div className="exp-page">
            <FuelGroceryVegReceiptSheet state={state} secondary />
          </div>
          <div className="exp-page">
            <LaddooIngredientsReceiptSheet state={state} secondary />
          </div>
          <div className="exp-page">
            <LaddooCookWageReceiptSheet state={state} secondary />
          </div>
        </>
      )}
    </div>
  );
};
