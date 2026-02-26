export interface User {
  id: number;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'MILL_ADMIN' | 'STAFF';
  millId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}