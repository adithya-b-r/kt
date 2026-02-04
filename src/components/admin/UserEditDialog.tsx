'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

interface UserEditDialogProps {
  user: any | null;
  open: boolean;
  onClose: () => void;
  onSave: (userId: string, data: any) => Promise<void>;
}

export function UserEditDialog({ user, open, onClose, onSave }: UserEditDialogProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'user',
    plan_type: 'free',
    tree_limit: 100,
    password: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        role: user.role || 'user',
        plan_type: user.plan_type || 'free',
        tree_limit: user.tree_limit || 100,
        password: ''
      });
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await onSave(user._id, formData);
      onClose();
    } catch (error) {
      // Error handling done by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSaving && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Edit User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-700">First Name</Label>
              <Input
                id="firstName"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-700">Last Name</Label>
              <Input
                id="lastName"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white border-slate-200 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan" className="text-slate-700">Plan Type</Label>
              <Select
                value={formData.plan_type}
                onValueChange={(val) => setFormData({ ...formData, plan_type: val })}
              >
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit" className="text-slate-700">Tree Limit</Label>
            <Input
              id="limit"
              type="number"
              value={formData.tree_limit}
              onChange={(e) => setFormData({ ...formData, tree_limit: parseInt(e.target.value) || 0 })}
              className="bg-white border-slate-200 text-slate-900"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Label htmlFor="password" className="text-slate-700">Reset Password (Optional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password to reset"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-white border-slate-200 text-slate-900"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="text-slate-700 bg-white hover:bg-slate-50">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#1b7c7c] hover:bg-[#156161] text-white">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
