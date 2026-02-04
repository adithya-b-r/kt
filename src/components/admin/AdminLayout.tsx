'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-900 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: 280 }}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 h-full flex flex-col shadow-2xl relative"
        >
          {/* Logo Section */}
          <div className="p-6 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text whitespace-nowrap overflow-hidden"
            >
              Kutumba
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-500 hover:text-indigo-600"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <motion.button
                  key={item.href}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-3 font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {!isSidebarOpen && isActive && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-indigo-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push('/')}
              className="flex items-center w-full p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="ml-3 font-medium">Log Out</span>}
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-8 z-20">
            <div className="flex items-center text-slate-500 text-sm">
              Dashboard <ChevronRight className="w-4 h-4 mx-2" /> <span className="text-indigo-600 font-medium">Overview</span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-indigo-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </Button>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Admin User</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
                </div>
                <Avatar className="h-10 w-10 ring-2 ring-indigo-100 dark:ring-indigo-900 cursor-pointer">
                  <AvatarImage src="/admin-avatar.png" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">AD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth will-change-transform">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={pathname} // Re-animate on route change
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
