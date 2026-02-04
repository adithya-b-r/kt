'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

import Image from 'next/image';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Simple Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-8 w-8 rounded-md overflow-hidden relative">
              <Image
                src="/kutumba-tree-logo.jpg"
                alt="Kutumba Tree Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">
              <span className="text-[#7a1e2b]">Kutumba</span> Admin
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-slate-600 hover:text-[#7a1e2b] hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout / Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Single View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

    </div>
  );
}
