'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usersAPI, millsAPI, dashboardAPI, DashboardSummary } from '@/lib/api';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalMills: 0,
    activeMills: 0,
    totalUsers: 0,
    millAdmins: 0,
  });
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get dashboard summary first, fallback to individual APIs
        try {
          const summary = await dashboardAPI.getSummary();
          setDashboardData(summary);
          // Also fetch mills and users for super admin specific stats
          const [mills, users] = await Promise.all([
            millsAPI.getAll(),
            usersAPI.getAll(),
          ]);
          setStats({
            totalMills: mills.length,
            activeMills: mills.filter((m: any) => m.isActive).length,
            totalUsers: users.length,
            millAdmins: users.filter((u: any) => u.role === 'MILL_ADMIN').length,
          });
        } catch (summaryErr) {
          // Fallback to individual API calls
        const [mills, users] = await Promise.all([
          millsAPI.getAll(),
          usersAPI.getAll(),
        ]);

        setStats({
          totalMills: mills.length,
          activeMills: mills.filter((m: any) => m.isActive).length,
          totalUsers: users.length,
          millAdmins: users.filter((u: any) => u.role === 'MILL_ADMIN').length,
        });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">সুপার অ্যাডমিন ড্যাশবোর্ড</h1>
        <p className="text-gray-600 mt-2">সিস্টেমের সারসংক্ষেপ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট মিল</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMills}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeMills} সক্রিয়
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয় মিল</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMills}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalMills > 0 ? Math.round((stats.activeMills / stats.totalMills) * 100) : 0}% মোট মিলের
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ব্যবহারকারী</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.millAdmins} মিল অ্যাডমিন
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মিল অ্যাডমিন</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.millAdmins}</div>
            <p className="text-xs text-muted-foreground">
              মিল ব্যবস্থাপক
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

