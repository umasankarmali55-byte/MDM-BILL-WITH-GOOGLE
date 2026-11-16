import React, { useState } from 'react';
import { Download, Smartphone, X, PackageCheck, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
        title="Install MDM Billing as a standalone offline app"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isIOS
                      ? 'Install on iPhone / iPad'
                      : 'Install MDM Billing App'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Works offline on desktop &amp; mobile
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close install instructions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 rounded-lg p-3.5 border border-slate-200 dark:border-slate-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    1.
                  </span>
                  <span>
                    Tap the{' '}
                    <strong className="inline-flex items-center gap-1">
                      Share <Share className="w-3.5 h-3.5 inline" />
                    </strong>{' '}
                    button in the Safari toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    2.
                  </span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    3.
                  </span>
                  <span>
                    Tap <strong>Add</strong> in the top-right corner to launch
                    as a standalone app.
                  </span>
                </li>
              </ol>
            ) : (
              <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-3.5 space-y-1.5">
                  <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                    Browser Install (Chrome / Edge / Android):
                  </p>
                  <p>
                    1. Open the app URL directly in its own browser tab (outside
                    embedded preview).
                  </p>
                  <p>
                    2. Click the <strong>Install</strong> icon in the browser
                    address bar, or open browser menu <strong>⋮ → Install
                    MDM Billing</strong>.
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 space-y-2">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Self-Host / Offline Package:
                  </p>
                  <p>
                    Download the complete PWA ZIP (ready-to-deploy production
                    build + full source code).
                  </p>
                  <a
                    href="/mdm-pwa-app.zip"
                    download="mdm-pwa-app.zip"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Complete PWA ZIP</span>
                  </a>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full rounded-lg bg-slate-100 dark:bg-slate-800 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
