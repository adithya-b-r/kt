import { TreePine } from 'lucide-react';
import Link from 'next/link';

const DashboardHeader = () => {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <TreePine className="h-8 w-8" style={{ color: '#64303A' }} />
              <span className="text-xl font-bold" style={{ color: '#64303A' }}>KutumbaTree</span>
            </Link>
            <div className="hidden sm:block border-l border-gray-300 pl-4">
              <h1 className="text-lg font-semibold">Welcome, test!</h1>
              <p className="text-sm text-gray-600">Build and explore your family heritage</p>
            </div>
          </div>
          <div className="px-3 py-1 border rounded-full text-sm font-medium" style={{ borderColor: '#64303A', color: '#64303A' }}>
            Free Plan
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
