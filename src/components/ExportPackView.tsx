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

const PACK_LABELS: Record<ExportPackType, string> = {
  primary: 'Primary Export Pack (7 sheets)',
  secondary: 'Secondary Export Pack (5 sheets)',
  vouchers: 'Primary Vouchers Pack (3 sheets)',
  sec_vouchers: 'Secondary Vouchers Pack (3 sheets)',
};

export const ExportPackView: React.FC<ExportPackViewProps> = ({
  pack,
  state,
  onDone,
}) => {
  const packRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeprint', applyA4PrintFit);
    window.addEventListener('afterprint', clearA4PrintFit);
    return () => {
      window.removeEventListener('beforeprint', applyA4PrintFit);
      window.removeEventListener('afterprint', clearA4PrintFit);
      clearA4PrintFit();
    };
  }, []);

  const handleDownloadPackPdf = async () => {
    if (!packRef.current || downloading) return;
    setDownloading(true);
    try {
      await downloadSheetsAsPdf(`MDM_${pack}_${state.cur}.pdf`, packRef.current);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintPack = () => {
    applyA4PrintFit();
    setTimeout(() => window.print(), 20);
  };

  return (
    <div
      ref={packRef}
      className="print-pack-root bg-slate-100 dark:bg-slate-950 min-h-screen py-6 px-4 space-y-6 overflow-x-auto"
    >
      <div className="no-print sticky top-3 z-50 max-w-[794px] mx-auto bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-lg shadow-xl flex flex-wrap items-center justify-between gap-2.5 text-sm font-medium">
        <span className="font-semibold text-slate-100">
          {PACK_LABELS[pack]}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPackPdf}
            className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{downloading ? 'Saving PDF...' : 'Download PDF'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrintPack}
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            type="button"
            onClick={onDone}
            className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-xs font-semibold"
          >
            Return to app
          </button>
        </div>
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
