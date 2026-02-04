'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Edit2, MoreVertical, Trash2, ArrowUpRight } from 'lucide-react';
import { IUser } from '@/models/User';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserTableProps {
  users: IUser[];
  onEdit: (user: any) => void;
  onSearch: (term: string) => void;
}

export function UserTable({ users, onEdit, onSearch }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-[#1b7c7c]"
          />
        </div>
        <div className="text-sm text-slate-500">
          Total: <span className="font-semibold text-slate-900">{users.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="font-semibold text-slate-500">User</TableHead>
              <TableHead className="font-semibold text-slate-500">Role</TableHead>
              <TableHead className="font-semibold text-slate-500">Plan</TableHead>
              <TableHead className="text-right font-semibold text-slate-500">Tree Limit</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user._id} className="border-b border-slate-50 hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-slate-200 text-slate-600 bg-transparent">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`font-medium ${user.plan_type === 'pro'
                        ? 'bg-[#e6f4f1] text-[#1b7c7c] hover:bg-[#d0e8e3]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {user.plan_type === 'pro' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                      {user.plan_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-600">
                    {user.tree_limit}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
