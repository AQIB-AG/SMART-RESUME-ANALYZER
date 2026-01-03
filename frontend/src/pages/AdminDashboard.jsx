import Navbar from '../components/Navbar';
import { Shield } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage users, jobs, and system settings
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Admin Panel</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Admin features coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

