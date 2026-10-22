'use client';

import React from 'react';
import { ScanText, ShieldCheck, FileSpreadsheet, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  onOpenSampleModal?: () => void;
}

export function Header({ onReset, onOpenSampleModal }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Zone 1: Single Brand Wordmark */}
      <div 
        onClick={onReset}
        className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
      >
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
          <ScanText className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
            VietOCR ScanDoc
          </span>
          <span className="text-[11px] font-medium text-slate-500 mt-0.5">
            Offline 100% · CamScanner Engine
          </span>
        </div>
      </div>

      {/* Zone 2: 4 Clean Single-Line Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a 
          href="#nhap-lieu" 
          className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
        >
          Nhập liệu thông minh
        </a>
        <a 
          href="#cam-scanner" 
          className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
        >
          Cắt cúp & Bộ lọc
        </a>
        <a 
          href="#bang-so-hoa" 
          className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
        >
          Bảng số hóa
        </a>
        <a 
          href="#xuat-file" 
          className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
        >
          Xuất Excel & Word
        </a>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenSampleModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Tài liệu mẫu 1-Click
        </button>
      </div>
    </header>
  );
}
