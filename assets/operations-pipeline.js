/**
 * LINKLOG QUOTE & OPERATIONS OS - SUPABASE CLOUD + RBAC + 5-STEP WORKFLOW ENGINE
 * Phương án 1: Kết hợp Supabase (PostgreSQL + Auth/RBAC) & Cloudflare / GitHub Pages
 * Độc lập giao diện 100%, không chèn banner đè trang gốc, kiểm soát phân quyền chặt chẽ.
 */

(function () {
  'use strict';

  document.body.style.paddingTop = '0px';
  const oldBanner = document.getElementById('linklog-operations-banner');
  if (oldBanner) oldBanner.remove();

  const STORAGE_KEY_SHIPMENTS = 'linklog_shipments_5steps_v4';
  const STORAGE_KEY_USERS = 'linklog_users_rbac_v4';
  const STORAGE_KEY_CURRENT_USER = 'linklog_current_user_v4';
  const STORAGE_KEY_SUPABASE = 'linklog_supabase_config_v4';

  // Danh mục 7 Vai trò chuẩn trong doanh nghiệp Logistics
  const ROLES_CONFIG = {
    ADMIN: { code: 'ADMIN', label: 'Giám Đốc / Super Admin', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', desc: 'Toàn quyền hệ thống, quản lý nhân sự & duyệt mọi bước' },
    MANAGER: { code: 'MANAGER', label: 'Trưởng Bộ Phận (Manager)', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', desc: 'Thẩm định & phê duyệt giá cước Bước 1, giám sát chung' },
    ACCOUNTANT: { code: 'ACCOUNTANT', label: 'Kế Toán (Accountant)', color: '#10b981', bg: 'rgba(16,185,129,0.15)', desc: 'Duyệt công nợ Bước 1 & Quyết toán hoa hồng Bước 5' },
    SALES: { code: 'SALES', label: 'Kinh Doanh (Sales)', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', desc: 'Lập Booking Form Bước 1 & Theo dõi hoa hồng' },
    LOGISTICS: { code: 'LOGISTICS', label: 'Điều Phối Cước & Xe (Logistics)', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', desc: 'Lấy Booking hãng tàu, điều xe kéo khớp Closing time Bước 2' },
    OPS: { code: 'OPS', label: 'Hiện Trường Bãi/Cảng (Ops)', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', desc: 'Kiểm hàng, kẹp seal Bước 3 & Vào sổ tàu Bước 4' },
    DOCS: { code: 'DOCS', label: 'Chứng Từ & Hải Quan (Docs)', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', desc: 'Truyền tờ khai HQ Bước 3 & Phát hành vận đơn B/L Bước 4' }
  };

  // Danh sách nhân sự mặc định (7 tài khoản đại diện các phòng ban)
  const INITIAL_USERS = [
    { email: 'admin@linklog.vn', full_name: 'Trần Đức Long', role: 'ADMIN', role_label: 'Giám Đốc / Super Admin', branch: 'ALL', password_demo: '123456', is_active: true },
    { email: 'manager@linklog.vn', full_name: 'Vũ Đức Minh', role: 'MANAGER', role_label: 'Trưởng Bộ Phận (Manager)', branch: 'ALL', password_demo: '123456', is_active: true },
    { email: 'ketoan@linklog.vn', full_name: 'Lê Minh Tâm', role: 'ACCOUNTANT', role_label: 'Kế Toán (Accountant)', branch: 'HCM', password_demo: '123456', is_active: true },
    { email: 'sales@linklog.vn', full_name: 'Nguyễn Văn Nam', role: 'SALES', role_label: 'Kinh Doanh (Sales)', branch: 'HCM', password_demo: '123456', is_active: true },
    { email: 'logistics@linklog.vn', full_name: 'Phạm Quốc Bảo', role: 'LOGISTICS', role_label: 'Điều Phối Cước & Xe (Logistics)', branch: 'HCM', password_demo: '123456', is_active: true },
    { email: 'ops@linklog.vn', full_name: 'Đặng Văn Hùng', role: 'OPS', role_label: 'Hiện Trường Bãi/Cảng (Ops)', branch: 'HPH', password_demo: '123456', is_active: true },
    { email: 'docs@linklog.vn', full_name: 'Hoàng Thu Trang', role: 'DOCS', role_label: 'Chứng Từ & Hải Quan (Docs)', branch: 'HCM', password_demo: '123456', is_active: true }
  ];

  // Dữ liệu 5 lô hàng mẫu
  const INITIAL_SHIPMENTS = [
    {
      id: 'SHP-2026-0101',
      customerName: 'ABC Furniture Vietnam',
      salesRep: 'Nguyễn Văn Nam (Sales HCM)',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Long Beach (USLGB)',
      cargo: 'Bàn ghế sofa xuất khẩu',
      equipment: '2 x 40HQ',
      currentStep: 1,
      statusText: 'Chờ thẩm định thanh toán & giá',
      createdAt: '2026-11-04 09:30',
      step1: { proposedPriceUsd: 2850, paymentTerm: 'Công nợ 30 ngày (Credit 30 days)', creditLimitUsd: 50000, currentDebtUsd: 18000, accountantApproved: false, accountantName: '', managerApproved: false, managerName: '' },
      step2: { carrier: 'Maersk Line', bookingNo: 'MSK-99201481', vesselVoyage: 'MAERSK ALABAMA / 2604E', etd: '2026-11-12', closingTime: '2026-11-10 18:00', truckingVendor: 'Huy Hoàng Logistics', truckPlate: '51C-882.91', isDispatched: false },
      step3: { containerNo: 'MSKU-8921820', sealNo: 'ML-VN-98210', isInspectedByOps: false, customsDeclarationNo: '106299182010', customsChannel: 'VÀNG (Luồng Vàng)', specializedCheckType: 'Kiểm dịch thực vật', isCleared: false },
      step4: { handedOverToCarrier: false, blType: 'Master B/L', blNo: 'MSKU99201481', blFileUploaded: false, issuedDate: '' },
      step5: { totalRevenueUsd: 5700, totalCostUsd: 4850, grossProfitUsd: 850, commissionRatePercent: 12, commissionAmountUsd: 102, isSettled: false, settledBy: '', settledDate: '' }
    },
    {
      id: 'SHP-2026-0102',
      customerName: 'VietWood Industrial Plywood',
      salesRep: 'Trần Thị Thu Thảo (Sales HPH)',
      pol: 'Hải Phòng (VNHPH)',
      pod: 'Qingdao (CNQDG)',
      cargo: 'Ván ép cốp pha phủ phim',
      equipment: '3 x 20GP',
      currentStep: 2,
      statusText: 'Đã thẩm định - Đang điều cước & xe kéo',
      createdAt: '2026-11-03 14:15',
      step1: { proposedPriceUsd: 1100, paymentTerm: 'Trả trước 100% trước khi xuất B/L', creditLimitUsd: 0, currentDebtUsd: 0, accountantApproved: true, accountantName: 'Lê Minh Tâm', managerApproved: true, managerName: 'Vũ Đức Minh' },
      step2: { carrier: 'ONE Line', bookingNo: 'ONE-HPH-2026-881', vesselVoyage: 'ONE CONTINUITY / 042W', etd: '2026-11-08', closingTime: '2026-11-06 20:00', truckingVendor: 'Hải An Trucking Đình Vũ', truckPlate: '15C-341.22', isDispatched: true },
      step3: { containerNo: 'TGHU-2091821', sealNo: 'ONE-VN-55219', isInspectedByOps: false, customsDeclarationNo: '106388102911', customsChannel: 'XANH (Luồng Xanh)', specializedCheckType: 'Hun trùng container', isCleared: false },
      step4: { handedOverToCarrier: false, blType: 'House B/L', blNo: 'HBL-LL-2026021', blFileUploaded: false, issuedDate: '' },
      step5: { totalRevenueUsd: 3300, totalCostUsd: 2750, grossProfitUsd: 550, commissionRatePercent: 10, commissionAmountUsd: 55, isSettled: false, settledBy: '', settledDate: '' }
    },
    {
      id: 'SHP-2026-0103',
      customerName: 'Mekong Fruits & Agri Trade',
      salesRep: 'Lê Tuấn Kiệt (Sales HCM)',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Tokyo (JPTYO)',
      cargo: 'Xoài cát sấy dẻo & Thanh long ruột đỏ',
      equipment: '1 x 40RF (Lạnh)',
      currentStep: 3,
      statusText: 'Đang đóng hàng tại bãi & Truyền tờ khai HQ',
      createdAt: '2026-11-02 10:00',
      step1: { proposedPriceUsd: 4200, paymentTerm: 'Thư tín dụng L/C trả ngay', creditLimitUsd: 100000, currentDebtUsd: 25000, accountantApproved: true, accountantName: 'Lê Minh Tâm', managerApproved: true, managerName: 'Vũ Đức Minh' },
      step2: { carrier: 'CMA CGM', bookingNo: 'CMA-SGN-441029', vesselVoyage: 'CMA ANTOINE / 102E', etd: '2026-11-07', closingTime: '2026-11-05 16:00', truckingVendor: 'Huy Hoàng Logistics', truckPlate: '51D-991.44', isDispatched: true },
      step3: { containerNo: 'CMAU-7721094', sealNo: 'CMA-VN-11928', isInspectedByOps: true, customsDeclarationNo: '106499201944', customsChannel: 'VÀNG (Luồng Vàng)', specializedCheckType: 'Kiểm dịch thực vật & C/O', isCleared: true },
      step4: { handedOverToCarrier: false, blType: 'Master B/L', blNo: 'CMA-TYO-99120', blFileUploaded: false, issuedDate: '' },
      step5: { totalRevenueUsd: 4200, totalCostUsd: 3450, grossProfitUsd: 750, commissionRatePercent: 15, commissionAmountUsd: 112.5, isSettled: false, settledBy: '', settledDate: '' }
    },
    {
      id: 'SHP-2026-0104',
      customerName: 'Saigon Garment Manufacturing',
      salesRep: 'Phạm Hồng Ánh (Sales HCM)',
      pol: 'Cái Mép (VNVUT)',
      pod: 'Rotterdam (NLRTM)',
      cargo: 'Quần áo thời trang dệt kim',
      equipment: '4 x 40HQ',
      currentStep: 4,
      statusText: 'Hải quan đã thanh lý - Đang phát hành B/L',
      createdAt: '2026-10-31 08:30',
      step1: { proposedPriceUsd: 3950, paymentTerm: 'Công nợ 15 ngày', creditLimitUsd: 80000, currentDebtUsd: 30000, accountantApproved: true, accountantName: 'Lê Minh Tâm', managerApproved: true, managerName: 'Vũ Đức Minh' },
      step2: { carrier: 'COSCO Shipping', bookingNo: 'COSU-99812034', vesselVoyage: 'COSCO PRIDE / 098W', etd: '2026-11-06', closingTime: '2026-11-04 12:00', truckingVendor: 'Đại Nam Trucking', truckPlate: '72C-109.88', isDispatched: true },
      step3: { containerNo: 'COSU-8819201', sealNo: 'COSU-VN-77218', isInspectedByOps: true, customsDeclarationNo: '106199827101', customsChannel: 'XANH (Luồng Xanh)', specializedCheckType: 'Không yêu cầu', isCleared: true },
      step4: { handedOverToCarrier: true, blType: 'House B/L', blNo: 'HBL-LL-SGN-26019', blFileUploaded: true, issuedDate: '2026-11-04' },
      step5: { totalRevenueUsd: 15800, totalCostUsd: 13600, grossProfitUsd: 2200, commissionRatePercent: 12, commissionAmountUsd: 264, isSettled: false, settledBy: '', settledDate: '' }
    },
    {
      id: 'SHP-2026-0105',
      customerName: 'An Nam Handicrafts Co., Ltd',
      salesRep: 'Hoàng Quốc Việt (Sales HPH)',
      pol: 'Hải Phòng (VNHPH)',
      pod: 'Hamburg (DEHAM)',
      cargo: 'Đồ gốm sứ mỹ nghệ & mây tre đan',
      equipment: '1 x 20GP',
      currentStep: 5,
      statusText: 'Tàu đã chạy - Kế toán đối soát chi phí & hoa hồng',
      createdAt: '2026-10-25 11:20',
      step1: { proposedPriceUsd: 2150, paymentTerm: 'Trả trước 100%', creditLimitUsd: 0, currentDebtUsd: 0, accountantApproved: true, accountantName: 'Lê Minh Tâm', managerApproved: true, managerName: 'Vũ Đức Minh' },
      step2: { carrier: 'Hapag-Lloyd', bookingNo: 'HLCU-HAM-110291', vesselVoyage: 'AL ZUBARA / 2409W', etd: '2026-10-30', closingTime: '2026-10-28 17:00', truckingVendor: 'Hải An Trucking', truckPlate: '15C-881.09', isDispatched: true },
      step3: { containerNo: 'HLXU-4410291', sealNo: 'HL-VN-882190', isInspectedByOps: true, customsDeclarationNo: '106099182099', customsChannel: 'ĐỎ (Luồng Đỏ)', specializedCheckType: 'Hun trùng & C/O', isCleared: true },
      step4: { handedOverToCarrier: true, blType: 'House B/L', blNo: 'HBL-LL-HPH-9918', blFileUploaded: true, issuedDate: '2026-10-30' },
      step5: { totalRevenueUsd: 2150, totalCostUsd: 1690, grossProfitUsd: 460, commissionRatePercent: 12, commissionAmountUsd: 55.2, isSettled: true, settledBy: 'Lê Minh Tâm', settledDate: '2026-11-04' }
    }
  ];

  // Quản lý cấu hình Supabase
  function getSupabaseConfig() {
    try {
      const cfg = localStorage.getItem(STORAGE_KEY_SUPABASE);
      if (cfg) return JSON.parse(cfg);
    } catch (e) {}
    return { url: '', anonKey: '', enabled: false };
  }

  function saveSupabaseConfig(url, anonKey) {
    const cleanUrl = (url || '').trim().replace(/\/$/, '');
    const cleanKey = (anonKey || '').trim();
    const cfg = { url: cleanUrl, anonKey: cleanKey, enabled: !!(cleanUrl && cleanKey) };
    localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(cfg));
    return cfg;
  }

  // Quản lý User & RBAC
  function getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    syncUsersToSupabase(users);
  }

  function getCurrentUser() {
    try {
      const u = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (u) return JSON.parse(u);
    } catch (e) {}
    const defaultAdmin = INITIAL_USERS[0];
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(defaultAdmin));
    return defaultAdmin;
  }

  function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    updateFabUserDisplay();
  }

  // Quản lý Lô hàng (Shipments)
  function getShipments() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SHIPMENTS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY_SHIPMENTS, JSON.stringify(INITIAL_SHIPMENTS));
    return INITIAL_SHIPMENTS;
  }

  function saveShipments(list, changedItem = null) {
    localStorage.setItem(STORAGE_KEY_SHIPMENTS, JSON.stringify(list));
    if (changedItem) {
      syncSingleShipmentToSupabase(changedItem);
    }
  }

  // =========================================================================
  // ĐỒNG BỘ 2 CHIỀU VỚI SUPABASE REST API (POSTGREST)
  // =========================================================================
  async function syncFromSupabase() {
    const cfg = getSupabaseConfig();
    if (!cfg.enabled) return false;

    try {
      // 1. Tải danh sách shipments
      const resShip = await fetch(`${cfg.url}/rest/v1/shipments?select=*&order=id.asc`, {
        headers: {
          'apikey': cfg.anonKey,
          'Authorization': `Bearer ${cfg.anonKey}`
        }
      });

      if (resShip.ok) {
        const rows = await resShip.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped = rows.map(r => ({
            id: r.id,
            customerName: r.customer_name,
            salesRep: r.sales_rep,
            pol: r.pol,
            pod: r.pod,
            cargo: r.cargo,
            equipment: r.equipment,
            currentStep: r.current_step,
            statusText: r.status_text,
            createdAt: r.created_at,
            step1: r.step1 || {},
            step2: r.step2 || {},
            step3: r.step3 || {},
            step4: r.step4 || {},
            step5: r.step5 || {}
          }));
          localStorage.setItem(STORAGE_KEY_SHIPMENTS, JSON.stringify(mapped));
        }
      }

      // 2. Tải danh sách profiles (users)
      const resUsers = await fetch(`${cfg.url}/rest/v1/profiles?select=*&order=created_at.asc`, {
        headers: {
          'apikey': cfg.anonKey,
          'Authorization': `Bearer ${cfg.anonKey}`
        }
      });

      if (resUsers.ok) {
        const uRows = await resUsers.json();
        if (Array.isArray(uRows) && uRows.length > 0) {
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(uRows));
        }
      }

      renderKanban();
      updateFabUserDisplay();
      return true;
    } catch (err) {
      console.warn('Supabase sync warning:', err);
      return false;
    }
  }

  async function syncSingleShipmentToSupabase(item) {
    const cfg = getSupabaseConfig();
    if (!cfg.enabled || !item) return;

    const payload = {
      id: item.id,
      customer_name: item.customerName,
      sales_rep: item.salesRep,
      pol: item.pol,
      pod: item.pod,
      cargo: item.cargo,
      equipment: item.equipment,
      current_step: item.currentStep,
      status_text: item.statusText,
      created_at: item.createdAt,
      step1: item.step1,
      step2: item.step2,
      step3: item.step3,
      step4: item.step4,
      step5: item.step5,
      updated_at: new Date().toISOString()
    };

    try {
      await fetch(`${cfg.url}/rest/v1/shipments`, {
        method: 'POST',
        headers: {
          'apikey': cfg.anonKey,
          'Authorization': `Bearer ${cfg.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Supabase push shipment error:', e);
    }
  }

  async function pushAllToSupabase() {
    const cfg = getSupabaseConfig();
    if (!cfg.enabled) return false;

    const shipments = getShipments();
    for (const s of shipments) {
      await syncSingleShipmentToSupabase(s);
    }
    const users = getUsers();
    await syncUsersToSupabase(users);
    return true;
  }

  async function syncUsersToSupabase(users) {
    const cfg = getSupabaseConfig();
    if (!cfg.enabled) return;

    try {
      for (const u of users) {
        await fetch(`${cfg.url}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'apikey': cfg.anonKey,
            'Authorization': `Bearer ${cfg.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            role_label: u.role_label,
            branch: u.branch || 'HCM',
            password_demo: u.password_demo || '123456',
            is_active: u.is_active !== false
          })
        });
      }
    } catch (e) {
      console.warn('Supabase push users error:', e);
    }
  }

  // Kiểm tra quyền RBAC
  function checkPermission(allowedRoles, actionName) {
    const user = getCurrentUser();
    if (!user.is_active) {
      alert('⛔ Tài khoản của bạn đã bị khóa bởi Quản trị viên!');
      return false;
    }
    if (user.role === 'ADMIN' || allowedRoles.includes(user.role)) {
      return true;
    }
    const allowedLabels = allowedRoles.map(r => ROLES_CONFIG[r]?.label || r).join(' hoặc ');
    alert(`⛔ PHÂN QUYỀN HỆ THỐNG (RBAC):\n\nBạn đang đăng nhập với vai trò: [${user.role_label}].\n\nChức năng "${actionName}" chỉ dành cho bộ phận: [${allowedLabels}] (hoặc Giám đốc Admin).\n\n👉 Vui lòng bấm nút "👤 Đổi Tài Khoản / Phân Quyền" ở góc dưới bên phải để chuyển sang đúng vai trò phụ trách!`);
    return false;
  }

  // =========================================================================
  // GIAO DIỆN CHÍNH: FLOATING ACTION HUB + AUTH + RBAC + KANBAN
  // =========================================================================
  function initWorkflowUI() {
    const fab = document.createElement('div');
    fab.id = 'linklog-operations-fab';
    fab.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    fab.innerHTML = `
      <!-- Thanh hiển thị User đang đăng nhập & Cấu hình Supabase -->
      <div style="display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.95); border: 1px solid #334155; padding: 5px 10px; border-radius: 999px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
        <span id="supabase-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; display: inline-block;" title="Trạng thái kết nối Supabase"></span>
        <button id="btn-open-auth-modal" style="background: none; border: none; color: #f8fafc; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; padding: 2px 4px;">
          <span>👤</span>
          <span id="fab-current-user-name">Trần Đức Long</span>
          <span id="fab-current-user-role" style="background: #ef4444; color: #fff; font-size: 9px; padding: 1px 6px; border-radius: 4px;">ADMIN</span>
        </button>
        <span style="color: #475569;">|</span>
        <button id="btn-open-supabase-modal" style="background: none; border: none; color: #38bdf8; font-size: 11px; font-weight: 700; cursor: pointer; padding: 2px 4px;" title="Kết nối Supabase & Quản trị Nhân sự">
          ⚙️ Quản trị & Supabase
        </button>
      </div>

      <!-- Cụm nút hành động chính -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="btn-quick-new-booking" style="
          background: #059669;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid #10b981;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span style="font-size: 16px; line-height: 1;">+</span>
          <span>Tạo Booking Mới</span>
        </button>

        <button id="btn-open-pipeline-fab" style="
          background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
          color: #ffffff;
          font-weight: 800;
          font-size: 13px;
          padding: 11px 20px;
          border-radius: 999px;
          border: 1px solid #3b82f6;
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.45);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span style="background: #3b82f6; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900;">5S</span>
          <span>QUY TRÌNH 5 BƯỚC</span>
          <span style="background: #ef4444; color: #ffffff; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px;" id="fab-order-count">5</span>
        </button>
      </div>
    `;

    document.body.appendChild(fab);

    createPipelineModal();
    createBookingModal();
    createAuthAndAdminModal();

    document.getElementById('btn-open-pipeline-fab').addEventListener('click', openPipelineModal);
    document.getElementById('btn-quick-new-booking').addEventListener('click', () => {
      if (checkPermission(['SALES', 'MANAGER'], 'Lập Booking Form mới (Bước 1)')) {
        openCreateBookingModal();
      }
    });
    document.getElementById('btn-open-auth-modal').addEventListener('click', () => openAuthModal('LOGIN'));
    document.getElementById('btn-open-supabase-modal').addEventListener('click', () => openAuthModal('ADMIN'));

    updateFabUserDisplay();
    syncFromSupabase();
    setTimeout(tryInjectHeaderButton, 1000);
  }

  function updateFabUserDisplay() {
    const user = getCurrentUser();
    const cfg = getSupabaseConfig();
    const roleObj = ROLES_CONFIG[user.role] || ROLES_CONFIG.SALES;

    const nameEl = document.getElementById('fab-current-user-name');
    const roleEl = document.getElementById('fab-current-user-role');
    const dotEl = document.getElementById('supabase-status-dot');

    if (nameEl) nameEl.innerText = user.full_name;
    if (roleEl) {
      roleEl.innerText = user.role;
      roleEl.style.background = roleObj.color;
    }
    if (dotEl) {
      dotEl.style.background = cfg.enabled ? '#10b981' : '#f59e0b';
      dotEl.title = cfg.enabled ? 'Đã kết nối Supabase Cloud PostgreSQL' : 'Đang chạy Local Storage (Bấm Quản trị & Supabase để kết nối Cloud)';
    }

    const modalUserBanner = document.getElementById('pipeline-active-user-badge');
    if (modalUserBanner) {
      modalUserBanner.innerHTML = `
        Đang thao tác: <strong style="color:#fff;">${user.full_name}</strong> 
        <span style="background:${roleObj.color};color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;margin-left:4px;">${roleObj.label}</span>
      `;
    }
  }

  function tryInjectHeaderButton() {
    const buttons = Array.from(document.querySelectorAll('button'));
    const targetBtn = buttons.find(b => b.innerText && b.innerText.includes('Tạo Báo Giá Mới'));
    if (targetBtn && targetBtn.parentElement && !document.getElementById('btn-header-5steps')) {
      const headerBtn = document.createElement('button');
      headerBtn.id = 'btn-header-5steps';
      headerBtn.className = targetBtn.className;
      headerBtn.style.cssText = `
        background: #1e3a8a !important;
        border: 1px solid #3b82f6 !important;
        color: #ffffff !important;
        font-weight: bold !important;
        margin-right: 8px !important;
        cursor: pointer !important;
      `;
      headerBtn.innerHTML = `<span>⚡ Vận Hành 5 Bước</span>`;
      headerBtn.addEventListener('click', openPipelineModal);
      targetBtn.parentElement.insertBefore(headerBtn, targetBtn);
    }
  }

  // =========================================================================
  // MODAL ĐĂNG NHẬP, QUẢN TRỊ PHÂN QUYỀN NHÂN VIÊN & CẤU HÌNH SUPABASE
  // =========================================================================
  function createAuthAndAdminModal() {
    const modal = document.createElement('div');
    modal.id = 'auth-admin-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.88);
      backdrop-filter: blur(8px);
      z-index: 100005;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    modal.innerHTML = `
      <div style="
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 16px;
        color: #f8fafc;
        width: 100%;
        max-width: 980px;
        height: 88vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.85);
      ">
        <!-- Header -->
        <div style="padding: 16px 24px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(16,185,129,0.2); border: 1px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              🔐
            </div>
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0;">Hệ Thống Tài Khoản, Phân Quyền Nhân Viên (RBAC) & Supabase Cloud</h3>
              <p style="font-size: 12px; color: #94a3b8; margin: 2px 0 0 0;">Phương án 1: Vận hành thực tế với Supabase PostgreSQL + Cloudflare mà không cần thuê VPS</p>
            </div>
          </div>
          <button onclick="document.getElementById('auth-admin-modal').style.display='none'" style="width: 32px; height: 32px; border-radius: 8px; background: #334155; color: #ffffff; border: none; font-size: 16px; cursor: pointer;">✕</button>
        </div>

        <!-- Tabs chuyển đổi -->
        <div style="display: flex; gap: 8px; padding: 12px 24px; background: #0b1120; border-bottom: 1px solid #1e293b;">
          <button id="tab-btn-login" onclick="window.LinklogPipeline.switchAdminTab('LOGIN')" style="padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; background: #2563eb; color: #fff;">
            👤 1. Đăng Nhập & Chuyển Đổi Vai Trò
          </button>
          <button id="tab-btn-users" onclick="window.LinklogPipeline.switchAdminTab('USERS')" style="padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1px solid #334155; cursor: pointer; background: #1e293b; color: #cbd5e1;">
            👑 2. Quản Trị Nhân Sự & Phân Quyền (Admin)
          </button>
          <button id="tab-btn-supabase" onclick="window.LinklogPipeline.switchAdminTab('SUPABASE')" style="padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1px solid #334155; cursor: pointer; background: #1e293b; color: #cbd5e1;">
            ☁️ 3. Kết Nối Database Supabase Cloud
          </button>
        </div>

        <!-- Nội dung Tab -->
        <div id="auth-admin-tab-content" style="flex: 1; padding: 24px; overflow-y: auto; background: #020617;">
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  function openAuthModal(defaultTab = 'LOGIN') {
    const m = document.getElementById('auth-admin-modal');
    if (m) {
      m.style.display = 'flex';
      renderAdminTab(defaultTab);
    }
  }

  function renderAdminTab(tab) {
    const btnLogin = document.getElementById('tab-btn-login');
    const btnUsers = document.getElementById('tab-btn-users');
    const btnSupa = document.getElementById('tab-btn-supabase');

    [btnLogin, btnUsers, btnSupa].forEach(b => {
      if (!b) return;
      b.style.background = '#1e293b';
      b.style.color = '#cbd5e1';
      b.style.border = '1px solid #334155';
    });

    const activeBtn = tab === 'LOGIN' ? btnLogin : tab === 'USERS' ? btnUsers : btnSupa;
    if (activeBtn) {
      activeBtn.style.background = '#2563eb';
      activeBtn.style.color = '#ffffff';
      activeBtn.style.border = 'none';
    }

    const container = document.getElementById('auth-admin-tab-content');
    if (!container) return;

    const currentUser = getCurrentUser();
    const users = getUsers();
    const cfg = getSupabaseConfig();

    if (tab === 'LOGIN') {
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 20px;">
          <!-- Cột trái: Form đăng nhập bằng Email & Mật khẩu -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px;">
            <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 0 0 6px 0;">Đăng Nhập Tài Khoản Nhân Viên</h4>
            <p style="font-size: 11px; color: #94a3b8; margin: 0 0 16px 0;">Nhập email và mật khẩu được cấp bởi Admin công ty</p>

            <form id="form-staff-login" style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Email nhân viên:</label>
                <input id="login-email" type="email" required value="${currentUser.email}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: #fff; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Mật khẩu (Mặc định: 123456):</label>
                <input id="login-pass" type="password" required value="123456" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: #fff; font-size: 12px; box-sizing: border-box;">
              </div>
              <button type="submit" style="margin-top: 6px; background: #2563eb; color: #ffffff; font-weight: bold; font-size: 12px; padding: 11px; border-radius: 8px; border: none; cursor: pointer;">
                🔓 Đăng Nhập Vào Hệ Thống
              </button>
            </form>

            <div style="margin-top: 20px; padding: 12px; background: #0b1120; border-radius: 8px; border: 1px solid #1e293b; font-size: 11px; color: #94a3b8;">
              <strong style="color: #38bdf8; display: block; margin-bottom: 4px;">💡 Cơ chế bảo mật RBAC đang bật:</strong>
              Mỗi nhân viên khi đăng nhập chỉ được phép bấm nút xử lý đúng công đoạn của phòng ban mình trong quy trình 5 bước.
            </div>
          </div>

          <!-- Cột phải: Chuyển nhanh 7 tài khoản phòng ban (1-Click Switch) -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px;">
            <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 0 0 6px 0;">Chuyển Nhanh Vai Trò Phòng Ban (Test Nhanh)</h4>
            <p style="font-size: 11px; color: #94a3b8; margin: 0 0 14px 0;">Click chọn 1 nhân sự bên dưới để đóng vai phòng ban đó và kiểm tra phân quyền trên bảng 5 Bước:</p>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${users.map(u => {
                const r = ROLES_CONFIG[u.role] || ROLES_CONFIG.SALES;
                const isMe = u.email === currentUser.email;
                return `
                  <div onclick="window.LinklogPipeline.quickSwitchUser('${u.email}')" style="
                    padding: 10px 14px;
                    border-radius: 8px;
                    background: ${isMe ? 'rgba(37,99,235,0.2)' : '#0b1120'};
                    border: 1px solid ${isMe ? '#3b82f6' : '#1e293b'};
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                  ">
                    <div>
                      <div style="font-size: 12px; font-weight: bold; color: #ffffff; display: flex; align-items: center; gap: 6px;">
                        <span>${u.full_name}</span>
                        <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">(${u.email})</span>
                      </div>
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${r.desc}</div>
                    </div>
                    <div style="text-align: right; flex-shrink: 0;">
                      <span style="background: ${r.color}; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; display: inline-block;">
                        ${u.role}
                      </span>
                      ${isMe ? `<div style="font-size: 10px; color: #60a5fa; font-weight: bold; margin-top: 3px;">✓ Đang chọn</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;

      document.getElementById('form-staff-login').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const pass = document.getElementById('login-pass').value.trim();
        const found = users.find(u => u.email.toLowerCase() === email && (u.password_demo || '123456') === pass);

        if (!found) {
          alert('❌ Email hoặc mật khẩu không đúng!');
          return;
        }
        if (!found.is_active) {
          alert('⛔ Tài khoản này đã bị khóa bởi Giám đốc / Admin!');
          return;
        }
        setCurrentUser(found);
        renderAdminTab('LOGIN');
        alert(`✅ Đăng nhập thành công:\nXin chào ${found.full_name} (${found.role_label})!`);
      });
    }

    if (tab === 'USERS') {
      const isAdmin = currentUser.role === 'ADMIN';
      container.innerHTML = `
        <div style="space-y: 16px;">
          ${!isAdmin ? `
            <div style="background: rgba(239,68,68,0.15); border: 1px solid #ef4444; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; color: #fca5a5;">
              ⚠️ <strong>Lưu ý:</strong> Bạn đang đăng nhập là <strong>${currentUser.full_name} (${currentUser.role})</strong>. Chỉ tài khoản <strong>ADMIN (Giám đốc)</strong> mới có quyền thêm nhân viên mới hoặc thay đổi phân quyền.
            </div>
          ` : ''}

          <!-- Form thêm nhân viên mới -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0;">+ Cấp Tài Khoản Nhân Viên Vận Hành Mới</h4>
            <form id="form-add-staff" style="display: grid; grid-template-columns: 1.2fr 1.2fr 0.8fr 1.2fr 0.6fr auto; gap: 10px; align-items: end;">
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Họ và tên nhân viên *</label>
                <input id="staff-name" type="text" required placeholder="VD: Nguyễn Thị Hoa" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Email đăng nhập *</label>
                <input id="staff-email" type="email" required placeholder="hoa.nt@linklog.vn" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Mật khẩu *</label>
                <input id="staff-pass" type="text" required value="123456" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Phòng ban / Vai trò (RBAC) *</label>
                <select id="staff-role" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
                  <option value="SALES">SALES - Nhân viên Kinh doanh</option>
                  <option value="ACCOUNTANT">ACCOUNTANT - Kế toán</option>
                  <option value="LOGISTICS">LOGISTICS - Điều phối Cước & Xe</option>
                  <option value="OPS">OPS - Hiện trường Bãi/Cảng</option>
                  <option value="DOCS">DOCS - Chứng từ & Hải quan</option>
                  <option value="MANAGER">MANAGER - Trưởng bộ phận</option>
                  <option value="ADMIN">ADMIN - Giám đốc / Quản trị</option>
                </select>
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Chi nhánh</label>
                <select id="staff-branch" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
                  <option value="HCM">HCM</option>
                  <option value="HPH">HPH</option>
                  <option value="ALL">Tất cả</option>
                </select>
              </div>
              <button type="submit" style="background: #059669; color: #fff; font-weight: bold; font-size: 12px; padding: 8px 14px; border-radius: 6px; border: none; cursor: pointer; height: 35px;">
                + Thêm Nhân Sự
              </button>
            </form>
          </div>

          <!-- Bảng danh sách nhân sự -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: #1e293b; color: #94a3b8; border-bottom: 1px solid #334155;">
                  <th style="padding: 10px 14px;">Họ và Tên</th>
                  <th style="padding: 10px 14px;">Email</th>
                  <th style="padding: 10px 14px;">Chi nhánh</th>
                  <th style="padding: 10px 14px;">Phân quyền Vai trò (RBAC)</th>
                  <th style="padding: 10px 14px;">Trạng thái</th>
                  <th style="padding: 10px 14px; text-align: right;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${users.map((u, idx) => {
                  const r = ROLES_CONFIG[u.role] || ROLES_CONFIG.SALES;
                  return `
                    <tr style="border-bottom: 1px solid #1e293b;">
                      <td style="padding: 10px 14px; font-weight: bold; color: #fff;">${u.full_name}</td>
                      <td style="padding: 10px 14px; color: #94a3b8; font-family: monospace;">${u.email}</td>
                      <td style="padding: 10px 14px;"><span style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${u.branch || 'HCM'}</span></td>
                      <td style="padding: 10px 14px;">
                        <select onchange="window.LinklogPipeline.changeUserRole(${idx}, this.value)" style="background: #020617; color: ${r.color}; font-weight: bold; border: 1px solid #334155; border-radius: 6px; padding: 4px 8px; font-size: 11px;">
                          ${Object.keys(ROLES_CONFIG).map(k => `<option value="${k}" ${u.role === k ? 'selected' : ''}>${k} - ${ROLES_CONFIG[k].label}</option>`).join('')}
                        </select>
                      </td>
                      <td style="padding: 10px 14px;">
                        <span style="color: ${u.is_active !== false ? '#34d399' : '#f87171'}; font-weight: bold; font-size: 11px;">
                          ${u.is_active !== false ? '● Đang hoạt động' : '🔒 Đã khóa'}
                        </span>
                      </td>
                      <td style="padding: 10px 14px; text-align: right;">
                        <button onclick="window.LinklogPipeline.toggleUserActive(${idx})" style="background: #1e293b; color: #cbd5e1; border: 1px solid #334155; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">
                          ${u.is_active !== false ? 'Khóa TK' : 'Mở khóa'}
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      document.getElementById('form-add-staff').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!checkPermission(['ADMIN'], 'Cấp tài khoản nhân viên mới')) return;

        const name = document.getElementById('staff-name').value.trim();
        const email = document.getElementById('staff-email').value.trim().toLowerCase();
        const pass = document.getElementById('staff-pass').value.trim();
        const role = document.getElementById('staff-role').value;
        const branch = document.getElementById('staff-branch').value;

        const list = getUsers();
        if (list.some(u => u.email.toLowerCase() === email)) {
          alert('❌ Email này đã tồn tại trong hệ thống!');
          return;
        }

        list.push({
          email,
          full_name: name,
          role,
          role_label: ROLES_CONFIG[role].label,
          branch,
          password_demo: pass,
          is_active: true
        });

        saveUsers(list);
        renderAdminTab('USERS');
        alert(`✅ Đã tạo tài khoản thành công cho ${name} (${ROLES_CONFIG[role].label})!`);
      });
    }

    if (tab === 'SUPABASE') {
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <!-- Cột trái: Điền URL & Key -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 0;">Cấu Hình Kết Nối Supabase Cloud</h4>
              <span style="font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 999px; background: ${cfg.enabled ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}; color: ${cfg.enabled ? '#34d399' : '#fbbf24'};">
                ${cfg.enabled ? '🟢 Đã kết nối' : '🟡 Chưa kết nối'}
              </span>
            </div>

            <form id="form-supabase-config" style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">1. Supabase Project URL (Settings ➔ API ➔ Project URL):</label>
                <input id="supa-url" type="url" placeholder="https://xxxxxxxxxxxx.supabase.co" value="${cfg.url}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: #fff; font-size: 12px; box-sizing: border-box;">
              </div>
              <div>
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">2. Supabase Anon Public Key (Settings ➔ API ➔ anon public):</label>
                <input id="supa-key" type="text" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${cfg.anonKey}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 8px; padding: 10px; color: #fff; font-size: 12px; font-family: monospace; box-sizing: border-box;">
              </div>

              <div style="display: flex; gap: 8px; margin-top: 6px;">
                <button type="submit" style="flex: 1; background: #059669; color: #fff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: none; cursor: pointer;">
                  💾 Lưu & Kết Nối Supabase Ngay
                </button>
                <button type="button" id="btn-push-all-supa" style="background: #2563eb; color: #fff; font-weight: bold; font-size: 12px; padding: 10px 14px; border-radius: 8px; border: none; cursor: pointer;">
                  ⬆️ Đẩy Dữ Liệu Lên Cloud
                </button>
              </div>
            </form>
          </div>

          <!-- Cột phải: Hướng dẫn 3 bước & Nút Copy SQL -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">Hướng Dẫn Khởi Tạo Database (1 Phút)</h4>
              <ol style="font-size: 12px; color: #cbd5e1; padding-left: 18px; line-height: 1.7; margin: 0;">
                <li>Truy cập <a href="https://supabase.com/dashboard" target="_blank" style="color: #38bdf8; text-decoration: underline;">Supabase Dashboard</a> và tạo Project miễn phí.</li>
                <li>Vào mục <strong>SQL Editor</strong> ở menu trái ➔ Bấm nút bên dưới để copy lệnh SQL ➔ Dán vào và nhấn <strong>RUN</strong>.</li>
                <li>Vào mục <strong>Project Settings ➔ API</strong>, copy <code>Project URL</code> và <code>anon public key</code> dán vào ô bên trái.</li>
              </ol>
            </div>

            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #1e293b;">
              <button id="btn-copy-sql-schema" style="width: 100%; background: #4f46e5; color: #ffffff; font-weight: bold; font-size: 12px; padding: 11px; border-radius: 8px; border: 1px solid #6366f1; cursor: pointer;">
                📋 Copy Toàn Bộ Mã SQL Tạo Bảng (supabase_schema.sql)
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('form-supabase-config').addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('supa-url').value;
        const key = document.getElementById('supa-key').value;
        saveSupabaseConfig(url, key);
        updateFabUserDisplay();
        const ok = await syncFromSupabase();
        renderAdminTab('SUPABASE');
        if (ok) {
          alert('✅ Kết nối và đồng bộ dữ liệu từ Supabase Cloud thành công!');
        } else {
          alert('✅ Đã lưu cấu hình! Hãy đảm bảo bạn đã chạy mã SQL trong Supabase SQL Editor.');
        }
      });

      document.getElementById('btn-push-all-supa').addEventListener('click', async () => {
        const ok = await pushAllToSupabase();
        if (ok) {
          alert('✅ Đã đẩy toàn bộ Lô hàng 5 bước & Danh sách nhân sự lên Supabase PostgreSQL thành công!');
        } else {
          alert('⚠️ Vui lòng nhập và Lưu Supabase URL & Key trước!');
        }
      });

      document.getElementById('btn-copy-sql-schema').addEventListener('click', async () => {
        try {
          const res = await fetch('/supabase_schema.sql');
          const sqlText = await res.text();
          await navigator.clipboard.writeText(sqlText);
          alert('✅ Đã Copy mã SQL vào bộ nhớ tạm! Bạn hãy mở Supabase -> SQL Editor -> Paste (Ctrl+V) và bấm RUN nhé.');
        } catch (err) {
          alert('File SQL đã được lưu sẵn tại /supabase_schema.sql trong thư mục dự án!');
        }
      });
    }
  }

  // =========================================================================
  // MODAL BẢNG ĐIỀU HÀNH KANBAN 5 BƯỚC
  // =========================================================================
  function createPipelineModal() {
    const modal = document.createElement('div');
    modal.id = 'pipeline-modal-container';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(6px);
      z-index: 100000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    modal.innerHTML = `
      <div style="
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 16px;
        color: #f8fafc;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
        width: 100%;
        max-width: 1340px;
        height: 92vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; background: #1e293b;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(37,99,235,0.25); border: 1px solid #3b82f6; display: flex; align-items: center; justify-content: center; color: #60a5fa; font-weight: 900; font-size: 16px;">
              5S
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 8px;">
                <span>Quy trình Phối hợp Liên phòng ban (Sơ đồ 5 Bước Tiêu Chuẩn)</span>
                <span style="font-size: 11px; font-weight: 600; color: #93c5fd; background: #1e3a8a; border: 1px solid #3b82f6; padding: 2px 8px; border-radius: 999px;">RBAC Protected</span>
              </h2>
              <p style="font-size: 12px; color: #94a3b8; margin: 2px 0 0 0;" id="pipeline-active-user-badge">
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="btn-modal-switch-user" style="font-size: 12px; font-weight: bold; color: #38bdf8; background: #0f172a; border: 1px solid #0284c7; padding: 6px 12px; border-radius: 8px; cursor: pointer;">
              👤 Đổi Vai Trò / Phân Quyền
            </button>
            <button id="btn-modal-create-booking" style="font-size: 12px; font-weight: bold; color: #ffffff; background: #059669; border: 1px solid #10b981; padding: 6px 14px; border-radius: 8px; cursor: pointer;">
              + Tạo Booking Mới
            </button>
            <button id="btn-refresh-sample-data" style="font-size: 12px; color: #cbd5e1; background: #0f172a; border: 1px solid #475569; padding: 6px 12px; border-radius: 8px; cursor: pointer;">
              🔄 Nạp lại Mẫu
            </button>
            <button id="btn-close-pipeline-modal" style="width: 32px; height: 32px; border-radius: 8px; background: #334155; color: #ffffff; border: none; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              ✕
            </button>
          </div>
        </div>

        <!-- Bộ lọc vai trò -->
        <div style="padding: 10px 24px; background: #0b1120; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #94a3b8; font-weight: 600;">Góc nhìn:</span>
            <button data-role="ALL" class="role-filter-btn" style="background: #2563eb; color: #ffffff; font-weight: 600; padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer;">Tất cả phòng ban</button>
            <button data-role="SALES" class="role-filter-btn" style="background: #1e293b; color: #cbd5e1; padding: 4px 12px; border-radius: 6px; border: 1px solid #334155; cursor: pointer;">1. Sales</button>
            <button data-role="ACCOUNTANT" class="role-filter-btn" style="background: #1e293b; color: #cbd5e1; padding: 4px 12px; border-radius: 6px; border: 1px solid #334155; cursor: pointer;">2. Kế toán</button>
            <button data-role="LOGISTICS" class="role-filter-btn" style="background: #1e293b; color: #cbd5e1; padding: 4px 12px; border-radius: 6px; border: 1px solid #334155; cursor: pointer;">3. Logistics</button>
            <button data-role="OPS" class="role-filter-btn" style="background: #1e293b; color: #cbd5e1; padding: 4px 12px; border-radius: 6px; border: 1px solid #334155; cursor: pointer;">4. Hiện trường (Ops)</button>
            <button data-role="DOCS" class="role-filter-btn" style="background: #1e293b; color: #cbd5e1; padding: 4px 12px; border-radius: 6px; border: 1px solid #334155; cursor: pointer;">5. Chứng từ (Docs)</button>
          </div>
          <div style="color: #94a3b8; font-family: monospace;">
            Tổng cộng: <strong id="pipeline-total-orders" style="color: #60a5fa;">0</strong> lô hàng đang vận hành
          </div>
        </div>

        <!-- Bảng 5 Cột Kanban -->
        <div style="flex: 1; padding: 18px; overflow-x: auto; background: #030712;">
          <div style="display: grid; grid-template-columns: repeat(5, minmax(240px, 1fr)); gap: 14px; height: 100%; min-width: 1250px;" id="kanban-columns-container">
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btn-close-pipeline-modal').addEventListener('click', closePipelineModal);
    document.getElementById('btn-modal-switch-user').addEventListener('click', () => openAuthModal('LOGIN'));
    document.getElementById('btn-modal-create-booking').addEventListener('click', () => {
      if (checkPermission(['SALES', 'MANAGER'], 'Lập Booking Form mới (Bước 1)')) {
        openCreateBookingModal();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePipelineModal();
    });

    document.getElementById('btn-refresh-sample-data').addEventListener('click', () => {
      if (confirm('Khôi phục dữ liệu mẫu 5 bước về ban đầu?')) {
        localStorage.removeItem(STORAGE_KEY_SHIPMENTS);
        renderKanban();
      }
    });

    modal.querySelectorAll('.role-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.role-filter-btn').forEach(b => {
          b.style.background = '#1e293b';
          b.style.color = '#cbd5e1';
          b.style.border = '1px solid #334155';
        });
        btn.style.background = '#2563eb';
        btn.style.color = '#ffffff';
        btn.style.border = 'none';
        renderKanban();
      });
    });
  }

  function renderKanban() {
    const list = getShipments();
    const countEl = document.getElementById('pipeline-total-orders');
    if (countEl) countEl.innerText = list.length;
    const fabCount = document.getElementById('fab-order-count');
    if (fabCount) fabCount.innerText = list.length;

    updateFabUserDisplay();

    const container = document.getElementById('kanban-columns-container');
    if (!container) return;

    const COLUMNS = [
      { step: 1, title: 'BƯỚC 1: Tiếp nhận & Thẩm định', desc: 'Sales lập form, Kế toán & Sếp duyệt', badge: 'Bước 1', badgeColor: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.15)', borderColor: '#78350f' },
      { step: 2, title: 'BƯỚC 2: Điều phối Cước & Xe', desc: 'Logistics check cước, lấy Booking & xe', badge: 'Bước 2', badgeColor: '#3b82f6', badgeBg: 'rgba(59, 130, 246, 0.15)', borderColor: '#1e3a8a' },
      { step: 3, title: 'BƯỚC 3: Đóng hàng & Hải quan', desc: 'Ops kẹp seal bãi, Docs truyền tờ khai', badge: 'Bước 3', badgeColor: '#a855f7', badgeBg: 'rgba(168, 85, 247, 0.15)', borderColor: '#581c87' },
      { step: 4, title: 'BƯỚC 4: Thanh lý & Vận đơn B/L', desc: 'Ops vào sổ tàu, Docs phát hành B/L', badge: 'Bước 4', badgeColor: '#6366f1', badgeBg: 'rgba(99, 102, 241, 0.15)', borderColor: '#312e81' },
      { step: 5, title: 'BƯỚC 5: Quyết toán & Hoa hồng', desc: 'Kế toán đối soát chi phí, chốt hoa hồng', badge: 'Bước 5', badgeColor: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.15)', borderColor: '#064e3b' }
    ];

    container.innerHTML = COLUMNS.map(col => {
      const items = list.filter(item => item.currentStep === col.step);

      const itemsHtml = items.map(item => `
        <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 10px; padding: 12px; margin-bottom: 12px; color: #e2e8f0; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#1e293b'" onclick="window.LinklogPipeline.openDetail('${item.id}')">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #60a5fa;">${item.id}</span>
            <span style="font-size: 10px; background: #1e293b; color: #cbd5e1; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${item.equipment}</span>
          </div>

          <div style="margin-bottom: 8px;">
            <div style="font-size: 12px; font-weight: bold; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.customerName}</div>
            <div style="font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${item.cargo}</div>
          </div>

          <div style="background: #020617; padding: 8px; border-radius: 6px; border: 1px solid #1e293b; font-size: 11px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; color: #94a3b8; margin-bottom: 4px;">
              <span>Tuyến:</span>
              <span style="color: #f1f5f9; font-weight: 600;">${item.pol.split(' ')[0]} ➔ ${item.pod.split(' ')[0]}</span>
            </div>

            ${col.step === 1 ? `
              <div style="display: flex; justify-content: space-between; color: #94a3b8; margin-bottom: 4px;">
                <span>Giá chào:</span>
                <span style="color: #fbbf24; font-weight: bold;">$${item.step1.proposedPriceUsd.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; padding-top: 4px; border-top: 1px solid #1e293b;">
                <span style="color: ${item.step1.accountantApproved ? '#34d399' : '#f59e0b'}; font-weight: 600;">
                  ${item.step1.accountantApproved ? '✓ KT đã duyệt' : '⏳ Chờ KT'}
                </span>
                <span style="color: ${item.step1.managerApproved ? '#34d399' : '#f59e0b'}; font-weight: 600;">
                  ${item.step1.managerApproved ? '✓ Sếp đã duyệt' : '⏳ Chờ Sếp'}
                </span>
              </div>
            ` : ''}

            ${col.step === 2 ? `
              <div style="display: flex; justify-content: space-between; color: #94a3b8; margin-bottom: 4px;">
                <span>Hãng tàu:</span>
                <span style="color: #93c5fd; font-weight: 600;">${item.step2.carrier}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; color: #fb7185; font-weight: bold; padding-top: 4px; border-top: 1px solid #1e293b;">
                <span>Closing:</span>
                <span>${item.step2.closingTime}</span>
              </div>
            ` : ''}

            ${col.step === 3 ? `
              <div style="display: flex; justify-content: space-between; color: #94a3b8; margin-bottom: 4px;">
                <span>Số Cont:</span>
                <span style="color: #c084fc; font-family: monospace; font-weight: bold;">${item.step3.containerNo}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; padding-top: 4px; border-top: 1px solid #1e293b;">
                <span style="color: ${item.step3.isInspectedByOps ? '#34d399' : '#f59e0b'};">
                  ${item.step3.isInspectedByOps ? '✓ Seal: ' + item.step3.sealNo : '⏳ Chưa kẹp seal'}
                </span>
                <span style="color: ${item.step3.isCleared ? '#34d399' : '#f59e0b'};">
                  ${item.step3.isCleared ? '✓ Đã thông quan' : '⏳ Chờ tờ khai'}
                </span>
              </div>
            ` : ''}

            ${col.step === 4 ? `
              <div style="display: flex; justify-content: space-between; color: #94a3b8; margin-bottom: 4px;">
                <span>Số B/L:</span>
                <span style="color: #818cf8; font-family: monospace; font-weight: bold;">${item.step4.blNo}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; padding-top: 4px; border-top: 1px solid #1e293b;">
                <span style="color: ${item.step4.handedOverToCarrier ? '#34d399' : '#f59e0b'};">
                  ${item.step4.handedOverToCarrier ? '✓ Vào sổ tàu' : '⏳ Chưa nộp'}
                </span>
                <span style="color: ${item.step4.blFileUploaded ? '#34d399' : '#94a3b8'};">
                  ${item.step4.blFileUploaded ? '✓ Đã có B/L' : '⏳ Dự thảo'}
                </span>
              </div>
            ` : ''}

            ${col.step === 5 ? `
              <div style="display: flex; justify-content: space-between; color: #94a3b8; margin-bottom: 4px;">
                <span>Lãi gộp (GP):</span>
                <span style="color: #34d399; font-weight: bold;">+$${item.step5.grossProfitUsd.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; padding-top: 4px; border-top: 1px solid #1e293b;">
                <span style="color: #94a3b8;">Hoa hồng Sales:</span>
                <span style="color: #fbbf24; font-weight: bold;">$${item.step5.commissionAmountUsd.toLocaleString()} (${item.step5.commissionRatePercent}%)</span>
              </div>
              <div style="font-size: 10px; text-align: center; margin-top: 4px; font-weight: bold; color: ${item.step5.isSettled ? '#34d399' : '#f59e0b'};">
                ${item.step5.isSettled ? '✓ Đã chốt quyết toán' : '⏳ Kế toán chưa chốt'}
              </div>
            ` : ''}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #94a3b8; padding-top: 4px; border-top: 1px solid #1e293b;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">👤 ${item.salesRep.split(' ')[0]}</span>
            <span style="color: #60a5fa; font-weight: bold;">Xử lý ➔</span>
          </div>
        </div>
      `).join('');

      return `
        <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; display: flex; flex-direction: column; height: 100%; overflow: hidden;">
          <div style="padding: 12px; background: #1e293b; border-bottom: 1px solid #334155;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: ${col.badgeColor}; background: ${col.badgeBg}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${col.borderColor};">
                ${col.badge}
              </span>
              <span style="font-size: 11px; font-weight: bold; color: #ffffff; background: #0f172a; padding: 2px 7px; border-radius: 999px; font-family: monospace;">
                ${items.length}
              </span>
            </div>
            <h3 style="font-size: 12px; font-weight: 700; color: #ffffff; margin: 6px 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${col.title}
            </h3>
            <p style="font-size: 10px; color: #94a3b8; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${col.desc}
            </p>
          </div>

          <div style="flex: 1; padding: 10px; overflow-y: auto;">
            ${items.length > 0 ? itemsHtml : `
              <div style="height: 100px; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 11px; border: 1px dashed #334155; border-radius: 8px;">
                Chưa có lô hàng
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  function openOrderDetailModal(shipmentId) {
    const list = getShipments();
    const item = list.find(s => s.id === shipmentId);
    if (!item) return;

    const currentUser = getCurrentUser();

    let detailModal = document.getElementById('shipment-detail-modal');
    if (!detailModal) {
      detailModal = document.createElement('div');
      detailModal.id = 'shipment-detail-modal';
      detailModal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.88);
        backdrop-filter: blur(8px);
        z-index: 100001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(detailModal);
    }

    detailModal.innerHTML = `
      <div style="
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 16px;
        color: #f8fafc;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
        width: 100%;
        max-width: 900px;
        height: 88vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; background: #1e293b;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-family: monospace; font-size: 13px; font-weight: bold; color: #60a5fa; background: #0f172a; padding: 3px 8px; border-radius: 4px; border: 1px solid #3b82f6;">${item.id}</span>
              <h3 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0;">${item.customerName}</h3>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">
              Hàng: <strong style="color: #f1f5f9;">${item.cargo}</strong> • Cont: <strong style="color: #f1f5f9;">${item.equipment}</strong> • Tuyến: <strong style="color: #f1f5f9;">${item.pol} ➔ ${item.pod}</strong>
            </p>
          </div>
          <button onclick="document.getElementById('shipment-detail-modal').style.display='none'" style="width: 32px; height: 32px; border-radius: 8px; background: #334155; color: #ffffff; border: none; font-size: 16px; cursor: pointer;">✕</button>
        </div>

        <!-- Stepper Bar -->
        <div style="padding: 12px 24px; background: #0b1120; border-bottom: 1px solid #1e293b;">
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; text-align: center; font-size: 11px;">
            ${[1, 2, 3, 4, 5].map(step => {
              const isCompleted = item.currentStep > step;
              const isCurrent = item.currentStep === step;
              const titles = ['1. Tiếp nhận & Duyệt', '2. Cước & Đặt xe', '3. Đóng hàng & HQ', '4. Thanh lý & B/L', '5. Quyết toán & GP'];
              return `
                <div style="padding: 8px 4px; border-radius: 6px; border: 1px solid ${
                  isCompleted ? '#059669' : isCurrent ? '#2563eb' : '#1e293b'
                }; background: ${
                  isCompleted ? 'rgba(5, 150, 105, 0.2)' : isCurrent ? 'rgba(37, 99, 235, 0.3)' : '#0f172a'
                }; color: ${
                  isCompleted ? '#34d399' : isCurrent ? '#60a5fa' : '#64748b'
                }; font-weight: ${isCurrent ? 'bold' : 'normal'};">
                  <div>${isCompleted ? '✓' : isCurrent ? '▶' : '○'} Bước ${step}</div>
                  <div style="font-size: 10px; margin-top: 2px;">${titles[step - 1]}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Action Box -->
        <div style="flex: 1; padding: 20px; overflow-y: auto; background: #020617;">
          <!-- Thông báo vai trò hiện tại -->
          <div style="margin-bottom: 12px; padding: 8px 12px; background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
            <span style="color: #94a3b8;">Người dùng hiện tại: <strong style="color: #fff;">${currentUser.full_name}</strong> (${currentUser.role_label})</span>
            <button onclick="document.getElementById('shipment-detail-modal').style.display='none'; window.LinklogPipeline.openAuth('LOGIN');" style="background: none; border: none; color: #38bdf8; font-weight: bold; cursor: pointer; text-decoration: underline;">
              Đổi sang tài khoản bộ phận khác ➔
            </button>
          </div>

          <div style="background: #0f172a; border: 1px solid #3b82f6; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 0;">Thao tác xử lý tại Bước ${item.currentStep}</h4>
              <span style="font-size: 11px; color: #93c5fd; background: #1e3a8a; padding: 2px 8px; border-radius: 4px;">${item.statusText}</span>
            </div>

            ${item.currentStep === 1 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 14px; font-size: 12px;">
                <div><span style="color: #94a3b8;">Giá đề xuất:</span> <strong style="color: #fbbf24; margin-left: 6px;">$${item.step1.proposedPriceUsd.toLocaleString()} / cont</strong></div>
                <div><span style="color: #94a3b8;">Điều kiện TT:</span> <strong style="color: #ffffff; margin-left: 6px;">${item.step1.paymentTerm}</strong></div>
              </div>
              <div style="display: flex; gap: 12px;">
                <button onclick="window.LinklogPipeline.approveStep1Accountant('${item.id}')" style="flex: 1; background: ${item.step1.accountantApproved ? '#064e3b' : '#059669'}; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #10b981; cursor: pointer;" ${item.step1.accountantApproved ? 'disabled' : ''}>
                  ${item.step1.accountantApproved ? '✓ Kế Toán Đã Duyệt (' + item.step1.accountantName + ')' : '👉 Kế Toán: Duyệt Điều Kiện Thanh Toán'}
                </button>
                <button onclick="window.LinklogPipeline.approveStep1Manager('${item.id}')" style="flex: 1; background: ${item.step1.managerApproved ? '#064e3b' : '#2563eb'}; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #3b82f6; cursor: pointer;" ${item.step1.managerApproved ? 'disabled' : ''}>
                  ${item.step1.managerApproved ? '✓ Trưởng Phòng Đã Duyệt (' + item.step1.managerName + ')' : '👉 Trưởng Phòng: Phê Duyệt Giá Cước'}
                </button>
              </div>
            ` : ''}

            ${item.currentStep === 2 ? `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 14px;">
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Hãng tàu:</label><input id="input-step2-carrier" type="text" value="${item.step2.carrier}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Số Booking:</label><input id="input-step2-booking" type="text" value="${item.step2.bookingNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Tàu / Chuyến:</label><input id="input-step2-vessel" type="text" value="${item.step2.vesselVoyage}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Closing Time:</label><input id="input-step2-closing" type="text" value="${item.step2.closingTime}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fb7185; font-weight: bold; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Nhà xe kéo:</label><input id="input-step2-trucker" type="text" value="${item.step2.truckingVendor}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Biển số xe:</label><input id="input-step2-plate" type="text" value="${item.step2.truckPlate}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
              </div>
              <button onclick="window.LinklogPipeline.completeStep2('${item.id}')" style="width: 100%; background: #2563eb; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #3b82f6; cursor: pointer;">
                👉 Logistics: Xác Nhận Đã Lấy Booking & Điều Xe Kéo (Chuyển Bước 3)
              </button>
            ` : ''}

            ${item.currentStep === 3 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div style="background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
                  <h5 style="color: #c084fc; font-size: 12px; font-weight: bold; margin: 0 0 8px 0;">1. Hiện Trường (Ops)</h5>
                  <div style="margin-bottom: 8px;"><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Container:</label><input id="input-step3-cont" type="text" value="${item.step3.containerNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                  <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Seal:</label><input id="input-step3-seal" type="text" value="${item.step3.sealNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                </div>
                <div style="background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
                  <h5 style="color: #818cf8; font-size: 12px; font-weight: bold; margin: 0 0 8px 0;">2. Chứng Từ Hải Quan (Docs)</h5>
                  <div style="margin-bottom: 8px;"><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Tờ Khai HQ:</label><input id="input-step3-tk" type="text" value="${item.step3.customsDeclarationNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
                  <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Phân Luồng:</label>
                    <select id="select-step3-channel" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;">
                      <option value="XANH (Luồng Xanh)">🟢 Luồng Xanh</option>
                      <option value="VÀNG (Luồng Vàng)" ${item.step3.customsChannel.includes('VÀNG') ? 'selected' : ''}>🟡 Luồng Vàng</option>
                      <option value="ĐỎ (Luồng Đỏ)" ${item.step3.customsChannel.includes('ĐỎ') ? 'selected' : ''}>🔴 Luồng Đỏ</option>
                    </select>
                  </div>
                </div>
              </div>
              <button onclick="window.LinklogPipeline.completeStep3('${item.id}')" style="width: 100%; background: #9333ea; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #a855f7; cursor: pointer;">
                👉 Ops & Docs: Xác Nhận Đã Kẹp Seal & Thông Quan (Chuyển Bước 4)
              </button>
            ` : ''}

            ${item.currentStep === 4 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 14px;">
                <div>
                  <h5 style="color: #818cf8; font-size: 12px; font-weight: bold; margin: 0 0 6px 0;">Thanh Lý Sổ Tàu (Ops)</h5>
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #ffffff; cursor: pointer;">
                    <input id="check-step4-handed" type="checkbox" checked>
                    <span>Đã bàn giao tờ khai thông quan cho hãng tàu</span>
                  </label>
                </div>
                <div>
                  <h5 style="color: #60a5fa; font-size: 12px; font-weight: bold; margin: 0 0 6px 0;">Phát Hành Vận Đơn B/L (Docs)</h5>
                  <input id="input-step4-blno" type="text" value="${item.step4.blNo}" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 7px; color: #fff; font-size: 12px; box-sizing: border-box;">
                </div>
              </div>
              <button onclick="window.LinklogPipeline.completeStep4('${item.id}')" style="width: 100%; background: #4f46e5; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #6366f1; cursor: pointer;">
                👉 Ops & Docs: Xác Nhận Đã Phát Hành Vận Đơn B/L (Chuyển Bước 5)
              </button>
            ` : ''}

            ${item.currentStep === 5 ? `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #0b1120; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; text-align: center; margin-bottom: 14px;">
                <div style="background: #020617; padding: 8px; border-radius: 6px;"><span style="font-size: 11px; color: #94a3b8; display: block;">Doanh Thu:</span><strong style="font-size: 15px; color: #60a5fa;">$${item.step5.totalRevenueUsd.toLocaleString()}</strong></div>
                <div style="background: #020617; padding: 8px; border-radius: 6px;"><span style="font-size: 11px; color: #94a3b8; display: block;">Chi Phí:</span><strong style="font-size: 15px; color: #fb7185;">$${item.step5.totalCostUsd.toLocaleString()}</strong></div>
                <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; padding: 8px; border-radius: 6px;"><span style="font-size: 11px; color: #34d399; display: block;">Lãi Gộp (GP):</span><strong style="font-size: 15px; color: #34d399;">+$${item.step5.grossProfitUsd.toLocaleString()}</strong></div>
              </div>
              <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <div><strong style="color: #fbbf24; font-size: 12px; display: block;">Hoa hồng Sales (${item.salesRep}):</strong><span style="font-size: 11px; color: #cbd5e1;">GP ($${item.step5.grossProfitUsd}) x ${item.step5.commissionRatePercent}%</span></div>
                <strong style="font-size: 16px; color: #fbbf24;">$${item.step5.commissionAmountUsd.toLocaleString()} USD</strong>
              </div>
              <button onclick="window.LinklogPipeline.completeStep5('${item.id}')" style="width: 100%; background: ${item.step5.isSettled ? '#064e3b' : '#059669'}; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #10b981; cursor: pointer;" ${item.step5.isSettled ? 'disabled' : ''}>
                ${item.step5.isSettled ? '✓ Đã Quyết Toán Bởi ' + item.step5.settledBy : '👉 Kế Toán: Xác Nhận Đối Soát & Chốt Hoa Hồng Sales'}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    detailModal.style.display = 'flex';
  }

  function createBookingModal() {
    const modal = document.createElement('div');
    modal.id = 'create-booking-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.88);
      backdrop-filter: blur(8px);
      z-index: 100002;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    modal.innerHTML = `
      <div style="background: #0f172a; border: 1px solid #334155; border-radius: 16px; color: #f8fafc; width: 100%; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8); overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; background: #1e293b;">
          <div>
            <h3 style="font-size: 15px; font-weight: 800; color: #ffffff; margin: 0;">Lập Booking Form Mới (Bước 1)</h3>
            <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 0 0;">Dành cho bộ phận Sales khởi tạo đơn hàng</p>
          </div>
          <button onclick="document.getElementById('create-booking-modal').style.display='none'" style="width: 28px; height: 28px; border-radius: 6px; background: #334155; color: #ffffff; border: none; cursor: pointer;">✕</button>
        </div>

        <form id="form-new-booking" style="padding: 20px; display: flex; flex-direction: column; gap: 12px; background: #0f172a;">
          <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Tên Khách Hàng *</label><input id="new-customer" type="text" required placeholder="VD: Tập đoàn Gỗ An Cường" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Cảng đi (POL) *</label><input id="new-pol" type="text" required value="Cát Lái (VNHCM)" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Cảng đến (POD) *</label><input id="new-pod" type="text" required placeholder="VD: Yokohama (JPYOK)" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Tên Hàng Hóa *</label><input id="new-cargo" type="text" required placeholder="VD: Nông sản sấy" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Thiết Bị (Cont) *</label>
              <select id="new-equip" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
                <option value="1 x 20GP">1 x 20GP</option>
                <option value="2 x 40HQ" selected>2 x 40HQ</option>
                <option value="3 x 40HQ">3 x 40HQ</option>
                <option value="1 x 40RF (Lạnh)">1 x 40RF (Lạnh)</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Giá chào bán (USD) *</label><input id="new-price" type="number" required value="2400" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;"></div>
            <div><label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Điều kiện thanh toán *</label>
              <select id="new-term" style="width: 100%; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px; color: #fff; font-size: 12px; box-sizing: border-box;">
                <option value="Trả trước 100%">Trả trước 100%</option>
                <option value="Công nợ 15 ngày">Công nợ 15 ngày</option>
                <option value="Công nợ 30 ngày (Credit 30 days)" selected>Công nợ 30 ngày</option>
                <option value="Thư tín dụng L/C">Thư tín dụng L/C</option>
              </select>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" onclick="document.getElementById('create-booking-modal').style.display='none'" style="padding: 7px 14px; background: #334155; color: #fff; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Hủy</button>
            <button type="submit" style="padding: 7px 16px; background: #059669; color: #fff; font-weight: bold; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Lưu & Đẩy Lên Bước 1</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('form-new-booking').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = getCurrentUser();
      const list = getShipments();
      const newId = 'SHP-2026-0' + (100 + list.length + 1);
      const price = parseFloat(document.getElementById('new-price').value) || 2000;

      const newShipment = {
        id: newId,
        customerName: document.getElementById('new-customer').value,
        salesRep: `${user.full_name} (${user.branch || 'HCM'})`,
        pol: document.getElementById('new-pol').value,
        pod: document.getElementById('new-pod').value,
        cargo: document.getElementById('new-cargo').value,
        equipment: document.getElementById('new-equip').value,
        currentStep: 1,
        statusText: 'Mới tạo - Chờ Kế toán & Trưởng phòng duyệt',
        createdAt: 'Vừa xong',
        step1: { proposedPriceUsd: price, paymentTerm: document.getElementById('new-term').value, accountantApproved: false, accountantName: '', managerApproved: false, managerName: '' },
        step2: { carrier: 'Đang chọn hãng tàu', bookingNo: '', vesselVoyage: '', closingTime: '2026-11-15 18:00', truckingVendor: '', truckPlate: '', isDispatched: false },
        step3: { containerNo: 'Đang cấp cont', sealNo: 'Chưa kẹp seal', isInspectedByOps: false, customsDeclarationNo: 'Chưa truyền', customsChannel: 'VÀNG (Luồng Vàng)', isCleared: false },
        step4: { handedOverToCarrier: false, blType: 'House B/L', blNo: 'Đang dự thảo', blFileUploaded: false, issuedDate: '' },
        step5: { totalRevenueUsd: price * 2, totalCostUsd: Math.round(price * 2 * 0.82), grossProfitUsd: Math.round(price * 2 * 0.18), commissionRatePercent: 12, commissionAmountUsd: Math.round((price * 2 * 0.18) * 0.12), isSettled: false, settledBy: '', settledDate: '' }
      };

      list.unshift(newShipment);
      saveShipments(list, newShipment);
      modal.style.display = 'none';
      renderKanban();
      openPipelineModal();
      openOrderDetailModal(newId);
    });
  }

  function openPipelineModal() {
    const m = document.getElementById('pipeline-modal-container');
    if (m) {
      m.style.display = 'flex';
      renderKanban();
    }
  }

  function closePipelineModal() {
    const m = document.getElementById('pipeline-modal-container');
    if (m) m.style.display = 'none';
  }

  function openCreateBookingModal() {
    const m = document.getElementById('create-booking-modal');
    if (m) m.style.display = 'flex';
  }

  // EXPORT API RA WINDOW
  window.LinklogPipeline = {
    openDetail: openOrderDetailModal,
    openAuth: openAuthModal,
    switchAdminTab: renderAdminTab,

    quickSwitchUser: function(email) {
      const users = getUsers();
      const found = users.find(u => u.email === email);
      if (!found) return;
      if (found.is_active === false) {
        alert('⛔ Tài khoản này đang bị khóa!');
        return;
      }
      setCurrentUser(found);
      renderAdminTab('LOGIN');
      renderKanban();
    },

    changeUserRole: function(idx, newRole) {
      if (!checkPermission(['ADMIN'], 'Thay đổi vai trò phân quyền nhân viên')) {
        renderAdminTab('USERS');
        return;
      }
      const users = getUsers();
      if (users[idx]) {
        users[idx].role = newRole;
        users[idx].role_label = ROLES_CONFIG[newRole].label;
        saveUsers(users);
        if (getCurrentUser().email === users[idx].email) {
          setCurrentUser(users[idx]);
        }
        renderAdminTab('USERS');
      }
    },

    toggleUserActive: function(idx) {
      if (!checkPermission(['ADMIN'], 'Khóa / Mở khóa tài khoản nhân viên')) return;
      const users = getUsers();
      if (users[idx]) {
        if (users[idx].role === 'ADMIN') {
          alert('⚠️ Không thể khóa tài khoản Giám đốc / Super Admin gốc!');
          return;
        }
        users[idx].is_active = users[idx].is_active === false ? true : false;
        saveUsers(users);
        renderAdminTab('USERS');
      }
    },

    approveStep1Accountant: function(id) {
      if (!checkPermission(['ACCOUNTANT'], 'Duyệt điều kiện thanh toán & công nợ (Bước 1)')) return;
      const user = getCurrentUser();
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step1.accountantApproved = true;
      item.step1.accountantName = user.full_name;
      if (item.step1.managerApproved) {
        item.currentStep = 2;
        item.statusText = 'Đã duyệt toàn bộ ➔ Chuyển Logistics điều cước & xe';
      } else {
        item.statusText = 'Kế toán đã duyệt ➔ Chờ Trưởng phòng duyệt giá';
      }
      saveShipments(list, item);
      renderKanban();
      openOrderDetailModal(id);
    },

    approveStep1Manager: function(id) {
      if (!checkPermission(['MANAGER'], 'Phê duyệt giá cước thương mại (Bước 1)')) return;
      const user = getCurrentUser();
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step1.managerApproved = true;
      item.step1.managerName = user.full_name;
      if (item.step1.accountantApproved) {
        item.currentStep = 2;
        item.statusText = 'Đã duyệt toàn bộ ➔ Chuyển Logistics điều cước & xe';
      } else {
        item.statusText = 'Trưởng phòng đã duyệt giá ➔ Chờ Kế toán duyệt công nợ';
      }
      saveShipments(list, item);
      renderKanban();
      openOrderDetailModal(id);
    },

    completeStep2: function(id) {
      if (!checkPermission(['LOGISTICS'], 'Điều phối Booking cước & đặt xe kéo (Bước 2)')) return;
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step2.carrier = document.getElementById('input-step2-carrier')?.value || item.step2.carrier;
      item.step2.bookingNo = document.getElementById('input-step2-booking')?.value || item.step2.bookingNo;
      item.step2.vesselVoyage = document.getElementById('input-step2-vessel')?.value || item.step2.vesselVoyage;
      item.step2.closingTime = document.getElementById('input-step2-closing')?.value || item.step2.closingTime;
      item.step2.truckingVendor = document.getElementById('input-step2-trucker')?.value || item.step2.truckingVendor;
      item.step2.truckPlate = document.getElementById('input-step2-plate')?.value || item.step2.truckPlate;
      item.step2.isDispatched = true;

      item.currentStep = 3;
      item.statusText = 'Đã có Booking & Xe ➔ Ops đóng hàng & Docs truyền tờ khai';
      saveShipments(list, item);
      renderKanban();
      openOrderDetailModal(id);
    },

    completeStep3: function(id) {
      if (!checkPermission(['OPS', 'DOCS'], 'Xác nhận đóng hàng kẹp seal & thông quan (Bước 3)')) return;
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step3.containerNo = document.getElementById('input-step3-cont')?.value || item.step3.containerNo;
      item.step3.sealNo = document.getElementById('input-step3-seal')?.value || item.step3.sealNo;
      item.step3.customsDeclarationNo = document.getElementById('input-step3-tk')?.value || item.step3.customsDeclarationNo;
      item.step3.customsChannel = document.getElementById('select-step3-channel')?.value || item.step3.customsChannel;
      item.step3.isInspectedByOps = true;
      item.step3.isCleared = true;

      item.currentStep = 4;
      item.statusText = 'Đã đóng hàng & thông quan ➔ Thanh lý hãng tàu & Xuất B/L';
      saveShipments(list, item);
      renderKanban();
      openOrderDetailModal(id);
    },

    completeStep4: function(id) {
      if (!checkPermission(['OPS', 'DOCS'], 'Thanh lý sổ tàu & phát hành vận đơn B/L (Bước 4)')) return;
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step4.blNo = document.getElementById('input-step4-blno')?.value || item.step4.blNo;
      item.step4.handedOverToCarrier = true;
      item.step4.blFileUploaded = true;
      item.step4.issuedDate = new Date().toISOString().split('T')[0];

      item.currentStep = 5;
      item.statusText = 'Đã phát hành B/L ➔ Chuyển Kế toán đối soát & chốt hoa hồng';
      saveShipments(list, item);
      renderKanban();
      openOrderDetailModal(id);
    },

    completeStep5: function(id) {
      if (!checkPermission(['ACCOUNTANT'], 'Đối soát chi phí & chốt quyết toán hoa hồng (Bước 5)')) return;
      const user = getCurrentUser();
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step5.isSettled = true;
      item.step5.settledBy = user.full_name;
      item.step5.settledDate = new Date().toISOString().split('T')[0];
      item.statusText = 'ĐÃ HOÀN TẤT QUYẾT TOÁN & LƯU TRỮ HỒ SƠ VĨNH VIỄN';
      saveShipments(list, item);
      renderKanban();
      openOrderDetailModal(id);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkflowUI);
  } else {
    initWorkflowUI();
  }

})();
