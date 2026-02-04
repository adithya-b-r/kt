'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserTable } from '@/components/admin/UserTable';
import { UserEditDialog } from '@/components/admin/UserEditDialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) {
        toast.error("Unauthorized. Admin access only.");
        router.push('/');
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (term: string) => {
    if (!term) {
      setFilteredUsers(users);
    } else {
      const lower = term.toLowerCase();
      setFilteredUsers(users.filter((u: any) =>
        u.first_name?.toLowerCase().includes(lower) ||
        u.last_name?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
      ));
    }
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update");
      }

      toast.success("User updated successfully");
      fetchUsers(); // Refresh list
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage users, roles, and limits</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            <LogOut className="h-4 w-4 mr-2" />
            Exit Admin
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <UserTable
            users={filteredUsers}
            onEdit={(user) => {
              setEditingUser(user);
              setIsDialogOpen(true);
            }}
            onSearch={handleSearch}
          />
        </div>

        {/* Edit Dialog */}
        <UserEditDialog
          user={editingUser}
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingUser(null);
          }}
          onSave={handleUpdateUser}
        />

      </div>
    </div>
  );
}
