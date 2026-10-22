'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, CheckCircle, AlertCircle, Layers } from 'lucide-react';
import { renderPdfToImages, PdfPagePreview } from '@/lib/pdf-service';

interface DocumentUploaderProps {
  onImageSelected: (dataUrl: string, fileName: string) => void;
  isProcessing: boolean;
}

export function DocumentUploader({
  onImageSelected,
  isProcessing,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pdfPages, setPdfPages] = useState<PdfPagePreview[]>([]);
  const [pdfFileName, setPdfFileName] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        setLoadingPdf(true);
        setPdfFileName(file.name);
        const pages = await renderPdfToImages(file);
        setPdfPages(pages);
        if (pages.length > 0) {
          // Default to first page
          onImageSelected(pages[0].dataUrl, `${file.name} - Trang 1`);
        }
      } catch (err) {
        console.error('Lỗi đọc file PDF:', err);
        alert('Không thể đọc file PDF này. Vui lòng thử file ảnh hoặc PDF khác: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoadingPdf(false);
      }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPdfPages([]);
          onImageSelected(e.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Định dạng tệp không được hỗ trợ. Vui lòng tải lên file ảnh PNG, JPG hoặc file PDF.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full space-y-3">
      {/* Drag & Drop Card */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/70'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3 shadow-xs">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Chọn hoặc kéo thả tệp hóa đơn, phiếu kho vào đây
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Hỗ trợ file PDF đa trang hoặc tệp hình ảnh (PNG, JPG, WebP)
          </p>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" /> Ảnh chụp / Scan
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> PDF Hóa đơn điện tử
            </span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold">Offline 100% bảo mật</span>
          </div>
        </div>
      </div>

      {/* PDF Page Picker if PDF contains multiple pages */}
      {pdfPages.length > 1 && (
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Tệp PDF có {pdfPages.length} trang: Chọn trang cần trích xuất OCR</span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pdfPages.map((p) => (
              <button
                key={p.pageNumber}
                onClick={() => onImageSelected(p.dataUrl, `${pdfFileName} - Trang ${p.pageNumber}`)}
                className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
              >
                Trang {p.pageNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {loadingPdf && (
        <div className="text-xs text-emerald-700 font-medium animate-pulse text-center">
          Đang kết xuất các trang PDF với độ phân giải cao 2x DPI...
        </div>
      )}
    </div>
  );
}
