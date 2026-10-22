'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DocumentUploader } from '@/components/upload/DocumentUploader';
import { SampleDocumentSelector } from '@/components/samples/SampleDocumentSelector';
import { CamScannerCropper } from '@/components/cam-scanner/CamScannerCropper';
import { EditableReviewTable } from '@/components/review/EditableReviewTable';
import { SAMPLE_DOCUMENTS, SampleDocPreset } from '@/lib/sample-documents';
import { runOcrRecognition } from '@/lib/ocr-service';
import { parseInvoiceWithBoundingBoxes } from '@/lib/table-parser';
import { InvoiceDocument, RecognizedWord } from '@/types/ocr';
import {
  FileCheck,
  ShieldCheck,
  Table as TableIcon,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  ArrowRight,
  ScanText,
} from 'lucide-react';

export default function HomePage() {
  // Current document source (dataUrl)
  const [currentImageSource, setCurrentImageSource] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<{ status: string; progress: number }>({
    status: 'Sẵn sàng',
    progress: 0,
  });

  // Processed results
  const [processedPreview, setProcessedPreview] = useState<string>('');
  const [recognizedWords, setRecognizedWords] = useState<RecognizedWord[]>([]);
  const [documentData, setDocumentData] = useState<InvoiceDocument | null>(null);

  // Sample modal open/close
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  // Active step in workflow
  const [activeStep, setActiveStep] = useState<'upload_and_crop' | 'review'>('upload_and_crop');

  // Load first sample document automatically on mount for instant user gratification
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstSample = SAMPLE_DOCUMENTS[0];
      if (firstSample) {
        const dataUrl = firstSample.generateDataUrl();
        setCurrentImageSource(dataUrl);
        setCurrentFileName(`${firstSample.name}.png`);
        setSelectedSampleId(firstSample.id);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle selecting a sample document
  const handleSelectSample = (preset: SampleDocPreset) => {
    const dataUrl = preset.generateDataUrl();
    setCurrentImageSource(dataUrl);
    setCurrentFileName(`${preset.name}.png`);
    setSelectedSampleId(preset.id);
    setDocumentData(null);
    setProcessedPreview('');
    setRecognizedWords([]);
    setActiveStep('upload_and_crop');
    setIsSampleModalOpen(false);
  };

  // Handle uploaded image or PDF page
  const handleImageUploaded = (dataUrl: string, fileName: string) => {
    setCurrentImageSource(dataUrl);
    setCurrentFileName(fileName);
    setSelectedSampleId('');
    setDocumentData(null);
    setProcessedPreview('');
    setRecognizedWords([]);
    setActiveStep('upload_and_crop');
  };

  // Run OCR on the cropped & filtered canvas
  const handleProceedToOcr = async (
    processedCanvas: HTMLCanvasElement,
    processedDataUrl: string
  ) => {
    try {
      setIsProcessing(true);
      setProcessedPreview(processedDataUrl);
      setOcrProgress({ status: 'Bắt đầu nhận diện...', progress: 5 });

      // Run Tesseract offline worker
      const ocrResult = await runOcrRecognition(processedCanvas, (update) => {
        setOcrProgress(update);
      });

      setRecognizedWords(ocrResult.words);

      // Algorithmic table and bounding box parsing
      const parsedDoc = parseInvoiceWithBoundingBoxes(
        ocrResult.lines,
        ocrResult.words,
        ocrResult.text
      );

      setDocumentData(parsedDoc);
      setActiveStep('review');
    } catch (err) {
      console.error('Lỗi quá trình OCR:', err);
      alert(
        'Đã xảy ra sự cố trong quá trình nhận dạng: ' +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToUpload = () => {
    setActiveStep('upload_and_crop');
    setDocumentData(null);
    setProcessedPreview('');
    setRecognizedWords([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Header Contract */}
      <Header
        onReset={() => {
          setActiveStep('upload_and_crop');
          setDocumentData(null);
        }}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Ứng dụng Trích xuất OCR CamScanner Offline</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">Mô hình cục bộ vie.traineddata</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Số Hóa Hóa Đơn & Phiếu Kho Tức Thì
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
                Tự động bóc tách cấu trúc bảng biểu chứng từ tiếng Việt theo phong cách CamScanner,
                chỉnh sửa trực tiếp số liệu và xuất file Excel (.xlsx) cùng Word (.docx) chuẩn A4.
              </p>
            </div>

            {/* Quick KPI Strip / Trust Markers */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                <span className="block font-bold text-slate-900">100% Offline</span>
                <span className="text-[11px] text-slate-500">Bảo mật nội bộ tuyệt đối</span>
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                <span className="block font-bold text-emerald-700">6 Cột Chuẩn</span>
                <span className="text-[11px] text-slate-500">STT, Tên, ĐVT, SL, Giá, Tiền</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex items-center border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveStep('upload_and_crop')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeStep === 'upload_and_crop'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold">
              1
            </span>
            <span>Nhập liệu & Cắt ảnh CamScanner</span>
          </button>

          <button
            onClick={() => {
              if (documentData) setActiveStep('review');
            }}
            disabled={!documentData}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeStep === 'review'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : documentData
                ? 'border-transparent text-slate-500 hover:text-slate-800'
                : 'border-transparent text-slate-300 cursor-not-allowed'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>Bảng số hóa & Xuất file ({documentData ? `${documentData.items.length} mục` : 'Chưa quét'})</span>
          </button>
        </div>

        {/* WORKSPACE VIEW 1: Upload & CamScanner Crop */}
        {activeStep === 'upload_and_crop' && (
          <div className="space-y-6">
            {/* Top row: Sample Document Presets */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <SampleDocumentSelector
                onSelectSample={handleSelectSample}
                selectedId={selectedSampleId}
              />
            </div>

            {/* Document Uploader Zone */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tải Lên File Của Bạn (Tùy Chọn)
                </h3>
                {currentFileName && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Đang chọn: {currentFileName}
                  </span>
                )}
              </div>
              <DocumentUploader
                onImageSelected={handleImageUploaded}
                isProcessing={isProcessing}
              />
            </div>

            {/* CamScanner Interactive Cropping Studio */}
            {currentImageSource && (
              <div id="cam-scanner" className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScanText className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Khung Cắt Cúp & Bộ Lọc Nâng Nét CamScanner
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Cắt bớt lề thừa và chọn bộ lọc tương phản trước khi phân tích
                  </span>
                </div>

                <CamScannerCropper
                  key={`${currentFileName}_${selectedSampleId}_${currentImageSource.slice(0, 40)}`}
                  imageSource={currentImageSource}
                  onProceedToOcr={handleProceedToOcr}
                  isProcessing={isProcessing}
                  ocrProgress={ocrProgress}
                />
              </div>
            )}
          </div>
        )}

        {/* WORKSPACE VIEW 2: Editable Review Table & Export */}
        {activeStep === 'review' && documentData && (
          <div id="bang-so-hoa" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Kết Quả Nhận Dạng OCR Bảng Biểu
                </h2>
                <p className="text-xs text-slate-500">
                  Dữ liệu đã được phân tích tọa độ bounding box thành 6 cột chuẩn. Bạn có thể sửa trực tiếp.
                </p>
              </div>

              <button
                onClick={handleResetToUpload}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Quét tài liệu khác</span>
              </button>
            </div>

            <EditableReviewTable
              documentData={documentData}
              onDocumentChange={setDocumentData}
              processedImagePreview={processedPreview || currentImageSource}
              recognizedWords={recognizedWords}
            />
          </div>
        )}

        {/* Feature Explanations & Mechanism Adjacency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-slate-200 text-xs">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Chạy Offline 100% Trong Trình Duyệt
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Tesseract.js và thư viện mô hình tiếng Việt `vie.traineddata` được đóng gói hoàn toàn
              trong máy chủ cục bộ, không gửi bất kỳ ảnh hóa đơn hay số liệu tài chính nào ra ngoài.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 mb-2.5">
              <TableIcon className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Thuật Toán Bounding Box Tách Bảng
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Nhận diện tọa độ từng từ (Word BBoxes), tự động nhóm dòng và chiếu hoành độ vào 6 cột
              (STT, Tên hàng, ĐVT, Số lượng, Đơn giá, Thành tiền) tách biệt với Header.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 mb-2.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Xuất Chuẩn Excel & Word A4
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Tải về tức thì bảng kê Excel (.xlsx) với định dạng số và tệp Word (.docx) khổ dọc Portrait
              chuẩn A4 có Quốc hiệu, bảng kẻ viền và 4 vị trí chữ ký kế toán.
            </p>
          </div>
        </div>
      </main>

      {/* Modal Quick Pick Samples if clicked from Header */}
      {isSampleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Chọn Tài Liệu Kế Toán Mẫu Để Thử Nghiệm
              </h3>
              <button
                onClick={() => setIsSampleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <SampleDocumentSelector
              onSelectSample={handleSelectSample}
              selectedId={selectedSampleId}
            />

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsSampleModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <span>VietOCR ScanDoc · Hệ thống trích xuất OCR Hóa đơn & Phiếu kho Offline 100%</span>
      </footer>
    </div>
  );
}
