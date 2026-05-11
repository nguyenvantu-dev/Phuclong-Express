'use client';

import { redirect } from 'next/navigation';

// Temporary redirect to order-management-list until this page is implemented
export default function OrdersListPage() {
  redirect('/admin/order-management-list');
}
