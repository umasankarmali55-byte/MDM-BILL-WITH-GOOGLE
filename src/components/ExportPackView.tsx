import React, { useEffect } from 'react';
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
  useEffect(() => {
    const handleAfterPrint = () => {
      onDone();
    };
    window.addEventListener('afterprint', handleAfterPrint, { once: true });
    const timer = setTimeout(() => {
      window.print();
    }, 250);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onDone]);

  return (
    <div className="bg-white min-h-screen p-0">
      <div className="no-print fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium">
        <span>Preparing PDF export pack...</span>
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
