/**
 * LINKLOG Quote OS - Module Điều hành Quy trình Phối hợp Liên phòng ban (5 Bước Tiêu chuẩn)
 * Tích hợp đầy đủ:
 * - BƯỚC 1: Tiếp nhận & Thẩm định (Sales + Kế toán + Manager)
 * - BƯỚC 2: Điều phối Cước vận chuyển & Đặt xe (Logistics + Trucker + Closing time)
 * - BƯỚC 3: Đóng hàng & Xử lý Hải quan (Ops kiểm cont/seal + Docs tờ khai)
 * - BƯỚC 4: Thanh lý & Phát hành Vận đơn (Ops vào sổ tàu + Docs xuất B/L)
 * - BƯỚC 5: Quyết toán & Chốt hoa hồng (Kế toán đối soát + Tính hoa hồng Sales)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'linklog_shipments_5steps_v1';

  // Dữ liệu mẫu chuẩn nghiệp vụ logistics
  const INITIAL_SHIPMENTS = [
    {
      id: 'SHP-2026-0101',
      customerName: 'ABC Furniture Vietnam',
      salesRep: 'Nguyễn Văn Nam (Sales Team)',
      pol: 'Cát Lái (VNHCM)',
      pod: 'Long Beach (USLGB)',
      cargo: 'Bàn ghế sofa xuất khẩu',
      equipment: '2 x 40HQ',
      currentStep: 1, // 1 -> 5
      statusText: 'Chờ thẩm định thanh toán & giá',
      createdAt: '2026-11-04 09:30',
      
      // Bước 1
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

      // Bước 2
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

      // Bước 3
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

      // Bước 4
      step4: {
        handedOverToCarrier: false,
        blType: 'Master B/L (Hãng tàu trực tiếp)',
        blNo: 'MSKU99201481',
        blFileUploaded: false,
        issuedDate: ''
      },

      // Bước 5
      step5: {
        totalRevenueUsd: 5700, // 2 x 2850
        totalCostUsd: 4850,    // cước + xe kéo + nâng hạ + local
        grossProfitUsd: 850,
        commissionRatePercent: 12, // 12% trên GP
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
        closingTime: '2026-11-06 20:00', // Sắp đến closing time!
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
        sealPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
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
        totalRevenueUsd: 15800, // 4 x 3950
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
        totalCostUsd: 1690, // Cước biển 1200 + Xe kéo 250 + Phí nâng hạ seal 150 + Hun trùng 90
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

  // Khởi tạo giao diện UI
  function initWorkflowUI() {
    // 1. Tạo thanh Top Banner điều hướng nổi bật
    const banner = document.createElement('div');
    banner.id = 'linklog-operations-banner';
    banner.className = 'fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2.5 shadow-xl flex items-center justify-between border-b border-blue-500/30';
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow">
          5S
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="font-extrabold tracking-wide text-sm bg-gradient-to-r from-blue-200 to-indigo-100 bg-clip-text text-transparent">
              LINKLOG QUY TRÌNH 5 BƯỚC LIÊN PHÒNG BAN
            </span>
            <span class="bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Live Operations
            </span>
          </div>
          <p class="text-[11px] text-slate-300 hidden sm:block">
            Sales (Booking) ➔ Kế toán/Manager (Duyệt) ➔ Logistics (Cước/Xe) ➔ Ops/Docs (Hải quan/Seal) ➔ B/L ➔ Quyết toán & Hoa hồng
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2.5">
        <button id="btn-open-pipeline-modal" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow transition flex items-center space-x-1.5 border border-blue-400/40 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          <span>Mở Bảng Điều Hành 5 Bước</span>
        </button>

        <button id="btn-create-booking" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow transition flex items-center space-x-1 border border-emerald-400/40 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>+ Tạo Booking Mới (Bước 1)</span>
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    // Dịch chuyển body xuống một chút để không che giao diện hiện tại
    document.body.style.paddingTop = '52px';

    // 2. Tạo Modal Trung tâm điều hành 5 Bước
    createPipelineModal();

    // 3. Tạo Modal Form Tạo Booking mới
    createBookingModal();

    // Gắn sự kiện click
    document.getElementById('btn-open-pipeline-modal').addEventListener('click', () => {
      openPipelineModal();
    });

    document.getElementById('btn-create-booking').addEventListener('click', () => {
      openCreateBookingModal();
    });
  }

  // Tạo Modal chính: Bảng Điều hành 5 Bước
  function createPipelineModal() {
    const modal = document.createElement('div');
    modal.id = 'pipeline-modal-container';
    modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex flex-col justify-end sm:justify-center p-0 sm:p-4 overflow-hidden';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 sm:rounded-2xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden mx-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white flex items-center space-x-2">
                <span>Quy trình Phối hợp Liên phòng ban (Sơ đồ 5 Bước Tiêu Chuẩn)</span>
                <span class="text-xs font-normal text-blue-400 bg-blue-950 border border-blue-800 px-2.5 py-0.5 rounded-full">Active Pipeline</span>
              </h2>
              <p class="text-xs text-slate-400">
                Theo dõi và xử lý trực tiếp: Sales ➔ Kế toán ➔ Logistics ➔ Ops/Docs ➔ Quyết toán & Hoa hồng
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <button id="btn-refresh-sample-data" class="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition flex items-center space-x-1 cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Nạp lại Dữ liệu Mẫu</span>
            </button>
            <button id="btn-close-pipeline-modal" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer">
              ✕
            </button>
          </div>
        </div>

        <!-- Bộ lọc vai trò phòng ban -->
        <div class="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0" id="role-filter-container">
            <span class="text-slate-400 font-semibold mr-1.5">Góc nhìn:</span>
            <button data-role="ALL" class="role-filter-btn bg-blue-600 text-white font-medium px-3 py-1 rounded-md transition cursor-pointer">Tất cả phòng ban</button>
            <button data-role="SALES" class="role-filter-btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-md transition cursor-pointer">1. Sales</button>
            <button data-role="ACCOUNTANT" class="role-filter-btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-md transition cursor-pointer">2. Kế toán</button>
            <button data-role="LOGISTICS" class="role-filter-btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-md transition cursor-pointer">3. Logistics/Pricing</button>
            <button data-role="OPS" class="role-filter-btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-md transition cursor-pointer">4. Hiện trường (Ops)</button>
            <button data-role="DOCS" class="role-filter-btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-md transition cursor-pointer">5. Chứng từ (Docs)</button>
          </div>

          <div class="text-[11px] text-slate-400 font-mono">
            Tổng cộng: <span id="pipeline-total-orders" class="font-bold text-white">0</span> lô hàng đang vận hành
          </div>
        </div>

        <!-- Bảng 5 Cột Kanban -->
        <div class="flex-1 p-6 overflow-x-auto overflow-y-hidden bg-slate-950/40">
          <div class="grid grid-cols-5 gap-4 min-w-[1250px] h-full" id="kanban-columns-container">
            <!-- 5 Cột được inject bằng JS -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Gắn sự kiện đóng modal
    document.getElementById('btn-close-pipeline-modal').addEventListener('click', closePipelineModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePipelineModal();
    });

    document.getElementById('btn-refresh-sample-data').addEventListener('click', () => {
      if (confirm('Khôi phục toàn bộ 5 lô hàng mẫu về trạng thái ban đầu?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderKanban();
      }
    });

    // Sự kiện lọc vai trò
    modal.querySelectorAll('.role-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.role-filter-btn').forEach(b => {
          b.className = 'role-filter-btn bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-md transition cursor-pointer';
        });
        btn.className = 'role-filter-btn bg-blue-600 text-white font-medium px-3 py-1 rounded-md transition cursor-pointer';
        renderKanban(btn.getAttribute('data-role'));
      });
    });
  }

  // Render 5 Cột Kanban
  function renderKanban(selectedRole = 'ALL') {
    const list = getShipments();
    document.getElementById('pipeline-total-orders').innerText = list.length;

    const container = document.getElementById('kanban-columns-container');
    if (!container) return;

    const COLUMNS = [
      {
        step: 1,
        title: 'BƯỚC 1: Tiếp nhận & Thẩm định',
        desc: 'Sales lập form, Kế toán & Trưởng phòng duyệt',
        badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
        headerBg: 'bg-amber-950/30 border-amber-800/40'
      },
      {
        step: 2,
        title: 'BƯỚC 2: Điều phối Cước & Đặt xe',
        desc: 'Logistics check cước, lấy Booking, đặt xe kéo',
        badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
        headerBg: 'bg-blue-950/30 border-blue-800/40'
      },
      {
        step: 3,
        title: 'BƯỚC 3: Đóng hàng & Hải quan',
        desc: 'Ops kẹp seal bãi, Docs nộp kiểm tra & tờ khai',
        badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
        headerBg: 'bg-purple-950/30 border-purple-800/40'
      },
      {
        step: 4,
        title: 'BƯỚC 4: Thanh lý & Ra Vận đơn B/L',
        desc: 'Ops vào sổ tàu, Docs phát hành MBL/HBL',
        badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
        headerBg: 'bg-indigo-950/30 border-indigo-800/40'
      },
      {
        step: 5,
        title: 'BƯỚC 5: Quyết toán & Hoa hồng',
        desc: 'Kế toán đối soát chi phí, chốt hoa hồng Sales',
        badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
        headerBg: 'bg-emerald-950/30 border-emerald-800/40'
      }
    ];

    container.innerHTML = COLUMNS.map(col => {
      const items = list.filter(item => item.currentStep === col.step);

      const itemsHtml = items.map(item => `
        <div class="shipment-card bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-3.5 shadow-md transition space-y-3 cursor-pointer group" onclick="window.LinklogPipeline.openDetail('${item.id}')">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-blue-400 group-hover:underline">${item.id}</span>
            <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">${item.equipment}</span>
          </div>

          <div>
            <h4 class="text-xs font-bold text-white truncate">${item.customerName}</h4>
            <p class="text-[11px] text-slate-400 truncate mt-0.5">${item.cargo}</p>
          </div>

          <div class="text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 space-y-1">
            <div class="flex justify-between text-slate-400">
              <span>Tuyến:</span>
              <span class="text-slate-200 font-medium">${item.pol.split(' ')[0]} ➔ ${item.pod.split(' ')[0]}</span>
            </div>
            
            ${col.step === 1 ? `
              <div class="flex justify-between text-slate-400">
                <span>Giá chào:</span>
                <span class="text-amber-400 font-bold">$${item.step1.proposedPriceUsd.toLocaleString()}</span>
              </div>
              <div class="flex justify-between text-[10px] pt-1 border-t border-slate-800">
                <span class="${item.step1.accountantApproved ? 'text-emerald-400' : 'text-amber-500 font-bold'}">
                  ${item.step1.accountantApproved ? '✓ KT đã duyệt' : '⏳ Chờ KT duyệt'}
                </span>
                <span class="${item.step1.managerApproved ? 'text-emerald-400' : 'text-amber-500 font-bold'}">
                  ${item.step1.managerApproved ? '✓ Sếp đã duyệt' : '⏳ Chờ Sếp duyệt'}
                </span>
              </div>
            ` : ''}

            ${col.step === 2 ? `
              <div class="flex justify-between text-slate-400">
                <span>Hãng tàu:</span>
                <span class="text-blue-300 font-medium">${item.step2.carrier}</span>
              </div>
              <div class="flex justify-between text-[10px] text-rose-400 font-bold pt-1 border-t border-slate-800">
                <span>Closing:</span>
                <span>${item.step2.closingTime}</span>
              </div>
            ` : ''}

            ${col.step === 3 ? `
              <div class="flex justify-between text-slate-400">
                <span>Số Container:</span>
                <span class="text-purple-300 font-mono font-bold">${item.step3.containerNo}</span>
              </div>
              <div class="flex justify-between text-[10px] pt-1 border-t border-slate-800">
                <span class="${item.step3.isInspectedByOps ? 'text-emerald-400' : 'text-purple-400'}">
                  ${item.step3.isInspectedByOps ? '✓ Seal: ' + item.step3.sealNo : '⏳ Chưa kẹp seal'}
                </span>
                <span class="${item.step3.isCleared ? 'text-emerald-400' : 'text-amber-400'}">
                  ${item.step3.isCleared ? '✓ Đã thông quan' : '⏳ Chờ tờ khai'}
                </span>
              </div>
            ` : ''}

            ${col.step === 4 ? `
              <div class="flex justify-between text-slate-400">
                <span>Vận đơn:</span>
                <span class="text-indigo-300 font-mono font-bold">${item.step4.blNo}</span>
              </div>
              <div class="flex justify-between text-[10px] pt-1 border-t border-slate-800">
                <span class="${item.step4.handedOverToCarrier ? 'text-emerald-400' : 'text-amber-400'}">
                  ${item.step4.handedOverToCarrier ? '✓ Vào sổ tàu' : '⏳ Chưa thanh lý'}
                </span>
                <span class="${item.step4.blFileUploaded ? 'text-emerald-400' : 'text-slate-400'}">
                  ${item.step4.blFileUploaded ? '✓ Đã ra B/L' : '⏳ Đang dự thảo'}
                </span>
              </div>
            ` : ''}

            ${col.step === 5 ? `
              <div class="flex justify-between text-slate-400">
                <span>Lãi gộp (GP):</span>
                <span class="text-emerald-400 font-bold">+$${item.step5.grossProfitUsd.toLocaleString()}</span>
              </div>
              <div class="flex justify-between text-[10px] pt-1 border-t border-slate-800">
                <span class="text-slate-400">Hoa hồng Sales:</span>
                <span class="text-amber-400 font-bold">$${item.step5.commissionAmountUsd.toLocaleString()} (${item.step5.commissionRatePercent}%)</span>
              </div>
              <div class="text-[10px] text-center pt-1 font-bold ${item.step5.isSettled ? 'text-emerald-400' : 'text-amber-400'}">
                ${item.step5.isSettled ? '✓ Đã quyết toán xong' : '⏳ Kế toán chưa chốt'}
              </div>
            ` : ''}
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span class="truncate">👤 ${item.salesRep.split(' ')[0]}</span>
            <span class="text-blue-400 font-bold group-hover:translate-x-0.5 transition">Chi tiết ➔</span>
          </div>
        </div>
      `).join('');

      return `
        <div class="flex flex-col h-full bg-slate-900/40 rounded-xl border border-slate-800/80 overflow-hidden">
          <!-- Column Header -->
          <div class="p-3 border-b border-slate-800 ${col.headerBg}">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${col.badgeColor}">
                Bước ${col.step}
              </span>
              <span class="text-xs font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded-full font-mono">
                ${items.length}
              </span>
            </div>
            <h3 class="text-xs font-bold text-white mt-1.5 line-clamp-1">${col.title}</h3>
            <p class="text-[10px] text-slate-400 truncate mt-0.5">${col.desc}</p>
          </div>

          <!-- Cards List -->
          <div class="flex-1 p-3 overflow-y-auto space-y-3">
            ${items.length > 0 ? itemsHtml : `
              <div class="h-28 flex flex-col items-center justify-center text-slate-400 text-xs text-center border border-dashed border-slate-800 rounded-xl">
                <span>Không có lô hàng</span>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  // Mở Modal xem chi tiết & Thao tác chuyển bước
  function openOrderDetailModal(shipmentId) {
    const list = getShipments();
    const item = list.find(s => s.id === shipmentId);
    if (!item) return;

    let detailModal = document.getElementById('shipment-detail-modal');
    if (!detailModal) {
      detailModal = document.createElement('div');
      detailModal.id = 'shipment-detail-modal';
      detailModal.className = 'fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto';
      document.body.appendChild(detailModal);
    }

    detailModal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div class="flex items-center space-x-2.5">
              <span class="text-sm font-mono font-bold text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded border border-blue-800">${item.id}</span>
              <h3 class="text-base font-bold text-white">${item.customerName}</h3>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Hàng hóa: <span class="text-slate-200 font-medium">${item.cargo}</span> • Thiết bị: <span class="text-slate-200 font-medium">${item.equipment}</span> • Tuyến: <span class="text-slate-200 font-medium">${item.pol} ➔ ${item.pod}</span>
            </p>
          </div>
          <button onclick="document.getElementById('shipment-detail-modal').classList.add('hidden')" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Stepper Progress Bar 5 Bước -->
        <div class="px-6 py-4 bg-slate-950/40 border-b border-slate-800">
          <div class="grid grid-cols-5 gap-2 text-center text-xs">
            ${[1, 2, 3, 4, 5].map(step => {
              const isCompleted = item.currentStep > step;
              const isCurrent = item.currentStep === step;
              const titles = ['1. Tiếp nhận & Duyệt', '2. Cước & Đặt xe', '3. Đóng hàng & HQ', '4. Thanh lý & B/L', '5. Quyết toán & GP'];
              return `
                <div class="p-2 rounded-lg border transition ${
                  isCompleted ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' :
                  isCurrent ? 'bg-blue-950/60 border-blue-500 text-blue-300 font-bold ring-1 ring-blue-500 shadow-lg' :
                  'bg-slate-900 border-slate-800 text-slate-400'
                }">
                  <div class="flex items-center justify-center space-x-1 mb-1">
                    <span>${isCompleted ? '✓' : isCurrent ? '▶' : '○'}</span>
                    <span class="font-bold">Bước ${step}</span>
                  </div>
                  <div class="text-[10px] truncate">${titles[step - 1]}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Nội dung Chi tiết theo Bước hiện tại -->
        <div class="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          <!-- HỘP THAO TÁC THEO BƯỚC HIỆN TẠI -->
          <div class="bg-blue-950/30 border border-blue-500/40 rounded-xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold text-white flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>Thao tác xử lý tại Bước ${item.currentStep}</span>
              </h4>
              <span class="text-xs text-blue-300 bg-blue-900/40 px-2.5 py-0.5 rounded border border-blue-700">
                ${item.statusText}
              </span>
            </div>

            <!-- BƯỚC 1 ACTION -->
            ${item.currentStep === 1 ? `
              <div class="space-y-3 pt-2">
                <div class="grid grid-cols-2 gap-4 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span class="text-slate-400">Giá đề xuất bán:</span>
                    <span class="font-bold text-amber-400 ml-2">$${item.step1.proposedPriceUsd.toLocaleString()} / cont</span>
                  </div>
                  <div>
                    <span class="text-slate-400">Điều kiện thanh toán:</span>
                    <span class="font-bold text-white ml-2">${item.step1.paymentTerm}</span>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 pt-2">
                  <button onclick="window.LinklogPipeline.approveStep1Accountant('${item.id}')" class="flex-1 ${item.step1.accountantApproved ? 'bg-emerald-900/60 border border-emerald-500 text-emerald-200 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'} font-bold py-2.5 px-4 rounded-lg shadow text-xs transition" ${item.step1.accountantApproved ? 'disabled' : ''}>
                    ${item.step1.accountantApproved ? '✓ Kế Toán Đã Duyệt Công Nợ' : '👉 Kế Toán: Duyệt Điều Kiện Thanh Toán'}
                  </button>

                  <button onclick="window.LinklogPipeline.approveStep1Manager('${item.id}')" class="flex-1 ${item.step1.managerApproved ? 'bg-emerald-900/60 border border-emerald-500 text-emerald-200 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'} font-bold py-2.5 px-4 rounded-lg shadow text-xs transition" ${item.step1.managerApproved ? 'disabled' : ''}>
                    ${item.step1.managerApproved ? '✓ Trưởng Phòng Đã Duyệt Giá' : '👉 Trưởng Phòng: Phê Duyệt Giá Cước'}
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- BƯỚC 2 ACTION -->
            ${item.currentStep === 2 ? `
              <div class="space-y-4 pt-2">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                  <div>
                    <label class="text-slate-400 text-[11px] block">Hãng tàu cấp Booking:</label>
                    <input id="input-step2-carrier" type="text" value="${item.step2.carrier}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs">
                  </div>
                  <div>
                    <label class="text-slate-400 text-[11px] block">Số Booking Note:</label>
                    <input id="input-step2-booking" type="text" value="${item.step2.bookingNo}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-mono">
                  </div>
                  <div>
                    <label class="text-slate-400 text-[11px] block">Tàu / Chuyến:</label>
                    <input id="input-step2-vessel" type="text" value="${item.step2.vesselVoyage}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs">
                  </div>
                  <div>
                    <label class="text-slate-400 text-[11px] block">Hạn đóng hàng (Closing Time):</label>
                    <input id="input-step2-closing" type="text" value="${item.step2.closingTime}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-rose-400 font-bold text-xs">
                  </div>
                  <div>
                    <label class="text-slate-400 text-[11px] block">Nhà xe kéo Cont:</label>
                    <input id="input-step2-trucker" type="text" value="${item.step2.truckingVendor}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs">
                  </div>
                  <div>
                    <label class="text-slate-400 text-[11px] block">Biển số xe kéo / SĐT tài xế:</label>
                    <input id="input-step2-plate" type="text" value="${item.step2.truckPlate}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs">
                  </div>
                </div>

                <button onclick="window.LinklogPipeline.completeStep2('${item.id}')" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg shadow text-xs transition cursor-pointer">
                  👉 Logistics: Xác Nhận Đã Có Booking & Đã Điều Xe (Chuyển Bước 3)
                </button>
              </div>
            ` : ''}

            <!-- BƯỚC 3 ACTION -->
            ${item.currentStep === 3 ? `
              <div class="space-y-4 pt-2">
                <div class="grid grid-cols-2 gap-4">
                  <!-- Phía Ops hiện trường -->
                  <div class="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                    <h5 class="font-bold text-purple-300 text-xs">1. Nhiệm vụ Hiện Trường (Ops tại bãi)</h5>
                    <div>
                      <label class="text-slate-400 text-[11px] block">Số Container:</label>
                      <input id="input-step3-cont" type="text" value="${item.step3.containerNo}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono">
                    </div>
                    <div>
                      <label class="text-slate-400 text-[11px] block">Số Chì (Seal No):</label>
                      <input id="input-step3-seal" type="text" value="${item.step3.sealNo}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono">
                    </div>
                    <div class="pt-1">
                      <label class="flex items-center space-x-2 text-xs cursor-pointer">
                        <input id="check-step3-ops" type="checkbox" ${item.step3.isInspectedByOps ? 'checked' : ''} class="rounded border-slate-700 text-purple-600">
                        <span class="text-slate-300 font-medium">Ops đã kiểm cont, kẹp seal & chụp ảnh bãi</span>
                      </label>
                    </div>
                  </div>

                  <!-- Phía Chứng từ Docs -->
                  <div class="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                    <h5 class="font-bold text-indigo-300 text-xs">2. Nhiệm vụ Chứng Từ (Docs Hải Quan)</h5>
                    <div>
                      <label class="text-slate-400 text-[11px] block">Số Tờ Khai Hải Quan:</label>
                      <input id="input-step3-tk" type="text" value="${item.step3.customsDeclarationNo}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono">
                    </div>
                    <div>
                      <label class="text-slate-400 text-[11px] block">Phân Luồng Hải Quan:</label>
                      <select id="select-step3-channel" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs">
                        <option value="XANH (Luồng Xanh)">🟢 Luồng Xanh (Thông quan tự động)</option>
                        <option value="VÀNG (Luồng Vàng)" ${item.step3.customsChannel.includes('VÀNG') ? 'selected' : ''}>🟡 Luồng Vàng (Kiểm tra hồ sơ)</option>
                        <option value="ĐỎ (Luồng Đỏ)" ${item.step3.customsChannel.includes('ĐỎ') ? 'selected' : ''}>🔴 Luồng Đỏ (Kiểm hóa thực tế)</option>
                      </select>
                    </div>
                    <div class="pt-1">
                      <label class="flex items-center space-x-2 text-xs cursor-pointer">
                        <input id="check-step3-cleared" type="checkbox" ${item.step3.isCleared ? 'checked' : ''} class="rounded border-slate-700 text-emerald-600">
                        <span class="text-emerald-400 font-medium">Đã thông quan & hoàn tất kiểm tra chuyên ngành</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button onclick="window.LinklogPipeline.completeStep3('${item.id}')" class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-lg shadow text-xs transition cursor-pointer">
                  👉 Xác Nhận Hoàn Thành Đóng Hàng & Hải Quan (Chuyển Sang Bước 4)
                </button>
              </div>
            ` : ''}

            <!-- BƯỚC 4 ACTION -->
            ${item.currentStep === 4 ? `
              <div class="space-y-4 pt-2">
                <div class="grid grid-cols-2 gap-4 bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                  <div class="space-y-3">
                    <h5 class="font-bold text-indigo-300 text-xs">Thanh Lý Hải Quan Với Hãng Tàu</h5>
                    <p class="text-slate-400 text-[11px]">Ops bàn giao tờ khai đã thông quan cho đại diện hãng tàu tại cảng để vào sổ tàu.</p>
                    <label class="flex items-center space-x-2 text-xs cursor-pointer pt-1">
                      <input id="check-step4-handed" type="checkbox" ${item.step4.handedOverToCarrier ? 'checked' : ''} class="rounded border-slate-700 text-indigo-600">
                      <span class="text-white font-medium">Đã nộp tờ khai vào sổ tàu thành công</span>
                    </label>
                  </div>

                  <div class="space-y-2">
                    <h5 class="font-bold text-blue-300 text-xs">Phát Hành Vận Đơn (B/L)</h5>
                    <div>
                      <label class="text-slate-400 text-[11px] block">Loại Vận Đơn:</label>
                      <select id="select-step4-bltype" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs">
                        <option value="Master B/L (Hãng tàu)">Master B/L (Hãng tàu phát hành)</option>
                        <option value="House B/L (LinkLog)">House B/L (Forwarder phát hành)</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-slate-400 text-[11px] block">Số Vận Đơn B/L:</label>
                      <input id="input-step4-blno" type="text" value="${item.step4.blNo}" class="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono">
                    </div>
                  </div>
                </div>

                <button onclick="window.LinklogPipeline.completeStep4('${item.id}')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg shadow text-xs transition cursor-pointer">
                  👉 Docs: Xác Nhận Đã Thanh Lý & Phát Hành B/L (Chuyển Bước 5 Quyết Toán)
                </button>
              </div>
            ` : ''}

            <!-- BƯỚC 5 ACTION -->
            ${item.currentStep === 5 ? `
              <div class="space-y-4 pt-2">
                <div class="grid grid-cols-3 gap-3 bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-center">
                  <div class="p-2 bg-slate-950/60 rounded border border-slate-800">
                    <span class="text-slate-400 text-[11px] block">Tổng Doanh Thu Bán:</span>
                    <span class="text-base font-bold text-blue-400">$${item.step5.totalRevenueUsd.toLocaleString()}</span>
                  </div>
                  <div class="p-2 bg-slate-950/60 rounded border border-slate-800">
                    <span class="text-slate-400 text-[11px] block">Tổng Chi Phí Thực Tế:</span>
                    <span class="text-base font-bold text-rose-400">$${item.step5.totalCostUsd.toLocaleString()}</span>
                  </div>
                  <div class="p-2 bg-emerald-950/30 rounded border border-emerald-500/30">
                    <span class="text-emerald-300 text-[11px] block">Lợi Nhuận Gộp (GP):</span>
                    <span class="text-base font-black text-emerald-400">+$${item.step5.grossProfitUsd.toLocaleString()}</span>
                  </div>
                </div>

                <div class="bg-amber-950/30 border border-amber-500/40 p-3.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span class="text-amber-300 font-bold block">Tự động tính Hoa hồng cho Sales (${item.salesRep}):</span>
                    <span class="text-slate-300 text-[11px]">Công thức: Lợi nhuận gộp ($${item.step5.grossProfitUsd}) x ${item.step5.commissionRatePercent}%</span>
                  </div>
                  <div class="text-right">
                    <span class="text-xs text-slate-400 block">Số tiền hoa hồng:</span>
                    <span class="text-lg font-black text-amber-400">$${item.step5.commissionAmountUsd.toLocaleString()} USD</span>
                  </div>
                </div>

                <button onclick="window.LinklogPipeline.completeStep5('${item.id}')" class="w-full ${item.step5.isSettled ? 'bg-emerald-900 border border-emerald-500 text-emerald-200 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'} font-bold py-2.5 rounded-lg shadow text-xs transition" ${item.step5.isSettled ? 'disabled' : ''}>
                  ${item.step5.isSettled ? '✓ Đã Quyết Toán & Đã Lưu Trữ Hồ Sơ Vĩnh Viễn' : '👉 Kế Toán: Xác Nhận Đối Soát & Chốt Quyết Toán Hoa Hồng'}
                </button>
              </div>
            ` : ''}

          </div>

          <!-- Lịch sử tóm tắt các bước đã qua -->
          <div class="space-y-2">
            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Hồ Sơ Toàn Trình Lô Hàng</h5>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div class="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span class="text-slate-400 block">Khách hàng:</span>
                <span class="font-bold text-white">${item.customerName}</span>
              </div>
              <div class="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span class="text-slate-400 block">Người phụ trách:</span>
                <span class="font-bold text-white">${item.salesRep}</span>
              </div>
              <div class="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span class="text-slate-400 block">Hãng tàu / Booking:</span>
                <span class="font-bold text-white">${item.step2.carrier} (${item.step2.bookingNo || 'Chưa có'})</span>
              </div>
              <div class="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span class="text-slate-400 block">Số Container / Seal:</span>
                <span class="font-bold text-white">${item.step3.containerNo || 'Chưa có'} / ${item.step3.sealNo || 'Chưa có'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    detailModal.classList.remove('hidden');
  }

  // Tạo Modal Form Lập Booking Mới
  function createBookingModal() {
    const modal = document.createElement('div');
    modal.id = 'create-booking-modal';
    modal.className = 'fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md hidden flex items-center justify-center p-4 overflow-y-auto';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 class="text-base font-bold text-white flex items-center space-x-2">
              <span class="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-xs">+</span>
              <span>Lập Booking Form Mới (Khởi tạo Bước 1)</span>
            </h3>
            <p class="text-xs text-slate-400">Dành cho Sales tiếp nhận yêu cầu từ khách hàng</p>
          </div>
          <button onclick="document.getElementById('create-booking-modal').classList.add('hidden')" class="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form id="form-new-booking" class="p-6 space-y-4 text-xs text-slate-300">
          <div>
            <label class="block text-slate-400 mb-1">Tên Khách Hàng Doanh Nghiệp *</label>
            <input id="new-customer" type="text" required placeholder="VD: Tập đoàn Gỗ An Cường" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Cảng đi (POL) *</label>
              <input id="new-pol" type="text" required value="Cát Lái (VNHCM)" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs">
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Cảng đến (POD) *</label>
              <input id="new-pod" type="text" required placeholder="VD: Yokohama (JPYOK)" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Tên Hàng Hóa *</label>
              <input id="new-cargo" type="text" required placeholder="VD: Nông sản sấy dẻo" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs">
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Loại Thiết Bị (Cont) *</label>
              <select id="new-equip" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs">
                <option value="1 x 20GP">1 x 20GP</option>
                <option value="2 x 40HQ" selected>2 x 40HQ</option>
                <option value="3 x 40HQ">3 x 40HQ</option>
                <option value="1 x 40RF (Lạnh)">1 x 40RF (Lạnh)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Giá chào bán dự kiến (USD/cont) *</label>
              <input id="new-price" type="number" required value="2400" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs">
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Điều kiện thanh toán đề xuất *</label>
              <select id="new-term" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs">
                <option value="Trả trước 100% trước khi ra B/L">Trả trước 100%</option>
                <option value="Công nợ 15 ngày sau tàu chạy">Công nợ 15 ngày</option>
                <option value="Công nợ 30 ngày (Credit 30 days)" selected>Công nợ 30 ngày</option>
                <option value="Thư tín dụng L/C">Thư tín dụng L/C</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-400 mb-1">Nhân viên Sales phụ trách</label>
            <input id="new-sales" type="text" value="Nguyễn Văn Nam (Sales Team)" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs">
          </div>

          <div class="pt-2 flex justify-end space-x-2">
            <button type="button" onclick="document.getElementById('create-booking-modal').classList.add('hidden')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-lg shadow cursor-pointer">Lưu & Khởi Tạo Bước 1</button>
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
      const sales = document.getElementById('new-sales').value;

      const newShipment = {
        id: newId,
        customerName: customer,
        salesRep: sales,
        pol: pol,
        pod: pod,
        cargo: cargo,
        equipment: equip,
        currentStep: 1,
        statusText: 'Mới tạo - Chờ Kế toán & Trưởng phòng duyệt',
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
          specializedCheckType: 'Kiểm dịch thực vật',
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

  // EXPORT CÁC HÀM XỬ LÝ ACTION VÀO WINDOW
  window.LinklogPipeline = {
    openDetail: openOrderDetailModal,

    // Bước 1: Kế toán duyệt
    approveStep1Accountant: function(id) {
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      item.step1.accountantApproved = true;
      item.step1.accountantName = 'Lê Minh Kế Toán';
      
      // Nếu sếp cũng duyệt rồi thì chuyển bước 2
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

    // Bước 1: Sếp duyệt
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

    // Bước 2: Logistics hoàn tất
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

      // Chuyển sang bước 3
      item.currentStep = 3;
      item.statusText = 'Đã có Booking & Xe ➔ Ops đóng hàng & Docs truyền tờ khai';

      saveShipments(list);
      renderKanban();
      openOrderDetailModal(id);
    },

    // Bước 3: Ops & Docs hoàn tất
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

      // Chuyển sang bước 4
      item.currentStep = 4;
      item.statusText = 'Đã đóng hàng & thông quan ➔ Thanh lý hãng tàu & Xuất B/L';

      saveShipments(list);
      renderKanban();
      openOrderDetailModal(id);
    },

    // Bước 4: Hoàn thành B/L
    completeStep4: function(id) {
      const list = getShipments();
      const item = list.find(s => s.id === id);
      if (!item) return;

      const blType = document.getElementById('select-step4-bltype')?.value || item.step4.blType;
      const blNo = document.getElementById('input-step4-blno')?.value || item.step4.blNo;

      item.step4.blType = blType;
      item.step4.blNo = blNo;
      item.step4.handedOverToCarrier = true;
      item.step4.blFileUploaded = true;
      item.step4.issuedDate = new Date().toISOString().split('T')[0];

      // Chuyển sang bước 5
      item.currentStep = 5;
      item.statusText = 'Đã phát hành B/L ➔ Chuyển Kế toán đối soát & chốt hoa hồng';

      saveShipments(list);
      renderKanban();
      openOrderDetailModal(id);
    },

    // Bước 5: Kế toán chốt quyết toán
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

  // Khởi động khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkflowUI);
  } else {
    initWorkflowUI();
  }

})();
