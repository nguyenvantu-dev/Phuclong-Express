/**
 * SQL Date Helper
 * Helper functions for SQL Server date formatting
 */

/**
 * Format Date to SQL Server compatible string (yyyy-MM-dd)
 */
export function formatSqlDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format Date to SQL Server datetime string (yyyy-MM-dd HH:mm:ss)
 * Used for end of day dates
 */
export function formatSqlEndOfDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Parse Vietnamese date string (dd/MM/yyyy) to Date object
 */
export function parseVietnameseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // Try ISO format
  const isoDate = new Date(dateStr);
  return isNaN(isoDate.getTime()) ? null : isoDate;
}

/**
 * Parse Vietnamese date string with time (dd/MM/yyyy HH:mm:ss)
 */
export function parseVietnameseDateTime(dateStr: string): Date | null {
  if (!dateStr) return null;

  const parts = dateStr.split(' ');
  const dateParts = parts[0].split('/');
  const timeParts = parts[1]?.split(':') || ['0', '0', '0'];

  if (dateParts.length === 3) {
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2] || '0', 10);
    return new Date(year, month, day, hours, minutes, seconds);
  }

  return null;
}