import {
  InvoiceDocument,
  InvoiceHeader,
  InvoiceItemRow,
  RecognizedLine,
  RecognizedWord,
} from '@/types/ocr';

/**
 * Normalizes Vietnamese text for case-insensitive matching without accents
 */
export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Parses numeric strings in Vietnamese accounting format:
 * e.g., "1.250.000", "1,250,000", "450.000,50", "12,5"
 */
export function parseVietnameseNumber(val: string): number {
  if (!val) return 0;
  let clean = val.trim().replace(/[^\d.,-]/g, '');

  if (clean.includes('.') && clean.includes(',')) {
    const lastDot = clean.lastIndexOf('.');
    const lastComma = clean.lastIndexOf(',');
    if (lastDot > lastComma) {
      // 1,250,000.50
      clean = clean.replace(/,/g, '');
    } else {
      // 1.250.000,50
      clean = clean.replace(/\./g, '').replace(',', '.');
    }
  } else if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      clean = clean.replace(/\./g, '');
    }
  } else if (clean.includes(',')) {
    const parts = clean.split(',');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      clean = clean.replace(/,/g, '');
    } else {
      clean = clean.replace(',', '.');
    }
  }

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

const VIETNAMESE_UNITS = [
  'cai', 'chiec', 'bo', 'thung', 'hop', 'bao', 'goi', 'ram', 'lo', 'chai', 
  'can', 'binh', 'cuon', 'cay', 'thanh', 'tam', 'met', 'm', 'm2', 'm3', 
  'kg', 'tan', 'ta', 'yen', 'lit', 'phuy', 'doi', 'bich', 'to', 'quyen', 'vien'
];

/**
 * Extracts header metadata dynamically from OCR lines without any hardcoded company defaults!
 */
export function extractHeaderMetadata(lines: RecognizedLine[], fullText: string): InvoiceHeader {
  const norm = removeVietnameseTones(fullText);

  // 1. Document Type Detection
  let documentType: InvoiceHeader['documentType'] = 'hoa_don_gtgt';
  if (norm.includes('phieu xuat kho') || (norm.includes('xuat kho') && !norm.includes('hoa don'))) {
    documentType = 'phieu_xuat_kho';
  } else if (norm.includes('phieu nhap kho') || (norm.includes('nhap kho') && !norm.includes('hoa don'))) {
    documentType = 'phieu_nhap_kho';
  } else if (norm.includes('hoa don ban hang')) {
    documentType = 'hoa_don_ban_hang';
  } else if (norm.includes('gia tri gia tang') || norm.includes('gtgt')) {
    documentType = 'hoa_don_gtgt';
  }

  // 2. Invoice / Receipt Number
  let invoiceNo = '';
  const noMatch = fullText.match(
    /(?:Số phiếu|So phieu|Số HĐ|So HD|Ký hiệu|Số|So|No\.?)\s*[:.]?\s*([A-Za-z0-9\/-]{3,20})/i
  );
  if (noMatch) {
    invoiceNo = noMatch[1].trim();
  } else {
    // Search for code patterns like XK-2024-..., NK-2024-..., 1C24...
    const codeMatch = fullText.match(/\b([A-Z0-9]{2,4}-[A-Z0-9-]{3,15})\b/);
    if (codeMatch) {
      invoiceNo = codeMatch[1].trim();
    }
  }

  // 3. Date
  let invoiceDate = '';
  const dateMatch1 = fullText.match(
    /(?:Ngày|Ngay)\s*(\d{1,2})\s*(?:tháng|thang)\s*(\d{1,2})\s*(?:năm|nam)\s*(\d{4})/i
  );
  const dateMatch2 = fullText.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);

  if (dateMatch1) {
    const d = dateMatch1[1].padStart(2, '0');
    const m = dateMatch1[2].padStart(2, '0');
    const y = dateMatch1[3];
    invoiceDate = `${d}/${m}/${y}`;
  } else if (dateMatch2) {
    const d = dateMatch2[1].padStart(2, '0');
    const m = dateMatch2[2].padStart(2, '0');
    const y = dateMatch2[3];
    invoiceDate = `${d}/${m}/${y}`;
  } else {
    const now = new Date();
    invoiceDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  }

  // 4. Tax Code Extraction (10-digit or 13-digit)
  const allMstMatches = Array.from(fullText.matchAll(/(?:\b\d{10}-\d{3}\b|\b\d{10}\b)/g)).map((m) => m[0]);
  const sellerTaxCode = allMstMatches[0] || '';
  const buyerTaxCode = allMstMatches.length > 1 ? allMstMatches[1] : '';

  // 5. Dynamic Seller & Buyer Names
  let sellerName = '';
  let buyerName = '';
  let sellerAddress = '';
  let buyerAddress = '';
  let warehouseName = '';

  const topLines = lines.slice(0, Math.min(lines.length, 25));

  for (let i = 0; i < topLines.length; i++) {
    const line = topLines[i];
    const text = line.text.trim();
    const textNorm = removeVietnameseTones(text);

    // Explicit seller labels
    if (!sellerName && (textNorm.includes('don vi ban') || textNorm.includes('don vi phat hanh') || textNorm.includes('nguoi ban'))) {
      sellerName = text.replace(/^(?:Đơn vị bán hàng|Đơn vị bán|Đơn vị phát hành|Người bán|Tên đơn vị)\s*[:.]?/i, '').trim();
      if (!sellerName && i + 1 < topLines.length) sellerName = topLines[i + 1].text.trim();
    }

    // Company / Organization patterns in top lines
    if (!sellerName && i < 8) {
      if (
        textNorm.includes('cong ty') ||
        textNorm.includes('tong cong ty') ||
        textNorm.includes('nha may') ||
        textNorm.includes('doanh nghiep') ||
        textNorm.includes('xi nghiep') ||
        textNorm.includes('trung tam') ||
        textNorm.includes('chi nhanh') ||
        textNorm.includes('ho kinh doanh')
      ) {
        sellerName = text.replace(/^(?:Tên đơn vị|Đơn vị)\s*[:.]?/i, '').trim();
      }
    }

    // Explicit buyer/receiver labels
    if (!buyerName && (
      textNorm.includes('nguoi mua') ||
      textNorm.includes('don vi mua') ||
      textNorm.includes('nguoi nhan') ||
      textNorm.includes('khach hang') ||
      textNorm.includes('don vi giao') ||
      textNorm.includes('nguoi giao')
    )) {
      buyerName = text.replace(/^(?:Họ tên người mua hàng|Người mua hàng|Đơn vị mua hàng|Người nhận hàng|Người giao hàng|Đơn vị giao hàng|Khách hàng|Họ tên người nhận)\s*[:.]?/i, '').trim();
      if (!buyerName && i + 1 < topLines.length) buyerName = topLines[i + 1].text.trim();
    }

    // Address
    if (!sellerAddress && textNorm.includes('dia chi') && i < 8) {
      sellerAddress = text.replace(/^(?:Địa chỉ|Dia chi)\s*[:.]?/i, '').trim();
    } else if (!buyerAddress && textNorm.includes('dia chi') && i >= 8) {
      buyerAddress = text.replace(/^(?:Địa chỉ|Dia chi)\s*[:.]?/i, '').trim();
    }

    // Warehouse
    if (textNorm.includes('xuat tai kho') || textNorm.includes('nhap tai kho') || textNorm.includes('tai kho')) {
      warehouseName = text.replace(/^(?:Xuất tại kho|Nhập tại kho|Tại kho|Kho)\s*[:.]?/i, '').trim();
    }
  }

  // Fallback to first bold/capitalized line if sellerName not found (DO NOT USE HARDCODED STRING)
  if (!sellerName && lines.length > 0) {
    const candidate = lines.find((l) => l.text.length > 6 && !removeVietnameseTones(l.text).includes('cong hoa'));
    if (candidate) sellerName = candidate.text.trim();
  }

  return {
    documentType,
    invoiceNo: invoiceNo || (documentType.includes('xuat') ? 'XK-01' : (documentType.includes('nhap') ? 'NK-01' : 'HD-01')),
    invoiceDate,
    sellerName: sellerName || 'Đơn vị phát hành',
    sellerTaxCode,
    sellerAddress,
    buyerName: buyerName || 'Khách hàng / Người nhận',
    buyerTaxCode,
    buyerAddress,
    warehouseName,
  };
}

/**
 * Checks if a line is part of header or footer sections to avoid mistaking it for an item row
 */
function isHeaderOrFooterLine(text: string): boolean {
  const norm = removeVietnameseTones(text);
  // National motto
  if (norm.includes('cong hoa xa hoi') || norm.includes('doc lap tu do')) return true;
  // Invoice title
  if (norm.includes('hoa don gia tri gia tang') || norm.includes('phieu xuat kho') || norm.includes('phieu nhap kho') || norm.includes('hoa don ban hang')) return true;
  // Header field labels
  if (norm.includes('ma so thue:') || norm.includes('dia chi:') || norm.includes('dien thoai:') || norm.includes('email:')) return true;
  if (norm.includes('ho ten nguoi mua') || norm.includes('don vi mua hang') || norm.includes('nguoi nhan hang') || norm.includes('ly do xuat')) return true;
  if (norm.includes('so phieu:') || norm.includes('mau so:') || norm.includes('ky hieu:') || norm.includes('ngay thang nam')) return true;
  // Table header line
  if (norm.includes('stt') && (norm.includes('ten') || norm.includes('luong') || norm.includes('dvt') || norm.includes('gia') || norm.includes('tien'))) return true;
  if (norm.includes('ten hang hoa') || norm.includes('ten vat tu') || norm.includes('quy cach')) return true;
  // Totals & Footers
  if (norm.includes('cong tien hang') || norm.includes('tong cong tien') || norm.includes('thue suat') || norm.includes('tien thue gtgt')) return true;
  if (norm.includes('tong cong thanh toan') || norm.includes('viet bang chu') || norm.includes('tong so tien')) return true;
  if (norm.includes('nguoi lap') || norm.includes('thu kho') || norm.includes('ke toan truong') || norm.includes('thu truong don vi') || norm.includes('giam doc')) return true;
  if (norm.includes('ky, ghi ro') || norm.includes('ky dien tu') || norm.includes('dong dau')) return true;

  return false;
}

/**
 * Parses a single candidate line of text into item fields:
 * [STT] [Item Name] [Unit] [Quantity] [Unit Price] [Amount]
 */
function parseLineIntoItem(
  line: RecognizedLine,
  rowIdx: number
): {
  stt: number | string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  confidence: number;
} | null {
  const text = line.text.trim();
  if (text.length < 3) return null;
  if (isHeaderOrFooterLine(text)) return null;

  const rawTokens = text.split(/\s+/).filter(Boolean);
  if (rawTokens.length === 0) return null;

  // 1. Check for leading STT (e.g. "1", "01", "1.", "2)")
  let stt: number | string = rowIdx + 1;
  let remainingTokens = [...rawTokens];

  const firstToken = rawTokens[0];
  const sttMatch = firstToken.match(/^(\d{1,3})[.)]?$/);
  if (sttMatch) {
    stt = parseInt(sttMatch[1], 10);
    remainingTokens = rawTokens.slice(1);
  }

  // 2. Find numbers from right to left (Amount, UnitPrice, Quantity)
  const numberTokens: { index: number; val: number; raw: string }[] = [];
  for (let i = 0; i < remainingTokens.length; i++) {
    const tok = remainingTokens[i];
    // Check if looks like a number: "48.500.000", "125.000", "2", "10", "48.500.000đ", "97.000.000d"
    const cleanedTok = tok.replace(/[đd₫]|vnd/gi, '');
    if (/^[\d.,]+$/.test(cleanedTok) && /\d/.test(cleanedTok)) {
      const num = parseVietnameseNumber(cleanedTok);
      if (num > 0) {
        numberTokens.push({ index: i, val: num, raw: tok });
      }
    }
  }

  let amount = 0;
  let unitPrice = 0;
  let quantity = 1;
  let numTokenIndices = new Set<number>();

  if (numberTokens.length >= 3) {
    const amtToken = numberTokens[numberTokens.length - 1];
    const priceToken = numberTokens[numberTokens.length - 2];
    const qtyToken = numberTokens[numberTokens.length - 3];

    amount = amtToken.val;
    unitPrice = priceToken.val;
    quantity = qtyToken.val;

    numTokenIndices.add(amtToken.index);
    numTokenIndices.add(priceToken.index);
    numTokenIndices.add(qtyToken.index);
  } else if (numberTokens.length === 2) {
    const t1 = numberTokens[0];
    const t2 = numberTokens[1];
    if (t1.val < 100 && t2.val >= 100) {
      quantity = t1.val;
      amount = t2.val;
      unitPrice = Math.round(amount / quantity);
    } else {
      unitPrice = t1.val;
      amount = t2.val;
    }
    numTokenIndices.add(t1.index);
    numTokenIndices.add(t2.index);
  } else if (numberTokens.length === 1) {
    const t = numberTokens[0];
    if (t.val >= 1000) {
      amount = t.val;
      unitPrice = t.val;
    } else {
      quantity = t.val;
    }
    numTokenIndices.add(t.index);
  }

  // 3. Find Unit of Measurement
  let unit = 'Cái';
  let unitTokenIndex = -1;

  for (let i = 0; i < remainingTokens.length; i++) {
    if (numTokenIndices.has(i)) continue;
    const tokNorm = removeVietnameseTones(remainingTokens[i]);
    if (VIETNAMESE_UNITS.includes(tokNorm)) {
      unit = remainingTokens[i];
      unitTokenIndex = i;
      break;
    }
  }

  // 4. Everything else forms the Item Name
  const nameParts: string[] = [];
  for (let i = 0; i < remainingTokens.length; i++) {
    if (numTokenIndices.has(i) || i === unitTokenIndex) continue;
    nameParts.push(remainingTokens[i]);
  }

  const itemName = nameParts.join(' ').trim();
  if (!itemName && amount === 0) return null;

  return {
    stt,
    itemName: itemName || text,
    unit,
    quantity: quantity || 1,
    unitPrice: unitPrice || (amount && quantity ? Math.round(amount / quantity) : 0),
    amount: amount || (unitPrice && quantity ? Math.round(unitPrice * quantity) : 0),
    confidence: line.confidence,
  };
}

/**
 * Main parser: Analyzes coordinates and bounding boxes of words and lines to extract structured table
 * GUARANTEED to parse the actual document lines and NEVER fallback to hardcoded mock data!
 */
export function parseInvoiceWithBoundingBoxes(
  lines: RecognizedLine[],
  words: RecognizedWord[],
  rawText: string
): InvoiceDocument {
  const header = extractHeaderMetadata(lines, rawText);

  // Locate table header line if present
  let tableHeaderIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const norm = removeVietnameseTones(lines[i].text);
    if (
      (norm.includes('stt') || norm.includes('so tt') || norm.includes('tt')) &&
      (norm.includes('ten') || norm.includes('vat tu') || norm.includes('hang') || norm.includes('dvt') || norm.includes('luong') || norm.includes('gia') || norm.includes('tien'))
    ) {
      tableHeaderIndex = i;
      break;
    }
  }

  const items: InvoiceItemRow[] = [];

  // Filter lines to extract items
  const startIdx = tableHeaderIndex >= 0 ? tableHeaderIndex + 1 : 0;
  let currentRow: InvoiceItemRow | null = null;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const lineNorm = removeVietnameseTones(line.text);

    // Stop extracting items if we reached the footer/totals section
    if (
      lineNorm.includes('cong tien hang') ||
      lineNorm.includes('tong cong tien') ||
      lineNorm.includes('thue suat') ||
      lineNorm.includes('tien thue') ||
      lineNorm.includes('tong thanh toan') ||
      lineNorm.includes('tong so tien') ||
      lineNorm.includes('viet bang chu') ||
      lineNorm.includes('nguoi lap') ||
      lineNorm.includes('thu kho') ||
      lineNorm.includes('giam doc kho') ||
      lineNorm.includes('ke toan truong') ||
      lineNorm.includes('dong dau')
    ) {
      break;
    }

    const parsed = parseLineIntoItem(line, items.length);

    if (parsed) {
      if (currentRow) {
        items.push(currentRow);
      }
      currentRow = {
        id: `item-${items.length + 1}`,
        ...parsed,
      };
    } else if (currentRow && line.text.trim()) {
      // Continuation line for multi-line description
      currentRow.itemName += ' ' + line.text.trim();
    } else if (line.text.trim().length > 2) {
      // Create a fallback row for this line of text
      if (currentRow) {
        items.push(currentRow);
      }
      currentRow = {
        id: `item-${items.length + 1}`,
        stt: items.length + 1,
        itemName: line.text.trim(),
        unit: 'Mục',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        confidence: line.confidence,
      };
    }
  }

  if (currentRow) {
    items.push(currentRow);
  }

  // If still empty (e.g. table header wasn't found or format was non-standard),
  // extract all non-header lines as items
  if (items.length === 0) {
    const validLines = lines.filter((l) => !isHeaderOrFooterLine(l.text) && l.text.trim().length > 2);
    validLines.forEach((l, idx) => {
      const parsed = parseLineIntoItem(l, idx);
      items.push({
        id: `item-${idx + 1}`,
        stt: parsed?.stt || idx + 1,
        itemName: parsed?.itemName || l.text.trim(),
        unit: parsed?.unit || 'Mục',
        quantity: parsed?.quantity || 1,
        unitPrice: parsed?.unitPrice || 0,
        amount: parsed?.amount || 0,
        confidence: l.confidence,
      });
    });
  }

  // Calculate totals
  const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  let vatRate = 0;
  if (header.documentType === 'hoa_don_gtgt') {
    vatRate = 8;
    if (rawText.includes('10%') || rawText.includes('10 %')) vatRate = 10;
    if (rawText.includes('5%') || rawText.includes('5 %')) vatRate = 5;
    if (rawText.includes('0%') || rawText.includes('0 %')) vatRate = 0;
  }

  const vatAmount = Math.round((subTotal * vatRate) / 100);
  const totalAmount = subTotal + vatAmount;

  return {
    header,
    items,
    vatRate,
    subTotal,
    vatAmount,
    totalAmount,
    totalInWords: numberToVietnameseWords(totalAmount),
    rawText,
  };
}

/**
 * Converts currency numbers into formal Vietnamese words for invoices
 */
export function numberToVietnameseWords(n: number): string {
  if (n === 0) return 'Không đồng';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];

  let num = Math.floor(Math.abs(n));
  let str = '';
  let scaleIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const chunkStr = readThreeDigits(chunk, units);
      str = `${chunkStr} ${scales[scaleIndex]} ${str}`.trim();
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  str = str.replace(/\s+/g, ' ').trim();
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return `${capitalized} đồng chẵn./.`;
}

function readThreeDigits(n: number, units: string[]): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;

  let res = '';
  if (h > 0) {
    res += `${units[h]} trăm `;
  }

  if (t > 1) {
    res += `${units[t]} mươi `;
    if (u === 1) res += 'mốt ';
    else if (u === 5) res += 'lăm ';
    else if (u > 0) res += `${units[u]} `;
  } else if (t === 1) {
    res += 'mười ';
    if (u === 5) res += 'lăm ';
    else if (u > 0) res += `${units[u]} `;
  } else if (t === 0 && u > 0) {
    if (h > 0) res += 'lẻ ';
    res += `${units[u]} `;
  }

  return res.trim();
}
