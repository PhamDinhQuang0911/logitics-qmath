/**
 * LINKLOG Quote OS - Module Điều hành Quy trình Phối hợp Liên phòng ban (5 Bước Tiêu chuẩn)
 * Đã tối ưu hóa 100% CSS độc lập - Đảm bảo không bao giờ bị đè chữ, không phụ thuộc CSS bên ngoài.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'linklog_shipments_5steps_v2';

  const INITIAL_SHIPMENTS = [
    {
      id: 'SHP-2026-0101',
      customerName: 'ABC Furniture Vietnam',
      salesRep: 'Nguyễn Văn Nam (Sales Team)',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Long Beach (USLGB)',
      cargo: 'Bàn ghế sofa xuất khẩu',
      equipment: '2 x 40HQ',
      currentStep: 1,
      statusText: 'Chờ thẩm định thanh toán & giá',
      createdAt: '2026-11-04 09:30',
      
      step1: {
        proposedPriceUsd: 2850,
        paymentTerm: 'Công nợ 30 ngày (Credit 30 days)',
        creditLimitUsd: 50000,
        currentDebtUsd: 18000,
        accountantApproved: false,
        accountantNote: 'Khách hàng có lịch sử trả nợ tốt, đề xuất cho hạn mức 30 ngày.',
        accountantName: '',
        managerApproved: false,
        managerNote: 'Biên lợi nhuận gộp 14.2%, đồng ý mức giá chào.',
        managerName: ''
      },

      step2: {
        carrier: 'Maersk Line',
        bookingNo: 'MSK-99201481',
        vesselVoyage: 'MAERSK ALABAMA / 2604E',
        etd: '2026-11-12',
        closingTime: '2026-11-10 18:00',
        truckingVendor: 'Huy Hoàng Logistics',
        truckPlate: '51C-882.91 / Mooc 51R-129.40',
        driverPhone: '0918.234.567',
        isDispatched: false
      },

      step3: {
        containerNo: 'MSKU-8921820',
        sealNo: 'ML-VN-98210',
        sealPhotoUrl: '',
        isInspectedByOps: false,
        customsDeclarationNo: '106299182010',
        customsChannel: 'VÀNG (Luồng Vàng)',
        specializedCheckDone: true,
        specializedCheckType: 'Kiểm dịch thực vật (Phytosanitary)',
        isCleared: false
      },

      step4: {
        handedOverToCarrier: false,
        blType: 'Master B/L (Hãng tàu trực tiếp)',
        blNo: 'MSKU99201481',
        blFileUploaded: false,
        issuedDate: ''
      },

      step5: {
        totalRevenueUsd: 5700,
        totalCostUsd: 4850,
        grossProfitUsd: 850,
        commissionRatePercent: 12,
        commissionAmountUsd: 102,
        isSettled: false,
        settledBy: '',
        settledDate: ''
      }
    },
    {
      id: 'SHP-2026-0102',
      customerName: 'VietWood Industrial Plywood',
      salesRep: 'Trần Thị Thu Thảo (Sales Hai Phong)',
      pol: 'Hải Phòng (VNHPH)',
      pod: 'Qingdao (CNQDG)',
      cargo: 'Ván ép cốp pha phủ phim',
      equipment: '3 x 20GP',
      currentStep: 2,
      statusText: 'Đã thẩm định - Đang điều cước & xe kéo',
      createdAt: '2026-11-03 14:15',
      
      step1: {
        proposedPriceUsd: 1100,
        paymentTerm: 'Trả trước 100% trước khi xuất B/L',
        creditLimitUsd: 0,
        currentDebtUsd: 0,
        accountantApproved: true,
        accountantNote: 'Khách hàng đồng ý TT trước khi nhận B/L, an toàn công nợ.',
        accountantName: 'Lê Minh Kế Toán',
        managerApproved: true,
        managerNote: 'Giá tốt cho tuyến HPH - QDG.',
        managerName: 'Vũ Đức Trưởng Bộ Phận'
      },

      step2: {
        carrier: 'ONE Line (Ocean Network Express)',
        bookingNo: 'ONE-HPH-2026-881',
        vesselVoyage: 'ONE CONTINUITY / 042W',
        etd: '2026-11-08',
        closingTime: '2026-11-06 20:00',
        truckingVendor: 'Hải An Trucking Đình Vũ',
        truckPlate: '15C-341.22',
        driverPhone: '0903.882.119',
        isDispatched: true
      },

      step3: {
        containerNo: 'TGHU-2091821',
        sealNo: 'ONE-VN-55219',
        sealPhotoUrl: '',
        isInspectedByOps: false,
        customsDeclarationNo: '106388102911',
        customsChannel: 'XANH (Luồng Xanh)',
        specializedCheckDone: true,
        specializedCheckType: 'Hun trùng container (Fumigation)',
        isCleared: false
      },

      step4: {
        handedOverToCarrier: false,
        blType: 'House B/L',
        blNo: 'HBL-LL-2026021',
        blFileUploaded: false,
        issuedDate: ''
      },

      step5: {
        totalRevenueUsd: 3300,
        totalCostUsd: 2750,
        grossProfitUsd: 550,
        commissionRatePercent: 10,
        commissionAmountUsd: 55,
        isSettled: false,
        settledBy: '',
        settledDate: ''
      }
    },
    {
      id: 'SHP-2026-0103',
      customerName: 'Mekong Fruits & Agri Trade',
      salesRep: 'Lê Tuấn Kiệt (Sales Mekong)',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Tokyo (JPTYO)',
      cargo: 'Xoài cát sấy dẻo & Thanh long ruột đỏ',
      equipment: '1 x 40RF (Lạnh)',
      currentStep: 3,
      statusText: 'Đang đóng hàng tại bãi & Truyền tờ khai HQ',
      createdAt: '2026-11-02 10:00',

      step1: {
        proposedPriceUsd: 4200,
        paymentTerm: 'Thư tín dụng L/C trả ngay',
        creditLimitUsd: 100000,
        currentDebtUsd: 25000,
        accountantApproved: true,
        accountantNote: 'Điều khoản L/C ngân hàng Vietcombank hợp lệ.',
        accountantName: 'Lê Minh Kế Toán',
        managerApproved: true,
        managerNote: 'Hàng lạnh cước cao, duyệt chính sách.',
        managerName: 'Vũ Đức Trưởng Bộ Phận'
      },

      step2: {
        carrier: 'CMA CGM',
        bookingNo: 'CMA-SGN-441029',
        vesselVoyage: 'CMA ANTOINE / 102E',
        etd: '2026-11-07',
        closingTime: '2026-11-05 16:00',
        truckingVendor: 'Huy Hoàng Logistics',
        truckPlate: '51D-991.44',
        driverPhone: '0988.112.334',
        isDispatched: true
      },

      step3: {
        containerNo: 'CMAU-7721094',
        sealNo: 'CMA-VN-11928',
        sealPhotoUrl: '',
        isInspectedByOps: true,
        customsDeclarationNo: '106499201944',
        customsChannel: 'VÀNG (Luồng Vàng)',
        specializedCheckDone: true,
        specializedCheckType: 'Kiểm dịch thực vật & C/O Form VJ',
        isCleared: true
      },

      step4: {
        handedOverToCarrier: false,
        blType: 'Master B/L',
        blNo: 'CMA-TYO-99120',
        blFileUploaded: false,
        issuedDate: ''
      },

      step5: {
        totalRevenueUsd: 4200,
        totalCostUsd: 3450,
        grossProfitUsd: 750,
        commissionRatePercent: 15,
        commissionAmountUsd: 112.5,
        isSettled: false,
        settledBy: '',
        settledDate: ''
      }
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

      step1: {
        proposedPriceUsd: 3950,
        paymentTerm: 'Công nợ 15 ngày sau khi tàu chạy',
        creditLimitUsd: 80000,
        currentDebtUsd: 30000,
        accountantApproved: true,
        accountantNote: 'Khách VIP, thanh toán đúng hạn.',
        accountantName: 'Lê Minh Kế Toán',
        managerApproved: true,
        managerNote: 'Số lượng lớn 4 cont, duyệt giá.',
        managerName: 'Vũ Đức Trưởng Bộ Phận'
      },

      step2: {
        carrier: 'COSCO Shipping Lines',
        bookingNo: 'COSU-99812034',
        vesselVoyage: 'COSCO PRIDE / 098W',
        etd: '2026-11-06',
        closingTime: '2026-11-04 12:00',
        truckingVendor: 'Đại Nam Trucking Vũng Tàu',
        truckPlate: '72C-109.88',
        driverPhone: '0977.441.223',
        isDispatched: true
      },

      step3: {
        containerNo: 'COSU-8819201',
        sealNo: 'COSU-VN-77218',
        sealPhotoUrl: '',
        isInspectedByOps: true,
        customsDeclarationNo: '106199827101',
        customsChannel: 'XANH (Luồng Xanh)',
        specializedCheckDone: true,
        specializedCheckType: 'Không yêu cầu',
        isCleared: true
      },

      step4: {
        handedOverToCarrier: true,
        blType: 'House B/L',
        blNo: 'HBL-LL-SGN-26019',
        blFileUploaded: true,
        issuedDate: '2026-11-04'
      },

      step5: {
        totalRevenueUsd: 15800,
        totalCostUsd: 13600,
        grossProfitUsd: 2200,
        commissionRatePercent: 12,
        commissionAmountUsd: 264,
        isSettled: false,
        settledBy: '',
        settledDate: ''
      }
    },
    {
      id: 'SHP-2026-0105',
      customerName: 'An Nam Handicrafts Co., Ltd',
      salesRep: 'Hoàng Quốc Việt (Sales Hai Phong)',
      pol: 'Hải Phòng (VNHPH)',
      pod: 'Hamburg (DEHAM)',
      cargo: 'Đồ gốm sứ mỹ nghệ & mây tre đan',
      equipment: '1 x 20GP',
      currentStep: 5,
      statusText: 'Tàu đã chạy - Kế toán đối soát chi phí & hoa hồng',
      createdAt: '2026-10-25 11:20',

      step1: {
        proposedPriceUsd: 2150,
        paymentTerm: 'Trả trước 100%',
        creditLimitUsd: 0,
        currentDebtUsd: 0,
        accountantApproved: true,
        accountantNote: 'Đã nhận đủ tiền cọc 100%.',
        accountantName: 'Lê Minh Kế Toán',
        managerApproved: true,
        managerNote: 'Duyệt.',
        managerName: 'Vũ Đức Trưởng Bộ Phận'
      },

      step2: {
        carrier: 'Hapag-Lloyd',
        bookingNo: 'HLCU-HAM-110291',
        vesselVoyage: 'AL ZUBARA / 2409W',
        etd: '2026-10-30',
        closingTime: '2026-10-28 17:00',
        truckingVendor: 'Hải An Trucking Đình Vũ',
        truckPlate: '15C-881.09',
        driverPhone: '0912.887.665',
        isDispatched: true
      },

      step3: {
        containerNo: 'HLXU-4410291',
        sealNo: 'HL-VN-882190',
        sealPhotoUrl: '',
        isInspectedByOps: true,
        customsDeclarationNo: '106099182099',
        customsChannel: 'ĐỎ (Luồng Đỏ - Kiểm hóa)',
        specializedCheckDone: true,
        specializedCheckType: 'Hun trùng thảo mộc & C/O Form A',
        isCleared: true
      },

      step4: {
        handedOverToCarrier: true,
        blType: 'House B/L',
        blNo: 'HBL-LL-HPH-9918',
        blFileUploaded: true,
        issuedDate: '2026-10-30'
      },

      step5: {
        totalRevenueUsd: 2150,
        totalCostUsd: 1690,
        grossProfitUsd: 460,
        commissionRatePercent: 12,
        commissionAmountUsd: 55.2,
        isSettled: true,
        settledBy: 'Lê Minh Kế Toán',
        settledDate: '2026-11-04'
      }
    }
  ];

  function getShipments() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SHIPMENTS));
    return INITIAL_SHIPMENTS;
  }

  function saveShipments(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  function initWorkflowUI() {
    // 1. Tạo thanh Top Banner điều hành với CSS độc lập tuyệt đối
    const banner = document.createElement('div');
    banner.id = 'linklog-operations-banner';
    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 38px; height: 38px; border-radius: 8px; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 15px; box-shadow: 0 2px 8px rgba(37,99,235,0.6); flex-shrink: 0;">
          5S
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 800; font-size: 13px; letter-spacing: 0.5px; color: #ffffff; white-space: nowrap;">
              QUY TRÌNH 5 BƯỚC LIÊN PHÒNG BAN
            </span>
            <span style="background: rgba(37,99,235,0.3); border: 1px solid #3b82f6; color: #93c5fd; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 999px; white-space: nowrap;">
              Live Operations
            </span>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 0 0; line-height: 1.2; white-space: nowrap;" class="hidden sm:block">
            Sales (Booking) ➔ Kế toán/Manager (Duyệt) ➔ Logistics (Cước/Xe) ➔ Ops/Docs (Hải quan/Seal) ➔ B/L ➔ Quyết toán & Hoa hồng
          </p>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
        <button id="btn-open-pipeline-modal" style="background: #2563eb; color: #ffffff; font-weight: 700; font-size: 12px; padding: 7px 14px; border-radius: 8px; border: 1px solid #3b82f6; box-shadow: 0 2px 8px rgba(0,0,0,0.4); cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <svg style="width: 15px; height: 15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          <span>Mở Bảng Điều Hành 5 Bước</span>
        </button>

        <button id="btn-create-booking" style="background: #059669; color: #ffffff; font-weight: 700; font-size: 12px; padding: 7px 14px; border-radius: 8px; border: 1px solid #10b981; box-shadow: 0 2px 8px rgba(0,0,0,0.4); cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <svg style="width: 15px; height: 15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>+ Tạo Booking Mới (Bước 1)</span>
        </button>
      </div>
    `;

    document.body.prepend(banner);
    document.body.style.paddingTop = '56px';

    createPipelineModal();
    createBookingModal();

    document.getElementById('btn-open-pipeline-modal').addEventListener('click', openPipelineModal);
    document.getElementById('btn-create-booking').addEventListener('click', openCreateBookingModal);
  }

  function createPipelineModal() {
    const modal = document.createElement('div');
    modal.id = 'pipeline-modal-container';
    modal.className = 'linklog-modal-overlay hidden';
    modal.innerHTML = `
      <div class="linklog-modal-box">
        <!-- Header -->
        <div style="padding: 16px 24px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; background: #1e293b;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(37,99,235,0.25); border: 1px solid #3b82f6; display: flex; align-items: center; justify-content: center; color: #60a5fa;">
              <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 8px;">
                <span>Quy trình Phối hợp Liên phòng ban (Sơ đồ 5 Bước Tiêu Chuẩn)</span>
                <span style="font-size: 11px; font-weight: 600; color: #93c5fd; background: #1e3a8a; border: 1px solid #3b82f6; padding: 2px 8px; border-radius: 999px;">Active Pipeline</span>
              </h2>
              <p style="font-size: 12px; color: #94a3b8; margin: 2px 0 0 0;">
                Theo dõi và xử lý trực tiếp: Sales ➔ Kế toán ➔ Logistics ➔ Ops/Docs ➔ Quyết toán & Hoa hồng
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-refresh-sample-data" style="font-size: 12px; color: #cbd5e1; background: #0f172a; border: 1px solid #475569; padding: 6px 12px; border-radius: 8px; cursor: pointer;">
              🔄 Nạp lại Dữ liệu Mẫu
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
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePipelineModal();
    });

    document.getElementById('btn-refresh-sample-data').addEventListener('click', () => {
      if (confirm('Khôi phục toàn bộ dữ liệu mẫu 5 bước về ban đầu?')) {
        localStorage.removeItem(STORAGE_KEY);
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
        renderKanban(btn.getAttribute('data-role'));
      });
    });
  }

  function renderKanban() {
    const list = getShipments();
    const countEl = document.getElementById('pipeline-total-orders');
    if (countEl) countEl.innerText = list.length;

    const container = document.getElementById('kanban-columns-container');
    if (!container) return;

    const COLUMNS = [
      {
        step: 1,
        title: 'BƯỚC 1: Tiếp nhận & Thẩm định',
        desc: 'Sales lập form, Kế toán & Sếp duyệt',
        badge: 'Bước 1',
        badgeColor: '#f59e0b',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        borderColor: '#78350f'
      },
      {
        step: 2,
        title: 'BƯỚC 2: Điều phối Cước & Xe',
        desc: 'Logistics check cước, lấy Booking & xe',
        badge: 'Bước 2',
        badgeColor: '#3b82f6',
        badgeBg: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#1e3a8a'
      },
      {
        step: 3,
        title: 'BƯỚC 3: Đóng hàng & Hải quan',
        desc: 'Ops kẹp seal bãi, Docs truyền tờ khai',
        badge: 'Bước 3',
        badgeColor: '#a855f7',
        badgeBg: 'rgba(168, 85, 247, 0.15)',
        borderColor: '#581c87'
      },
      {
        step: 4,
        title: 'BƯỚC 4: Thanh lý & Vận đơn B/L',
        desc: 'Ops vào sổ tàu, Docs phát hành B/L',
        badge: 'Bước 4',
        badgeColor: '#6366f1',
        badgeBg: 'rgba(99, 102, 241, 0.15)',
        borderColor: '#312e81'
      },
      {
        step: 5,
        title: 'BƯỚC 5: Quyết toán & Hoa hồng',
        desc: 'Kế toán đối soát chi phí, chốt hoa hồng',
        badge: 'Bước 5',
        badgeColor: '#10b981',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        borderColor: '#064e3b'
      }
    ];

    container.innerHTML = COLUMNS.map(col => {
      const items = list.filter(item => item.currentStep === col.step);

      const itemsHtml = items.map(item => `
        <div class="linklog-card" onclick="window.LinklogPipeline.openDetail('${item.id}')">
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
            <span style="color: #60a5fa; font-weight: bold;">Chi tiết ➔</span>
          </div>
        </div>
      `).join('');

      return `
        <div class="linklog-kanban-col">
          <div class="linklog-kanban-header">
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

    let detailModal = document.getElementById('shipment-detail-modal');
    if (!detailModal) {
      detailModal = document.createElement('div');
      detailModal.id = 'shipment-detail-modal';
      detailModal.className = 'linklog-modal-overlay';
      document.body.appendChild(detailModal);
    }

    detailModal.innerHTML = `
      <div class="linklog-modal-box" style="max-width: 900px; height: 88vh;">
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
          <button onclick="document.getElementById('shipment-detail-modal').classList.add('hidden')" style="width: 32px; height: 32px; border-radius: 8px; background: #334155; color: #ffffff; border: none; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            ✕
          </button>
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
          <div style="background: #0f172a; border: 1px solid #3b82f6; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <h4 style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
                <span>Thao tác xử lý tại Bước ${item.currentStep}</span>
              </h4>
              <span style="font-size: 11px; color: #93c5fd; background: #1e3a8a; padding: 2px 8px; border-radius: 4px;">
                ${item.statusText}
              </span>
            </div>

            <!-- BƯỚC 1 -->
            ${item.currentStep === 1 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 14px; font-size: 12px;">
                <div>
                  <span style="color: #94a3b8;">Giá đề xuất chào bán:</span>
                  <strong style="color: #fbbf24; margin-left: 6px;">$${item.step1.proposedPriceUsd.toLocaleString()} / cont</strong>
                </div>
                <div>
                  <span style="color: #94a3b8;">Điều kiện thanh toán:</span>
                  <strong style="color: #ffffff; margin-left: 6px;">${item.step1.paymentTerm}</strong>
                </div>
              </div>

              <div style="display: flex; gap: 12px;">
                <button onclick="window.LinklogPipeline.approveStep1Accountant('${item.id}')" style="flex: 1; background: ${item.step1.accountantApproved ? '#064e3b' : '#059669'}; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #10b981; cursor: ${item.step1.accountantApproved ? 'default' : 'pointer'};" ${item.step1.accountantApproved ? 'disabled' : ''}>
                  ${item.step1.accountantApproved ? '✓ Kế Toán Đã Duyệt Công Nợ' : '👉 Kế Toán: Duyệt Điều Kiện Thanh Toán'}
                </button>
                <button onclick="window.LinklogPipeline.approveStep1Manager('${item.id}')" style="flex: 1; background: ${item.step1.managerApproved ? '#064e3b' : '#2563eb'}; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #3b82f6; cursor: ${item.step1.managerApproved ? 'default' : 'pointer'};" ${item.step1.managerApproved ? 'disabled' : ''}>
                  ${item.step1.managerApproved ? '✓ Trưởng Phòng Đã Duyệt Giá' : '👉 Trưởng Phòng: Phê Duyệt Giá Cước'}
                </button>
              </div>
            ` : ''}

            <!-- BƯỚC 2 -->
            ${item.currentStep === 2 ? `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 14px;">
                <div>
                  <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Hãng tàu cấp Booking:</label>
                  <input id="input-step2-carrier" type="text" value="${item.step2.carrier}" class="linklog-input">
                </div>
                <div>
                  <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Số Booking Note:</label>
                  <input id="input-step2-booking" type="text" value="${item.step2.bookingNo}" class="linklog-input">
                </div>
                <div>
                  <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Tàu / Chuyến:</label>
                  <input id="input-step2-vessel" type="text" value="${item.step2.vesselVoyage}" class="linklog-input">
                </div>
                <div>
                  <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Hạn Closing Time:</label>
                  <input id="input-step2-closing" type="text" value="${item.step2.closingTime}" class="linklog-input" style="color: #fb7185; font-weight: bold;">
                </div>
                <div>
                  <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Nhà xe kéo cont:</label>
                  <input id="input-step2-trucker" type="text" value="${item.step2.truckingVendor}" class="linklog-input">
                </div>
                <div>
                  <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Biển số xe kéo / SĐT:</label>
                  <input id="input-step2-plate" type="text" value="${item.step2.truckPlate}" class="linklog-input">
                </div>
              </div>

              <button onclick="window.LinklogPipeline.completeStep2('${item.id}')" style="width: 100%; background: #2563eb; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #3b82f6; cursor: pointer;">
                👉 Logistics: Xác Nhận Đã Có Booking & Đã Điều Xe (Chuyển Sang Bước 3)
              </button>
            ` : ''}

            <!-- BƯỚC 3 -->
            ${item.currentStep === 3 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div style="background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
                  <h5 style="color: #c084fc; font-size: 12px; font-weight: bold; margin: 0 0 8px 0;">1. Nhiệm vụ Hiện Trường (Ops)</h5>
                  <div style="margin-bottom: 8px;">
                    <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Container:</label>
                    <input id="input-step3-cont" type="text" value="${item.step3.containerNo}" class="linklog-input">
                  </div>
                  <div>
                    <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Chì (Seal No):</label>
                    <input id="input-step3-seal" type="text" value="${item.step3.sealNo}" class="linklog-input">
                  </div>
                </div>

                <div style="background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
                  <h5 style="color: #818cf8; font-size: 12px; font-weight: bold; margin: 0 0 8px 0;">2. Nhiệm vụ Chứng Từ (Docs)</h5>
                  <div style="margin-bottom: 8px;">
                    <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Tờ Khai Hải Quan:</label>
                    <input id="input-step3-tk" type="text" value="${item.step3.customsDeclarationNo}" class="linklog-input">
                  </div>
                  <div>
                    <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Phân Luồng Hải Quan:</label>
                    <select id="select-step3-channel" class="linklog-select">
                      <option value="XANH (Luồng Xanh)">🟢 Luồng Xanh (Thông quan tự động)</option>
                      <option value="VÀNG (Luồng Vàng)" ${item.step3.customsChannel.includes('VÀNG') ? 'selected' : ''}>🟡 Luồng Vàng (Kiểm tra hồ sơ)</option>
                      <option value="ĐỎ (Luồng Đỏ)" ${item.step3.customsChannel.includes('ĐỎ') ? 'selected' : ''}>🔴 Luồng Đỏ (Kiểm hóa thực tế)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button onclick="window.LinklogPipeline.completeStep3('${item.id}')" style="width: 100%; background: #9333ea; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #a855f7; cursor: pointer;">
                👉 Xác Nhận Hoàn Thành Đóng Hàng & Hải Quan (Chuyển Sang Bước 4)
              </button>
            ` : ''}

            <!-- BƯỚC 4 -->
            ${item.currentStep === 4 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #0b1120; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 14px;">
                <div>
                  <h5 style="color: #818cf8; font-size: 12px; font-weight: bold; margin: 0 0 6px 0;">Thanh Lý Vào Sổ Tàu</h5>
                  <p style="font-size: 11px; color: #94a3b8; margin: 0 0 10px 0;">Ops bàn giao tờ khai thông quan cho hãng tàu.</p>
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #ffffff; cursor: pointer;">
                    <input id="check-step4-handed" type="checkbox" ${item.step4.handedOverToCarrier ? 'checked' : ''}>
                    <span>Đã nộp tờ khai vào sổ tàu</span>
                  </label>
                </div>

                <div>
                  <h5 style="color: #60a5fa; font-size: 12px; font-weight: bold; margin: 0 0 6px 0;">Phát Hành Vận Đơn (B/L)</h5>
                  <div style="margin-bottom: 6px;">
                    <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Số Vận Đơn B/L:</label>
                    <input id="input-step4-blno" type="text" value="${item.step4.blNo}" class="linklog-input">
                  </div>
                </div>
              </div>

              <button onclick="window.LinklogPipeline.completeStep4('${item.id}')" style="width: 100%; background: #4f46e5; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #6366f1; cursor: pointer;">
                👉 Docs: Xác Nhận Đã Thanh Lý & Phát Hành B/L (Chuyển Bước 5 Quyết Toán)
              </button>
            ` : ''}

            <!-- BƯỚC 5 -->
            ${item.currentStep === 5 ? `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #0b1120; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; text-align: center; margin-bottom: 14px;">
                <div style="background: #020617; padding: 8px; border-radius: 6px;">
                  <span style="font-size: 11px; color: #94a3b8; display: block;">Doanh Thu Bán:</span>
                  <strong style="font-size: 15px; color: #60a5fa;">$${item.step5.totalRevenueUsd.toLocaleString()}</strong>
                </div>
                <div style="background: #020617; padding: 8px; border-radius: 6px;">
                  <span style="font-size: 11px; color: #94a3b8; display: block;">Tổng Chi Phí:</span>
                  <strong style="font-size: 15px; color: #fb7185;">$${item.step5.totalCostUsd.toLocaleString()}</strong>
                </div>
                <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; padding: 8px; border-radius: 6px;">
                  <span style="font-size: 11px; color: #34d399; display: block;">Lãi Gộp Thực Tế (GP):</span>
                  <strong style="font-size: 15px; color: #34d399;">+$${item.step5.grossProfitUsd.toLocaleString()}</strong>
                </div>
              </div>

              <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <div>
                  <strong style="color: #fbbf24; font-size: 12px; display: block;">Tự động tính hoa hồng Sales (${item.salesRep}):</strong>
                  <span style="font-size: 11px; color: #cbd5e1;">Lợi nhuận gộp ($${item.step5.grossProfitUsd}) x ${item.step5.commissionRatePercent}%</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 11px; color: #94a3b8; display: block;">Tiền hoa hồng:</span>
                  <strong style="font-size: 16px; color: #fbbf24;">$${item.step5.commissionAmountUsd.toLocaleString()} USD</strong>
                </div>
              </div>

              <button onclick="window.LinklogPipeline.completeStep5('${item.id}')" style="width: 100%; background: ${item.step5.isSettled ? '#064e3b' : '#059669'}; color: #ffffff; font-weight: bold; font-size: 12px; padding: 10px; border-radius: 8px; border: 1px solid #10b981; cursor: ${item.step5.isSettled ? 'default' : 'pointer'};" ${item.step5.isSettled ? 'disabled' : ''}>
                ${item.step5.isSettled ? '✓ Đã Quyết Toán & Đã Lưu Trữ Hồ Sơ Vĩnh Viễn' : '👉 Kế Toán: Xác Nhận Đối Soát & Chốt Quyết Toán Hoa Hồng'}
              </button>
            ` : ''}

          </div>
        </div>
      </div>
    `;

    detailModal.classList.remove('hidden');
  }

  function createBookingModal() {
    const modal = document.createElement('div');
    modal.id = 'create-booking-modal';
    modal.className = 'linklog-modal-overlay hidden';
    modal.innerHTML = `
      <div class="linklog-modal-box" style="max-width: 520px; height: auto; max-height: 90vh;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; background: #1e293b;">
          <div>
            <h3 style="font-size: 15px; font-weight: 800; color: #ffffff; margin: 0;">Lập Booking Form Mới (Bước 1)</h3>
            <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 0 0;">Tiếp nhận yêu cầu cước từ khách hàng</p>
          </div>
          <button onclick="document.getElementById('create-booking-modal').classList.add('hidden')" style="width: 28px; height: 28px; border-radius: 6px; background: #334155; color: #ffffff; border: none; cursor: pointer;">✕</button>
        </div>

        <form id="form-new-booking" style="padding: 20px; display: flex; flex-direction: column; gap: 12px; background: #0f172a;">
          <div>
            <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Tên Khách Hàng Doanh Nghiệp *</label>
            <input id="new-customer" type="text" required placeholder="VD: Tập đoàn Gỗ An Cường" class="linklog-input">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Cảng đi (POL) *</label>
              <input id="new-pol" type="text" required value="Cát Lái (VNHCM)" class="linklog-input">
            </div>
            <div>
              <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Cảng đến (POD) *</label>
              <input id="new-pod" type="text" required placeholder="VD: Yokohama (JPYOK)" class="linklog-input">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Tên Hàng Hóa *</label>
              <input id="new-cargo" type="text" required placeholder="VD: Nông sản sấy" class="linklog-input">
            </div>
            <div>
              <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Thiết Bị (Cont) *</label>
              <select id="new-equip" class="linklog-select">
                <option value="1 x 20GP">1 x 20GP</option>
                <option value="2 x 40HQ" selected>2 x 40HQ</option>
                <option value="3 x 40HQ">3 x 40HQ</option>
                <option value="1 x 40RF (Lạnh)">1 x 40RF (Lạnh)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Giá chào bán (USD) *</label>
              <input id="new-price" type="number" required value="2400" class="linklog-input">
            </div>
            <div>
              <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 4px;">Điều kiện thanh toán *</label>
              <select id="new-term" class="linklog-select">
                <option value="Trả trước 100%">Trả trước 100%</option>
                <option value="Công nợ 15 ngày">Công nợ 15 ngày</option>
                <option value="Công nợ 30 ngày (Credit 30 days)" selected>Công nợ 30 ngày</option>
                <option value="Thư tín dụng L/C">Thư tín dụng L/C</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" onclick="document.getElementById('create-booking-modal').classList.add('hidden')" style="padding: 7px 14px; background: #334155; color: #ffffff; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Hủy</button>
            <button type="submit" style="padding: 7px 16px; background: #059669; color: #ffffff; font-weight: bold; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Lưu & Bắt Đầu Bước 1</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('form-new-booking').addEventListener('submit', (e) => {
      e.preventDefault();
      const list = getShipments();
      const newId = 'SHP-2026-0' + (100 + list.length + 1);

      const customer = document.getElementById('new-customer').value;
      const pol = document.getElementById('new-pol').value;
      const pod = document.getElementById('new-pod').value;
      const cargo = document.getElementById('new-cargo').value;
      const equip = document.getElementById('new-equip').value;
      const price = parseFloat(document.getElementById('new-price').value) || 2000;
      const term = document.getElementById('new-term').value;

      const newShipment = {
        id: newId,
        customerName: customer,
        salesRep: 'Nguyễn Văn Nam (Sales Team)',
        pol: pol,
        pod: pod,
        cargo: cargo,
        equipment: equip,
        currentStep: 1,
        statusText: 'Mới tạo - Chờ Kế toán & Sếp duyệt',
        createdAt: 'Vừa xong',
        step1: {
          proposedPriceUsd: price,
          paymentTerm: term,
          creditLimitUsd: 50000,
          currentDebtUsd: 0,
          accountantApproved: false,
          accountantNote: '',
          accountantName: '',
          managerApproved: false,
          managerNote: '',
          managerName: ''
        },
        step2: {
          carrier: 'Đang chọn hãng tàu',
          bookingNo: '',
          vesselVoyage: '',
          etd: '',
          closingTime: '2026-11-15 18:00',
          truckingVendor: '',
          truckPlate: '',
          driverPhone: '',
          isDispatched: false
        },
        step3: {
          containerNo: 'Đang cấp cont',
          sealNo: 'Chưa kẹp seal',
          sealPhotoUrl: '',
          isInspectedByOps: false,
          customsDeclarationNo: 'Chưa truyền',
          customsChannel: 'VÀNG (Luồng Vàng)',
          specializedCheckDone: false,
          specializedCheckType: 'Kiểm dịch',
          isCleared: false
        },
        step4: {
          handedOverToCarrier: false,
          blType: 'House B/L',
          blNo: 'Đang dự thảo',
          blFileUploaded: false,
          issuedDate: ''
        },
        step5: {
          totalRevenueUsd: price * 2,
          totalCostUsd: price * 2 * 0.82,
          grossProfitUsd: price * 2 * 0.18,
          commissionRatePercent: 12,
          commissionAmountUsd: (price * 2 * 0.18) * 0.12,
          isSettled: false,
          settledBy: '',
          settledDate: ''
        }
      };

      list.unshift(newShipment);
      saveShipments(list);
      modal.classList.add('hidden');
      renderKanban();
      openPipelineModal();
      openOrderDetailModal(newId);
    });
  }

  function openPipelineModal() {
    const m = document.getElementById('pipeline-modal-container');
    if (m) {
      m.classList.remove('hidden');
      renderKanban();
    }
  }

  function closePipelineModal() {
    const m = document.getElementById('pipeline-modal-container');
    if (m) m.classList.add('hidden');
  }

  function openCreateBookingModal() {
    const m = document.getElementById('create-booking-modal');
    if (m) m.classList.remove('hidden');
  }

  window.LinklogPipeline = {
    openDetail: openOrderDetailModal,

    approveStep1Accountant: function(id) {
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step1.accountantApproved = true;
      item.step1.accountantName = 'Lê Minh Kế Toán';
      
      if (item.step1.managerApproved) {
        item.currentStep = 2;
        item.statusText = 'Đã duyệt toàn bộ ➔ Chuyển Logistics điều cước & xe';
      } else {
        item.statusText = 'Kế toán đã duyệt ➔ Chờ Trưởng phòng duyệt giá';
      }

      saveShipments(list);
      renderKanban();
      openOrderDetailModal(id);
    },

    approveStep1Manager: function(id) {
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step1.managerApproved = true;
      item.step1.managerName = 'Vũ Đức Trưởng Bộ Phận';

      if (item.step1.accountantApproved) {
        item.currentStep = 2;
        item.statusText = 'Đã duyệt toàn bộ ➔ Chuyển Logistics điều cước & xe';
      } else {
        item.statusText = 'Trưởng phòng đã duyệt giá ➔ Chờ Kế toán duyệt công nợ';
      }

      saveShipments(list);
      renderKanban();
      openOrderDetailModal(id);
    },

    completeStep2: function(id) {
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      const carrier = document.getElementById('input-step2-carrier')?.value || item.step2.carrier;
      const booking = document.getElementById('input-step2-booking')?.value || item.step2.bookingNo;
      const vessel = document.getElementById('input-step2-vessel')?.value || item.step2.vesselVoyage;
      const closing = document.getElementById('input-step2-closing')?.value || item.step2.closingTime;
      const trucker = document.getElementById('input-step2-trucker')?.value || item.step2.truckingVendor;
      const plate = document.getElementById('input-step2-plate')?.value || item.step2.truckPlate;

      item.step2.carrier = carrier;
      item.step2.bookingNo = booking;
      item.step2.vesselVoyage = vessel;
      item.step2.closingTime = closing;
      item.step2.truckingVendor = trucker;
      item.step2.truckPlate = plate;
      item.step2.isDispatched = true;

      item.currentStep = 3;
      item.statusText = 'Đã có Booking & Xe ➔ Ops đóng hàng & Docs truyền tờ khai';

      saveShipments(list);
      renderKanban();
      openOrderDetailModal(id);
    },

    completeStep3: function(id) {
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      const cont = document.getElementById('input-step3-cont')?.value || item.step3.containerNo;
      const seal = document.getElementById('input-step3-seal')?.value || item.step3.sealNo;
      const tk = document.getElementById('input-step3-tk')?.value || item.step3.customsDeclarationNo;
      const channel = document.getElementById('select-step3-channel')?.value || item.step3.customsChannel;

      item.step3.containerNo = cont;
      item.step3.sealNo = seal;
      item.step3.customsDeclarationNo = tk;
      item.step3.customsChannel = channel;
      item.step3.isInspectedByOps = true;
      item.step3.isCleared = true;

      item.currentStep = 4;
      item.statusText = 'Đã đóng hàng & thông quan ➔ Thanh lý hãng tàu & Xuất B/L';

      saveShipments(list);
      renderKanban();
      openOrderDetailModal(id);
    },

    completeStep4: function(id) {
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      const blNo = document.getElementById('input-step4-blno')?.value || item.step4.blNo;

      item.step4.blNo = blNo;
      item.step4.handedOverToCarrier = true;
      item.step4.blFileUploaded = true;
      item.step4.issuedDate = new Date().toISOString().split('T')[0];

      item.currentStep = 5;
      item.statusText = 'Đã phát hành B/L ➔ Chuyển Kế toán đối soát & chốt hoa hồng';

      saveShipments(list);
      renderKanban();
      openOrderDetailModal(id);
    },

    completeStep5: function(id) {
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step5.isSettled = true;
      item.step5.settledBy = 'Lê Minh Kế Toán';
      item.step5.settledDate = new Date().toISOString().split('T')[0];
      item.statusText = 'ĐÃ HOÀN TẤT QUYẾT TOÁN & LƯU TRỮ HỒ SƠ VĨNH VIỄN';

      saveShipments(list);
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
