import { redirect } from 'next/navigation';

/**
 * Admin Root Page
 *
 * Redirects to /orders as the default admin page.
 */
export default function AdminPage() {
  redirect('/admin/orders');
}
