/**
 * Generates realistic high-resolution canvas documents for:
 * 1. Hóa đơn Giá trị gia tăng (GTGT)
 * 2. Phiếu Xuất kho
 * 3. Phiếu Nhập kho
 * These can be loaded with 1-click for instant test and evaluation.
 */

export interface SampleDocPreset {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  generateDataUrl: () => string;
}

export const SAMPLE_DOCUMENTS: SampleDocPreset[] = [
  {
    id: 'sample-vat-invoice',
    name: 'Hóa đơn GTGT Điện tử',
    subtitle: 'Công ty Cổ phần Công nghệ & Thiết bị Số',
    badge: 'Hóa đơn VAT',
    generateDataUrl: () => createSampleVatInvoiceCanvas(),
  },
  {
    id: 'sample-export-receipt',
    name: 'Phiếu Xuất Kho Vật Tư',
    subtitle: 'Tổng Kho Cơ Khí & Thiết Bị Công Nghiệp',
    badge: 'Phiếu xuất kho',
    generateDataUrl: () => createSampleExportReceiptCanvas(),
  },
  {
    id: 'sample-import-receipt',
    name: 'Phiếu Nhập Kho Nguyên Vật Liệu',
    subtitle: 'Nhà Máy Chế Tạo & Cơ Điện Miền Bắc',
    badge: 'Phiếu nhập kho',
    generateDataUrl: () => createSampleImportReceiptCanvas(),
  },
];

function createSampleVatInvoiceCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  // Background Paper (subtle off-white)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Border
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
  ctx.strokeStyle = '#BAE6FD';
  ctx.lineWidth = 1;
  ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

  // Seller Header
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillText('CÔNG TY CỔ PHẦN CÔNG NGHỆ & THIẾT BỊ SỐ VIỆT NAM', 70, 95);

  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Mã số thuế: 0108934567', 70, 130);
  ctx.fillText('Địa chỉ: Tầng 8, Tòa nhà Thăng Long, 98 Ngụy Như Kon Tum, Thanh Xuân, Hà Nội', 70, 160);
  ctx.fillText('Điện thoại: 024.3789.6688   -   Email: ketoan@congngheso.vn', 70, 190);

  // Line Divider
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(70, 215);
  ctx.lineTo(canvas.width - 70, 215);
  ctx.stroke();

  // Document Title
  ctx.fillStyle = '#0369A1';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HÓA ĐƠN GIÁ TRỊ GIA TĂNG', canvas.width / 2, 275);

  ctx.font = 'italic 19px Arial, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Ngày 18 tháng 10 năm 2024', canvas.width / 2, 310);
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillStyle = '#BE123C';
  ctx.fillText('Mẫu số: 1/001   -   Ký hiệu: 1C24TBB   -   Số: 0048912', canvas.width / 2, 345);
  ctx.textAlign = 'left';

  // Buyer Info Box
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(70, 380, canvas.width - 140, 150);
  ctx.strokeStyle = '#CBD5E1';
  ctx.strokeRect(70, 380, canvas.width - 140, 150);

  ctx.fillStyle = '#0F172A';
  ctx.font = '19px Arial, sans-serif';
  ctx.fillText('Họ tên người mua hàng: Nguyễn Văn Tuấn (Trưởng phòng CNTT)', 90, 415);
  ctx.fillText('Tên đơn vị: CÔNG TY TNHH PHẦN MỀM & TRUYỀN THÔNG Á CHÂU', 90, 450);
  ctx.fillText('Mã số thuế: 0314567890', 90, 485);
  ctx.fillText('Địa chỉ: Số 124 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh', 90, 520);

  // Table Grid
  const startY = 560;
  const colX = [70, 140, 620, 720, 830, 970, 1130];
  const rowHeight = 52;

  // Header Row
  ctx.fillStyle = '#E0F2FE';
  ctx.fillRect(colX[0], startY, colX[6] - colX[0], rowHeight);
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(colX[0], startY, colX[6] - colX[0], rowHeight);

  ctx.fillStyle = '#0369A1';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('STT', colX[0] + 15, startY + 33);
  ctx.fillText('Tên hàng hóa, dịch vụ', colX[1] + 20, startY + 33);
  ctx.fillText('ĐVT', colX[2] + 20, startY + 33);
  ctx.fillText('Số lượng', colX[3] + 15, startY + 33);
  ctx.fillText('Đơn giá', colX[4] + 25, startY + 33);
  ctx.fillText('Thành tiền', colX[5] + 35, startY + 33);

  // Vertical Header Lines
  for (let c = 1; c < colX.length; c++) {
    ctx.beginPath();
    ctx.moveTo(colX[c], startY);
    ctx.lineTo(colX[c], startY + rowHeight);
    ctx.stroke();
  }

  // Items Data
  const sampleItems = [
    { stt: '1', name: 'Máy chủ Dell PowerEdge R450 16-Core 32GB RAM', unit: 'Bộ', qty: '2', price: '48.500.000', amount: '97.000.000' },
    { stt: '2', name: 'Ổ cứng SSD Enterprise Samsung 960GB SAS 12G', unit: 'Chiếc', qty: '4', price: '6.200.000', amount: '24.800.000' },
    { stt: '3', name: 'Bộ lưu điện UPS APC Smart 3000VA LCD 230V', unit: 'Chiếc', qty: '1', price: '28.900.000', amount: '28.900.000' },
    { stt: '4', name: 'Switch Cisco Catalyst 1000 24-Port Gigabit PoE', unit: 'Chiếc', qty: '2', price: '14.500.000', amount: '29.000.000' },
    { stt: '5', name: 'Cáp mạng Cat6 UTP CommScope thùng 305m', unit: 'Thùng', qty: '5', price: '2.450.000', amount: '12.250.000' },
  ];

  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#1E293B';

  sampleItems.forEach((it, idx) => {
    const curY = startY + (idx + 1) * rowHeight;
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(colX[0], curY, colX[6] - colX[0], rowHeight);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.strokeRect(colX[0], curY, colX[6] - colX[0], rowHeight);

    for (let c = 1; c < colX.length; c++) {
      ctx.beginPath();
      ctx.moveTo(colX[c], curY);
      ctx.lineTo(colX[c], curY + rowHeight);
      ctx.stroke();
    }

    ctx.fillStyle = '#0F172A';
    ctx.fillText(it.stt, colX[0] + 25, curY + 33);
    ctx.fillText(it.name, colX[1] + 15, curY + 33);
    ctx.fillText(it.unit, colX[2] + 25, curY + 33);
    ctx.fillText(it.qty, colX[3] + 35, curY + 33);
    ctx.fillText(it.price, colX[4] + 20, curY + 33);
    ctx.fillText(it.amount, colX[5] + 25, curY + 33);
  });

  // Totals Section
  const totalsY = startY + 6 * rowHeight + 20;
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(colX[0], totalsY, colX[6] - colX[0], 150);
  ctx.strokeStyle = '#94A3B8';
  ctx.strokeRect(colX[0], totalsY, colX[6] - colX[0], 150);

  ctx.fillStyle = '#1E293B';
  ctx.font = '19px Arial, sans-serif';
  ctx.fillText('Cộng tiền hàng:', 650, totalsY + 35);
  ctx.fillText('191.950.000 đ', 980, totalsY + 35);

  ctx.fillText('Thuế suất GTGT: 8%   -   Tiền thuế GTGT:', 500, totalsY + 75);
  ctx.fillText('15.356.000 đ', 980, totalsY + 75);

  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillStyle = '#0369A1';
  ctx.fillText('TỔNG CỘNG THANH TOÁN:', 500, totalsY + 120);
  ctx.fillText('207.306.000 đ', 960, totalsY + 120);

  // In Words
  ctx.font = 'italic 19px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Số tiền viết bằng chữ: Hai trăm linh bảy triệu ba trăm linh sáu nghìn đồng chẵn./.', 90, totalsY + 185);

  // Signatures
  const sigY = totalsY + 240;
  ctx.font = 'bold 19px Arial, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('NGƯỜI MUA HÀNG', 170, sigY);
  ctx.fillText('NGƯỜI BÁN HÀNG', 830, sigY);

  ctx.font = 'italic 16px Arial, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('(Ký, ghi rõ họ tên)', 180, sigY + 30);
  ctx.fillText('(Ký điện tử, đóng dấu)', 830, sigY + 30);

  // Stamp Badge (CamScanner realistic watermark stamp)
  ctx.save();
  ctx.translate(880, sigY + 100);
  ctx.rotate(-0.08);
  ctx.strokeStyle = 'rgba(225, 29, 72, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-90, -35, 180, 70);
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = 'rgba(225, 29, 72, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('ĐÃ KÝ ĐIỆN TỬ', 0, -8);
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('CÔNG NGHỆ & THIẾT BỊ SỐ', 0, 15);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

function createSampleExportReceiptCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#0D9488';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('TỔNG CÔNG TY CƠ KHÍ & THIẾT BỊ CÔNG NGHIỆP MIỀN BẮC', 70, 95);

  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Mã số thuế: 0102345678', 70, 130);
  ctx.fillText('Địa chỉ: Lô B2, Khu công nghiệp Quang Minh, Mê Linh, Hà Nội', 70, 160);

  ctx.fillStyle = '#0F766E';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PHIẾU XUẤT KHO', canvas.width / 2, 255);

  ctx.font = 'italic 19px Arial, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Ngày 19 tháng 10 năm 2024   -   Số phiếu: XK-2024-0891', canvas.width / 2, 295);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#F0FDFA';
  ctx.fillRect(70, 335, canvas.width - 140, 160);
  ctx.strokeStyle = '#99F6E4';
  ctx.strokeRect(70, 335, canvas.width - 140, 160);

  ctx.fillStyle = '#0F172A';
  ctx.font = '19px Arial, sans-serif';
  ctx.fillText('Người nhận hàng: Trần Đình Khoa - Đội Cơ giới & Thi công', 90, 370);
  ctx.fillText('Lý do xuất kho: Xuất vật tư phụ tùng bảo trì dây chuyền dập thủy lực', 90, 405);
  ctx.fillText('Xuất tại kho: Kho Cơ giới Trung tâm (Kho A1)', 90, 440);
  ctx.fillText('Địa điểm giao: Nhà máy Cơ điện Sóc Sơn, Hà Nội', 90, 475);

  const startY = 530;
  const colX = [70, 140, 620, 720, 830, 970, 1130];
  const rowHeight = 52;

  ctx.fillStyle = '#CCFBF1';
  ctx.fillRect(colX[0], startY, colX[6] - colX[0], rowHeight);
  ctx.strokeStyle = '#0F766E';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(colX[0], startY, colX[6] - colX[0], rowHeight);

  ctx.fillStyle = '#115E59';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('STT', colX[0] + 15, startY + 33);
  ctx.fillText('Tên vật tư, phụ tùng', colX[1] + 20, startY + 33);
  ctx.fillText('ĐVT', colX[2] + 20, startY + 33);
  ctx.fillText('Số lượng', colX[3] + 15, startY + 33);
  ctx.fillText('Đơn giá', colX[4] + 25, startY + 33);
  ctx.fillText('Thành tiền', colX[5] + 35, startY + 33);

  for (let c = 1; c < colX.length; c++) {
    ctx.beginPath();
    ctx.moveTo(colX[c], startY);
    ctx.lineTo(colX[c], startY + rowHeight);
    ctx.stroke();
  }

  const exportItems = [
    { stt: '1', name: 'Van điện từ thủy lực Yuken DSDG-01-2B2', unit: 'Bộ', qty: '4', price: '4.850.000', amount: '19.400.000' },
    { stt: '2', name: 'Xi lanh thủy lực áp cao hành trình 400mm', unit: 'Chiếc', qty: '2', price: '12.500.000', amount: '25.000.000' },
    { stt: '3', name: 'Dầu thủy lực Caltex Rando HD 68 (Phuy 208L)', unit: 'Phuy', qty: '3', price: '9.800.000', amount: '29.400.000' },
    { stt: '4', name: 'Phớt ben cao áp chịu nhiệt NOK 120x140x12', unit: 'Cái', qty: '10', price: '350.000', amount: '3.500.000' },
    { stt: '5', name: 'Đồng hồ đo áp suất chân đồng 0-250 bar Wika', unit: 'Cái', qty: '6', price: '850.000', amount: '5.100.000' },
  ];

  exportItems.forEach((it, idx) => {
    const curY = startY + (idx + 1) * rowHeight;
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F0FDFA';
    ctx.fillRect(colX[0], curY, colX[6] - colX[0], rowHeight);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(colX[0], curY, colX[6] - colX[0], rowHeight);

    for (let c = 1; c < colX.length; c++) {
      ctx.beginPath();
      ctx.moveTo(colX[c], curY);
      ctx.lineTo(colX[c], curY + rowHeight);
      ctx.stroke();
    }

    ctx.fillStyle = '#0F172A';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(it.stt, colX[0] + 25, curY + 33);
    ctx.fillText(it.name, colX[1] + 15, curY + 33);
    ctx.fillText(it.unit, colX[2] + 25, curY + 33);
    ctx.fillText(it.qty, colX[3] + 35, curY + 33);
    ctx.fillText(it.price, colX[4] + 20, curY + 33);
    ctx.fillText(it.amount, colX[5] + 25, curY + 33);
  });

  const totalsY = startY + 6 * rowHeight + 20;
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(colX[0], totalsY, colX[6] - colX[0], 100);
  ctx.strokeStyle = '#94A3B8';
  ctx.strokeRect(colX[0], totalsY, colX[6] - colX[0], 100);

  ctx.fillStyle = '#0F766E';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('TỔNG CỘNG TIỀN VẬT TƯ XUẤT KHO:', 450, totalsY + 60);
  ctx.fillText('82.400.000 đ', 960, totalsY + 60);

  ctx.font = 'italic 19px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Số tiền viết bằng chữ: Tám mươi hai triệu bốn trăm nghìn đồng chẵn./.', 90, totalsY + 140);

  const sigY = totalsY + 200;
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('NGƯỜI LẬP', 120, sigY);
  ctx.fillText('NGƯỜI NHẬN', 400, sigY);
  ctx.fillText('THỦ KHO', 690, sigY);
  ctx.fillText('GIÁM ĐỐC KHO', 930, sigY);

  return canvas.toDataURL('image/png');
}

function createSampleImportReceiptCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#4338CA';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.fillStyle = '#1E1B4B';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('NHÀ MÁY CHẾ TẠO MÁY & THIẾT BỊ ĐIỆN HẢI PHÒNG', 70, 95);

  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Mã số thuế: 0201987654', 70, 130);
  ctx.fillText('Địa chỉ: Khu CN Đình Vũ, Phường Đông Hải 2, Quận Hải An, Hải Phòng', 70, 160);

  ctx.fillStyle = '#4338CA';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PHIẾU NHẬP KHO', canvas.width / 2, 255);

  ctx.font = 'italic 19px Arial, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Ngày 20 tháng 10 năm 2024   -   Số phiếu: NK-2024-0412', canvas.width / 2, 295);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#EEF2FF';
  ctx.fillRect(70, 335, canvas.width - 140, 160);
  ctx.strokeStyle = '#C7D2FE';
  ctx.strokeRect(70, 335, canvas.width - 140, 160);

  ctx.fillStyle = '#0F172A';
  ctx.font = '19px Arial, sans-serif';
  ctx.fillText('Đơn vị giao hàng: CÔNG TY TNHH VẬT TƯ KIM KHÍ BẢO LONG', 90, 370);
  ctx.fillText('Theo hóa đơn số: 0098231 ngày 19/10/2024 của Bên giao', 90, 405);
  ctx.fillText('Nhập tại kho: Kho Thép & Nguyên Liệu Chính (Kho B3)', 90, 440);
  ctx.fillText('Họ tên người giao: Đặng Thanh Tùng (Phụ trách giao nhận)', 90, 475);

  const startY = 530;
  const colX = [70, 140, 620, 720, 830, 970, 1130];
  const rowHeight = 52;

  ctx.fillStyle = '#E0E7FF';
  ctx.fillRect(colX[0], startY, colX[6] - colX[0], rowHeight);
  ctx.strokeStyle = '#4338CA';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(colX[0], startY, colX[6] - colX[0], rowHeight);

  ctx.fillStyle = '#3730A3';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('STT', colX[0] + 15, startY + 33);
  ctx.fillText('Tên nguyên vật liệu nhập kho', colX[1] + 20, startY + 33);
  ctx.fillText('ĐVT', colX[2] + 20, startY + 33);
  ctx.fillText('Số lượng', colX[3] + 15, startY + 33);
  ctx.fillText('Đơn giá', colX[4] + 25, startY + 33);
  ctx.fillText('Thành tiền', colX[5] + 35, startY + 33);

  for (let c = 1; c < colX.length; c++) {
    ctx.beginPath();
    ctx.moveTo(colX[c], startY);
    ctx.lineTo(colX[c], startY + rowHeight);
    ctx.stroke();
  }

  const importItems = [
    { stt: '1', name: 'Thép tấm cán nóng SS400 độ dày 12mm x 1500 x 6000', unit: 'Tấn', qty: '5', price: '16.800.000', amount: '84.000.000' },
    { stt: '2', name: 'Thép hình chữ H Posco 200 x 200 x 8 x 12', unit: 'Cây', qty: '12', price: '7.450.000', amount: '89.400.000' },
    { stt: '3', name: 'Que hàn điện chịu lực Kim Tín KT-421 (Hộp 5kg)', unit: 'Hộp', qty: '40', price: '185.000', amount: '7.400.000' },
    { stt: '4', name: 'Bulong neo móng cường độ cao M24 x 800mm mạ kẽm', unit: 'Bộ', qty: '60', price: '125.000', amount: '7.500.000' },
    { stt: '5', name: 'Sơn chống rỉ kết cấu thép Epoxy 2 thành phần', unit: 'Thùng', qty: '8', price: '1.650.000', amount: '13.200.000' },
  ];

  importItems.forEach((it, idx) => {
    const curY = startY + (idx + 1) * rowHeight;
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#EEF2FF';
    ctx.fillRect(colX[0], curY, colX[6] - colX[0], rowHeight);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(colX[0], curY, colX[6] - colX[0], rowHeight);

    for (let c = 1; c < colX.length; c++) {
      ctx.beginPath();
      ctx.moveTo(colX[c], curY);
      ctx.lineTo(colX[c], curY + rowHeight);
      ctx.stroke();
    }

    ctx.fillStyle = '#0F172A';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(it.stt, colX[0] + 25, curY + 33);
    ctx.fillText(it.name, colX[1] + 15, curY + 33);
    ctx.fillText(it.unit, colX[2] + 25, curY + 33);
    ctx.fillText(it.qty, colX[3] + 35, curY + 33);
    ctx.fillText(it.price, colX[4] + 20, curY + 33);
    ctx.fillText(it.amount, colX[5] + 25, curY + 33);
  });

  const totalsY = startY + 6 * rowHeight + 20;
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(colX[0], totalsY, colX[6] - colX[0], 100);
  ctx.strokeStyle = '#94A3B8';
  ctx.strokeRect(colX[0], totalsY, colX[6] - colX[0], 100);

  ctx.fillStyle = '#4338CA';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('TỔNG CỘNG TIỀN VẬT TƯ NHẬP KHO:', 450, totalsY + 60);
  ctx.fillText('201.500.000 đ', 950, totalsY + 60);

  ctx.font = 'italic 19px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Số tiền viết bằng chữ: Hai trăm linh một triệu năm trăm nghìn đồng chẵn./.', 90, totalsY + 140);

  return canvas.toDataURL('image/png');
}
