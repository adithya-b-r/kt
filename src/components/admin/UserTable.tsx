'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Search, Edit2, MoreVertical, Trash2, Shield, Download } from 'lucide-react';
import { IUser } from '@/models/User';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9 h-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg bg-slate-50 dark:bg-slate-900/50 transition-all font-sans"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex border-dashed text-slate-600">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
              <TableHead className="w-[250px] text-xs uppercase tracking-wider font-semibold text-slate-500">User</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500">Role</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500">Plan</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider font-semibold text-slate-500">Tree Limit</TableHead>
              <TableHead className="text-right w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-3 bg-slate-100 rounded-full mb-2">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <p>No users found matching your search.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 border-slate-100 dark:border-slate-800 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-200">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-slate-100 font-semibold">{user.first_name} {user.last_name}</span>
                          <span className="text-xs text-slate-500">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                        <span className="text-sm text-slate-600">Active</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-normal ${user.role === 'admin' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.plan_type === 'pro' ? 'default' : 'secondary'}
                        className={`font-medium shadow-none ${user.plan_type === 'pro'
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-lg shadow-indigo-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {user.plan_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-600">
                      {user.tree_limit}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <div>Showing {users.length} users</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0"><span className="sr-only">Previous</span>&lt;</Button>
          <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0"><span className="sr-only">Next</span>&gt;</Button>
        </div>
      </div>
    </div>
  );
}
