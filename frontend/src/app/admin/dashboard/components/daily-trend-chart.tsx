'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export interface TrendSeries {
  key: string;
  label: string;
  color: string;
}

interface DailyTrendChartProps {
  title: string;
  data: any[];
  series: TrendSeries[];
  loading?: boolean;
  /** Format giá trị trục Y / tooltip (vd tiền, kg). */
  valueFormatter?: (v: number) => string;
}

/** Hiển thị dd/MM từ chuỗi ngày ISO (SQL date) trả về từ BE. */
const formatDayLabel = (value: string): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/** Rút gọn nhãn trục Y để không bị cắt khi số lớn (1tr, 1 tỷ...). Tooltip vẫn hiện số đầy đủ. */
const compactNumber = (v: number): string => {
  const n = Math.abs(v);
  if (n >= 1e9) return `${(v / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
  if (n >= 1e6) return `${(v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
  if (n >= 1e3) return `${(v / 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}k`;
  return v.toLocaleString('vi-VN');
};

/**
 * Biểu đồ đường theo ngày — dùng chung cho KH mới / doanh thu / sản lượng.
 */
export function DailyTrendChart({ title, data, series, loading, valueFormatter }: DailyTrendChartProps) {
  return (
    <div className="bg-white rounded-lg border border-[#14264b]/20 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[#14264b] mb-3">{title}</h3>
      {loading ? (
        <div className="h-64 bg-gray-50 animate-pulse rounded" />
      ) : !data || data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">
          Không có dữ liệu trong khoảng đã chọn
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="ngay" tickFormatter={formatDayLabel} fontSize={12} stroke="#6b7280" />
            <YAxis
              fontSize={12}
              stroke="#6b7280"
              tickFormatter={valueFormatter ? (v) => compactNumber(Number(v)) : undefined}
              width={valueFormatter ? 56 : 40}
            />
            <Tooltip
              labelFormatter={(label) => `Ngày ${formatDayLabel(String(label))}`}
              formatter={(value, name) => [
                valueFormatter ? valueFormatter(Number(value)) : (value as number),
                series.find((s) => s.key === name)?.label || String(name),
              ]}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
