# Kế hoạch chuyển đổi OrderMan từ C# Web Forms sang NestJS

## 1. Tổng quan Project hiện tại

### Công nghệ hiện tại:
- **.NET Framework 4.5** (Web Forms)
- **Entity Framework 6** (Code First Migrations)
- **ASP.NET Identity** (Authentication)
- **SQL Server** (Database)

### Cấu trúc Project:
```
/OrderMan.Models/          # Entity models + DbContext
/OrderMan.Migrations/      # Database migrations
/OrderMan/                 # Pages + BLL (Business Logic)
/DBConnect.cs              # Data access layer
/DataProvider.cs          # Data providers
/Utils.cs, DateTimeUtil.cs # Utilities
```

---

## 2. Các bước chuyển đổi

### Phase 1: Thiết lập NestJS Project (Ngày 1)
- [ ] 2.1.1 Tạo NestJS project mới với TypeScript
- [ ] 2.1.2 Cấu hình TypeORM hoặc Prisma
- [ ] 2.1.3 Thiết lập PostgreSQL/SQL Server connection
- [ ] 2.1.4 Cấu hình ESLint, Prettier

### Phase 2: Database Schema & Entities (Ngày 2-3)
- [ ] 2.2.1 Tạo entities từ C# models
  - [ ] **ApplicationUser** (extend ASP.NET Identity)
  - [ ] **TyGia** (Exchange rate)
  - [ ] **QuocGia** (Country)
  - [ ] **Website**
  - [ ] **ThongTinWeb**
  - [ ] **ThacMac** (Q&A)
  - [ ] **KhachBuon** (Wholesale customer)
  - [ ] **DonHang** (Order)
  - [ ] **DotHang** (Shipment batch)
  - [ ] **LoHang** (Cargo/Container)
  - [ ] **HangCoSan** (In-stock goods)
  - [ ] **HangKhoan** (Pre-ordered goods)
  - [ ] **CongNo** (Debt/Credit)
  - [ ] **DiaChiNhanHang** (Shipping address)
  - [ ] **TaiKhoanNganHang** (Bank account)
  - [ ] **TyGia** (Currency)
  - [ ] **Tracking**
  - [ ] **HanhDong** (Action logs)
  - [ ] **CauHinh** (Configuration)
- [ ] 2.2.2 Tạo migrations cho database

### Phase 3: Authentication & Authorization (Ngày 3-4)
- [ ] 2.3.1 Thiết lập Passport.js/JWT
- [ ] 2.3.2 Tạo Auth Module:
  - [ ] Register endpoint
  - [ ] Login endpoint
  - [ ] Refresh token
  - [ ] Logout
- [ ] 2.3.3 Tạo Guards & Decorators cho authorization

### Phase 4: API Development (Ngày 4-10)
- [ ] 2.4.1 **Users Module**
  - CRUD users
  - Profile management
  - User roles/permissions
- [ ] 2.4.2 **Orders Module (DonHang)**
  - Create/Update/Delete orders
  - Order status management
  - Order search & filtering
- [ ] 2.4.3 **Shipments Module (DotHang)**
  - Create shipment batches
  - Shipment tracking
  - Shipping status
- [ ] 2.4.4 **Cargo Module (LoHang)**
  - Cargo management
  - Cargo details
  - Cost tracking
- [ ] 2.4.5 **Products Module (HangCoSan, HangKhoan)**
  - In-stock products
  - Pre-orders
  - Product catalog
- [ ] 2.4.6 **Finance Module (CongNo)**
  - Debt/Credit management
  - Payment tracking
  - Financial reports
- [ ] 2.4.7 **Reports Module (BaoCao)**
  - Revenue reports
  - Debt analysis
  - Activity logs
- [ ] 2.4.8 **Configuration Module (CauHinh)**
  - System settings
  - Exchange rates
  - Countries/Currencies

### Phase 5: Business Logic Migration (Ngày 10-14)
- [ ] 2.5.1 Migrate BLL.cs methods sang NestJS Services
- [ ] 2.5.2 Migrate DataProvider.cs
- [ ] 2.5.3 Migrate Utils.cs, DateTimeUtil.cs

### Phase 6: File & Excel Handling (Ngày 14-16)
- [ ] 2.6.1 File upload/download
- [ ] 2.6.2 Excel export/import (sử dụng xlsx, exceljs)
- [ ] 2.6.3 PDF generation (nếu cần)

### Phase 7: Testing (Ngày 16-18)
- [ ] 2.7.1 Unit tests cho services
- [ ] 2.7.2 Integration tests cho APIs
- [ ] 2.7.3 E2E tests

### Phase 8: Deployment (Ngày 18-20)
- [ ] 2.8.1 Dockerize NestJS application
- [ ] 2.8.2 CI/CD pipeline setup
- [ ] 2.8.3 Database migration strategy

---

## 3. Mapping C# → NestJS

| C# Component | NestJS Equivalent |
|--------------|-------------------|
| `Page` class | Controller + Service |
| `BLL` class | Service |
| `DbContext` | TypeORM Repository / Prisma Client |
| `Entity` class | Entity / Model |
| `Identity` | Passport + JWT |
| `Web.config` | `config.yaml` / `.env` |
| `Global.asax` | `main.ts` + Modules |

---

## 4. Cấu trúc NestJS Project sau chuyển đổi

```
/src
  /auth
    /guards
    /strategies
    /dto
  /users
    /dto
    /entities
  /orders
    /dto
    /entities
  /shipments
    /dto
    /entities
  /cargo
    /dto
    /entities
  /products
    /dto
    /entities
  /finance
    /dto
    /entities
  /reports
  /config
  /common
    /decorators
    /filters
    /interceptors
    /pipes
  /database
    /migrations
    /entities
  /utils
  app.module.ts
  main.ts
```

---

## 5. Dependencies cần cài đặt

```json
{
  "@nestjs/common": "^10.x",
  "@nestjs/core": "^10.x",
  "@nestjs/platform-express": "^10.x",
  "@nestjs/typeorm": "^10.x",
  "@nestjs/passport": "^10.x",
  "@nestjs/jwt": "^10.x",
  "@nestjs/config": "^3.x",
  "typeorm": "^0.3.x",
  "pg": "^8.x",
  "mssql": "^9.x",
  "passport": "^0.7.x",
  "passport-jwt": "^4.x",
  "bcrypt": "^5.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x",
  "xlsx": "^0.18.x",
  "exceljs": "^4.x",
  "rxjs": "^7.x"
}
```

---

## 6. Ưu tiên chuyển đổi

1. **High Priority**: Auth, Users, Orders, Shipments
2. **Medium Priority**: Products, Finance, Reports
3. **Low Priority**: Q&A, Configuration, Logs

---

## 7. Lưu ý quan trọng

- ASP.NET Identity sẽ được thay thế bằng JWT/Passport
- Web Forms UI sẽ cần frontend riêng (React/Vue/Angular)
- Một số business logic phức tạp trong BLL.cs cần được refactor
- Consider using Prisma thay vì TypeORM nếu muốn developer experience tốt hơn
