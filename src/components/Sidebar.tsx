import React from 'react';
import {
  CalendarDays,
  SlidersHorizontal,
  Building2,
  FileText,
  FileSpreadsheet,
  Award,
  Receipt,
  ClipboardList,
  X,
} from 'lucide-react';
import { TabId } from '../types/mdm';

interface NavGroup {
  title: string;
  titleColor: string;
  activeBg: string;
  iconColor: string;
  hoverBg: string;
  items: { id: TabId; label: string; icon: React.ReactNode }[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Setup & Entry',
    titleColor: 'text-sky-700 dark:text-sky-400',
    activeBg: 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-sm',
    iconColor: 'text-sky-600 dark:text-sky-400',
    hoverBg: 'hover:bg-sky-50 dark:hover:bg-sky-950/50',
    items: [
      { id: 1, label: 'Daily Attendance', icon: <CalendarDays className="w-4 h-4 shrink-0" /> },
      { id: 0, label: 'Norms & Menu', icon: <SlidersHorizontal className="w-4 h-4 shrink-0" /> },
      { id: 4, label: 'School & Staff Details', icon: <Building2 className="w-4 h-4 shrink-0" /> },
    ],
  },
  {
    title: 'Primary Reports (SB–VIII)',
    titleColor: 'text-indigo-700 dark:text-indigo-400',
    activeBg: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/50',
    items: [
      { id: 3, label: '1. PM POSHAN Report', icon: <FileText className="w-4 h-4 shrink-0" /> },
      { id: 2, label: '2. Form-15 (Odia)', icon: <FileText className="w-4 h-4 shrink-0" /> },
      { id: 5, label: '3. Laddoo Report', icon: <Award className="w-4 h-4 shrink-0" /> },
      { id: 6, label: '4. Laddoo Form-15', icon: <Award className="w-4 h-4 shrink-0" /> },
      { id: 8, label: '5. MDCF Report', icon: <ClipboardList className="w-4 h-4 shrink-0" /> },
      { id: 9, label: '6. MDCF Page 2', icon: <ClipboardList className="w-4 h-4 shrink-0" /> },
    ],
  },
  {
    title: 'Secondary (Class 9–10)',
    titleColor: 'text-violet-700 dark:text-violet-400',
    activeBg: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm',
    iconColor: 'text-violet-600 dark:text-violet-400',
    hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-950/50',
    items: [
      { id: 11, label: 'Secondary Report', icon: <FileText className="w-4 h-4 shrink-0" /> },
      { id: 10, label: 'Form-15 Secondary', icon: <FileText className="w-4 h-4 shrink-0" /> },
      { id: 14, label: 'Laddoo Report Sec.', icon: <Award className="w-4 h-4 shrink-0" /> },
      { id: 13, label: 'Laddoo Form-15 Sec.', icon: <Award className="w-4 h-4 shrink-0" /> },
    ],
  },
  {
    title: 'Abstract Sheets',
    titleColor: 'text-emerald-700 dark:text-emerald-400',
    activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50',
    items: [
      { id: 7, label: 'Abstract (Primary)', icon: <FileSpreadsheet className="w-4 h-4 shrink-0" /> },
      { id: 12, label: 'Abstract (Secondary)', icon: <FileSpreadsheet className="w-4 h-4 shrink-0" /> },
    ],
  },
  {
    title: 'Vouchers (Primary)',
    titleColor: 'text-amber-700 dark:text-amber-400',
    activeBg: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm',
    iconColor: 'text-amber-600 dark:text-amber-400',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/50',
    items: [
      { id: 15, label: 'Fuel, Grocery & Veg', icon: <Receipt className="w-4 h-4 shrink-0" /> },
      { id: 16, label: 'Laddoo Ingredients', icon: <Receipt className="w-4 h-4 shrink-0" /> },
      { id: 17, label: 'Laddoo Cook Wage', icon: <Receipt className="w-4 h-4 shrink-0" /> },
    ],
  },
  {
    title: 'Secondary Vouchers',
    titleColor: 'text-rose-700 dark:text-rose-400',
    activeBg: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm',
    iconColor: 'text-rose-600 dark:text-rose-400',
    hoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-950/50',
    items: [
      { id: 18, label: 'Sec. Fuel, Grocery & Veg', icon: <Receipt className="w-4 h-4 shrink-0" /> },
      { id: 19, label: 'Sec. Laddoo Ingredients', icon: <Receipt className="w-4 h-4 shrink-0" /> },
      { id: 20, label: 'Sec. Cook Wage', icon: <Receipt className="w-4 h-4 shrink-0" /> },
    ],
  },
];

export const TAB_TITLES: Record<TabId, string> = {
  0: 'Norms & Weekly Menu',
  1: 'Daily Attendance',
  2: 'Form-15 (Odia)',
  3: 'PM POSHAN Report',
  4: 'School & Staff Details',
  5: 'Laddoo Report',
  6: 'Laddoo Form-15',
  7: 'Abstract Sheet (Primary)',
  8: 'MDCF Report (Page 1)',
  9: 'MDCF Page 2',
  10: 'Form-15 Secondary (Odia)',
  11: 'Secondary Report',
  12: 'Abstract Sheet (Secondary)',
  13: 'Laddoo Form-15 Secondary',
  14: 'Laddoo Report Secondary',
  15: 'Receipts: Fuel, Grocery, Veg',
  16: 'Laddoo Ingredients Receipt',
  17: 'Laddoo Cook Wage Receipt',
  18: 'Secondary Receipts: Fuel, Grocery, Veg',
  19: 'Secondary Laddoo Ingredients Receipt',
  20: 'Secondary Laddoo Cook Wage Receipt',
};

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  schoolName: string;
  monthLabel: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  schoolName,
  monthLabel,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleSelect = (id: TabId) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800">
      <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-600 text-white flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-bold text-sm tracking-tight text-white truncate">
            PM POSHAN Ledger
          </div>
          <div className="text-xs text-sky-100 truncate mt-0.5">
            {schoolName} · {monthLabel}
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-md text-white/90 hover:bg-white/15"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className={`px-2.5 mb-1.5 text-xs font-bold tracking-tight ${group.titleColor}`}>
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-all text-left whitespace-nowrap ${
                      isActive
                        ? group.activeBg
                        : `text-slate-700 dark:text-slate-300 ${group.hoverBg} hover:text-slate-900 dark:hover:text-white`
                    }`}
                  >
                    <span className={isActive ? 'text-white' : group.iconColor}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 no-print h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden no-print flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-[272px] max-w-[85vw] h-full z-10 shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
