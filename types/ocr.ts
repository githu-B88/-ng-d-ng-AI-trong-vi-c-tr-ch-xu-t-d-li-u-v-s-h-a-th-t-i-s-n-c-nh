export interface InvoiceItemRow {
  id: string;
  stt: number | string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  confidence?: number;
}

export interface InvoiceHeader {
  documentType: 'hoa_don_gtgt' | 'phieu_xuat_kho' | 'phieu_nhap_kho' | 'hoa_don_ban_hang';
  invoiceNo: string;
  invoiceDate: string;
  sellerName: string;
  sellerTaxCode: string;
  sellerAddress: string;
  buyerName: string;
  buyerTaxCode: string;
  buyerAddress: string;
  warehouseName?: string;
  reason?: string;
}

export interface InvoiceDocument {
  header: InvoiceHeader;
  items: InvoiceItemRow[];
  vatRate: number; // e.g. 8 or 10 or 0
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  totalInWords?: string;
  rawText?: string;
}

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface RecognizedWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface RecognizedLine {
  text: string;
  words: RecognizedWord[];
  bbox: BoundingBox;
  confidence: number;
}

export interface ImageFilterOptions {
  rotate: number; // 0, 90, 180, 270
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  mode: 'original' | 'magic' | 'bw' | 'high_contrast';
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
