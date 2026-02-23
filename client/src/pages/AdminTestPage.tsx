import { AdminDashboard } from './AdminDashboard';

export function AdminTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard Test</h1>
        <p className="text-gray-600">Testing the admin dashboard component</p>
      </div>
      <AdminDashboard />
    </div>
  );
}
