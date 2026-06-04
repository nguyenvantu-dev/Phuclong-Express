import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExchangeRatesService } from './exchange-rates.service';

/** Người cập nhật được ghi vào lịch sử khi job tự chạy */
const SYSTEM_USER = 'SYSTEM-VCB';
/** Múi giờ Việt Nam cho lịch chạy cron */
const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';
/** Endpoint tỷ giá công khai của Vietcombank */
const VCB_API = 'https://www.vietcombank.com.vn/api/exchangerates';
/** Không tự cập nhật: VND là gốc (=1); các mã VCB không công bố sẽ tự bị bỏ qua */
const SKIP_CODES = new Set(['VND']);

interface VcbRate {
  currencyCode: string;
  sell: string;
}

export interface SyncResult {
  success: boolean;
  updated: string[];
  skipped: string[];
  error?: string;
}

/**
 * Tự động cập nhật tỷ giá hằng ngày từ Vietcombank.
 *
 * - Cron chạy 09:00 giờ VN mỗi ngày.
 * - Lấy giá BÁN (sell) của VCB làm TyGiaVND.
 * - Chỉ cập nhật các mã đang có trong bảng TY_GIA và được VCB công bố.
 * - CongShipVeVN = TyGiaVND (cùng giá bán VCB).
 * - Admin vẫn sửa tay được qua PUT /exchange-rates/:name.
 */
@Injectable()
export class ExchangeRateSchedulerService {
  private readonly logger = new Logger(ExchangeRateSchedulerService.name);

  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Cron('0 9 * * *', { name: 'daily-vcb-exchange-rate', timeZone: VN_TIMEZONE })
  async handleDailyUpdate(): Promise<void> {
    this.logger.log('Bắt đầu tự động cập nhật tỷ giá từ Vietcombank...');
    const result = await this.syncFromVietcombank();
    if (result.success) {
      this.logger.log(
        `Cập nhật xong: ${result.updated.length} mã (${result.updated.join(', ') || '-'}); ` +
          `bỏ qua: ${result.skipped.join(', ') || '-'}`,
      );
    } else {
      this.logger.error(`Cập nhật tỷ giá thất bại: ${result.error}`);
    }
  }

  /** Fetch VCB + cập nhật DB. Dùng được cho cả cron lẫn trigger thủ công. */
  async syncFromVietcombank(): Promise<SyncResult> {
    try {
      const sellByCode = await this.fetchVcbSellRates();
      const current = await this.exchangeRatesService.findAll();

      const updated: string[] = [];
      const skipped: string[] = [];

      for (const row of current) {
        const code = row.Name;
        const sell = sellByCode.get(code);
        if (SKIP_CODES.has(code) || sell === undefined || !(sell > 0)) {
          skipped.push(code);
          continue;
        }
        // Theo yêu cầu: Cộng ship về VN = Tỷ giá VND (cùng giá bán VCB)
        const res = await this.exchangeRatesService.update(
          { name: code, tyGiaVND: sell, congShipVeVN: sell },
          SYSTEM_USER,
        );
        if (res.success) {
          updated.push(code);
        } else {
          skipped.push(code);
          this.logger.warn(`Không cập nhật được ${code}: ${res.error}`);
        }
      }

      return { success: true, updated, skipped };
    } catch (error: any) {
      return { success: false, updated: [], skipped: [], error: error.message };
    }
  }

  /** Gọi API VCB cho ngày hiện tại (giờ VN) và trả về map mã -> giá bán. */
  private async fetchVcbSellRates(): Promise<Map<string, number>> {
    const date = this.vnDateString();
    const res = await fetch(`${VCB_API}?date=${date}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      throw new Error(`VCB API trả về HTTP ${res.status}`);
    }
    const json: any = await res.json();
    const data: VcbRate[] = Array.isArray(json?.Data) ? json.Data : [];
    if (data.length === 0) {
      throw new Error('VCB API không trả về dữ liệu tỷ giá');
    }

    const map = new Map<string, number>();
    for (const item of data) {
      const sell = parseFloat(String(item.sell).replace(/,/g, ''));
      if (item.currencyCode && Number.isFinite(sell)) {
        map.set(item.currencyCode, sell);
      }
    }
    return map;
  }

  /** Ngày hiện tại theo múi giờ VN, định dạng YYYY-MM-DD. */
  private vnDateString(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: VN_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }
}
