/**
 * =================================================================================
 * LINKLOG LOGISTICS OS - HỆ THỐNG QUẢN TRỊ VẬN HÀNH 5 BƯỚC LIÊN PHÒNG BAN
 * Tích hợp:
 *  1. Lưu trữ Đám mây Kép: Cloudflare R2 Storage + Supabase PostgreSQL
 *  2. Cổng Đăng nhập Bắt buộc (Mandatory Full-screen Login Gate)
 *  3. Tài khoản Quản trị (Super Admin): Tạo mới, Phân quyền 3 chiều & Thu hồi TK
 *  4. Phân quyền Nhân sự theo: BỘ PHẬN x KHU VỰC (Bắc/Trung/Nam) x NGÀNH NGHỀ
 *  5. Giao diện Làm việc Tập trung (Focused Workspace): Ẩn toàn bộ phần không liên quan
 * =================================================================================
 */

(function () {
  'use strict';

  document.body.style.paddingTop = '0px';
  const oldBanner = document.getElementById('linklog-operations-banner');
  if (oldBanner) oldBanner.remove();
  const oldFab = document.getElementById('linklog-operations-fab');
  if (oldFab) oldFab.remove();

  // =========================================================================
  // 1. CẤU HÌNH KẾT NỐI CLOUDFLARE R2 & SUPABASE POSTGRESQL (ĐÃ KẾT NỐI SẴN)
  // =========================================================================
  const CLOUD_CONFIG = {
    supabaseUrl: 'https://cuniqanbumcrqcdlcvad.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bmlxYW5idW1jcnFjZGxjdmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDE4MTMsImV4cCI6MjEwNDUxNzgxM30.MWSv1QKVlQ9r-8r0hkrqWsmm75hULq_VjPCbTqXDe-o',
    supabaseDocId: 'linklog_logistics_os',
    r2WorkerUploadUrl: 'https://upload-helper.phamngockhanh-942001.workers.dev/',
    r2PublicBaseUrl: 'https://pub-2efc95bbe7924897bdd0db54d0da243f.r2.dev',
    r2DbFileName: 'linklog_logistics_db.json'
  };

  const STORAGE_KEY_DB = 'linklog_r2_cached_db_v5';
  const STORAGE_KEY_SESSION = 'linklog_active_session_v5';

  // =========================================================================
  // 2. DANH MỤC PHÂN QUYỀN 3 CHIỀU: BỘ PHẬN x KHU VỰC x NGÀNH NGHỀ
  // =========================================================================
  const ROLES = {
    ADMIN: {
      code: 'ADMIN',
      label: 'Quản Trị Viên / Giám Đốc',
      color: '#ef4444',
      steps: [1, 2, 3, 4, 5],
      desc: 'Toàn quyền hệ thống, tạo/phân quyền/thu hồi tài khoản nhân viên, duyệt mọi bước'
    },
    MANAGER: {
      code: 'MANAGER',
      label: 'Trưởng Bộ Phận (Manager)',
      color: '#f59e0b',
      steps: [1, 2, 3, 4, 5],
      desc: 'Phê duyệt giá cước Bước 1 & Giám sát toàn bộ lô hàng thuộc Khu vực/Ngành nghề phụ trách'
    },
    SALES: {
      code: 'SALES',
      label: 'Nhân Viên Kinh Doanh (Sales)',
      color: '#3b82f6',
      steps: [1, 5],
      desc: 'Lập Booking Form (Bước 1), theo dõi tiến độ đơn hàng của mình & nhận Hoa hồng (Bước 5)'
    },
    ACCOUNTANT: {
      code: 'ACCOUNTANT',
      label: 'Kế Toán (Accountant)',
      color: '#10b981',
      steps: [1, 5],
      desc: 'Thẩm định điều kiện thanh toán/công nợ (Bước 1) & Đối soát chi phí, chốt hoa hồng (Bước 5)'
    },
    LOGISTICS: {
      code: 'LOGISTICS',
      label: 'Điều Phối Cước & Xe (Logistics)',
      color: '#06b6d4',
      steps: [2],
      desc: 'Check giá hãng tàu, lấy Booking Note & điều xe kéo khớp Closing time (Bước 2)'
    },
    OPS: {
      code: 'OPS',
      label: 'Hiện Trường Bãi/Cảng (Ops)',
      color: '#a855f7',
      steps: [3, 4],
      desc: 'Kiểm hàng, kẹp seal tại bãi (Bước 3) & Bàn giao tờ khai vào sổ tàu (Bước 4)'
    },
    DOCS: {
      code: 'DOCS',
      label: 'Chứng Từ & Hải Quan (Docs)',
      color: '#6366f1',
      steps: [3, 4],
      desc: 'Nộp kiểm tra chuyên ngành, truyền tờ khai HQ (Bước 3) & Phát hành vận đơn B/L (Bước 4)'
    }
  };

  const REGIONS = {
    ALL: { code: 'ALL', label: '🌐 Toàn Quốc (Tất cả khu vực)', badge: 'Toàn Quốc', color: '#38bdf8' },
    HCM: { code: 'HCM', label: '🌴 Miền Nam (TP.HCM / Cát Lái / Cái Mép)', badge: 'Miền Nam (HCM)', color: '#34d399' },
    HPH: { code: 'HPH', label: '⚓ Miền Bắc (Hải Phòng / Nội Bài)', badge: 'Miền Bắc (HPH)', color: '#fbbf24' },
    DAD: { code: 'DAD', label: '🌊 Miền Trung (Đà Nẵng / Quy Nhơn)', badge: 'Miền Trung (DAD)', color: '#c084fc' }
  };

  const INDUSTRIES = {
    ALL: { code: 'ALL', label: '🏭 Tất Cả Ngành Hàng', badge: 'Mọi Ngành Hàng', color: '#94a3b8' },
    WOOD: { code: 'WOOD', label: '🪵 Gỗ, Nội Thất & Vật Liệu Xây Dựng', badge: 'Ngành Gỗ & Nội Thất', color: '#d97706' },
    AGRI: { code: 'AGRI', label: '🥭 Nông Sản, Thực Phẩm & Hàng Lạnh (Reefer)', badge: 'Ngành Nông Sản/Lạnh', color: '#16a34a' },
    GARMENT: { code: 'GARMENT', label: '👕 Dệt May, Giày Da & Thời Trang', badge: 'Ngành Dệt May', color: '#db2777' },
    ELECTRONICS: { code: 'ELECTRONICS', label: '⚙️ Điện Tử, Máy Móc & Công Nghiệp', badge: 'Ngành Điện Tử/Máy Móc', color: '#2563eb' }
  };

  // =========================================================================
  // 3. DỮ LIỆU KHỞI TẠO MẪU (NHÂN SỰ PHÂN QUYỀN CHI TIẾT & LÔ HÀNG 5 BƯỚC)
  // =========================================================================
  const DEFAULT_USERS = [
    {
      id: 'usr_admin_1',
      email: 'admin@linklog.vn',
      username: 'admin',
      password: '123456',
      fullName: 'Phạm Đình Quang (Tổng Quản Trị)',
      role: 'ADMIN',
      region: 'ALL',
      industry: 'ALL',
      status: 'ACTIVE', // ACTIVE | REVOKED
      createdAt: '2026-11-01'
    },
    {
      id: 'usr_mgr_hcm',
      email: 'truongphong.hcm@linklog.vn',
      username: 'manager_hcm',
      password: '123456',
      fullName: 'Vũ Đức Minh (Trưởng BP Miền Nam)',
      role: 'MANAGER',
      region: 'HCM',
      industry: 'ALL',
      status: 'ACTIVE',
      createdAt: '2026-11-01'
    },
    {
      id: 'usr_acc_all',
      email: 'ketoan@linklog.vn',
      username: 'ketoan',
      password: '123456',
      fullName: 'Lê Minh Tâm (Kế Toán Công Nợ)',
      role: 'ACCOUNTANT',
      region: 'ALL',
      industry: 'ALL',
      status: 'ACTIVE',
      createdAt: '2026-11-01'
    },
    {
      id: 'usr_sales_wood_hcm',
      email: 'sales.go@linklog.vn',
      username: 'sales_go',
      password: '123456',
      fullName: 'Nguyễn Văn Nam (Sales Gỗ - HCM)',
      role: 'SALES',
      region: 'HCM',
      industry: 'WOOD',
      status: 'ACTIVE',
      createdAt: '2026-11-01'
    },
    {
      id: 'usr_sales_agri_hcm',
      email: 'sales.nongsan@linklog.vn',
      username: 'sales_nongsan',
      password: '123456',
      fullName: 'Lê Tuấn Kiệt (Sales Nông Sản - HCM)',
      role: 'SALES',
      region: 'HCM',
      industry: 'AGRI',
      status: 'ACTIVE',
      createdAt: '2026-11-01'
    },
    {
      id: 'usr_log_hcm',
      email: 'logistics.hcm@linklog.vn',
      username: 'logistics_hcm',
      password: '123456',
      fullName: 'Phạm Quốc Bảo (Điều Phối Cước HCM)',
      role: 'LOGISTICS',
      region: 'HCM',
      industry: 'ALL',
      status: 'ACTIVE',
      createdAt: '2026-11-01'
    },
    {
      id: 'usr_ops_hph',
      email: 'ops.hph@linklog.vn',
      username: 'ops_hph',
      password: '123456',
      fullName: 'Đặng Văn Hùng (Hiện Trường Hải Phòng)',
      role: 'OPS',
      region: 'HPH',
      industry: 'WOOD',
      status: 'ACTIVE',
      createdAt: '2026-11-01'
    },
    {
      id: 'usr_docs_hcm',
      email: 'docs.hcm@linklog.vn',
      username: 'docs_hcm',
      password: '123456',
      fullName: 'Hoàng Thu Trang (Chứng Từ HQ - HCM)',
      role: 'DOCS',
      region: 'HCM',
      industry: 'ALL',
      status: 'ACTIVE',
      createdAt: '2026-11-01'
    }
  ];

  const DEFAULT_SHIPMENTS = [
    {
      id: 'SHP-2026-0101',
      customerName: 'ABC Furniture Vietnam',
      salesRep: 'Nguyễn Văn Nam (Sales Gỗ - HCM)',
      salesEmail: 'sales.go@linklog.vn',
      region: 'HCM',
      industry: 'WOOD',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Long Beach (USLGB)',
      cargo: 'Bàn ghế sofa gỗ sồi xuất khẩu',
      equipment: '2 x 40HQ',
      currentStep: 1,
      statusText: 'Bước 1: Chờ Kế toán & Trưởng BP duyệt',
      createdAt: '2026-11-05 08:30',
      step1: { proposedPriceUsd: 2850, paymentTerm: 'Công nợ 30 ngày', accountantApproved: false, accountantName: '', managerApproved: false, managerName: '' },
      step2: { carrier: 'Maersk Line', bookingNo: 'MSK-99201481', vesselVoyage: 'MAERSK ALABAMA / 2604E', closingTime: '2026-11-10 18:00', truckingVendor: 'Huy Hoàng Logistics', truckPlate: '51C-882.91', bookingFileUrl: '', isDispatched: false },
      step3: { containerNo: 'MSKU-8921820', sealNo: 'ML-VN-98210', sealFileUrl: '', isInspectedByOps: false, customsDeclarationNo: '106299182010', customsChannel: 'VÀNG (Luồng Vàng)', specializedCheckType: 'Hun trùng gỗ', isCleared: false },
      step4: { handedOverToCarrier: false, blType: 'Master B/L', blNo: 'MSKU99201481', blFileUrl: '', blFileUploaded: false, issuedDate: '' },
      step5: { totalRevenueUsd: 5700, totalCostUsd: 4850, grossProfitUsd: 850, commissionRatePercent: 12, commissionAmountUsd: 102, isSettled: false, settledBy: '', settledDate: '' }
    },
    {
      id: 'SHP-2026-0102',
      customerName: 'VietWood Industrial Plywood',
      salesRep: 'Trần Thị Thảo (Sales Gỗ - HPH)',
      salesEmail: 'admin@linklog.vn',
      region: 'HPH',
      industry: 'WOOD',
      pol: 'Hải Phòng (VNHPH)',
      pod: 'Qingdao (CNQDG)',
      cargo: 'Ván ép cốp pha phủ phim',
      equipment: '3 x 20GP',
      currentStep: 3,
      statusText: 'Bước 3: Chờ Ops Hải Phòng kẹp seal & Docs thông quan',
      createdAt: '2026-11-04 14:15',
      step1: { proposedPriceUsd: 1100, paymentTerm: 'Trả trước 100%', accountantApproved: true, accountantName: 'Lê Minh Tâm', managerApproved: true, managerName: 'Phạm Đình Quang' },
      step2: { carrier: 'ONE Line', bookingNo: 'ONE-HPH-2026-881', vesselVoyage: 'ONE CONTINUITY / 042W', closingTime: '2026-11-06 20:00', truckingVendor: 'Hải An Trucking Đình Vũ', truckPlate: '15C-341.22', bookingFileUrl: '', isDispatched: true },
      step3: { containerNo: 'TGHU-2091821', sealNo: 'ONE-VN-55219', sealFileUrl: '', isInspectedByOps: false, customsDeclarationNo: '106388102911', customsChannel: 'XANH (Luồng Xanh)', specializedCheckType: 'Hun trùng container', isCleared: false },
      step4: { handedOverToCarrier: false, blType: 'House B/L', blNo: 'HBL-LL-2026021', blFileUrl: '', blFileUploaded: false, issuedDate: '' },
      step5: { totalRevenueUsd: 3300, totalCostUsd: 2750, grossProfitUsd: 550, commissionRatePercent: 10, commissionAmountUsd: 55, isSettled: false, settledBy: '', settledDate: '' }
    },
    {
      id: 'SHP-2026-0103',
      customerName: 'Mekong Fruits & Agri Trade',
      salesRep: 'Lê Tuấn Kiệt (Sales Nông Sản - HCM)',
      salesEmail: 'sales.nongsan@linklog.vn',
      region: 'HCM',
      industry: 'AGRI',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Tokyo (JPTYO)',
      cargo: 'Xoài cát sấy dẻo & Thanh long ruột đỏ',
      equipment: '1 x 40RF (Lạnh)',
      currentStep: 2,
      statusText: 'Bước 2: Đã duyệt - Chờ Logistics HCM lấy Booking & đặt xe',
      createdAt: '2026-11-04 10:00',
      step1: { proposedPriceUsd: 4200, paymentTerm: 'Thư tín dụng L/C trả ngay', accountantApproved: true, accountantName: 'Lê Minh Tâm', managerApproved: true, managerName: 'Vũ Đức Minh' },
      step2: { carrier: 'CMA CGM', bookingNo: 'CMA-SGN-441029', vesselVoyage: 'CMA ANTOINE / 102E', closingTime: '2026-11-07 16:00', truckingVendor: 'Huy Hoàng Logistics', truckPlate: '51D-991.44', bookingFileUrl: '', isDispatched: false },
      step3: { containerNo: 'CMAU-7721094', sealNo: 'CMA-VN-11928', sealFileUrl: '', isInspectedByOps: false, customsDeclarationNo: '106499201944', customsChannel: 'VÀNG (Luồng Vàng)', specializedCheckType: 'Kiểm dịch thực vật', isCleared: false },
      step4: { handedOverToCarrier: false, blType: 'Master B/L', blNo: 'CMA-TYO-99120', blFileUrl: '', blFileUploaded: false, issuedDate: '' },
      step5: { totalRevenueUsd: 4200, totalCostUsd: 3450, grossProfitUsd: 750, commissionRatePercent: 15, commissionAmountUsd: 112.5, isSettled: false, settledBy: '', settledDate: '' }
    },
    {
      id: 'SHP-2026-0104',
      customerName: 'Saigon Garment Manufacturing',
      salesRep: 'Phạm Hồng Ánh (Sales Dệt May - HCM)',
      salesEmail: 'admin@linklog.vn',
      region: 'HCM',
      industry: 'GARMENT',
      pol: 'Cái Mép (VNVUT)',
      pod: 'Rotterdam (NLRTM)',
      cargo: 'Quần áo thời trang dệt kim xuất khẩu EU',
      equipment: '4 x 40HQ',
      currentStep: 4,
      statusText: 'Bước 4: Chờ Ops thanh lý sổ tàu & Docs xuất B/L',
      createdAt: '2026-11-02 08:30',
      step1: { proposedPriceUsd: 3950, paymentTerm: 'Công nợ 15 ngày', accountantApproved: true, accountantName: 'Lê Minh Tâm', managerApproved: true, managerName: 'Vũ Đức Minh' },
      step2: { carrier: 'COSCO Shipping', bookingNo: 'COSU-99812034', vesselVoyage: 'COSCO PRIDE / 098W', closingTime: '2026-11-05 12:00', truckingVendor: 'Đại Nam Trucking', truckPlate: '72C-109.88', bookingFileUrl: '', isDispatched: true },
      step3: { containerNo: 'COSU-8819201', sealNo: 'COSU-VN-77218', sealFileUrl: '', isInspectedByOps: true, customsDeclarationNo: '106199827101', customsChannel: 'XANH (Luồng Xanh)', specializedCheckType: 'C/O Form EUR.1', isCleared: true },
      step4: { handedOverToCarrier: true, blType: 'House B/L', blNo: 'HBL-LL-SGN-26019', blFileUrl: '', blFileUploaded: false, issuedDate: '2026-11-05' },
      step5: { totalRevenueUsd: 15800, totalCostUsd: 13600, grossProfitUsd: 2200, commissionRatePercent: 12, commissionAmountUsd: 264, isSettled: false, settledBy: '', settledDate: '' }
    },
    {
      id: 'SHP-2026-0105',
      customerName: 'An Nam Handicrafts & Furniture',
      salesRep: 'Nguyễn Văn Nam (Sales Gỗ - HCM)',
      salesEmail: 'sales.go@linklog.vn',
      region: 'HCM',
      industry: 'WOOD',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Hamburg (DEHAM)',
      cargo: 'Tủ gỗ nội thất & đồ mỹ nghệ xuất khẩu',
      equipment: '1 x 20GP',
      currentStep: 5,
      statusText: 'Bước 5: Tàu đã chạy - Chờ Kế toán chốt quyết toán & hoa hồng',
      createdAt: '2026-10-28 11:20',
      step1: { proposedPriceUsd: 2150, paymentTerm: 'Trả trước 100%', accountantApproved: true, accountantName: 'Lê Minh Tâm', managerApproved: true, managerName: 'Vũ Đức Minh' },
      step2: { carrier: 'Hapag-Lloyd', bookingNo: 'HLCU-HAM-110291', vesselVoyage: 'AL ZUBARA / 2409W', closingTime: '2026-10-30 17:00', truckingVendor: 'Huy Hoàng Logistics', truckPlate: '51C-881.09', bookingFileUrl: '', isDispatched: true },
      step3: { containerNo: 'HLXU-4410291', sealNo: 'HL-VN-882190', sealFileUrl: '', isInspectedByOps: true, customsDeclarationNo: '106099182099', customsChannel: 'ĐỎ (Luồng Đỏ)', specializedCheckType: 'Hun trùng & C/O', isCleared: true },
      step4: { handedOverToCarrier: true, blType: 'House B/L', blNo: 'HBL-LL-HCM-9918', blFileUrl: '', blFileUploaded: true, issuedDate: '2026-10-31' },
      step5: { totalRevenueUsd: 2150, totalCostUsd: 1690, grossProfitUsd: 460, commissionRatePercent: 12, commissionAmountUsd: 55.2, isSettled: false, settledBy: '', settledDate: '' }
    }
  ];

  // =========================================================================
  // 4. LỚP LƯU TRỮ ĐỒNG BỘ CLOUDFLARE R2 + SUPABASE POSTGRESQL
  // =========================================================================
  let dbState = {
    users: DEFAULT_USERS,
    shipments: DEFAULT_SHIPMENTS,
    lastUpdated: new Date().toISOString()
  };

  let isCloudSynced = false;
  let workspaceFilterMode = 'MY_TASKS'; // 'MY_TASKS' | 'ALL_ALLOWED'
  let isFocusedWorkspaceOpen = true; // Mở mặc định không gian làm việc tập trung sau khi login

  function loadLocalDb() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DB);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.shipments)) {
          dbState = parsed;
          return;
        }
      }
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dbState));
  }

  // Đọc dữ liệu từ Cloudflare R2 & Supabase khi khởi động
  async function loadFromCloudStorage() {
    let loaded = false;

    // 1. Ưu tiên đọc từ Supabase PostgreSQL (nhanh, không bị cache CDN)
    try {
      const res = await fetch(`${CLOUD_CONFIG.supabaseUrl}/rest/v1/configurations?id=eq.${CLOUD_CONFIG.supabaseDocId}&select=raw_data,updated_at`, {
        headers: {
          'apikey': CLOUD_CONFIG.supabaseKey,
          'Authorization': `Bearer ${CLOUD_CONFIG.supabaseKey}`
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].raw_data && Array.isArray(rows[0].raw_data.users) && Array.isArray(rows[0].raw_data.shipments)) {
          dbState = rows[0].raw_data;
          localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dbState));
          loaded = true;
          isCloudSynced = true;
        }
      }
    } catch (e) {
      console.warn('Supabase fetch error:', e);
    }

    // 2. Nếu Supabase chưa có bản ghi đầy đủ, đọc từ Cloudflare R2 Bucket
    if (!loaded) {
      try {
        const resR2 = await fetch(`${CLOUD_CONFIG.r2PublicBaseUrl}/${CLOUD_CONFIG.r2DbFileName}?t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (resR2.ok) {
          const dataR2 = await resR2.json();
          if (dataR2 && Array.isArray(dataR2.users) && Array.isArray(dataR2.shipments)) {
            dbState = dataR2;
            localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dbState));
            loaded = true;
            isCloudSynced = true;
          }
        }
      } catch (e) {
        console.warn('R2 fetch error:', e);
      }
    }

    // Nếu trên Cloud chưa có dữ liệu khởi tạo, đẩy bộ dữ liệu chuẩn lên cả R2 và Supabase
    if (!loaded) {
      await saveToCloudStorage();
    }

    refreshActiveSessionFromDb();
    renderAllViews();
  }

  // Ghi toàn bộ dữ liệu lên Cloudflare R2 VÀ Supabase PostgreSQL
  async function saveToCloudStorage() {
    dbState.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dbState));

    const statusBadge = document.getElementById('cloud-sync-indicator');
    if (statusBadge) {
      statusBadge.innerHTML = '🔄 Đang lưu lên Cloudflare R2 & Supabase...';
      statusBadge.style.color = '#fbbf24';
    }

    let r2Ok = false;
    let supaOk = false;

    // 1. Lưu file JSON trực tiếp lên Cloudflare R2 qua Worker
    try {
      const blob = new Blob([JSON.stringify(dbState, null, 2)], { type: 'application/json' });
      const formData = new FormData();
      formData.append('file', blob, CLOUD_CONFIG.r2DbFileName);
      const resR2 = await fetch(CLOUD_CONFIG.r2WorkerUploadUrl, {
        method: 'PUT',
        body: formData
      });
      if (resR2.ok) r2Ok = true;
    } catch (e) {
      console.warn('Lỗi ghi R2:', e);
    }

    // 2. Đồng bộ sang Supabase PostgreSQL (Bảng configurations)
    try {
      const resSupa = await fetch(`${CLOUD_CONFIG.supabaseUrl}/rest/v1/configurations`, {
        method: 'POST',
        headers: {
          'apikey': CLOUD_CONFIG.supabaseKey,
          'Authorization': `Bearer ${CLOUD_CONFIG.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: CLOUD_CONFIG.supabaseDocId,
          raw_data: dbState,
          url: `${CLOUD_CONFIG.r2PublicBaseUrl}/${CLOUD_CONFIG.r2DbFileName}`,
          updated_at: dbState.lastUpdated
        })
      });
      if (resSupa.ok) supaOk = true;
    } catch (e) {
      console.warn('Lỗi ghi Supabase:', e);
    }

    isCloudSynced = r2Ok || supaOk;
    if (statusBadge) {
      statusBadge.innerHTML = '🟢 Đã lưu trên Cloudflare R2 & Supabase';
      statusBadge.style.color = '#34d399';
    }
  }

  // Upload chứng từ đính kèm (Ảnh chụp Seal, B/L, Tờ khai) lên Cloudflare R2
  async function uploadAttachmentToR2(fileInputId, shipmentId, fieldType) {
    const fileInput = document.getElementById(fileInputId);
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert('⚠️ Vui lòng chọn file từ máy tính trước khi tải lên!');
      return;
    }
    const file = fileInput.files[0];
    const cleanName = `linklog_${shipmentId}_${fieldType}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    try {
      const formData = new FormData();
      formData.append('file', file, cleanName);
      const res = await fetch(CLOUD_CONFIG.r2WorkerUploadUrl, {
        method: 'PUT',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const fileUrl = data.url || `${CLOUD_CONFIG.r2PublicBaseUrl}/${cleanName}`;

      const item = dbState.shipments.find(s => s.id === shipmentId);
      if (item) {
        if (fieldType === 'BOOKING') item.step2.bookingFileUrl = fileUrl;
        if (fieldType === 'SEAL') item.step3.sealFileUrl = fileUrl;
        if (fieldType === 'BL') {
          item.step4.blFileUrl = fileUrl;
          item.step4.blFileUploaded = true;
        }
        await saveToCloudStorage();
        openOrderDetailModal(shipmentId);
        alert(`✅ Đã tải file lên Cloudflare R2 thành công!\nURL: ${fileUrl}`);
      }
    } catch (err) {
      alert('❌ Lỗi tải file lên Cloudflare R2: ' + err.message);
    }
  }

  // =========================================================================
  // 5. QUẢN LÝ PHIÊN ĐĂNG NHẬP & KIỂM TRA PHÂN QUYỀN
  // =========================================================================
  function getActiveUser() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_SESSION) || localStorage.getItem(STORAGE_KEY_SESSION);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Kiểm tra xem tài khoản còn tồn tại và không bị thu hồi trong dbState không
        const fresh = dbState.users.find(u => u.email.toLowerCase() === (parsed.email || '').toLowerCase());
        if (fresh) {
          if (fresh.status === 'REVOKED') {
            clearActiveUser();
            return null;
          }
          return fresh;
        }
      }
    } catch (e) {}
    return null;
  }

  function setActiveUser(user) {
    sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  }

  function clearActiveUser() {
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }

  function refreshActiveSessionFromDb() {
    const u = getActiveUser();
    if (u) setActiveUser(u);
  }

  // Kiểm tra lô hàng có thuộc Khu vực & Ngành nghề của nhân sự đang đăng nhập không
  function isShipmentVisibleToUser(shipment, user) {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    // 1. Kiểm tra Khu vực (Region)
    if (user.region && user.region !== 'ALL' && shipment.region !== user.region) {
      return false;
    }

    // 2. Kiểm tra Ngành nghề (Industry)
    if (user.industry && user.industry !== 'ALL' && shipment.industry !== user.industry) {
      return false;
    }

    return true;
  }

  // Kiểm tra lô hàng có đang ở Bước mà Bộ phận của nhân viên này cần xử lý không
  function isShipmentActionableByUser(shipment, user) {
    if (!user) return false;
    if (!isShipmentVisibleToUser(shipment, user)) return false;
    if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;

    const roleCfg = ROLES[user.role];
    if (!roleCfg) return false;
    return roleCfg.steps.includes(shipment.currentStep);
  }

  // =========================================================================
  // 6. CỔNG ĐĂNG NHẬP BẮT BUỘC TOÀN MÀN HÌNH (MANDATORY LOGIN GATE)
  // =========================================================================
  function renderLoginGate() {
    let gate = document.getElementById('linklog-login-gate');
    const user = getActiveUser();

    if (user) {
      if (gate) gate.style.display = 'none';
      return;
    }

    if (!gate) {
      gate = document.createElement('div');
      gate.id = 'linklog-login-gate';
      gate.style.cssText = `
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at top right, #1e3a8a, #0f172a 55%, #020617);
        z-index: 200000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: system-ui, -apple-system, sans-serif;
        color: #f8fafc;
        overflow-y: auto;
      `;
      document.body.appendChild(gate);
    }

    gate.style.display = 'flex';

    gate.innerHTML = `
      <div style="
        width: 100%;
        max-width: 1080px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid #334155;
        border-radius: 20px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
        display: grid;
        grid-template-columns: 1fr 1.35fr;
        overflow: hidden;
      ">
        <!-- Cột trái: Form đăng nhập chính thức -->
        <div style="padding: 36px 32px; border-right: 1px solid #1e293b; display: flex; flex-direction: column; justify-content: space-between; background: #0b1120;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #1d4ed8); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; color: #fff; box-shadow: 0 4px 15px rgba(37,99,235,0.5);">
                LL
              </div>
              <div>
                <div style="font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">LINKLOG LOGISTICS OS</div>
                <div style="font-size: 11px; color: #38bdf8; font-weight: 600;">Hệ Thống Điều Hành 5 Bước • Cloudflare R2 & Supabase</div>
              </div>
            </div>

            <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 6px 0;">Đăng Nhập Hệ Thống</h2>
            <p style="font-size: 12px; color: #94a3b8; margin: 0 0 24px 0;">
              Hệ thống tự động cá nhân hóa giao diện theo <strong>Bộ phận</strong>, <strong>Khu vực</strong> và <strong>Ngành hàng</strong> được phân quyền.
            </p>

            <form id="form-gate-login" style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label style="font-size: 12px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 6px;">Email hoặc Tên đăng nhập *</label>
                <input id="gate-input-email" type="text" required placeholder="VD: admin@linklog.vn hoặc sales.go@linklog.vn" value="admin@linklog.vn" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 10px; padding: 12px 14px; color: #ffffff; font-size: 13px; box-sizing: border-box;">
              </div>

              <div>
                <label style="font-size: 12px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 6px;">Mật khẩu *</label>
                <input id="gate-input-pass" type="password" required placeholder="Nhập mật khẩu..." value="123456" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 10px; padding: 12px 14px; color: #ffffff; font-size: 13px; box-sizing: border-box;">
              </div>

              <div id="gate-login-error" style="display: none; background: rgba(239,68,68,0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 10px 12px; border-radius: 8px; font-size: 12px;"></div>

              <button type="submit" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-weight: 800; font-size: 14px; padding: 13px; border-radius: 10px; border: 1px solid #3b82f6; cursor: pointer; box-shadow: 0 4px 15px rgba(37,99,235,0.4); margin-top: 4px;">
                🔓 Đăng Nhập Vào Không Gian Làm Việc
              </button>
            </form>
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; display: flex; align-items: center; justify-content: space-between;">
            <span>☁️ Lưu trữ: <strong>Cloudflare R2 + Supabase</strong></span>
            <span style="color: #34d399;">● Đã kết nối</span>
          </div>
        </div>

        <!-- Cột phải: Bảng chọn nhanh Tài khoản Quản trị & Nhân viên theo Khu vực / Ngành nghề -->
        <div style="padding: 32px; background: #0f172a; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #ffffff; margin: 0;">⚡ Chọn Nhanh Tài Khoản Để Kiểm Tra Phân Quyền (1-Click)</h3>
              <span style="font-size: 11px; background: #1e3a8a; color: #93c5fd; padding: 2px 8px; border-radius: 999px; font-weight: 600;">Mật khẩu chung: 123456</span>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;">
              Bấm vào bất kỳ tài khoản nào bên dưới để đăng nhập ngay và trải nghiệm giao diện đã được lọc gọn theo <strong>Khu vực</strong> & <strong>Ngành nghề</strong>:
            </p>

            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 410px; overflow-y: auto; padding-right: 4px;">
              ${dbState.users.map(u => {
                const r = ROLES[u.role] || ROLES.SALES;
                const reg = REGIONS[u.region] || REGIONS.ALL;
                const ind = INDUSTRIES[u.industry] || INDUSTRIES.ALL;
                const isRevoked = u.status === 'REVOKED';
                return `
                  <div onclick="window.LinklogOS.quickLogin('${u.email}')" style="
                    padding: 11px 14px;
                    border-radius: 10px;
                    background: ${u.role === 'ADMIN' ? 'rgba(239,68,68,0.1)' : '#0b1120'};
                    border: 1px solid ${u.role === 'ADMIN' ? '#ef4444' : '#1e293b'};
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: ${isRevoked ? 'not-allowed' : 'pointer'};
                    opacity: ${isRevoked ? '0.5' : '1'};
                    transition: all 0.15s;
                  " onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='${u.role === 'ADMIN' ? '#ef4444' : '#1e293b'}'">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 13px; font-weight: 800; color: #ffffff;">${u.fullName}</span>
                        <span style="font-size: 11px; color: #64748b; font-family: monospace;">(${u.email})</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px; margin-top: 5px; flex-wrap: wrap;">
                        <span style="background: ${r.color}; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px;">
                          ${r.label}
                        </span>
                        <span style="background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.4); color: #38bdf8; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 4px;">
                          📍 ${reg.badge}
                        </span>
                        <span style="background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 4px;">
                          🏭 ${ind.badge}
                        </span>
                        ${isRevoked ? `<span style="background:#ef4444;color:#fff;font-size:10px;padding:1px 6px;border-radius:4px;font-weight:bold;">🔒 ĐÃ THU HỒI</span>` : ''}
                      </div>
                    </div>
                    <div style="color: #60a5fa; font-size: 12px; font-weight: 800; flex-shrink: 0; margin-left: 10px;">
                      Đăng nhập ➔
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('form-gate-login').addEventListener('submit', (e) => {
      e.preventDefault();
      const inputId = document.getElementById('gate-input-email').value.trim().toLowerCase();
      const inputPass = document.getElementById('gate-input-pass').value.trim();
      const errBox = document.getElementById('gate-login-error');

      const found = dbState.users.find(u =>
        (u.email.toLowerCase() === inputId || (u.username && u.username.toLowerCase() === inputId)) &&
        String(u.password) === inputPass
      );

      if (!found) {
        errBox.style.display = 'block';
        errBox.innerText = '❌ Email/Tên đăng nhập hoặc mật khẩu không chính xác!';
        return;
      }

      if (found.status === 'REVOKED') {
        errBox.style.display = 'block';
        errBox.innerText = '⛔ Tài khoản của bạn đã bị Quản trị viên thu hồi quyền truy cập!';
        return;
      }

      setActiveUser(found);
      isFocusedWorkspaceOpen = true;
      workspaceFilterMode = (found.role === 'ADMIN' || found.role === 'MANAGER') ? 'ALL_ALLOWED' : 'MY_TASKS';
      renderAllViews();
    });
  }

  // =========================================================================
  // 7. KHÔNG GIAN LÀM VIỆC TẬP TRUNG THEO PHÂN QUYỀN (FOCUSED WORKSPACE)
  // =========================================================================
  function renderFocusedWorkspace() {
    const user = getActiveUser();
    let ws = document.getElementById('linklog-focused-workspace');

    if (!user) {
      if (ws) ws.style.display = 'none';
      return;
    }

    if (!ws) {
      ws = document.createElement('div');
      ws.id = 'linklog-focused-workspace';
      ws.style.cssText = `
        position: fixed;
        inset: 0;
        background: #020617;
        z-index: 95000;
        display: flex;
        flex-direction: column;
        font-family: system-ui, -apple-system, sans-serif;
        color: #f8fafc;
        overflow: hidden;
      `;
      document.body.appendChild(ws);
    }

    // Nếu người dùng tạm thu nhỏ để xem màn hình báo giá gốc
    if (!isFocusedWorkspaceOpen) {
      ws.style.display = 'none';
      renderFloatingSwitchBar(user);
      return;
    }

    ws.style.display = 'flex';
    const floatBar = document.getElementById('linklog-floating-switch');
    if (floatBar) floatBar.style.display = 'none';

    const roleCfg = ROLES[user.role] || ROLES.SALES;
    const regCfg = REGIONS[user.region] || REGIONS.ALL;
    const indCfg = INDUSTRIES[user.industry] || INDUSTRIES.ALL;

    // Lọc danh sách lô hàng theo Khu vực & Ngành nghề của nhân viên này
    const visibleShipments = dbState.shipments.filter(s => isShipmentVisibleToUser(s, user));
    const actionableShipments = visibleShipments.filter(s => isShipmentActionableByUser(s, user));

    // Các cột bước hiển thị:
    // Nếu chọn chế độ "MY_TASKS" (Chỉ hiện việc của bộ phận tôi) -> Chỉ hiển thị các bước mà bộ phận đó phụ trách!
    const allColumns = [
      { step: 1, title: 'BƯỚC 1: Tiếp nhận & Thẩm định', dept: 'Sales • Kế toán • Trưởng BP', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      { step: 2, title: 'BƯỚC 2: Điều phối Cước & Xe', dept: 'Bộ phận Logistics', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
      { step: 3, title: 'BƯỚC 3: Đóng hàng & Hải quan', dept: 'Hiện trường (Ops) • Chứng từ (Docs)', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
      { step: 4, title: 'BƯỚC 4: Thanh lý & Ra Vận đơn B/L', dept: 'Hiện trường (Ops) • Chứng từ (Docs)', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
      { step: 5, title: 'BƯỚC 5: Quyết toán & Hoa hồng', dept: 'Kế toán • Sales', color: '#10b981', bg: 'rgba(16,185,129,0.12)' }
    ];

    const displayedColumns = (workspaceFilterMode === 'MY_TASKS' && user.role !== 'ADMIN' && user.role !== 'MANAGER')
      ? allColumns.filter(c => roleCfg.steps.includes(c.step))
      : allColumns;

    ws.innerHTML = `
      <!-- TOP HEADER CÁ NHÂN HÓA THEO PHÂN QUYỀN -->
      <div style="padding: 12px 24px; background: #0f172a; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #1e3a8a); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; color: #fff;">
            LL
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 15px; font-weight: 800; color: #ffffff;">${user.fullName}</span>
              <span style="background: ${roleCfg.color}; color: #fff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 5px;">
                ${roleCfg.label}
              </span>
              <span style="background: rgba(56,189,248,0.15); border: 1px solid #0284c7; color: #38bdf8; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 5px;">
                📍 Khu vực: ${regCfg.badge}
              </span>
              <span style="background: rgba(245,158,11,0.15); border: 1px solid #d97706; color: #fbbf24; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 5px;">
                🏭 Ngành: ${indCfg.badge}
              </span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 3px; display: flex; align-items: center; gap: 12px;">
              <span>Nhiệm vụ: ${roleCfg.desc}</span>
              <span id="cloud-sync-indicator" style="color: #34d399; font-weight: 600;">🟢 Đã lưu trên Cloudflare R2 & Supabase</span>
            </div>
          </div>
        </div>

        <!-- Cụm nút chức năng bên phải -->
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          ${(user.role === 'ADMIN' || user.role === 'SALES' || user.role === 'MANAGER') ? `
            <button onclick="window.LinklogOS.openCreateBooking()" style="background: #059669; color: #fff; font-weight: 700; font-size: 12px; padding: 8px 14px; border-radius: 8px; border: 1px solid #10b981; cursor: pointer;">
              + Lập Booking Mới (Bước 1)
            </button>
          ` : ''}

          ${user.role === 'ADMIN' ? `
            <button onclick="window.LinklogOS.openAdminStaffModal()" style="background: #dc2626; color: #fff; font-weight: 800; font-size: 12px; padding: 8px 14px; border-radius: 8px; border: 1px solid #f87171; cursor: pointer; box-shadow: 0 2px 10px rgba(220,38,38,0.4);">
              👑 Quản Trị Nhân Sự & Phân Quyền (${dbState.users.length})
            </button>
          ` : ''}

          <button onclick="window.LinklogOS.toggleQuoteDashboard(false)" style="background: #1e293b; color: #cbd5e1; font-weight: 600; font-size: 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; cursor: pointer;" title="Xem giao diện Báo giá & Hợp đồng chung">
            📊 Xem Bàn Báo Giá
          </button>

          <button onclick="window.LinklogOS.logout()" style="background: #334155; color: #fca5a5; font-weight: 700; font-size: 12px; padding: 8px 12px; border-radius: 8px; border: 1px solid #475569; cursor: pointer;">
            🚪 Đăng Xuất / Đổi TK
          </button>
        </div>
      </div>

      <!-- THANH CHẾ ĐỘ HIỂN THỊ TỐI GIẢN (CHỐNG RỐI MẮT CHO NHÂN VIÊN) -->
      <div style="padding: 10px 24px; background: #0b1120; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #94a3b8; font-weight: 600;">Chế độ hiển thị:</span>
          <button onclick="window.LinklogOS.setFilterMode('MY_TASKS')" style="
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            border: ${workspaceFilterMode === 'MY_TASKS' ? '1px solid #3b82f6' : '1px solid #334155'};
            background: ${workspaceFilterMode === 'MY_TASKS' ? '#2563eb' : '#1e293b'};
            color: #ffffff;
          ">
            🎯 Chỉ Hiện Công Việc Của Bộ Phận Tôi (${actionableShipments.length} đơn cần xử lý)
          </button>

          <button onclick="window.LinklogOS.setFilterMode('ALL_ALLOWED')" style="
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            border: ${workspaceFilterMode === 'ALL_ALLOWED' ? '1px solid #3b82f6' : '1px solid #334155'};
            background: ${workspaceFilterMode === 'ALL_ALLOWED' ? '#2563eb' : '#1e293b'};
            color: #ffffff;
          ">
            📋 Xem Đủ 5 Bước Trong Khu Vực & Ngành Của Tôi (${visibleShipments.length} đơn)
          </button>
        </div>

        <div style="font-size: 11px; color: #94a3b8;">
          💡 <em>Các lô hàng thuộc khu vực khác hoặc ngành hàng khác đã được hệ thống tự động ẩn đi để tránh làm rối giao diện.</em>
        </div>
      </div>

      <!-- KHU VỰC BẢNG ĐIỀU HÀNH KANBAN ĐÃ LỌC GỌN -->
      <div style="flex: 1; padding: 20px 24px; overflow-x: auto; overflow-y: hidden; background: #030712;">
        <div style="display: grid; grid-template-columns: repeat(${displayedColumns.length}, minmax(280px, 1fr)); gap: 16px; height: 100%; min-width: ${displayedColumns.length * 290}px;">
          ${displayedColumns.map(col => {
            const colItems = visibleShipments.filter(s => s.currentStep === col.step);
            const isMyStep = roleCfg.steps.includes(col.step);

            return `
              <div style="background: #0b1120; border: 1px solid ${isMyStep ? col.color : '#1e293b'}; border-radius: 14px; display: flex; flex-direction: column; height: 100%; overflow: hidden; box-shadow: ${isMyStep ? '0 0 20px rgba(59,130,246,0.1)' : 'none'};">
                <!-- Column Header -->
                <div style="padding: 14px; background: #111827; border-bottom: 1px solid #1f2937;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: ${col.color}; background: ${col.bg}; padding: 3px 8px; border-radius: 5px; border: 1px solid ${col.color};">
                      ${isMyStep ? '⚡ VIỆC CỦA BẠN • ' : ''}BƯỚC ${col.step}
                    </span>
                    <span style="font-size: 12px; font-weight: 800; color: #ffffff; background: #1e293b; padding: 2px 9px; border-radius: 999px;">
                      ${colItems.length}
                    </span>
                  </div>
                  <div style="font-size: 13px; font-weight: 800; color: #ffffff;">${col.title}</div>
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Phụ trách: ${col.dept}</div>
                </div>

                <!-- Column Cards -->
                <div style="flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
                  ${colItems.length === 0 ? `
                    <div style="height: 120px; border: 1px dashed #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 12px; text-align: center; padding: 12px;">
                      Không có lô hàng nào ở bước này thuộc Khu vực (${regCfg.badge}) & Ngành (${indCfg.badge})
                    </div>
                  ` : colItems.map(item => {
                    const itemReg = REGIONS[item.region] || REGIONS.HCM;
                    const itemInd = INDUSTRIES[item.industry] || INDUSTRIES.WOOD;
                    return `
                      <div onclick="window.LinklogOS.openDetail('${item.id}')" style="
                        background: #111827;
                        border: 1px solid #1f2937;
                        border-radius: 10px;
                        padding: 14px;
                        cursor: pointer;
                        transition: all 0.15s;
                      " onmouseover="this.style.borderColor='#3b82f6'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#1f2937'; this.style.transform='none'">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                          <span style="font-family: monospace; font-size: 12px; font-weight: 800; color: #60a5fa;">${item.id}</span>
                          <span style="font-size: 10px; font-weight: 700; background: #1e293b; color: #e2e8f0; padding: 2px 7px; border-radius: 4px;">${item.equipment}</span>
                        </div>

                        <div style="font-size: 13px; font-weight: 800; color: #ffffff; margin-bottom: 3px;">${item.customerName}</div>
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">📦 ${item.cargo}</div>

                        <!-- Nhãn Khu vực & Ngành nghề trên thẻ -->
                        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
                          <span style="font-size: 10px; font-weight: 700; background: rgba(56,189,248,0.12); color: #38bdf8; padding: 2px 6px; border-radius: 4px;">
                            📍 ${itemReg.badge}
                          </span>
                          <span style="font-size: 10px; font-weight: 700; background: rgba(245,158,11,0.12); color: #fbbf24; padding: 2px 6px; border-radius: 4px;">
                            🏭 ${itemInd.badge}
                          </span>
                        </div>

                        <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 9px; font-size: 11px; margin-bottom: 10px;">
                          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="color: #64748b;">Tuyến:</span>
                            <strong style="color: #f1f5f9;">${item.pol.split(' ')[0]} ➔ ${item.pod.split(' ')[0]}</strong>
                          </div>

                          ${col.step === 1 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                              <span style="color: #64748b;">Giá chào:</span>
                              <strong style="color: #fbbf24;">$${item.step1.proposedPriceUsd.toLocaleString()} (${item.step1.paymentTerm})</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; padding-top: 4px; border-top: 1px solid #1e293b;">
                              <span style="color: ${item.step1.accountantApproved ? '#34d399' : '#f59e0b'}; font-weight: 700;">${item.step1.accountantApproved ? '✓ KT đã duyệt' : '⏳ Chờ Kế toán'}</span>
                              <span style="color: ${item.step1.managerApproved ? '#34d399' : '#f59e0b'}; font-weight: 700;">${item.step1.managerApproved ? '✓ Sếp đã duyệt' : '⏳ Chờ Trưởng BP'}</span>
                            </div>
                          ` : ''}

                          ${col.step === 2 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                              <span style="color: #64748b;">Hãng tàu:</span>
                              <strong style="color: #38bdf8;">${item.step2.carrier}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #fb7185; font-weight: 700; padding-top: 4px; border-top: 1px solid #1e293b;">
                              <span>Closing Time:</span>
                              <span>${item.step2.closingTime}</span>
                            </div>
                          ` : ''}

                          ${col.step === 3 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                              <span style="color: #64748b;">Cont / Seal:</span>
                              <strong style="color: #c084fc; font-family: monospace;">${item.step3.containerNo} / ${item.step3.sealNo}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; padding-top: 4px; border-top: 1px solid #1e293b;">
                              <span style="color: #34d399;">Tờ khai: ${item.step3.customsDeclarationNo}</span>
                              <span style="color: #fbbf24;">${item.step3.customsChannel.split(' ')[0]}</span>
                            </div>
                          ` : ''}

                          ${col.step === 4 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                              <span style="color: #64748b;">Số Vận Đơn:</span>
                              <strong style="color: #818cf8; font-family: monospace;">${item.step4.blNo}</strong>
                            </div>
                          ` : ''}

                          ${col.step === 5 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                              <span style="color: #64748b;">Lãi gộp (GP):</span>
                              <strong style="color: #34d399;">+$${item.step5.grossProfitUsd.toLocaleString()}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; padding-top: 4px; border-top: 1px solid #1e293b;">
                              <span style="color: #94a3b8;">Hoa hồng Sales:</span>
                              <strong style="color: #fbbf24;">$${item.step5.commissionAmountUsd.toLocaleString()}</strong>
                            </div>
                          ` : ''}
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
                          <span style="color: #64748b;">👤 ${item.salesRep.split('(')[0]}</span>
                          <span style="color: #60a5fa; font-weight: 800;">Mở xử lý ➔</span>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderFloatingSwitchBar(user) {
    let bar = document.getElementById('linklog-floating-switch');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'linklog-floating-switch';
      bar.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 10px;
        background: #0f172a;
        border: 2px solid #3b82f6;
        padding: 10px 16px;
        border-radius: 999px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        font-family: system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(bar);
    }
    bar.style.display = 'flex';
    bar.innerHTML = `
      <span style="color: #fff; font-size: 12px; font-weight: 700;">👤 ${user.fullName}</span>
      <button onclick="window.LinklogOS.toggleQuoteDashboard(true)" style="background: #2563eb; color: #fff; font-weight: 800; font-size: 12px; padding: 7px 14px; border-radius: 999px; border: none; cursor: pointer;">
        ⚡ Quay Lại Không Gian Vận Hành 5 Bước
      </button>
      <button onclick="window.LinklogOS.logout()" style="background: #334155; color: #fca5a5; font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 999px; border: none; cursor: pointer;">
        Đăng xuất
      </button>
    `;
  }

  // =========================================================================
  // 8. MODAL QUẢN TRỊ NHÂN SỰ: TẠO MỚI, PHÂN QUYỀN KHU VỰC/NGÀNH & THU HỒI TK
  // =========================================================================
  function openAdminStaffModal() {
    const user = getActiveUser();
    if (!user || user.role !== 'ADMIN') {
      alert('⛔ Chỉ Tài khoản Quản trị (Super Admin) mới có quyền truy cập Quản trị Nhân sự!');
      return;
    }

    let modal = document.getElementById('linklog-admin-staff-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'linklog-admin-staff-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.9);
        backdrop-filter: blur(8px);
        z-index: 150000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
        color: #f8fafc;
      `;
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';

    modal.innerHTML = `
      <div style="width: 100%; max-width: 1180px; height: 90vh; background: #0f172a; border: 1px solid #334155; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
        <!-- Header -->
        <div style="padding: 16px 24px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="font-size: 17px; font-weight: 800; color: #ffffff; margin: 0;">👑 Trung Tâm Quản Trị Nhân Sự & Phân Quyền 3 Chiều (Bộ Phận • Khu Vực • Ngành Nghề)</h3>
            <p style="font-size: 12px; color: #94a3b8; margin: 3px 0 0 0;">Tạo tài khoản mới, gán quyền theo Khu vực & Ngành hàng, hoặc Thu hồi/Khóa tài khoản nhân viên. Tự động lưu trên Cloudflare R2 & Supabase.</p>
          </div>
          <button onclick="document.getElementById('linklog-admin-staff-modal').style.display='none'" style="width: 34px; height: 34px; border-radius: 8px; background: #334155; color: #fff; border: none; font-size: 16px; cursor: pointer;">✕</button>
        </div>

        <div style="flex: 1; padding: 20px 24px; overflow-y: auto; background: #020617;">
          <!-- FORM TẠO TÀI KHOẢN NHÂN VIÊN MỚI -->
          <div style="background: #0f172a; border: 1px solid #3b82f6; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 800; color: #60a5fa; margin: 0 0 12px 0;">+ Tạo & Phân Quyền Tài Khoản Nhân Viên Mới</h4>
            <form id="form-admin-create-user" style="display: grid; grid-template-columns: 1.2fr 1.2fr 0.8fr 1.2fr 1fr 1.2fr auto; gap: 10px; align-items: end;">
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Họ và tên nhân viên *</label>
                <input id="adm-new-name" type="text" required placeholder="VD: Trần Văn Bình" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Email đăng nhập *</label>
                <input id="adm-new-email" type="email" required placeholder="binh.tv@linklog.vn" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Mật khẩu *</label>
                <input id="adm-new-pass" type="text" required value="123456" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">1. Bộ phận / Vai trò *</label>
                <select id="adm-new-role" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
                  ${Object.keys(ROLES).map(k => `<option value="${k}">${ROLES[k].label}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">2. Khu vực *</label>
                <select id="adm-new-region" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #38bdf8; font-weight: bold; font-size: 12px; box-sizing: border-box;">
                  ${Object.keys(REGIONS).map(k => `<option value="${k}">${REGIONS[k].badge}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">3. Ngành nghề phụ trách *</label>
                <select id="adm-new-industry" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fbbf24; font-weight: bold; font-size: 12px; box-sizing: border-box;">
                  ${Object.keys(INDUSTRIES).map(k => `<option value="${k}">${INDUSTRIES[k].badge}</option>`).join('')}
                </select>
              </div>
              <button type="submit" style="background: #059669; color: #fff; font-weight: 800; font-size: 12px; padding: 9px 16px; border-radius: 6px; border: none; cursor: pointer; white-space: nowrap;">
                + Cấp Tài Khoản
              </button>
            </form>
          </div>

          <!-- BẢNG DANH SÁCH NHÂN VIÊN & THU HỒI QUYỀN -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #1e293b; color: #cbd5e1; border-bottom: 1px solid #334155;">
                  <th style="padding: 12px;">Nhân viên / Email</th>
                  <th style="padding: 12px;">Mật khẩu</th>
                  <th style="padding: 12px;">Bộ phận (Role)</th>
                  <th style="padding: 12px;">Phân quyền Khu vực</th>
                  <th style="padding: 12px;">Phân quyền Ngành nghề</th>
                  <th style="padding: 12px;">Trạng thái</th>
                  <th style="padding: 12px; text-align: right;">Thu hồi / Xóa</th>
                </tr>
              </thead>
              <tbody>
                ${dbState.users.map((u, idx) => {
                  const isRevoked = u.status === 'REVOKED';
                  return `
                    <tr style="border-bottom: 1px solid #1e293b; background: ${isRevoked ? 'rgba(239,68,68,0.06)' : 'transparent'};">
                      <td style="padding: 10px 12px;">
                        <div style="font-weight: 800; color: #ffffff;">${u.fullName}</div>
                        <div style="font-size: 11px; color: #64748b; font-family: monospace;">${u.email}</div>
                      </td>
                      <td style="padding: 10px 12px; font-family: monospace; color: #94a3b8;">${u.password}</td>
                      <td style="padding: 10px 12px;">
                        <select onchange="window.LinklogOS.updateStaffField(${idx}, 'role', this.value)" style="background: #020617; color: #fff; border: 1px solid #334155; border-radius: 6px; padding: 5px 8px; font-size: 11px;">
                          ${Object.keys(ROLES).map(k => `<option value="${k}" ${u.role === k ? 'selected' : ''}>${ROLES[k].label}</option>`).join('')}
                        </select>
                      </td>
                      <td style="padding: 10px 12px;">
                        <select onchange="window.LinklogOS.updateStaffField(${idx}, 'region', this.value)" style="background: #020617; color: #38bdf8; font-weight: bold; border: 1px solid #334155; border-radius: 6px; padding: 5px 8px; font-size: 11px;">
                          ${Object.keys(REGIONS).map(k => `<option value="${k}" ${u.region === k ? 'selected' : ''}>${REGIONS[k].badge}</option>`).join('')}
                        </select>
                      </td>
                      <td style="padding: 10px 12px;">
                        <select onchange="window.LinklogOS.updateStaffField(${idx}, 'industry', this.value)" style="background: #020617; color: #fbbf24; font-weight: bold; border: 1px solid #334155; border-radius: 6px; padding: 5px 8px; font-size: 11px;">
                          ${Object.keys(INDUSTRIES).map(k => `<option value="${k}" ${u.industry === k ? 'selected' : ''}>${INDUSTRIES[k].badge}</option>`).join('')}
                        </select>
                      </td>
                      <td style="padding: 10px 12px;">
                        <span style="padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 800; background: ${isRevoked ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}; color: ${isRevoked ? '#f87171' : '#34d399'};">
                          ${isRevoked ? '🔒 Đã thu hồi' : '● Hoạt động'}
                        </span>
                      </td>
                      <td style="padding: 10px 12px; text-align: right; white-space: nowrap;">
                        <button onclick="window.LinklogOS.toggleRevokeStaff(${idx})" style="background: ${isRevoked ? '#059669' : '#d97706'}; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; margin-right: 6px;">
                          ${isRevoked ? '🔓 Khôi phục' : '🔒 Thu hồi TK'}
                        </button>
                        <button onclick="window.LinklogOS.deleteStaff(${idx})" style="background: #dc2626; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('form-admin-create-user').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('adm-new-name').value.trim();
      const email = document.getElementById('adm-new-email').value.trim().toLowerCase();
      const password = document.getElementById('adm-new-pass').value.trim();
      const role = document.getElementById('adm-new-role').value;
      const region = document.getElementById('adm-new-region').value;
      const industry = document.getElementById('adm-new-industry').value;

      if (dbState.users.some(u => u.email.toLowerCase() === email)) {
        alert('❌ Email này đã tồn tại trên hệ thống!');
        return;
      }

      dbState.users.push({
        id: 'usr_' + Date.now(),
        email,
        username: email.split('@')[0],
        password,
        fullName,
        role,
        region,
        industry,
        status: 'ACTIVE',
        createdAt: new Date().toISOString().split('T')[0]
      });

      await saveToCloudStorage();
      openAdminStaffModal();
      alert(`✅ Đã tạo tài khoản và lưu lên Cloudflare R2 & Supabase:\n- Nhân viên: ${fullName}\n- Bộ phận: ${ROLES[role].label}\n- Khu vực: ${REGIONS[region].badge}\n- Ngành: ${INDUSTRIES[industry].badge}`);
    });
  }

  // =========================================================================
  // 9. MODAL CHI TIẾT LÔ HÀNG & UPLOAD CHỨNG TỪ LÊN CLOUDFLARE R2
  // =========================================================================
  function openOrderDetailModal(shipmentId) {
    const item = dbState.shipments.find(s => s.id === shipmentId);
    const user = getActiveUser();
    if (!item || !user) return;

    let modal = document.getElementById('shipment-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shipment-detail-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.88);
        backdrop-filter: blur(8px);
        z-index: 140000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
        color: #f8fafc;
      `;
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    const regCfg = REGIONS[item.region] || REGIONS.HCM;
    const indCfg = INDUSTRIES[item.industry] || INDUSTRIES.WOOD;

    modal.innerHTML = `
      <div style="width: 100%; max-width: 920px; max-height: 90vh; background: #0f172a; border: 1px solid #334155; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
        <!-- Header -->
        <div style="padding: 16px 24px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 13px; font-weight: 800; color: #60a5fa; background: #0f172a; padding: 3px 8px; border-radius: 4px; border: 1px solid #3b82f6;">${item.id}</span>
              <h3 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0;">${item.customerName}</h3>
              <span style="font-size: 10px; background: rgba(56,189,248,0.15); color: #38bdf8; padding: 2px 7px; border-radius: 4px; font-weight: 700;">📍 ${regCfg.badge}</span>
              <span style="font-size: 10px; background: rgba(245,158,11,0.15); color: #fbbf24; padding: 2px 7px; border-radius: 4px; font-weight: 700;">🏭 ${indCfg.badge}</span>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">
              Hàng hóa: <strong style="color: #fff;">${item.cargo}</strong> • Cont: <strong style="color: #fff;">${item.equipment}</strong> • Tuyến: <strong style="color: #fff;">${item.pol} ➔ ${item.pod}</strong>
            </p>
          </div>
          <button onclick="document.getElementById('shipment-detail-modal').style.display='none'" style="width: 32px; height: 32px; border-radius: 8px; background: #334155; color: #fff; border: none; cursor: pointer;">✕</button>
        </div>

        <!-- Stepper -->
        <div style="padding: 12px 24px; background: #0b1120; border-bottom: 1px solid #1e293b; display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; text-align: center; font-size: 11px;">
          ${[1, 2, 3, 4, 5].map(step => {
            const done = item.currentStep > step;
            const curr = item.currentStep === step;
            const labels = ['1. Tiếp nhận & Duyệt', '2. Cước & Đặt xe', '3. Đóng hàng & HQ', '4. Thanh lý & B/L', '5. Quyết toán & GP'];
            return `
              <div style="padding: 8px 4px; border-radius: 6px; border: 1px solid ${done ? '#059669' : curr ? '#3b82f6' : '#1e293b'}; background: ${done ? 'rgba(5,150,105,0.2)' : curr ? 'rgba(37,99,235,0.25)' : '#0f172a'}; color: ${done ? '#34d399' : curr ? '#60a5fa' : '#64748b'}; font-weight: ${curr ? '800' : 'normal'};">
                <div>${done ? '✓' : curr ? '▶' : '○'} Bước ${step}</div>
                <div style="font-size: 10px; margin-top: 2px;">${labels[step - 1]}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Body -->
        <div style="flex: 1; padding: 20px 24px; overflow-y: auto; background: #020617;">
          <div style="background: #0f172a; border: 1px solid #3b82f6; border-radius: 12px; padding: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 0;">Thao tác nghiệp vụ tại Bước ${item.currentStep}</h4>
              <span style="font-size: 11px; color: #93c5fd; background: #1e3a8a; padding: 3px 10px; border-radius: 6px;">${item.statusText}</span>
            </div>

            ${item.currentStep === 1 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 14px; font-size: 12px;">
                <div><span style="color: #94a3b8;">Giá đề xuất bán:</span> <strong style="color: #fbbf24; margin-left: 6px;">$${item.step1.proposedPriceUsd.toLocaleString()} / cont</strong></div>
                <div><span style="color: #94a3b8;">Điều kiện thanh toán:</span> <strong style="color: #ffffff; margin-left: 6px;">${item.step1.paymentTerm}</strong></div>
              </div>
              <div style="display: flex; gap: 12px;">
                <button onclick="window.LinklogOS.approveStep1Accountant('${item.id}')" style="flex: 1; background: ${item.step1.accountantApproved ? '#064e3b' : '#059669'}; color: #fff; font-weight: 800; font-size: 12px; padding: 11px; border-radius: 8px; border: 1px solid #10b981; cursor: pointer;" ${item.step1.accountantApproved ? 'disabled' : ''}>
                  ${item.step1.accountantApproved ? '✓ Kế Toán Đã Duyệt (' + item.step1.accountantName + ')' : '👉 Kế Toán: Duyệt Điều Kiện Thanh Toán'}
                </button>
                <button onclick="window.LinklogOS.approveStep1Manager('${item.id}')" style="flex: 1; background: ${item.step1.managerApproved ? '#064e3b' : '#2563eb'}; color: #fff; font-weight: 800; font-size: 12px; padding: 11px; border-radius: 8px; border: 1px solid #3b82f6; cursor: pointer;" ${item.step1.managerApproved ? 'disabled' : ''}>
                  ${item.step1.managerApproved ? '✓ Trưởng BP Đã Duyệt (' + item.step1.managerName + ')' : '👉 Trưởng BP: Phê Duyệt Giá Cước'}
                </button>
              </div>
            ` : ''}

            ${item.currentStep === 2 ? `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 14px;">
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Hãng tàu:</label><input id="in-s2-carrier" type="text" value="${item.step2.carrier}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Số Booking Note:</label><input id="in-s2-booking" type="text" value="${item.step2.bookingNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Tàu / Chuyến:</label><input id="in-s2-vessel" type="text" value="${item.step2.vesselVoyage}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Closing Time:</label><input id="in-s2-closing" type="text" value="${item.step2.closingTime}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fb7185; font-weight: bold; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Nhà xe kéo:</label><input id="in-s2-trucker" type="text" value="${item.step2.truckingVendor}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Biển số xe:</label><input id="in-s2-plate" type="text" value="${item.step2.truckPlate}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
              </div>
              <button onclick="window.LinklogOS.completeStep2('${item.id}')" style="width: 100%; background: #2563eb; color: #fff; font-weight: 800; font-size: 12px; padding: 11px; border-radius: 8px; border: 1px solid #3b82f6; cursor: pointer;">
                👉 Logistics: Xác Nhận Booking & Điều Xe Kéo (Lưu R2 & Chuyển Bước 3)
              </button>
            ` : ''}

            ${item.currentStep === 3 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div style="background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
                  <h5 style="color: #c084fc; font-size: 12px; font-weight: bold; margin: 0 0 8px 0;">1. Hiện Trường Bãi/Cảng (Ops)</h5>
                  <div style="margin-bottom: 8px;"><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Container:</label><input id="in-s3-cont" type="text" value="${item.step3.containerNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                  <div style="margin-bottom: 8px;"><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Chì (Seal):</label><input id="in-s3-seal" type="text" value="${item.step3.sealNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <input id="file-s3-seal" type="file" style="font-size: 11px; color: #94a3b8; flex: 1;">
                    <button onclick="window.LinklogOS.uploadR2('file-s3-seal', '${item.id}', 'SEAL')" style="background: #334155; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">⬆️ Lưu R2</button>
                  </div>
                  ${item.step3.sealFileUrl ? `<div style="margin-top:4px;font-size:10px;"><a href="${item.step3.sealFileUrl}" target="_blank" style="color:#34d399;">✓ Xem ảnh Seal trên Cloudflare R2</a></div>` : ''}
                </div>
                <div style="background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
                  <h5 style="color: #818cf8; font-size: 12px; font-weight: bold; margin: 0 0 8px 0;">2. Chứng Từ Hải Quan (Docs)</h5>
                  <div style="margin-bottom: 8px;"><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Tờ Khai HQ:</label><input id="in-s3-tk" type="text" value="${item.step3.customsDeclarationNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                  <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Phân Luồng:</label>
                    <select id="in-s3-channel" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;">
                      <option value="XANH (Luồng Xanh)">🟢 Luồng Xanh</option>
                      <option value="VÀNG (Luồng Vàng)" ${item.step3.customsChannel.includes('VÀNG') ? 'selected' : ''}>🟡 Luồng Vàng</option>
                      <option value="ĐỎ (Luồng Đỏ)" ${item.step3.customsChannel.includes('ĐỎ') ? 'selected' : ''}>🔴 Luồng Đỏ</option>
                    </select>
                  </div>
                </div>
              </div>
              <button onclick="window.LinklogOS.completeStep3('${item.id}')" style="width: 100%; background: #9333ea; color: #fff; font-weight: 800; font-size: 12px; padding: 11px; border-radius: 8px; border: 1px solid #a855f7; cursor: pointer;">
                👉 Ops & Docs: Xác Nhận Đã Kẹp Seal & Thông Quan (Chuyển Bước 4)
              </button>
            ` : ''}

            ${item.currentStep === 4 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 14px;">
                <div>
                  <h5 style="color: #818cf8; font-size: 12px; font-weight: bold; margin: 0 0 6px 0;">Thanh Lý Sổ Tàu (Ops)</h5>
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #ffffff;">
                    <input type="checkbox" checked> <span>Đã bàn giao tờ khai thông quan cho hãng tàu</span>
                  </label>
                </div>
                <div>
                  <h5 style="color: #60a5fa; font-size: 12px; font-weight: bold; margin: 0 0 6px 0;">Phát Hành Vận Đơn B/L (Docs)</h5>
                  <input id="in-s4-blno" type="text" value="${item.step4.blNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box; margin-bottom: 6px;">
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <input id="file-s4-bl" type="file" style="font-size: 11px; color: #94a3b8; flex: 1;">
                    <button onclick="window.LinklogOS.uploadR2('file-s4-bl', '${item.id}', 'BL')" style="background: #334155; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">⬆️ Tải B/L lên R2</button>
                  </div>
                  ${item.step4.blFileUrl ? `<div style="margin-top:4px;font-size:10px;"><a href="${item.step4.blFileUrl}" target="_blank" style="color:#34d399;">✓ Tải file B/L từ Cloudflare R2</a></div>` : ''}
                </div>
              </div>
              <button onclick="window.LinklogOS.completeStep4('${item.id}')" style="width: 100%; background: #4f46e5; color: #fff; font-weight: 800; font-size: 12px; padding: 11px; border-radius: 8px; border: 1px solid #6366f1; cursor: pointer;">
                👉 Ops & Docs: Xác Nhận Phát Hành Vận Đơn B/L (Chuyển Bước 5)
              </button>
            ` : ''}

            ${item.currentStep === 5 ? `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #0b1120; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; text-align: center; margin-bottom: 14px;">
                <div style="background: #020617; padding: 8px; border-radius: 6px;"><span style="font-size: 11px; color: #94a3b8; display: block;">Doanh Thu:</span><strong style="font-size: 15px; color: #60a5fa;">$${item.step5.totalRevenueUsd.toLocaleString()}</strong></div>
                <div style="background: #020617; padding: 8px; border-radius: 6px;"><span style="font-size: 11px; color: #94a3b8; display: block;">Chi Phí:</span><strong style="font-size: 15px; color: #fb7185;">$${item.step5.totalCostUsd.toLocaleString()}</strong></div>
                <div style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 8px; border-radius: 6px;"><span style="font-size: 11px; color: #34d399; display: block;">Lãi Gộp (GP):</span><strong style="font-size: 15px; color: #34d399;">+$${item.step5.grossProfitUsd.toLocaleString()}</strong></div>
              </div>
              <div style="background: rgba(245,158,11,0.15); border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <div><strong style="color: #fbbf24; font-size: 12px; display: block;">Hoa hồng Sales (${item.salesRep}):</strong><span style="font-size: 11px; color: #cbd5e1;">GP ($${item.step5.grossProfitUsd}) x ${item.step5.commissionRatePercent}%</span></div>
                <strong style="font-size: 16px; color: #fbbf24;">$${item.step5.commissionAmountUsd.toLocaleString()} USD</strong>
              </div>
              <button onclick="window.LinklogOS.completeStep5('${item.id}')" style="width: 100%; background: ${item.step5.isSettled ? '#064e3b' : '#059669'}; color: #fff; font-weight: 800; font-size: 12px; padding: 11px; border-radius: 8px; border: 1px solid #10b981; cursor: pointer;" ${item.step5.isSettled ? 'disabled' : ''}>
                ${item.step5.isSettled ? '✓ Đã Quyết Toán Bởi ' + item.step5.settledBy : '👉 Kế Toán: Xác Nhận Đối Soát & Chốt Hoa Hồng (Lưu R2)'}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 10. MODAL TẠO BOOKING MỚI (GẮN KHU VỰC & NGÀNH NGHỀ)
  // =========================================================================
  function openCreateBookingModal() {
    const user = getActiveUser();
    if (!user) return;

    let modal = document.getElementById('create-booking-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'create-booking-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.88);
        backdrop-filter: blur(8px);
        z-index: 145000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
        color: #f8fafc;
      `;
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    const defaultRegion = user.region !== 'ALL' ? user.region : 'HCM';
    const defaultIndustry = user.industry !== 'ALL' ? user.industry : 'WOOD';

    modal.innerHTML = `
      <div style="background: #0f172a; border: 1px solid #334155; border-radius: 16px; width: 100%; max-width: 540px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.85);">
        <div style="padding: 16px 20px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
          <h3 style="font-size: 15px; font-weight: 800; color: #fff; margin: 0;">+ Lập Booking Form Mới (Bước 1)</h3>
          <button onclick="document.getElementById('create-booking-modal').style.display='none'" style="background: #334155; color: #fff; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;">✕</button>
        </div>

        <form id="form-new-booking-v5" style="padding: 20px; display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Tên Khách Hàng Doanh Nghiệp *</label>
            <input id="nb-customer" type="text" required placeholder="VD: Công ty Nội Thất Hoàng Gia" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 11px; color: #38bdf8; font-weight: bold; display: block; margin-bottom: 4px;">Khu Vực Vận Hành *</label>
              <select id="nb-region" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #38bdf8; font-weight: bold; font-size: 12px;">
                <option value="HCM" ${defaultRegion === 'HCM' ? 'selected' : ''}>Miền Nam (HCM)</option>
                <option value="HPH" ${defaultRegion === 'HPH' ? 'selected' : ''}>Miền Bắc (HPH)</option>
                <option value="DAD" ${defaultRegion === 'DAD' ? 'selected' : ''}>Miền Trung (DAD)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 11px; color: #fbbf24; font-weight: bold; display: block; margin-bottom: 4px;">Ngành Hàng *</label>
              <select id="nb-industry" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fbbf24; font-weight: bold; font-size: 12px;">
                <option value="WOOD" ${defaultIndustry === 'WOOD' ? 'selected' : ''}>Ngành Gỗ & Nội Thất</option>
                <option value="AGRI" ${defaultIndustry === 'AGRI' ? 'selected' : ''}>Ngành Nông Sản/Lạnh</option>
                <option value="GARMENT" ${defaultIndustry === 'GARMENT' ? 'selected' : ''}>Ngành Dệt May</option>
                <option value="ELECTRONICS" ${defaultIndustry === 'ELECTRONICS' ? 'selected' : ''}>Ngành Điện Tử/Máy Móc</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Cảng đi (POL) *</label><input id="nb-pol" type="text" required value="Cát Lái (VNHCM)" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Cảng đến (POD) *</label><input id="nb-pod" type="text" required placeholder="VD: Los Angeles (USLAX)" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Tên Hàng Hóa *</label><input id="nb-cargo" type="text" required placeholder="VD: Bàn ghế gỗ xuất khẩu" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Loại Cont *</label>
              <select id="nb-equip" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px;">
                <option value="1 x 20GP">1 x 20GP</option>
                <option value="2 x 40HQ" selected>2 x 40HQ</option>
                <option value="1 x 40RF (Lạnh)">1 x 40RF (Lạnh)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Giá chào (USD/cont) *</label><input id="nb-price" type="number" required value="2600" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Điều kiện thanh toán *</label>
              <select id="nb-term" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px;">
                <option value="Trả trước 100%">Trả trước 100%</option>
                <option value="Công nợ 30 ngày" selected>Công nợ 30 ngày</option>
                <option value="Thư tín dụng L/C">Thư tín dụng L/C</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" onclick="document.getElementById('create-booking-modal').style.display='none'" style="padding: 8px 14px; background: #334155; color: #fff; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Hủy</button>
            <button type="submit" style="padding: 8px 16px; background: #059669; color: #fff; font-weight: 800; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">💾 Lưu Lên Cloudflare R2 & Bắt Đầu Bước 1</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('form-new-booking-v5').addEventListener('submit', async (e) => {
      e.preventDefault();
      const price = parseFloat(document.getElementById('nb-price').value) || 2400;
      const newId = 'SHP-2026-0' + (100 + dbState.shipments.length + 1);

      const newShp = {
        id: newId,
        customerName: document.getElementById('nb-customer').value.trim(),
        salesRep: user.fullName,
        salesEmail: user.email,
        region: document.getElementById('nb-region').value,
        industry: document.getElementById('nb-industry').value,
        pol: document.getElementById('nb-pol').value,
        pod: document.getElementById('nb-pod').value,
        cargo: document.getElementById('nb-cargo').value,
        equipment: document.getElementById('nb-equip').value,
        currentStep: 1,
        statusText: 'Bước 1: Mới tạo - Chờ Kế toán & Trưởng BP duyệt',
        createdAt: 'Vừa xong',
        step1: { proposedPriceUsd: price, paymentTerm: document.getElementById('nb-term').value, accountantApproved: false, accountantName: '', managerApproved: false, managerName: '' },
        step2: { carrier: 'Đang chọn hãng tàu', bookingNo: '', vesselVoyage: '', closingTime: '2026-11-15 18:00', truckingVendor: '', truckPlate: '', bookingFileUrl: '', isDispatched: false },
        step3: { containerNo: 'Đang cấp cont', sealNo: 'Chưa kẹp seal', sealFileUrl: '', isInspectedByOps: false, customsDeclarationNo: 'Chưa truyền', customsChannel: 'VÀNG (Luồng Vàng)', isCleared: false },
        step4: { handedOverToCarrier: false, blType: 'House B/L', blNo: 'Đang dự thảo', blFileUrl: '', blFileUploaded: false, issuedDate: '' },
        step5: { totalRevenueUsd: price * 2, totalCostUsd: Math.round(price * 2 * 0.82), grossProfitUsd: Math.round(price * 2 * 0.18), commissionRatePercent: 12, commissionAmountUsd: Math.round((price * 2 * 0.18) * 0.12), isSettled: false, settledBy: '', settledDate: '' }
      };

      dbState.shipments.unshift(newShp);
      modal.style.display = 'none';
      renderAllViews();
      await saveToCloudStorage();
    });
  }

  function renderAllViews() {
    renderLoginGate();
    renderFocusedWorkspace();
  }

  // =========================================================================
  // 11. PUBLIC API XỬ LÝ SỰ KIỆN
  // =========================================================================
  window.LinklogOS = {
    quickLogin: function(email) {
      const found = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) return;
      if (found.status === 'REVOKED') {
        alert('⛔ Tài khoản này đã bị Quản trị viên thu hồi quyền truy cập!');
        return;
      }
      setActiveUser(found);
      isFocusedWorkspaceOpen = true;
      workspaceFilterMode = (found.role === 'ADMIN' || found.role === 'MANAGER') ? 'ALL_ALLOWED' : 'MY_TASKS';
      renderAllViews();
    },

    logout: function() {
      clearActiveUser();
      const detailModal = document.getElementById('shipment-detail-modal');
      if (detailModal) detailModal.style.display = 'none';
      const admModal = document.getElementById('linklog-admin-staff-modal');
      if (admModal) admModal.style.display = 'none';
      renderAllViews();
    },

    setFilterMode: function(mode) {
      workspaceFilterMode = mode;
      renderFocusedWorkspace();
    },

    toggleQuoteDashboard: function(showWorkspace) {
      isFocusedWorkspaceOpen = showWorkspace;
      renderFocusedWorkspace();
    },

    openAdminStaffModal: openAdminStaffModal,
    openCreateBooking: openCreateBookingModal,
    openDetail: openOrderDetailModal,
    uploadR2: uploadAttachmentToR2,

    updateStaffField: async function(idx, field, value) {
      const user = getActiveUser();
      if (!user || user.role !== 'ADMIN') return;
      if (dbState.users[idx]) {
        dbState.users[idx][field] = value;
        await saveToCloudStorage();
        openAdminStaffModal();
      }
    },

    toggleRevokeStaff: async function(idx) {
      const user = getActiveUser();
      if (!user || user.role !== 'ADMIN') return;
      const target = dbState.users[idx];
      if (!target) return;
      if (target.email === 'admin@linklog.vn') {
        alert('⚠️ Không thể thu hồi tài khoản Tổng Quản Trị gốc!');
        return;
      }
      target.status = target.status === 'REVOKED' ? 'ACTIVE' : 'REVOKED';
      await saveToCloudStorage();
      openAdminStaffModal();
    },

    deleteStaff: async function(idx) {
      const user = getActiveUser();
      if (!user || user.role !== 'ADMIN') return;
      const target = dbState.users[idx];
      if (!target) return;
      if (target.email === 'admin@linklog.vn') {
        alert('⚠️ Không thể xóa tài khoản Tổng Quản Trị gốc!');
        return;
      }
      if (confirm(`Xóa vĩnh viễn tài khoản nhân viên "${target.fullName}" (${target.email})?`)) {
        dbState.shipments;
        dbState.users.splice(idx, 1);
        await saveToCloudStorage();
        openAdminStaffModal();
      }
    },

    approveStep1Accountant: async function(id) {
      const user = getActiveUser();
      if (!user || (user.role !== 'ACCOUNTANT' && user.role !== 'ADMIN')) {
        alert('⛔ Chỉ bộ phận KẾ TOÁN (hoặc Admin) mới có quyền duyệt điều kiện thanh toán ở Bước 1!');
        return;
      }
      const item = dbState.shipments.find(s => s.id === id);
      if (!item) return;
      item.step1.accountantApproved = true;
      item.step1.accountantName = user.fullName;
      if (item.step1.managerApproved) {
        item.currentStep = 2;
        item.statusText = 'Bước 2: Đã duyệt - Chờ Logistics lấy Booking & đặt xe';
      } else {
        item.statusText = 'Bước 1: Kế toán đã duyệt - Chờ Trưởng BP duyệt giá';
      }
      renderAllViews();
      openOrderDetailModal(id);
      await saveToCloudStorage();
    },

    approveStep1Manager: async function(id) {
      const user = getActiveUser();
      if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
        alert('⛔ Chỉ TRƯỞNG BỘ PHẬN (hoặc Admin) mới có quyền phê duyệt giá cước ở Bước 1!');
        return;
      }
      const item = dbState.shipments.find(s => s.id === id);
      if (!item) return;
      item.step1.managerApproved = true;
      item.step1.managerName = user.fullName;
      if (item.step1.accountantApproved) {
        item.currentStep = 2;
        item.statusText = 'Bước 2: Đã duyệt - Chờ Logistics lấy Booking & đặt xe';
      } else {
        item.statusText = 'Bước 1: Trưởng BP đã duyệt - Chờ Kế toán duyệt công nợ';
      }
      renderAllViews();
      openOrderDetailModal(id);
      await saveToCloudStorage();
    },

    completeStep2: async function(id) {
      const user = getActiveUser();
      if (!user || (user.role !== 'LOGISTICS' && user.role !== 'ADMIN')) {
        alert('⛔ Chỉ bộ phận LOGISTICS (hoặc Admin) mới có quyền điều phối Booking & xe kéo ở Bước 2!');
        return;
      }
      const item = dbState.shipments.find(s => s.id === id);
      if (!item) return;
      item.step2.carrier = document.getElementById('in-s2-carrier')?.value || item.step2.carrier;
      item.step2.bookingNo = document.getElementById('in-s2-booking')?.value || item.step2.bookingNo;
      item.step2.vesselVoyage = document.getElementById('in-s2-vessel')?.value || item.step2.vesselVoyage;
      item.step2.closingTime = document.getElementById('in-s2-closing')?.value || item.step2.closingTime;
      item.step2.truckingVendor = document.getElementById('in-s2-trucker')?.value || item.step2.truckingVendor;
      item.step2.truckPlate = document.getElementById('in-s2-plate')?.value || item.step2.truckPlate;
      item.step2.isDispatched = true;
      item.currentStep = 3;
      item.statusText = 'Bước 3: Đang đóng hàng kẹp seal & truyền tờ khai HQ';
      renderAllViews();
      openOrderDetailModal(id);
      await saveToCloudStorage();
    },

    completeStep3: async function(id) {
      const user = getActiveUser();
      if (!user || (!['OPS', 'DOCS', 'ADMIN'].includes(user.role))) {
        alert('⛔ Chỉ bộ phận HIỆN TRƯỜNG (OPS) hoặc CHỨNG TỪ (DOCS) mới có quyền xác nhận Bước 3!');
        return;
      }
      const item = dbState.shipments.find(s => s.id === id);
      if (!item) return;
      item.step3.containerNo = document.getElementById('in-s3-cont')?.value || item.step3.containerNo;
      item.step3.sealNo = document.getElementById('in-s3-seal')?.value || item.step3.sealNo;
      item.step3.customsDeclarationNo = document.getElementById('in-s3-tk')?.value || item.step3.customsDeclarationNo;
      item.step3.customsChannel = document.getElementById('in-s3-channel')?.value || item.step3.customsChannel;
      item.step3.isInspectedByOps = true;
      item.step3.isCleared = true;
      item.currentStep = 4;
      item.statusText = 'Bước 4: Đã thông quan - Chờ thanh lý sổ tàu & phát hành B/L';
      renderAllViews();
      openOrderDetailModal(id);
      await saveToCloudStorage();
    },

    completeStep4: async function(id) {
      const user = getActiveUser();
      if (!user || (!['OPS', 'DOCS', 'ADMIN'].includes(user.role))) {
        alert('⛔ Chỉ bộ phận OPS hoặc DOCS mới có quyền thanh lý & phát hành B/L ở Bước 4!');
        return;
      }
      const item = dbState.shipments.find(s => s.id === id);
      if (!item) return;
      item.step4.blNo = document.getElementById('in-s4-blno')?.value || item.step4.blNo;
      item.step4.handedOverToCarrier = true;
      item.step4.blFileUploaded = true;
      item.currentStep = 5;
      item.statusText = 'Bước 5: Đã ra B/L - Chờ Kế toán đối soát & chốt hoa hồng';
      renderAllViews();
      openOrderDetailModal(id);
      await saveToCloudStorage();
    },

    completeStep5: async function(id) {
      const user = getActiveUser();
      if (!user || (user.role !== 'ACCOUNTANT' && user.role !== 'ADMIN')) {
        alert('⛔ Chỉ bộ phận KẾ TOÁN (hoặc Admin) mới có quyền chốt quyết toán & hoa hồng ở Bước 5!');
        return;
      }
      const item = dbState.shipments.find(s => s.id === id);
      if (!item) return;
      item.step5.isSettled = true;
      item.step5.settledBy = user.fullName;
      item.step5.settledDate = new Date().toISOString().split('T')[0];
      item.statusText = 'HOÀN TẤT QUYẾT TOÁN & ĐÃ LƯU TRỮ TRÊN CLOUDFLARE R2';
      renderAllViews();
      openOrderDetailModal(id);
      await saveToCloudStorage();
    }
  };

  // Khởi động hệ thống
  loadLocalDb();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderAllViews();
      loadFromCloudStorage();
    });
  } else {
    renderAllViews();
    loadFromCloudStorage();
  }

})();
