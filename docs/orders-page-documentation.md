# Orders Page Documentation

## Overview
- **Original C# File**: `admin/QLDatHang_LietKe.aspx`
- **Converted Files**:
  - Frontend: `PhucLong-v2/frontend/src/app/(admin)/orders/page.tsx`
  - Backend: `PhucLong-v2/backend/src/orders/`
- **Purpose**: Display and manage orders with filtering, pagination, and mass operations

---

## Column Mapping (QLDatHang_LietKe → Next.js)

| # | C# Column (HeaderText) | Field | Data Type | Notes |
|---|------------------------|-------|-----------|-------|
| 1 | Checkbox | `id` | checkbox | Select for mass operations |
| 2 | Edit | `id` | link | Edit button |
| 3 | Mã ĐH | `ID` | number | Order ID |
| 4 | Website | `WebsiteName` | string | Dropdown in edit mode |
| 5 | Username | `username` | string | Red color if DaQuaHanMuc && !LaKhachVip |
| 6 | Ngày save | `ngaySaveLink` | date | Format: dd/MM/yyyy |
| 7 | Loại tiền | `loaiTien` | string | USD/VND |
| 8 | Quốc gia | `tenQuocGia` | string | Country name |
| 9 | Link SP | `linkWeb` | link | Disabled if DaQuaHanMuc && !LaKhachVip |
| 10 | Hình | `linkHinh` | image | Height 30px |
| 11 | Màu | `color` | string | Product color |
| 12 | Size | `size` | string | Product size |
| 13 | Số lượng | `soLuong` | number | Quantity |
| 14 | Giá web | `donGiaWeb` | number | Price in {0:n2} format |
| 15 | %Công | `cong` | number | Service fee percentage |
| 16 | % sale off | `saleOff` | number | Discount percentage |
| 17 | $Phụ thu | `phuThu` | number | Extra fee |
| 18 | $ShipUS | `shipUsa` | number | US shipping cost |
| 19 | Tax | `tax` | number | Tax amount |
| 20 | Công VNĐ | `tienCongVnd` | number | Service fee in VND, format {0:n0} |
| 21 | Tổng VNĐ | `tongTienVnd` | number | Total in VND, format {0:n0} |
| 22 | Vùng miền | `vungMien` | string | Region (Mien Nam/Mien Bac/etc) |
| 23 | Ghi chú | `ghiChu` | string | Order notes |
| 24 | user added | `usernameSave` | string | Username who created order |

---

## Filter Panel Mapping

| C# Control | Field | Type | Description |
|------------|-------|------|-------------|
| tbNoiDungTim | `search` | text | General search filter |
| tbMaDatHang | `search` | text | Order number search |
| tbTuNgay | `startDate` | date | Start date filter |
| tbDenNgay | `endDate` | date | End date filter |
| ddWebsite | `website` | dropdown | Filter by website |
| ddQuocGia | `quocGia` | dropdown | Filter by country |
| ddUserName | `username` | dropdown | Filter by username |

---

## Business Logic (JavaScript Functions)

### 1. CheckAllItem() - Select All
**C#**: Lines 16-44
**TypeScript**: `handleSelectAll()` in [page.tsx:89-95](PhucLong-v2/frontend/src/app/(admin)/orders/page.tsx#L89-L95)

```typescript
// When select all is checked:
// - Check/uncheck all rows
// - Calculate total: count += soLuong
// - Calculate price: price += soLuong * donGiaWeb
// - Calculate VND: vnd += tongTienVnd
```

### 2. calculateTotal() - Individual Selection
**C#**: Lines 45-80
**TypeScript**: `handleSelect()` in [page.tsx:98-102](PhucLong-v2/frontend/src/app/(admin)/orders/page.tsx#L98-L102)

```typescript
// When individual checkbox is toggled:
// - Add/subtract soLuong from total count
// - Add/subtract (soLuong * donGiaWeb) from total price
// - Add/subtract tongTienVnd from total VND
```

### 3. Username Red Color Logic
**C#**: Line 167
```csharp
style='<%# ((bool)Eval("DaQuaHanMuc") && !(bool)Eval("LaKhachVip"))? "color: Red": "color: Black"%>'
```

**TypeScript**: [page.tsx:143-145](PhucLong-v2/frontend/src/app/(admin)/orders/page.tsx#L143-L145)
```typescript
const isUsernameRed = (order: Order) => {
  return order.daQuaHanMuc && !order.laKhachVip;
};
```

### 4. Link Disabled Logic
**C#**: Line 192
```csharp
visible='<%# !(bool)Eval("DaQuaHanMuc") || (bool)Eval("LaKhachVip")%>'
```

**TypeScript**: [page.tsx:147-150](PhucLong-v2/frontend/src/app/(admin)/orders/page.tsx#L147-L150)
```typescript
const isLinkDisabled = (order: Order) => {
  return order.daQuaHanMuc && !order.laKhachVip;
};
```

---

## Summary Calculation

### Display Fields (C# → TypeScript)
| Label | Field | Calculation |
|-------|-------|-------------|
| Total item | `lblTotalCount` | SUM(soLuong) |
| Tổng tiền | `lblTotalPrice` | SUM(soLuong * donGiaWeb) |
| Tổng tiền VND | `lblTotalVND` | SUM(tongTienVnd) |

**TypeScript Implementation**: [page.tsx:65-76](PhucLong-v2/frontend/src/app/(admin)/orders/page.tsx#L65-L76)

---

## Mass Operations

### 1. Mass Update
- **C#**: `lbtMassUpdate_Click` → navigates to `QLDatHang_MassUpdate.aspx`
- **TypeScript**: Link to `/orders/mass-update`

### 2. Mass Delete
- **C#**: `lbtMassDelete_Click` with confirmation
- **TypeScript**: [page.tsx:105-109](PhucLong-v2/frontend/src/app/(admin)/orders/page.tsx#L105-L109)
  - Confirmation: "Bạn có chắc muốn xóa không?"
  - Calls: `massDelete(selectedIds)`

### 3. Mass Cancel
- **C#**: `lbtMassCancel_Click`
- **TypeScript**: [page.tsx:111-118](PhucLong-v2/frontend/src/app/(admin)/orders/page.tsx#L111-L118)
  - Sets `trangThaiOrder` to `OrderStatus.CANCELLED`

---

## Tabs Navigation

| C# Tab | URL | TypeScript Link |
|--------|-----|-----------------|
| Quản lý Item | QLDatHang_LietKe.aspx | Current page |
| Tạo mới item | QLDatHang_Them.aspx | `/orders/new` |
| Mass update | QLDatHang_MassUpdate.aspx | `/orders/mass-update` |
| Thêm mới item bằng excel | QLDatHang_Import.aspx | `/orders/import` |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get orders with filters |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Soft delete order |
| POST | `/api/orders/mass-delete` | Mass soft delete |
| POST | `/api/orders/mass-update` | Mass update |
| POST | `/api/orders/:id/restore` | Restore deleted order |

---

## Order Entity Fields

```typescript
interface Order {
  id: number;
  orderNumber: string;
  username: string;
  usernameSave: string;
  linkWeb: string;
  linkHinh: string;
  color: string;
  size: string;
  soLuong: number;
  donGiaWeb: number;
  saleOff: number;
  phuThu: number;
  shipUsa: number;
  tax: number;
  cong: number;
  loaiTien: string; // USD/VND
  ghiChu: string;
  tyGia: number;
  giaSauOffUsd: number;
  giaSauOffVnd: number;
  tienCongUsd: number;
  tienCongVnd: number;
  tongTienUsd: number;
  tongTienVnd: number;
  trangThaiOrder: OrderStatus;
  adminNote: string;
  ngayVeVn: Date | null;
  ngaySaveLink: Date;
  ngayMuaHang: Date | null;
  namTaiChinh: number;
  websiteName: string;
  tenDotHang: string;
  yeuCauGuiHang: number;
  daQuaHanMuc: boolean;
  laKhachVip: boolean;
  ngayYeuCauGuiHang: Date | null;
  yeuCauGuiGhiChu: string;
  guiHangSoKg: number | null;
  guiHangTien: number | null;
  loaiHangId: number | null;
  tenLoaiHang: string;
  canHangSoKg: number | null;
  canHangTienShipVeVn: number | null;
  canHangTienShipTrongNuoc: number | null;
  hangKhoan: boolean;
  maSoHang: string;
  quocGiaId: number;
  tenQuocGia: string;
  linkTaiKhoanMang: string;
  vungMien: string;
  nguoiTao: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Status Values (OrderStatus)

| Status | Description |
|--------|-------------|
| RECEIVED | Đã nhận đơn |
| ORDERED | Đã đặt hàng |
| IN_PROGRESS | Đang xử lý |
| SHIPPED | Đã gửi hàng |
| DELIVERED | Đã giao hàng |
| CANCELLED | Đã hủy |

---

## Currency Calculation Logic

**Backend** ([orders.service.ts:44-60](PhucLong-v2/backend/src/orders/orders.service.ts#L44-L60)):
```
giaSauOffVnd = giaSauOffUsd * tyGia
tienCongVnd = tienCongUsd * tyGia
tongTienVnd = tongTienUsd * tyGia
```

---

## Dependencies

### Frontend
- `@tanstack/react-query` - Data fetching
- `axios` - HTTP client
- `@/lib/api` - API methods
- `@/types/order` - TypeScript types

### Backend
- `@nestjs/typeorm` - ORM
- `typeorm` - Database queries
- SQL Server database

---

## Related Pages

| Page | File | Purpose |
|------|------|---------|
| Order List | `orders/page.tsx` | Main orders listing |
| New Order | `orders/new/page.tsx` | Create new order |
| Order Detail | `orders/[id]/page.tsx` | View/edit single order |
| Mass Update | `orders/mass-update/page.tsx` | Bulk update orders |
| Import | `orders/import/page.tsx` | Import from Excel |

---

## Notes

1. **Soft Delete**: Orders are not permanently deleted, `isDeleted` flag is set to `true`
2. **Date Format**: Display format is Vietnamese `dd/MM/yyyy`
3. **Number Format**: Prices use `{0:n2}` (2 decimal places), totals use `{0:n0}` (no decimals)
4. **Mock Data**: Backend returns mock data when database is unavailable
5. **CORS**: Backend CORS configured for `http://localhost:3000`
