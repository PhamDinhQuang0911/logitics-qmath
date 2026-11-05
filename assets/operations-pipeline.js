/**
 * =================================================================================
 * LINKLOG B2B QUOTE OS - TÍCH HỢP TRỰC TIẾP VÀO GIAO DIỆN GỐC (LIGHT CORPORATE UI)
 * - Giữ nguyên 100% giao diện trắng/xanh gốc của LINKLOG
 * - Gắn chức năng Đăng nhập, Tài khoản Quản trị, Tạo/Phân quyền/Thu hồi nhân sự
 * - Tự động lọc Menu trái, Khu vực (HCM/HPH) & Ngành nghề ngay trên giao diện gốc
 * - Lưu trữ đồng bộ trên Cloudflare R2 & Supabase PostgreSQL
 * =================================================================================
 */

(function () {
  'use strict';

  // Xóa mọi lớp phủ cũ nếu có
  if (document.body) document.body.style.paddingTop = '0px';
  ['linklog-operations-banner', 'linklog-operations-fab', 'linklog-focused-workspace', 'linklog-floating-switch'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  // =========================================================================
  // 1. CẤU HÌNH KẾT NỐI CLOUDFLARE R2 & SUPABASE POSTGRESQL
  // =========================================================================
  const CLOUD_CONFIG = {
    supabaseUrl: 'https://cuniqanbumcrqcdlcvad.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bmlxYW5idW1jcnFjZGxjdmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDE4MTMsImV4cCI6MjEwNDUxNzgxM30.MWSv1QKVlQ9r-8r0hkrqWsmm75hULq_VjPCbTqXDe-o',
    supabaseDocId: 'linklog_logistics_os_v6',
    r2WorkerUploadUrl: 'https://upload-helper.phamngockhanh-942001.workers.dev/',
    r2PublicBaseUrl: 'https://pub-2efc95bbe7924897bdd0db54d0da243f.r2.dev',
    r2DbFileName: 'linklog_logistics_db.json'
  };

  const STORAGE_KEY_DB = 'linklog_native_db_v6';
  const STORAGE_KEY_SESSION = 'linklog_native_session_v6';

  // =========================================================================
  // 2. ĐỊNH NGHĨA PHÂN QUYỀN: BỘ PHẬN x KHU VỰC x NGÀNH NGHỀ TRÊN GIAO DIỆN GỐC
  // =========================================================================
  const ROLES = {
    COMMERCIAL_MANAGER: {
      code: 'COMMERCIAL_MANAGER',
      label: 'Quản Trị Viên / Giám Đốc (Admin)',
      allowedNav: ['home', 'admin', 'inbox', 'quotes', 'rates', 'vendors', 'customers', 'approvals', 'followups', 'intelligence', 'resources'],
      allowedSubNav: ['team', 'settings'],
      steps5: [1, 2, 3, 4, 5]
    },
    BRANCH_LEAD: {
      code: 'BRANCH_LEAD',
      label: 'Trưởng Chi Nhánh (Branch Lead)',
      allowedNav: ['home', 'inbox', 'quotes', 'customers', 'approvals', 'intelligence', 'resources'],
      allowedSubNav: [],
      steps5: [1, 2, 3, 4, 5]
    },
    SALES_MANAGER: {
      code: 'SALES_MANAGER',
      label: 'Trưởng Nhóm Kinh Doanh (Sales Manager)',
      allowedNav: ['home', 'inbox', 'quotes', 'customers', 'followups', 'resources'],
      allowedSubNav: [],
      steps5: [1, 5]
    },
    SALES: {
      code: 'SALES',
      label: 'Chuyên Viên Kinh Doanh (Sales)',
      allowedNav: ['home', 'inbox', 'quotes', 'customers', 'followups', 'resources'],
      allowedSubNav: [],
      steps5: [1, 5]
    },
    PRICING_EXECUTIVE: {
      code: 'PRICING_EXECUTIVE',
      label: 'Điều Phối Giá & Hãng Tàu (Pricing/Logistics)',
      allowedNav: ['home', 'quotes', 'rates', 'vendors', 'resources'],
      allowedSubNav: [],
      steps5: [2]
    },
    OPS_DOCS: {
      code: 'OPS_DOCS',
      label: 'Hiện Trường & Chứng Từ HQ (Ops & Docs)',
      allowedNav: ['home', 'quotes', 'customers', 'resources'],
      allowedSubNav: [],
      steps5: [3, 4]
    },
    ACCOUNTANT: {
      code: 'ACCOUNTANT',
      label: 'Kế Toán Công Nợ & Quyết Toán (Accountant)',
      allowedNav: ['home', 'quotes', 'customers', 'approvals', 'intelligence'],
      allowedSubNav: [],
      steps5: [1, 5]
    }
  };

  const REGIONS = {
    ALL: { code: 'ALL', label: 'Toàn Quốc (HCM & HPH)' },
    HCM: { code: 'HCM', label: 'Chi Nhánh TP.HCM (Miền Nam)' },
    HPH: { code: 'HPH', label: 'Chi Nhánh Hải Phòng (Miền Bắc)' }
  };

  const INDUSTRIES = {
    ALL: { code: 'ALL', label: 'Tất Cả Ngành Nghề' },
    WOOD: { code: 'WOOD', label: 'Ngành Gỗ & Nội Thất' },
    AGRI: { code: 'AGRI', label: 'Ngành Nông Sản & Thực Phẩm' },
    MACHINERY: { code: 'MACHINERY', label: 'Ngành Máy Móc & Công Nghiệp' },
    SERVICE: { code: 'SERVICE', label: 'Dịch Vụ Logistics & Hàng Tiêu Dùng' }
  };

  // Ánh xạ khách hàng & báo giá trong giao diện gốc sang Ngành nghề
  function getCustomerIndustry(cust) {
    if (!cust) return 'SERVICE';
    if (cust.industry) return cust.industry;
    const id = cust.id || cust.customerId || '';
    const text = ((cust.name || '') + ' ' + (cust.customerName || '') + ' ' + (cust.commodity || '') + ' ' + (cust.shipment?.cargo || '')).toLowerCase();
    if (id === 'CUST-01' || id === 'CUST-02' || text.includes('furniture') || text.includes('wood') || text.includes('gỗ') || text.includes('plywood')) return 'WOOD';
    if (id === 'CUST-06' || text.includes('agri') || text.includes('gạo') || text.includes('nông sản') || text.includes('fruits')) return 'AGRI';
    if (id === 'CUST-05' || id === 'CUST-04' || text.includes('machinery') || text.includes('plastic') || text.includes('máy') || text.includes('nhựa')) return 'MACHINERY';
    return 'SERVICE';
  }

  // Bổ sung 2 báo giá mẫu cho Ngành Nông sản (CUST-06) & Ngành Máy móc (CUST-05) để mọi ngành đều có dữ liệu đầy đủ trên giao diện gốc
  const EXTRA_NATIVE_QUOTES = [
    {
      id: 'Q-2026-0098',
      customerName: 'Mekong Agri-Trade International',
      customerId: 'CUST-06',
      stream: 'TRADING',
      commodityValueUsd: 64000,
      branch: 'HCM',
      salesOwner: 'Nguyễn Minh Anh',
      createdAt: '2026-10-04 11:20',
      status: 'READY_TO_PRICE',
      mode: 'Ocean FCL',
      direction: 'Export',
      shipment: {
        id: 'SHP-0098',
        customerName: 'Mekong Agri-Trade',
        direction: 'Export',
        mode: 'Ocean FCL',
        pickup: 'Long An',
        pol: 'Cat Lai',
        pod: 'Los Angeles',
        equipment: '2 × 40HC',
        quantity: 2,
        cargo: 'Gạo ST25 hữu cơ & Hạt điều nông sản',
        targetEtd: '20 Oct 2026',
        incoterm: 'CIF',
        customs: 'Yes',
        destinationCharges: 'No',
        missingFields: [],
        rawInquiry: 'Báo giá xuất khẩu 2x40HC Gạo ST25 & Hạt điều từ Cát Lái đi Los Angeles.'
      },
      activeOptionId: 'OPTION_A',
      options: [
        {
          id: 'OPTION_A',
          label: 'OPTION A',
          tag: 'Lowest Cost',
          carrier: 'ONE',
          transitTimeDays: 21,
          validUntil: '31 Oct 2026',
          routing: ['Long An', 'Cat Lai', 'Los Angeles'],
          lines: [
            { id: 'LA-1', service: 'Ocean Freight', vendorId: 'VND-01', vendorName: 'ONE', rateId: 'RT-0001', rateSource: 'Contract Oct 2026', unit: '40HC', quantity: 2, unitCost: 1450, cost: 2900, sell: 3300, gp: 400, gpPercent: 12.12 }
          ],
          totalCost: 2900,
          totalSell: 3300,
          grossProfit: 400,
          gpPercent: 12.12
        }
      ],
      commercialGate: { status: 'GREEN', reasons: ['Biên lợi nhuận GP 12.12% đạt chuẩn >= 10%'], requiresApproval: false, canIssueDirectly: true },
      timeline: [{ id: 'EV-98', quoteId: 'Q-2026-0098', timestamp: '2026-10-04T11:20:00Z', timeFormatted: '11:20', actor: 'Nguyễn Minh Anh', actorRole: 'Sales', action: 'Tiếp nhận yêu cầu báo giá nông sản xuất khẩu', state: 'READY_TO_PRICE' }],
      agentRuns: []
    },
    {
      id: 'Q-2026-0089',
      customerName: 'Sino-VN Machinery & Automation Corp',
      customerId: 'CUST-05',
      stream: 'TRADING',
      commodityValueUsd: 125000,
      branch: 'HPH',
      salesOwner: 'Lê Quang Hải',
      createdAt: '2026-10-03 09:15',
      status: 'QUOTE_SENT',
      mode: 'Ocean FCL',
      direction: 'Import',
      shipment: {
        id: 'SHP-0089',
        customerName: 'Sino-VN Machinery',
        direction: 'Import',
        mode: 'Ocean FCL',
        pickup: 'Shanghai',
        pol: 'Shanghai',
        pod: 'Hai Phong',
        equipment: '2 × 40HC',
        quantity: 2,
        cargo: 'Máy gia công cơ khí CNC & Cắt Laser',
        targetEtd: '18 Oct 2026',
        incoterm: 'DDP',
        customs: 'Yes',
        destinationCharges: 'Yes',
        missingFields: [],
        rawInquiry: 'Báo giá nhập khẩu trọn gói 2x40HC Máy cơ khí CNC về KCN Bắc Ninh qua cảng Hải Phòng.'
      },
      activeOptionId: 'OPTION_A',
      options: [
        {
          id: 'OPTION_A',
          label: 'OPTION A',
          tag: 'Best Transit',
          carrier: 'COSCO',
          transitTimeDays: 6,
          validUntil: '31 Oct 2026',
          routing: ['Shanghai', 'Hai Phong', 'Bac Ninh'],
          lines: [
            { id: 'LM-1', service: 'Ocean & Trucking Package', vendorId: 'VND-02', vendorName: 'COSCO', rateId: 'RT-0011', rateSource: 'Northern Contract', unit: '40HC', quantity: 2, unitCost: 1100, cost: 2200, sell: 2650, gp: 450, gpPercent: 16.98 }
          ],
          totalCost: 2200,
          totalSell: 2650,
          grossProfit: 450,
          gpPercent: 16.98
        }
      ],
      commercialGate: { status: 'GREEN', reasons: ['Biên lợi nhuận GP 16.98% đạt chuẩn >= 10%'], requiresApproval: false, canIssueDirectly: true },
      timeline: [{ id: 'EV-89', quoteId: 'Q-2026-0089', timestamp: '2026-10-03T09:15:00Z', timeFormatted: '09:15', actor: 'Lê Quang Hải', actorRole: 'Sales HPH', action: 'Phát hành báo giá thiết bị máy móc CNC', state: 'QUOTE_SENT' }],
      agentRuns: []
    }
  ];

  // =========================================================================
  // 3. DANH SÁCH TÀI KHOẢN MẶC ĐỊNH (ĐỒNG BỘ VỚI NHÂN SỰ GIAO DIỆN GỐC)
  // =========================================================================
  const DEFAULT_USERS = [
    {
      id: 'USR-ADMIN',
      name: 'Phạm Đình Quang (Tổng Quản Trị)',
      email: 'admin@linklog.vn',
      username: 'admin',
      password: '123456',
      role: 'COMMERCIAL_MANAGER',
      roleLabel: 'Tổng Quản Trị (Super Admin)',
      branch: 'ALL',
      industry: 'ALL',
      status: 'ACTIVE'
    },
    {
      id: 'USR-01',
      name: 'Nguyễn Minh Anh',
      email: 'minh.anh@linklog.vn',
      username: 'minh.anh',
      password: '123456',
      role: 'SALES_MANAGER',
      roleLabel: 'Sales Manager (Ngành Gỗ - HCM)',
      branch: 'HCM',
      industry: 'WOOD',
      status: 'ACTIVE'
    },
    {
      id: 'USR-AGRI-HCM',
      name: 'Lê Tuấn Kiệt',
      email: 'tuan.kiet@linklog.vn',
      username: 'tuan.kiet',
      password: '123456',
      role: 'SALES',
      roleLabel: 'Sales Specialist (Nông Sản - HCM)',
      branch: 'HCM',
      industry: 'AGRI',
      status: 'ACTIVE'
    },
    {
      id: 'USR-04',
      name: 'Lê Quang Hải',
      email: 'quang.hai@linklog.vn',
      username: 'quang.hai',
      password: '123456',
      role: 'SALES',
      roleLabel: 'Sales Specialist (Ngành Gỗ - HPH)',
      branch: 'HPH',
      industry: 'WOOD',
      status: 'ACTIVE'
    },
    {
      id: 'USR-MACH-HPH',
      name: 'Hoàng Văn Bách',
      email: 'van.bach@linklog.vn',
      username: 'van.bach',
      password: '123456',
      role: 'SALES',
      roleLabel: 'Sales Specialist (Máy Móc - HPH)',
      branch: 'HPH',
      industry: 'MACHINERY',
      status: 'ACTIVE'
    },
    {
      id: 'USR-02',
      name: 'Trần Đức Long',
      email: 'duc.long@linklog.vn',
      username: 'duc.long',
      password: '123456',
      role: 'PRICING_EXECUTIVE',
      roleLabel: 'Pricing & Logistics (HCM)',
      branch: 'HCM',
      industry: 'ALL',
      status: 'ACTIVE'
    },
    {
      id: 'USR-05',
      name: 'Nguyễn Thu Hà',
      email: 'thu.ha@linklog.vn',
      username: 'thu.ha',
      password: '123456',
      role: 'PRICING_EXECUTIVE',
      roleLabel: 'Pricing & Logistics (HPH)',
      branch: 'HPH',
      industry: 'ALL',
      status: 'ACTIVE'
    },
    {
      id: 'USR-03',
      name: 'Phạm Minh Tuấn',
      email: 'minh.tuan@linklog.vn',
      username: 'minh.tuan',
      password: '123456',
      role: 'BRANCH_LEAD',
      roleLabel: 'Trưởng Chi Nhánh HCM',
      branch: 'HCM',
      industry: 'ALL',
      status: 'ACTIVE'
    },
    {
      id: 'USR-06',
      name: 'Hoàng Anh',
      email: 'hoang.anh@linklog.vn',
      username: 'hoang.anh',
      password: '123456',
      role: 'BRANCH_LEAD',
      roleLabel: 'Trưởng Chi Nhánh Hải Phòng',
      branch: 'HPH',
      industry: 'ALL',
      status: 'ACTIVE'
    },
    {
      id: 'USR-OPS-HCM',
      name: 'Bùi Thanh Thảo',
      email: 'thanh.thao@linklog.vn',
      username: 'thanh.thao',
      password: '123456',
      role: 'OPS_DOCS',
      roleLabel: 'Hiện Trường & Chứng Từ (HCM)',
      branch: 'HCM',
      industry: 'ALL',
      status: 'ACTIVE'
    },
    {
      id: 'USR-ACC-ALL',
      name: 'Lê Minh Tâm',
      email: 'ketoan@linklog.vn',
      username: 'ketoan',
      password: '123456',
      role: 'ACCOUNTANT',
      roleLabel: 'Kế Toán Công Nợ (Toàn Quốc)',
      branch: 'ALL',
      industry: 'ALL',
      status: 'ACTIVE'
    }
  ];

  // Dữ liệu 5 bước vận hành
  const DEFAULT_SHIPMENTS = [
    {
      id: 'SHP-2026-0101',
      customerName: 'ABC Furniture Export Corp',
      salesRep: 'Nguyễn Minh Anh',
      region: 'HCM',
      industry: 'WOOD',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Los Angeles (USLAX)',
      cargo: 'Đồ gỗ nội thất xuất khẩu (2x40HC)',
      currentStep: 1,
      statusText: 'Bước 1: Chờ Kế toán & Trưởng CN duyệt',
      step1: { proposedPriceUsd: 3960, paymentTerm: 'L/C 60 ngày', accountantApproved: false, managerApproved: false },
      step2: { carrier: 'ONE Line', bookingNo: 'ONE-SGN-99201', closingTime: '2026-11-10 18:00', truckPlate: '51C-882.91' },
      step3: { containerNo: 'ONEU-8921820', sealNo: 'ONE-VN-98210', sealFileUrl: '', customsNo: '106299182010', channel: 'Luồng Vàng' },
      step4: { blNo: 'ONEYSGN992014', blFileUrl: '' },
      step5: { revenueUsd: 3960, costUsd: 3540, gpUsd: 420, commissionUsd: 50.4, isSettled: false }
    },
    {
      id: 'SHP-2026-0102',
      customerName: 'VietWood Industrial Plywood',
      salesRep: 'Lê Quang Hải',
      region: 'HPH',
      industry: 'WOOD',
      pol: 'Hải Phòng (VNHPH)',
      pod: 'Hamburg (DEHAM)',
      cargo: 'Gỗ ván ép phủ phim (1x40HC)',
      currentStep: 3,
      statusText: 'Bước 3: Đang kẹp seal & truyền tờ khai tại Hải Phòng',
      step1: { proposedPriceUsd: 2705, paymentTerm: 'T/T 30% cọc', accountantApproved: true, managerApproved: true },
      step2: { carrier: 'Hapag-Lloyd', bookingNo: 'HLCU-HPH-881', closingTime: '2026-11-08 20:00', truckPlate: '15C-341.22' },
      step3: { containerNo: 'HLXU-2091821', sealNo: 'HL-VN-55219', sealFileUrl: '', customsNo: '106388102911', channel: 'Luồng Xanh' },
      step4: { blNo: 'HLCUHPH202602', blFileUrl: '' },
      step5: { revenueUsd: 2705, costUsd: 2500, gpUsd: 205, commissionUsd: 24.6, isSettled: false }
    },
    {
      id: 'SHP-2026-0103',
      customerName: 'Mekong Agri-Trade International',
      salesRep: 'Lê Tuấn Kiệt',
      region: 'HCM',
      industry: 'AGRI',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Los Angeles (USLAX)',
      cargo: 'Gạo ST25 hữu cơ & Hạt điều (2x40HC)',
      currentStep: 2,
      statusText: 'Bước 2: Chờ Pricing/Logistics lấy Booking & điều xe',
      step1: { proposedPriceUsd: 3300, paymentTerm: 'D/P qua ngân hàng', accountantApproved: true, managerApproved: true },
      step2: { carrier: 'CMA CGM', bookingNo: 'CMA-SGN-4410', closingTime: '2026-11-09 16:00', truckPlate: '51D-991.44' },
      step3: { containerNo: 'CMAU-7721094', sealNo: 'CMA-VN-11928', sealFileUrl: '', customsNo: '106499201944', channel: 'Luồng Vàng' },
      step4: { blNo: 'CMASGN441029', blFileUrl: '' },
      step5: { revenueUsd: 3300, costUsd: 2900, gpUsd: 400, commissionUsd: 48, isSettled: false }
    }
  ];

  let dbState = {
    users: DEFAULT_USERS,
    shipments: DEFAULT_SHIPMENTS,
    lastUpdated: new Date().toISOString()
  };

  function loadLocalDb() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DB);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
          dbState = parsed;
          return;
        }
      }
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dbState));
  }

  function getActiveUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSION);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const found = dbState.users.find(u => u.email.toLowerCase() === (parsed.email || '').toLowerCase());
      if (found && found.status !== 'REVOKED') return found;
    } catch (e) {}
    return null;
  }

  function setActiveUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_SESSION);
      return;
    }
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    syncUserWithNativeReact(user);
  }

  // Đồng bộ tài khoản đang đăng nhập vào thẳng React State của giao diện gốc
  function syncUserWithNativeReact(user) {
    if (!window.__LINKLOG_REACT__ || !user) return;
    const reactApp = window.__LINKLOG_REACT__;

    // Cập nhật currentUser trong giao diện gốc
    if (reactApp.currentUser?.id !== user.id || reactApp.currentUser?.name !== user.name || reactApp.currentUser?.branch !== user.branch || reactApp.currentUser?.industry !== user.industry) {
      reactApp.setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel: user.roleLabel || (ROLES[user.role]?.label || user.role),
        branch: user.branch || 'ALL',
        industry: user.industry || 'ALL'
      });
    }

    // Tự động khóa Chi nhánh (Khu vực) trên giao diện gốc nếu nhân viên thuộc HCM hoặc HPH
    const targetBranch = (user.branch && user.branch !== 'ALL') ? user.branch : reactApp.currentBranch;
    if (user.branch && user.branch !== 'ALL' && reactApp.currentBranch !== user.branch) {
      reactApp.setCurrentBranch(user.branch);
    }

    // Nếu tab hiện tại không nằm trong danh sách menu được phép của bộ phận này, chuyển về Trung Tâm Điều Hành ('home')
    const roleCfg = ROLES[user.role] || ROLES.SALES;
    const allAllowed = [...roleCfg.allowedNav, ...roleCfg.allowedSubNav];
    if (reactApp.activeNav && !allAllowed.includes(reactApp.activeNav)) {
      reactApp.setActiveNav('home');
    }

    if (reactApp.forceUpdate) reactApp.forceUpdate();
  }

  // =========================================================================
  // 4. ĐỒNG BỘ DỮ LIỆU LÊN CLOUDFLARE R2 & SUPABASE POSTGRESQL
  // =========================================================================
  async function loadFromCloudStorage() {
    let loaded = false;
    try {
      const res = await fetch(`${CLOUD_CONFIG.supabaseUrl}/rest/v1/configurations?id=eq.${CLOUD_CONFIG.supabaseDocId}&select=raw_data`, {
        headers: {
          'apikey': CLOUD_CONFIG.supabaseKey,
          'Authorization': `Bearer ${CLOUD_CONFIG.supabaseKey}`
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].raw_data && Array.isArray(rows[0].raw_data.users)) {
          dbState = rows[0].raw_data;
          localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dbState));
          loaded = true;
        }
      }
    } catch (e) {}

    if (!loaded) {
      try {
        const resR2 = await fetch(`${CLOUD_CONFIG.r2PublicBaseUrl}/${CLOUD_CONFIG.r2DbFileName}?t=${Date.now()}`, { cache: 'no-store' });
        if (resR2.ok) {
          const dataR2 = await resR2.json();
          if (dataR2 && Array.isArray(dataR2.users) && dataR2.users[0]?.roleLabel) {
            dbState = dataR2;
            localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dbState));
            loaded = true;
          }
        }
      } catch (e) {}
    }

    if (!loaded) {
      await saveToCloudStorage();
    }

    const active = getActiveUser();
    if (active) syncUserWithNativeReact(active);
    refreshNativeInjections();
  }

  async function saveToCloudStorage() {
    dbState.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dbState));

    // 1. Lưu trực tiếp lên Cloudflare R2
    try {
      const blob = new Blob([JSON.stringify(dbState, null, 2)], { type: 'application/json' });
      const formData = new FormData();
      formData.append('file', blob, CLOUD_CONFIG.r2DbFileName);
      await fetch(CLOUD_CONFIG.r2WorkerUploadUrl, { method: 'PUT', body: formData });
    } catch (e) {}

    // 2. Đồng bộ sang Supabase PostgreSQL
    try {
      await fetch(`${CLOUD_CONFIG.supabaseUrl}/rest/v1/configurations`, {
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
    } catch (e) {}
  }

  // =========================================================================
  // 5. HOOK LỌC GIAO DIỆN GỐC THEO BỘ PHẬN, KHU VỰC & NGÀNH NGHỀ
  // =========================================================================
  // Lọc nút Chi nhánh trên Header gốc
  window.__LL_BRANCHES__ = function () {
    const user = getActiveUser();
    if (!user || user.branch === 'ALL') return ['ALL', 'HCM', 'HPH'];
    return [user.branch];
  };

  // Lọc Menu trái (Sidebar) theo Bộ phận để nhân viên không bị rối bởi các mục không liên quan
  window.__LL_FILTER_NAV__ = function (navItems) {
    const user = getActiveUser();
    if (!user) return navItems;
    const roleCfg = ROLES[user.role] || ROLES.SALES;
    return navItems.filter(item => roleCfg.allowedNav.includes(item.id));
  };

  window.__LL_FILTER_SUBNAV__ = function (subNavItems) {
    const user = getActiveUser();
    if (!user) return subNavItems;
    const roleCfg = ROLES[user.role] || ROLES.SALES;
    return subNavItems.filter(item => roleCfg.allowedSubNav.includes(item.id));
  };

  // Lọc danh sách Báo giá (Quotes) theo Khu vực & Ngành nghề của nhân viên
  window.__LL_FILTER_QUOTES__ = function (quotes) {
    const user = getActiveUser();
    const merged = [...quotes];
    EXTRA_NATIVE_QUOTES.forEach(eq => {
      if (!merged.some(q => q.id === eq.id)) merged.push(eq);
    });
    if (!user) return merged;

    return merged.filter(q => {
      const matchBranch = (user.branch === 'ALL' || !user.branch) || q.branch === user.branch;
      const qInd = getCustomerIndustry(q);
      const matchInd = (user.industry === 'ALL' || !user.industry) || qInd === user.industry;
      return matchBranch && matchInd;
    });
  };

  // Lọc danh sách Khách hàng (CRM) theo Khu vực & Ngành nghề của nhân viên
  window.__LL_FILTER_CUSTOMERS__ = function (customers) {
    const user = getActiveUser();
    if (!user) return customers;
    return customers.filter(c => {
      const matchBranch = (user.branch === 'ALL' || !user.branch) || c.branch === user.branch;
      const cInd = getCustomerIndustry(c);
      const matchInd = (user.industry === 'ALL' || !user.industry) || cInd === user.industry;
      return matchBranch && matchInd;
    });
  };

  // Lọc Kho giá (Rates) theo Khu vực của nhân viên
  window.__LL_FILTER_RATES__ = function (rates) {
    const user = getActiveUser();
    if (!user || user.branch === 'ALL' || !user.branch) return rates;
    return rates.filter(r => r.branchScope === user.branch || r.branchScope === 'GLOBAL');
  };

  // Lọc Hãng tàu & Nhà xe (Vendors) theo Khu vực của nhân viên
  window.__LL_FILTER_VENDORS__ = function (vendors) {
    const user = getActiveUser();
    if (!user || user.branch === 'ALL' || !user.branch) return vendors;
    return vendors.filter(v => !v.branchCoverage || v.branchCoverage.includes(user.branch));
  };

  // Lọc Follow-ups & Approvals theo các Báo giá mà nhân viên được phép xem
  window.__LL_FILTER_FOLLOWUPS__ = function (followups, _, allowedQuotes) {
    const allowedIds = new Set((allowedQuotes || []).map(q => q.id));
    const user = getActiveUser();
    if (!user) return followups;
    return followups.filter(f => {
      const matchBranch = user.branch === 'ALL' || f.branch === user.branch;
      const matchQuote = allowedIds.size === 0 || allowedIds.has(f.quoteId);
      return matchBranch && matchQuote;
    });
  };

  window.__LL_FILTER_APPROVALS__ = function (approvals, _, allowedQuotes) {
    const allowedIds = new Set((allowedQuotes || []).map(q => q.id));
    const user = getActiveUser();
    if (!user) return approvals;
    return approvals.filter(a => {
      const matchBranch = user.branch === 'ALL' || a.branch === user.branch;
      const matchQuote = allowedIds.size === 0 || allowedIds.has(a.quoteId);
      return matchBranch && matchQuote;
    });
  };

  // =========================================================================
  // 6. HỘP ĐĂNG NHẬP TRẮNG NHỎ GỌN (CHUẨN PHONG CÁCH GIAO DIỆN GỐC)
  // =========================================================================
  function renderLoginModal() {
    const activeUser = getActiveUser();
    let modal = document.getElementById('linklog-clean-login-modal');

    if (activeUser) {
      if (modal) modal.style.display = 'none';
      return;
    }

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'linklog-clean-login-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(3px);
        z-index: 99990;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        font-family: Inter, system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    modal.innerHTML = `
      <div style="width: 100%; max-width: 410px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18); overflow: hidden; color: #0f172a;">
        <div style="padding: 20px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px;">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #1e3a8a; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px;">LL</div>
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #1e3a8a;">LINKLOG — Đăng Nhập</div>
            <div style="font-size: 11px; color: #64748b;">Hệ thống Báo giá & Điều hành Logistics</div>
          </div>
        </div>

        <form id="ll-clean-login-form" style="padding: 20px 24px;">
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 5px;">Email hoặc Tên đăng nhập</label>
            <input id="ll-login-email" type="text" required value="admin@linklog.vn" placeholder="VD: admin@linklog.vn" style="width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #0f172a; background: #ffffff; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 5px;">Mật khẩu</label>
            <input id="ll-login-pass" type="password" required value="123456" placeholder="••••••" style="width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #0f172a; background: #ffffff; box-sizing: border-box;">
          </div>

          <div id="ll-login-err" style="display: none; margin-bottom: 12px; padding: 8px 10px; border-radius: 6px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 12px; font-weight: 600;"></div>

          <button type="submit" style="width: 100%; padding: 10px 14px; background: #1e3a8a; color: #ffffff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;">
            Đăng Nhập Hệ Thống
          </button>

          <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #e2e8f0;">
            <label style="display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 6px;">Hoặc chọn nhanh tài khoản để kiểm tra phân quyền:</label>
            <select id="ll-quick-select-user" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; color: #1e293b; background: #f8fafc; cursor: pointer;">
              ${dbState.users.filter(u => u.status !== 'REVOKED').map(u => `
                <option value="${u.email}">${u.name} — ${u.roleLabel} [${u.branch} • ${INDUSTRIES[u.industry]?.label || u.industry}]</option>
              `).join('')}
            </select>
          </div>
        </form>
      </div>
    `;

    const quickSelect = document.getElementById('ll-quick-select-user');
    if (quickSelect) {
      quickSelect.addEventListener('change', (e) => {
        const selectedEmail = e.target.value;
        const found = dbState.users.find(u => u.email === selectedEmail);
        if (found) {
          document.getElementById('ll-login-email').value = found.email;
          document.getElementById('ll-login-pass').value = found.password || '123456';
        }
      });
    }

    const form = document.getElementById('ll-clean-login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawUser = document.getElementById('ll-login-email').value.trim().toLowerCase();
        const rawPass = document.getElementById('ll-login-pass').value.trim();
        const errBox = document.getElementById('ll-login-err');

        const found = dbState.users.find(u =>
          u.email.toLowerCase() === rawUser ||
          (u.username && u.username.toLowerCase() === rawUser)
        );

        if (!found || found.password !== rawPass) {
          errBox.style.display = 'block';
          errBox.textContent = 'Email hoặc mật khẩu không chính xác!';
          return;
        }

        if (found.status === 'REVOKED') {
          errBox.style.display = 'block';
          errBox.textContent = 'Tài khoản này đã bị Quản trị viên thu hồi quyền truy cập!';
          return;
        }

        setActiveUser(found);
        renderLoginModal();
        refreshNativeInjections();
      });
    }
  }

  // =========================================================================
  // 7. GẮN THÔNG TIN TÀI KHOẢN, NÚT QUẢN TRỊ & ĐĂNG XUẤT VÀO HEADER GỐC
  // =========================================================================
  function renderHeaderControls() {
    const slot = document.getElementById('linklog-header-user-slot');
    const user = getActiveUser();
    if (!slot || !user) return;

    const isAdmin = user.role === 'COMMERCIAL_MANAGER';
    const indShort = user.industry === 'WOOD' ? 'Ngành Gỗ'
      : user.industry === 'AGRI' ? 'Nông sản'
      : user.industry === 'MACHINERY' ? 'Máy móc'
      : user.industry === 'SERVICE' ? 'Logistics'
      : 'Mọi ngành';

    slot.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <button onclick="window.LinklogNative.openPipelineModal()" style="padding: 6px 10px; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap;" title="Mở bảng Quy trình Phối hợp 5 Bước">
          ⚡ Quy Trình 5 Bước
        </button>

        ${isAdmin ? `
          <button onclick="window.LinklogNative.openStaffPage()" style="padding: 6px 10px; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap;" title="Tạo, phân quyền và thu hồi tài khoản nhân viên">
            ⚙️ Quản Trị TK (${dbState.users.length})
          </button>
        ` : ''}

        <div style="text-align: right; padding-left: 6px; border-left: 1px solid #e2e8f0;">
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.2;">${user.name}</div>
          <div style="font-size: 10px; color: #475569; margin-top: 2px;">
            <span style="color: #1d4ed8; font-weight: 600;">${user.branch}</span> •
            <span style="color: #b45309; font-weight: 600;">${indShort}</span>
          </div>
        </div>

        <button onclick="window.LinklogNative.logout()" style="padding: 6px 10px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap;" title="Đăng xuất hoặc đổi tài khoản khác">
          Đăng xuất
        </button>
      </div>
    `;
  }

  // =========================================================================
  // 8. TRANG QUẢN TRỊ TÀI KHOẢN & PHÂN QUYỀN NHÂN VIÊN TRONG GIAO DIỆN GỐC
  //    (Hiển thị trong mục "Đội Ngũ & Phân Quyền" và tab "Quản trị Nhân sự")
  // =========================================================================
  function renderNativeStaffManager(container) {
    if (!container) return;
    const user = getActiveUser();
    const isAdmin = user && user.role === 'COMMERCIAL_MANAGER';

    container.innerHTML = `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); color: #0f172a;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; margin-bottom: 18px;">
          <div>
            <h2 style="font-size: 16px; font-weight: 800; color: #1e3a8a; margin: 0;">Quản Trị Tài Khoản Nhân Viên & Phân Quyền (Bộ Phận • Khu Vực • Ngành Nghề)</h2>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">
              Tạo tài khoản mới, phân quyền theo Khu vực & Ngành nghề để giao diện nhân viên tự động ẩn các phần không liên quan, hoặc thu hồi tài khoản.
            </p>
          </div>
          <span id="ll-cloud-badge" style="font-size: 11px; font-weight: 700; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 5px 10px; border-radius: 6px;">
            ☁️ Đã đồng bộ Cloudflare R2 & Supabase
          </span>
        </div>

        ${isAdmin ? `
          <!-- FORM TẠO TÀI KHOẢN NHÂN VIÊN MỚI -->
          <form id="ll-form-create-staff" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 700; color: #1e3a8a; margin-bottom: 12px;">+ Cấp Tài Khoản & Phân Quyền Nhân Viên Mới</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; align-items: end;">
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">Họ và tên *</label>
                <input id="ns-name" type="text" required placeholder="VD: Trần Văn Bình" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">Email đăng nhập *</label>
                <input id="ns-email" type="email" required placeholder="binh.tv@linklog.vn" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">Mật khẩu *</label>
                <input id="ns-pass" type="text" required value="123456" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">Bộ phận / Vai trò *</label>
                <select id="ns-role" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;">
                  ${Object.keys(ROLES).map(k => `<option value="${k}">${ROLES[k].label}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">Khu vực (Chi nhánh) *</label>
                <select id="ns-branch" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;">
                  ${Object.keys(REGIONS).map(k => `<option value="${k}">${REGIONS[k].label}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">Ngành nghề phụ trách *</label>
                <select id="ns-industry" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff;">
                  ${Object.keys(INDUSTRIES).map(k => `<option value="${k}">${INDUSTRIES[k].label}</option>`).join('')}
                </select>
              </div>
              <div>
                <button type="submit" style="width: 100%; padding: 8px 14px; background: #1e3a8a; color: #ffffff; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
                  + Tạo Tài Khoản
                </button>
              </div>
            </div>
          </form>
        ` : ''}

        <!-- BẢNG DANH SÁCH NHÂN VIÊN -->
        <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
            <thead>
              <tr style="background: #f1f5f9; color: #334155; border-bottom: 1px solid #e2e8f0;">
                <th style="padding: 10px 12px;">Họ & Tên / Email</th>
                <th style="padding: 10px 12px;">Mật khẩu</th>
                <th style="padding: 10px 12px;">Bộ phận (Vai trò)</th>
                <th style="padding: 10px 12px;">Khu vực</th>
                <th style="padding: 10px 12px;">Ngành nghề phụ trách</th>
                <th style="padding: 10px 12px;">Trạng thái</th>
                <th style="padding: 10px 12px; text-align: right;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${dbState.users.map((u, idx) => {
                const revoked = u.status === 'REVOKED';
                return `
                  <tr style="border-bottom: 1px solid #f1f5f9; background: ${revoked ? '#fef2f2' : '#ffffff'};">
                    <td style="padding: 10px 12px;">
                      <div style="font-weight: 700; color: #0f172a;">${u.name}</div>
                      <div style="font-size: 11px; color: #64748b; font-family: monospace;">${u.email}</div>
                    </td>
                    <td style="padding: 10px 12px; font-family: monospace; color: #475569;">${isAdmin ? u.password : '••••••'}</td>
                    <td style="padding: 10px 12px;">
                      <select ${!isAdmin ? 'disabled' : ''} onchange="window.LinklogNative.updateUser(${idx}, 'role', this.value)" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; background: #fff; color: #0f172a;">
                        ${Object.keys(ROLES).map(k => `<option value="${k}" ${u.role === k ? 'selected' : ''}>${ROLES[k].label}</option>`).join('')}
                      </select>
                    </td>
                    <td style="padding: 10px 12px;">
                      <select ${!isAdmin ? 'disabled' : ''} onchange="window.LinklogNative.updateUser(${idx}, 'branch', this.value)" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; background: #fff; color: #1e40af; font-weight: 600;">
                        ${Object.keys(REGIONS).map(k => `<option value="${k}" ${u.branch === k ? 'selected' : ''}>${REGIONS[k].label}</option>`).join('')}
                      </select>
                    </td>
                    <td style="padding: 10px 12px;">
                      <select ${!isAdmin ? 'disabled' : ''} onchange="window.LinklogNative.updateUser(${idx}, 'industry', this.value)" style="padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; background: #fff; color: #b45309; font-weight: 600;">
                        ${Object.keys(INDUSTRIES).map(k => `<option value="${k}" ${u.industry === k ? 'selected' : ''}>${INDUSTRIES[k].label}</option>`).join('')}
                      </select>
                    </td>
                    <td style="padding: 10px 12px;">
                      <span style="padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; background: ${revoked ? '#fee2e2' : '#dcfce7'}; color: ${revoked ? '#b91c1c' : '#15803d'};">
                        ${revoked ? 'Đã thu hồi' : 'Hoạt động'}
                      </span>
                    </td>
                    <td style="padding: 10px 12px; text-align: right; white-space: nowrap;">
                      <button onclick="window.LinklogNative.switchAccount('${u.email}')" style="padding: 4px 8px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; margin-right: 4px;">
                        Đăng nhập thử
                      </button>
                      ${isAdmin && u.email !== 'admin@linklog.vn' ? `
                        <button onclick="window.LinklogNative.toggleRevoke(${idx})" style="padding: 4px 8px; background: ${revoked ? '#dcfce7' : '#fef3c7'}; color: ${revoked ? '#15803d' : '#b45309'}; border: 1px solid ${revoked ? '#86efac' : '#fde68a'}; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; margin-right: 4px;">
                          ${revoked ? 'Khôi phục' : 'Thu hồi TK'}
                        </button>
                        <button onclick="window.LinklogNative.deleteUser(${idx})" style="padding: 4px 8px; background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer;">
                          Xóa
                        </button>
                      ` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const createForm = container.querySelector('#ll-form-create-staff');
    if (createForm) {
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = container.querySelector('#ns-name').value.trim();
        const email = container.querySelector('#ns-email').value.trim().toLowerCase();
        const password = container.querySelector('#ns-pass').value.trim();
        const role = container.querySelector('#ns-role').value;
        const branch = container.querySelector('#ns-branch').value;
        const industry = container.querySelector('#ns-industry').value;

        if (dbState.users.some(u => u.email.toLowerCase() === email)) {
          alert('Email này đã tồn tại trên hệ thống!');
          return;
        }

        dbState.users.push({
          id: 'USR-' + Date.now().toString().slice(-4),
          name,
          email,
          username: email.split('@')[0],
          password,
          role,
          roleLabel: ROLES[role]?.label || role,
          branch,
          industry,
          status: 'ACTIVE'
        });

        renderNativeStaffManager(container);
        renderHeaderControls();
        await saveToCloudStorage();
        alert(`Đã tạo tài khoản nhân viên "${name}" và lưu trên Cloudflare R2 & Supabase!`);
      });
    }
  }

  // =========================================================================
  // 9. MODAL QUY TRÌNH 5 BƯỚC (GIAO DIỆN SÁNG TRẮNG/XANH ĐỒNG BỘ WEB GỐC)
  // =========================================================================
  function openPipelineModal() {
    const user = getActiveUser();
    if (!user) return;

    let modal = document.getElementById('ll-clean-pipeline-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'll-clean-pipeline-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(2px);
        z-index: 99980;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: Inter, system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';

    // Lọc các lô hàng 5 bước theo đúng Khu vực & Ngành nghề của nhân viên đang đăng nhập
    const visibleShipments = dbState.shipments.filter(s => {
      const matchBranch = user.branch === 'ALL' || s.region === user.branch;
      const matchInd = user.industry === 'ALL' || s.industry === user.industry;
      return matchBranch && matchInd;
    });

    const stepsInfo = [
      { step: 1, title: 'BƯỚC 1: Tiếp nhận & Thẩm định', sub: 'Sales lập Booking • Kế toán & Trưởng BP duyệt' },
      { step: 2, title: 'BƯỚC 2: Điều phối Cước & Xe', sub: 'Logistics lấy Booking & đặt xe khớp Closing time' },
      { step: 3, title: 'BƯỚC 3: Đóng hàng & Hải quan', sub: 'Ops kẹp seal tại bãi • Docs truyền tờ khai' },
      { step: 4, title: 'BƯỚC 4: Thanh lý & Xuất B/L', sub: 'Ops bàn giao tờ khai • Docs tải B/L lên R2' },
      { step: 5, title: 'BƯỚC 5: Quyết toán & Lưu trữ', sub: 'Kế toán đối soát chi phí & chốt hoa hồng Sales' }
    ];

    modal.innerHTML = `
      <div style="width: 100%; max-width: 1220px; max-height: 90vh; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px rgba(15,23,42,0.22); color: #0f172a;">
        <div style="padding: 16px 24px; background: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="font-size: 16px; font-weight: 800; color: #1e3a8a; margin: 0;">Quy Trình Vận Hành Phối Hợp Liên Phòng Ban (5 Bước Tiêu Chuẩn)</h3>
            <p style="font-size: 12px; color: #64748b; margin: 3px 0 0 0;">
              Đang lọc theo phân quyền của <strong>${user.name}</strong>: Khu vực <strong>${REGIONS[user.branch]?.label}</strong> • <strong>${INDUSTRIES[user.industry]?.label}</strong>
            </p>
          </div>
          <button onclick="document.getElementById('ll-clean-pipeline-modal').style.display='none'" style="padding: 6px 12px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">✕ Đóng</button>
        </div>

        <div style="flex: 1; padding: 18px 20px; overflow-x: auto; overflow-y: auto;">
          <div style="display: grid; grid-template-columns: repeat(5, minmax(220px, 1fr)); gap: 14px;">
            ${stepsInfo.map(col => {
              const items = visibleShipments.filter(s => s.currentStep === col.step);
              return `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; display: flex; flex-direction: column; min-height: 380px;">
                  <div style="padding: 12px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; border-radius: 10px 10px 0 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 11px; font-weight: 800; color: #1e3a8a;">${col.title}</span>
                      <span style="background: #1e3a8a; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 999px;">${items.length}</span>
                    </div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 3px;">${col.sub}</div>
                  </div>
                  <div style="padding: 10px; display: flex; flex-direction: column; gap: 10px; flex: 1;">
                    ${items.length === 0 ? `<div style="padding: 20px 10px; text-align: center; color: #94a3b8; font-size: 11px;">Không có lô hàng ở bước này</div>` : items.map(item => `
                      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; font-size: 11px;">
                        <div style="display: flex; justify-content: space-between; font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">
                          <span>${item.id}</span>
                          <span style="background: #dbeafe; color: #1e40af; padding: 1px 6px; border-radius: 4px; font-size: 10px;">${item.region}</span>
                        </div>
                        <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${item.customerName}</div>
                        <div style="color: #64748b; margin-bottom: 6px;">${item.cargo}</div>
                        <div style="font-size: 10px; color: #475569; background: #ffffff; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
                          <div>Tuyến: <strong>${item.pol} → ${item.pod}</strong></div>
                          <div style="color: #047857; font-weight: 600; margin-top: 2px;">${item.statusText}</div>
                        </div>
                        ${col.step < 5 ? `
                          <button onclick="window.LinklogNative.advanceShipment('${item.id}')" style="width: 100%; padding: 6px; background: #1e3a8a; color: #fff; border: none; border-radius: 5px; font-size: 11px; font-weight: 700; cursor: pointer;">
                            ✓ Xác nhận & Chuyển Bước ${col.step + 1} →
                          </button>
                        ` : `
                          <div style="text-align: center; padding: 5px; background: #dcfce7; color: #15803d; border-radius: 5px; font-weight: 700;">
                            GP: +$${item.step5.gpUsd} • Hoa hồng: $${item.step5.commissionUsd}
                          </div>
                        `}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 10. TỰ ĐỘNG CẬP NHẬT KHI NGƯỜI DÙNG CHUYỂN TAB TRONG GIAO DIỆN GỐC
  // =========================================================================
  function refreshNativeInjections() {
    renderLoginModal();
    renderHeaderControls();

    const teamContainer = document.getElementById('linklog-native-team-container');
    if (teamContainer && !teamContainer.dataset.rendered) {
      teamContainer.dataset.rendered = 'true';
      renderNativeStaffManager(teamContainer);
    }

    const staffContainer = document.getElementById('linklog-native-staff-container');
    if (staffContainer && !staffContainer.dataset.rendered) {
      staffContainer.dataset.rendered = 'true';
      renderNativeStaffManager(staffContainer);
    }
  }

  // Quan sát DOM nhẹ nhàng để khi người dùng bấm sang tab "Đội Ngũ & Phân Quyền" hoặc "Quản trị 15 Nhân sự" thì bảng quản trị hiện ra ngay
  const observer = new MutationObserver(() => {
    const slot = document.getElementById('linklog-header-user-slot');
    if (slot && !slot.querySelector('button')) {
      renderHeaderControls();
    }
    const teamContainer = document.getElementById('linklog-native-team-container');
    if (teamContainer && !teamContainer.dataset.rendered) {
      teamContainer.dataset.rendered = 'true';
      renderNativeStaffManager(teamContainer);
    }
    const staffContainer = document.getElementById('linklog-native-staff-container');
    if (staffContainer && !staffContainer.dataset.rendered) {
      staffContainer.dataset.rendered = 'true';
      renderNativeStaffManager(staffContainer);
    }
  });

  // =========================================================================
  // 11. PUBLIC API
  // =========================================================================
  window.LinklogNative = {
    logout: function () {
      setActiveUser(null);
      renderLoginModal();
    },

    switchAccount: function (email) {
      const found = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) return;
      if (found.status === 'REVOKED') {
        alert('Tài khoản này đã bị thu hồi quyền truy cập!');
        return;
      }
      setActiveUser(found);
      renderHeaderControls();
      const tc = document.getElementById('linklog-native-team-container');
      if (tc) { tc.dataset.rendered = ''; renderNativeStaffManager(tc); }
      const sc = document.getElementById('linklog-native-staff-container');
      if (sc) { sc.dataset.rendered = ''; renderNativeStaffManager(sc); }
    },

    openStaffPage: function () {
      if (window.__LINKLOG_REACT__) {
        window.__LINKLOG_REACT__.setActiveNav('team');
        setTimeout(() => {
          const tc = document.getElementById('linklog-native-team-container');
          if (tc) { tc.dataset.rendered = ''; renderNativeStaffManager(tc); }
        }, 50);
      }
    },

    openPipelineModal: openPipelineModal,

    advanceShipment: async function (id) {
      const item = dbState.shipments.find(s => s.id === id);
      if (!item || item.currentStep >= 5) return;
      item.currentStep += 1;
      item.statusText = `Đã chuyển sang Bước ${item.currentStep}`;
      openPipelineModal();
      await saveToCloudStorage();
    },

    updateUser: async function (idx, field, val) {
      const target = dbState.users[idx];
      if (!target) return;
      target[field] = val;
      if (field === 'role' && ROLES[val]) {
        target.roleLabel = ROLES[val].label;
      }
      await saveToCloudStorage();
      const active = getActiveUser();
      if (active && active.email === target.email) {
        setActiveUser(target);
      }
      renderHeaderControls();
    },

    toggleRevoke: async function (idx) {
      const target = dbState.users[idx];
      if (!target || target.email === 'admin@linklog.vn') return;
      target.status = target.status === 'REVOKED' ? 'ACTIVE' : 'REVOKED';
      await saveToCloudStorage();
      const tc = document.getElementById('linklog-native-team-container');
      if (tc) renderNativeStaffManager(tc);
      const sc = document.getElementById('linklog-native-staff-container');
      if (sc) renderNativeStaffManager(sc);
    },

    deleteUser: async function (idx) {
      const target = dbState.users[idx];
      if (!target || target.email === 'admin@linklog.vn') return;
      if (confirm(`Xóa tài khoản nhân viên "${target.name}" (${target.email})?`)) {
        dbState.users.splice(idx, 1);
        await saveToCloudStorage();
        const tc = document.getElementById('linklog-native-team-container');
        if (tc) renderNativeStaffManager(tc);
        const sc = document.getElementById('linklog-native-staff-container');
        if (sc) renderNativeStaffManager(sc);
        renderHeaderControls();
      }
    }
  };

  // Khởi chạy
  loadLocalDb();

  function boot() {
    observer.observe(document.body, { childList: true, subtree: true });
    const active = getActiveUser();
    if (active) {
      setTimeout(() => syncUserWithNativeReact(active), 100);
    }
    refreshNativeInjections();
    loadFromCloudStorage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
