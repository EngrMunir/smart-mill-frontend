import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import Navbar from '@/components/Navbar';
import { AuthGuard } from '@/components/AuthGuard';
import { RoleGuard } from '@/components/RoleGuard';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SUPER_ADMIN']}>
        <div className="min-h-screen bg-gray-50">
          <SuperAdminSidebar />
          <div className="lg:ml-64">
            <Navbar />
            <main className="pt-16 p-6">
              {children}
            </main>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}






































