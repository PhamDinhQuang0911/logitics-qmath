-- =================================================================================
-- LINKLOG QUOTE & OPERATIONS OS - SUPABASE DATABASE SCHEMA (PHƯƠNG ÁN 1)
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào mục "SQL Editor" trên Supabase
-- và nhấn nút "RUN" để khởi tạo toàn bộ Bảng, Phân quyền RBAC và Dữ liệu mẫu.
-- =================================================================================

-- 1. BẢNG HỒ SƠ NHÂN VIÊN & PHÂN QUYỀN (PROFILES / RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Liên kết với auth.users của Supabase nếu dùng Supabase Auth
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'SALES' CHECK (role IN ('ADMIN', 'MANAGER', 'SALES', 'ACCOUNTANT', 'LOGISTICS', 'OPS', 'DOCS')),
    role_label TEXT NOT NULL DEFAULT 'Nhân viên Kinh doanh (Sales)',
    branch TEXT NOT NULL DEFAULT 'HCM' CHECK (branch IN ('ALL', 'HCM', 'HPH')),
    password_demo TEXT DEFAULT '123456', -- Mật khẩu dùng cho xác thực nội bộ nhanh
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BẢNG LÔ HÀNG VẬN HÀNH 5 BƯỚC (SHIPMENTS PIPELINE)
CREATE TABLE IF NOT EXISTS public.shipments (
    id TEXT PRIMARY KEY, -- Mã lô hàng: VD SHP-2026-0101
    customer_name TEXT NOT NULL,
    sales_rep TEXT NOT NULL,
    sales_email TEXT,
    pol TEXT NOT NULL,
    pod TEXT NOT NULL,
    cargo TEXT NOT NULL,
    equipment TEXT NOT NULL,
    current_step INT NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
    status_text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    
    -- Dữ liệu chi tiết 5 bước lưu dạng JSONB linh hoạt, chuẩn PostgreSQL
    step1 JSONB NOT NULL DEFAULT '{}'::jsonb,
    step2 JSONB NOT NULL DEFAULT '{}'::jsonb,
    step3 JSONB NOT NULL DEFAULT '{}'::jsonb,
    step4 JSONB NOT NULL DEFAULT '{}'::jsonb,
    step5 JSONB NOT NULL DEFAULT '{}'::jsonb,
    audit_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BẬT ROW LEVEL SECURITY (RLS) VÀ CHÍNH SÁCH TRUY CẬP
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc/ghi qua API cho ứng dụng (Phân quyền chi tiết được kiểm soát ở tầng App & Role)
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to shipments" ON public.shipments;
CREATE POLICY "Allow all access to shipments" ON public.shipments FOR ALL USING (true) WITH CHECK (true);

-- 4. KHỞI TẠO TÀI KHOẢN NHÂN SỰ MẪU CHO 7 VAI TRÒ (Mật khẩu mặc định: 123456)
INSERT INTO public.profiles (email, full_name, role, role_label, branch, password_demo, is_active)
VALUES
    ('admin@linklog.vn', 'Trần Đức Long (Giám Đốc / Admin)', 'ADMIN', 'Giám Đốc Điều Hành (Super Admin)', 'ALL', '123456', true),
    ('manager@linklog.vn', 'Vũ Đức Minh (Trưởng Bộ Phận)', 'MANAGER', 'Trưởng Bộ Phận (Manager)', 'ALL', '123456', true),
    ('ketoan@linklog.vn', 'Lê Minh Tâm (Kế Toán Trưởng)', 'ACCOUNTANT', 'Kế Toán Công Nợ & Quyết Toán', 'HCM', '123456', true),
    ('sales@linklog.vn', 'Nguyễn Văn Nam (Sales HCM)', 'SALES', 'Nhân Viên Kinh Doanh (Sales)', 'HCM', '123456', true),
    ('logistics@linklog.vn', 'Phạm Quốc Bảo (Điều Phối Cước)', 'LOGISTICS', 'Chuyên Viên Logistics & Điều Xe', 'HCM', '123456', true),
    ('ops@linklog.vn', 'Đặng Văn Hùng (Hiện Trường Bãi)', 'OPS', 'Nhân Viên Hiện Trường (Ops)', 'HPH', '123456', true),
    ('docs@linklog.vn', 'Hoàng Thu Trang (Chứng Từ HQ)', 'DOCS', 'Chuyên Viên Chứng Từ & Hải Quan (Docs)', 'HCM', '123456', true)
ON CONFLICT (email) DO NOTHING;

-- 5. KHỞI TẠO 5 LÔ HÀNG MẪU TƯƠNG ỨNG 5 BƯỚC
INSERT INTO public.shipments (id, customer_name, sales_rep, sales_email, pol, pod, cargo, equipment, current_step, status_text, created_at, step1, step2, step3, step4, step5)
VALUES
(
    'SHP-2026-0101',
    'ABC Furniture Vietnam',
    'Nguyễn Văn Nam (Sales HCM)',
    'sales@linklog.vn',
    'Cát Lái (VNHCM)',
    'Long Beach (USLGB)',
    'Bàn ghế sofa xuất khẩu',
    '2 x 40HQ',
    1,
    'Chờ thẩm định thanh toán & giá',
    '2026-11-04 09:30',
    '{"proposedPriceUsd": 2850, "paymentTerm": "Công nợ 30 ngày (Credit 30 days)", "creditLimitUsd": 50000, "currentDebtUsd": 18000, "accountantApproved": false, "accountantNote": "Khách có lịch sử trả nợ tốt", "accountantName": "", "managerApproved": false, "managerNote": "Biên GP 14.2%", "managerName": ""}'::jsonb,
    '{"carrier": "Maersk Line", "bookingNo": "MSK-99201481", "vesselVoyage": "MAERSK ALABAMA / 2604E", "etd": "2026-11-12", "closingTime": "2026-11-10 18:00", "truckingVendor": "Huy Hoàng Logistics", "truckPlate": "51C-882.91", "driverPhone": "0918.234.567", "isDispatched": false}'::jsonb,
    '{"containerNo": "MSKU-8921820", "sealNo": "ML-VN-98210", "isInspectedByOps": false, "customsDeclarationNo": "106299182010", "customsChannel": "VÀNG (Luồng Vàng)", "specializedCheckDone": true, "specializedCheckType": "Kiểm dịch thực vật", "isCleared": false}'::jsonb,
    '{"handedOverToCarrier": false, "blType": "Master B/L", "blNo": "MSKU99201481", "blFileUploaded": false, "issuedDate": ""}'::jsonb,
    '{"totalRevenueUsd": 5700, "totalCostUsd": 4850, "grossProfitUsd": 850, "commissionRatePercent": 12, "commissionAmountUsd": 102, "isSettled": false, "settledBy": "", "settledDate": ""}'::jsonb
),
(
    'SHP-2026-0102',
    'VietWood Industrial Plywood',
    'Trần Thị Thu Thảo (Sales HPH)',
    'sales@linklog.vn',
    'Hải Phòng (VNHPH)',
    'Qingdao (CNQDG)',
    'Ván ép cốp pha phủ phim',
    '3 x 20GP',
    2,
    'Đã thẩm định - Đang điều cước & xe kéo',
    '2026-11-03 14:15',
    '{"proposedPriceUsd": 1100, "paymentTerm": "Trả trước 100% trước khi xuất B/L", "creditLimitUsd": 0, "currentDebtUsd": 0, "accountantApproved": true, "accountantNote": "An toàn công nợ", "accountantName": "Lê Minh Tâm", "managerApproved": true, "managerNote": "Duyệt giá", "managerName": "Vũ Đức Minh"}'::jsonb,
    '{"carrier": "ONE Line", "bookingNo": "ONE-HPH-2026-881", "vesselVoyage": "ONE CONTINUITY / 042W", "etd": "2026-11-08", "closingTime": "2026-11-06 20:00", "truckingVendor": "Hải An Trucking Đình Vũ", "truckPlate": "15C-341.22", "driverPhone": "0903.882.119", "isDispatched": true}'::jsonb,
    '{"containerNo": "TGHU-2091821", "sealNo": "ONE-VN-55219", "isInspectedByOps": false, "customsDeclarationNo": "106388102911", "customsChannel": "XANH (Luồng Xanh)", "specializedCheckDone": true, "specializedCheckType": "Hun trùng container", "isCleared": false}'::jsonb,
    '{"handedOverToCarrier": false, "blType": "House B/L", "blNo": "HBL-LL-2026021", "blFileUploaded": false, "issuedDate": ""}'::jsonb,
    '{"totalRevenueUsd": 3300, "totalCostUsd": 2750, "grossProfitUsd": 550, "commissionRatePercent": 10, "commissionAmountUsd": 55, "isSettled": false, "settledBy": "", "settledDate": ""}'::jsonb
),
(
    'SHP-2026-0103',
    'Mekong Fruits & Agri Trade',
    'Lê Tuấn Kiệt (Sales HCM)',
    'sales@linklog.vn',
    'Cát Lái (VNHCM)',
    'Tokyo (JPTYO)',
    'Xoài cát sấy dẻo & Thanh long ruột đỏ',
    '1 x 40RF (Lạnh)',
    3,
    'Đang đóng hàng tại bãi & Truyền tờ khai HQ',
    '2026-11-02 10:00',
    '{"proposedPriceUsd": 4200, "paymentTerm": "Thư tín dụng L/C trả ngay", "creditLimitUsd": 100000, "currentDebtUsd": 25000, "accountantApproved": true, "accountantNote": "L/C hợp lệ", "accountantName": "Lê Minh Tâm", "managerApproved": true, "managerNote": "Duyệt", "managerName": "Vũ Đức Minh"}'::jsonb,
    '{"carrier": "CMA CGM", "bookingNo": "CMA-SGN-441029", "vesselVoyage": "CMA ANTOINE / 102E", "etd": "2026-11-07", "closingTime": "2026-11-05 16:00", "truckingVendor": "Huy Hoàng Logistics", "truckPlate": "51D-991.44", "driverPhone": "0988.112.334", "isDispatched": true}'::jsonb,
    '{"containerNo": "CMAU-7721094", "sealNo": "CMA-VN-11928", "isInspectedByOps": true, "customsDeclarationNo": "106499201944", "customsChannel": "VÀNG (Luồng Vàng)", "specializedCheckDone": true, "specializedCheckType": "Kiểm dịch thực vật & C/O", "isCleared": true}'::jsonb,
    '{"handedOverToCarrier": false, "blType": "Master B/L", "blNo": "CMA-TYO-99120", "blFileUploaded": false, "issuedDate": ""}'::jsonb,
    '{"totalRevenueUsd": 4200, "totalCostUsd": 3450, "grossProfitUsd": 750, "commissionRatePercent": 15, "commissionAmountUsd": 112.5, "isSettled": false, "settledBy": "", "settledDate": ""}'::jsonb
),
(
    'SHP-2026-0104',
    'Saigon Garment Manufacturing',
    'Phạm Hồng Ánh (Sales HCM)',
    'sales@linklog.vn',
    'Cái Mép (VNVUT)',
    'Rotterdam (NLRTM)',
    'Quần áo thời trang dệt kim',
    '4 x 40HQ',
    4,
    'Hải quan đã thanh lý - Đang phát hành B/L',
    '2026-10-31 08:30',
    '{"proposedPriceUsd": 3950, "paymentTerm": "Công nợ 15 ngày", "creditLimitUsd": 80000, "currentDebtUsd": 30000, "accountantApproved": true, "accountantNote": "Khách VIP", "accountantName": "Lê Minh Tâm", "managerApproved": true, "managerNote": "Duyệt 4 cont", "managerName": "Vũ Đức Minh"}'::jsonb,
    '{"carrier": "COSCO Shipping", "bookingNo": "COSU-99812034", "vesselVoyage": "COSCO PRIDE / 098W", "etd": "2026-11-06", "closingTime": "2026-11-04 12:00", "truckingVendor": "Đại Nam Trucking", "truckPlate": "72C-109.88", "driverPhone": "0977.441.223", "isDispatched": true}'::jsonb,
    '{"containerNo": "COSU-8819201", "sealNo": "COSU-VN-77218", "isInspectedByOps": true, "customsDeclarationNo": "106199827101", "customsChannel": "XANH (Luồng Xanh)", "specializedCheckDone": true, "specializedCheckType": "Không yêu cầu", "isCleared": true}'::jsonb,
    '{"handedOverToCarrier": true, "blType": "House B/L", "blNo": "HBL-LL-SGN-26019", "blFileUploaded": true, "issuedDate": "2026-11-04"}'::jsonb,
    '{"totalRevenueUsd": 15800, "totalCostUsd": 13600, "grossProfitUsd": 2200, "commissionRatePercent": 12, "commissionAmountUsd": 264, "isSettled": false, "settledBy": "", "settledDate": ""}'::jsonb
),
(
    'SHP-2026-0105',
    'An Nam Handicrafts Co., Ltd',
    'Hoàng Quốc Việt (Sales HPH)',
    'sales@linklog.vn',
    'Hải Phòng (VNHPH)',
    'Hamburg (DEHAM)',
    'Đồ gốm sứ mỹ nghệ & mây tre đan',
    '1 x 20GP',
    5,
    'Tàu đã chạy - Kế toán đối soát chi phí & hoa hồng',
    '2026-10-25 11:20',
    '{"proposedPriceUsd": 2150, "paymentTerm": "Trả trước 100%", "creditLimitUsd": 0, "currentDebtUsd": 0, "accountantApproved": true, "accountantNote": "Đã thu 100%", "accountantName": "Lê Minh Tâm", "managerApproved": true, "managerNote": "Duyệt", "managerName": "Vũ Đức Minh"}'::jsonb,
    '{"carrier": "Hapag-Lloyd", "bookingNo": "HLCU-HAM-110291", "vesselVoyage": "AL ZUBARA / 2409W", "etd": "2026-10-30", "closingTime": "2026-10-28 17:00", "truckingVendor": "Hải An Trucking", "truckPlate": "15C-881.09", "driverPhone": "0912.887.665", "isDispatched": true}'::jsonb,
    '{"containerNo": "HLXU-4410291", "sealNo": "HL-VN-882190", "isInspectedByOps": true, "customsDeclarationNo": "106099182099", "customsChannel": "ĐỎ (Luồng Đỏ)", "specializedCheckDone": true, "specializedCheckType": "Hun trùng & C/O", "isCleared": true}'::jsonb,
    '{"handedOverToCarrier": true, "blType": "House B/L", "blNo": "HBL-LL-HPH-9918", "blFileUploaded": true, "issuedDate": "2026-10-30"}'::jsonb,
    '{"totalRevenueUsd": 2150, "totalCostUsd": 1690, "grossProfitUsd": 460, "commissionRatePercent": 12, "commissionAmountUsd": 55.2, "isSettled": true, "settledBy": "Lê Minh Tâm", "settledDate": "2026-11-04"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
