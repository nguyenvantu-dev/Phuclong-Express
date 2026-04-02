/**
 * Order Status Enum
 *
 * Represents the possible statuses of an order in the Phuc Long Express system.
 * These statuses mirror the backend OrderStatus enum.
 */
export enum OrderStatus {
  RECEIVED = 'Received',
  ORDERED = 'Ordered',
  SHIPPED = 'Shipped',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

/**
 * Order status display configuration
 *
 * Provides human-readable labels and colors for each status.
 */
export const OrderStatusConfig: Record<OrderStatus, { label: string; color: string }> = {
  [OrderStatus.RECEIVED]: { label: 'Received', color: 'bg-blue-100 text-blue-800' },
  [OrderStatus.ORDERED]: { label: 'Ordered', color: 'bg-yellow-100 text-yellow-800' },
  [OrderStatus.SHIPPED]: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  [OrderStatus.COMPLETED]: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

/**
 * Get all order status options for dropdowns
 */
export const orderStatusOptions = Object.values(OrderStatus).map((status) => ({
  value: status,
  label: OrderStatusConfig[status].label,
}));
