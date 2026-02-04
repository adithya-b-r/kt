'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserTable } from '@/components/admin/UserTable';
import { UserEditDialog } from '@/components/admin/UserEditDialog';
import AdminLayout from '@/components/admin/AdminLayout';
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b7c7c]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Simple Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm">Manage user plans and limits directly.</p>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1">
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
    </AdminLayout>
  );
}
