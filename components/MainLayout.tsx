import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Navbar />
        <main className="pt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}



