# LINKLOG Quote OS - Bản Clone 100%

Hệ thống điều hành báo giá & hợp đồng thương mại / logistics đa tác tử (Multi-Agent Logistics & Commercial Trading Quote OS).

---

## 📁 Cấu trúc thư mục

```
linklog-clone/
├── index.html                                          # Điểm vào chính của ứng dụng SPA
├── favicon.svg                                         # Logo favicon chính thức
├── LINKLOG_Tom_Luoc_Du_An_Infographic.png              # Sơ đồ tổng kết dự án
├── Logistics_B2B_MultiAgent_Architecture_v1.svg        # Sơ đồ kiến trúc Multi-Agent
├── package.json                                        # Cấu hình khởi chạy nhanh với Node.js
├── README.md                                           # Hướng dẫn chi tiết
├── assets/
│   ├── index-DQqdgjCC.js                              # Toàn bộ logic React, State, Datasets & Đa ngôn ngữ (491 KB)
│   └── index-OP3lbgwH.css                              # Toàn bộ giao diện Tailwind CSS (38 KB)
└── downloads/                                          # Kho tài liệu dự án đính kèm
    ├── Bao_Gia_He_Thong_Bao_Gia_Logistics_B2B_MultiAgent_40Tr.docx
    ├── Bao_Gia_Hop_Nhat_Linklog_MultiAgent_Va_FlyTrustContent_50Percent.docx
    ├── Bao_gia_Linklog_da_kenh_20261006_v3.pdf
    ├── Hop_Dong_Dich_Vu_Trien_Khai_Linklog_Quote_OS.docx
    ├── LINKLOG_Tom_Luoc_Du_An_Infographic.png
    ├── Logistics_B2B_MultiAgent_Architecture_v1.svg
    └── Logistics_B2B_MultiAgent_Master_Workbook_v1.xlsx
```

---

## 🚀 Hướng dẫn khởi chạy (Chọn 1 trong các cách)

### Cách 1: Sử dụng Python (Không cần cài đặt thêm gì)
Mở terminal tại thư mục này và gõ:
```bash
python -m http.server 3000
```
Sau đó truy cập trình duyệt tại: `http://localhost:3000`

### Cách 2: Sử dụng Node.js / npx
```bash
npm start
# Hoặc: npx serve -s . -l 3000
```
Sau đó truy cập: `http://localhost:3000`

### Cách 3: Sử dụng Extension "Live Server" trên VS Code / IDE
Nhấp chuột phải vào file `index.html` chọn **Open with Live Server**.

---

## 🌐 Triển khai lên mạng (Hosting miễn phí)
- **Vercel / Netlify / Cloudflare Pages / GitHub Pages**: Kéo thả toàn bộ thư mục này hoặc push lên GitHub, hệ thống sẽ tự động online 100% ngay lập tức mà không cần build bước nào.
