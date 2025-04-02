'use client';

import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
              <Button
                variant="secondary"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-semibold">{user?.name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{user?.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-lg capitalize">{user?.role}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Account Created</p>
                <p className="text-lg">
                  {/* Display formatted date when user data is available */}
                  {/* Date is not available directly in our current auth context, but would be in a real implementation */}
                  Recently
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <Button
                onClick={() => router.push('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}