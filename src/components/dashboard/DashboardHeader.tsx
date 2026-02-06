import { LogOut, User, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3 transition-all duration-300 hover:opacity-90">
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-200 group-hover:shadow-md transition-shadow duration-300">
              <Image
                src="/kutumba-tree-logo.png"
                alt="Kutumba Tree Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 leading-tight">
                <span className="text-[#64303A]">Kutumba</span> Tree
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:block text-right mr-2">
              <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                {user?.first_name || user?.email?.split('@')[0] || 'Member'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {user?.plan_type === 'pro' ? 'Premium Member' : 'Free Plan'}
              </p>
            </div>

            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm ${user?.plan_type === 'pro'
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
              {user?.plan_type === 'pro' && <Sparkles className="h-3 w-3" />}
              {user?.plan_type === 'pro' ? 'PRO' : 'FREE'}
            </div>

            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block mx-1"></div>

            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-[#64303A] hover:bg-[#64303A]/5 transition-all duration-200"
                title="Profile"
              >
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
