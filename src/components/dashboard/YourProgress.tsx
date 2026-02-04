import { Clock } from 'lucide-react';

interface YourProgressProps {
  familyMembersCount: number;
}

const YourProgress = ({ familyMembersCount, user }: { familyMembersCount: number; user: any }) => {
  const limit = user?.tree_limit || 100;
  const remaining = Math.max(0, limit - familyMembersCount);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Your Progress
        </h3>
      </div>
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="p-2 sm:p-4 border border-gray-200 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold" style={{ color: '#64303A' }}>{familyMembersCount}</div>
            <div className="text-xs sm:text-sm text-gray-600">Family Members</div>
          </div>
          <div className="p-2 sm:p-4 border border-gray-200 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold" style={{ color: '#64303A' }}>{limit}</div>
            <div className="text-xs sm:text-sm text-gray-600">{user?.plan_type === 'pro' ? 'Pro Limit' : 'Free Limit'}</div>
          </div>
          <div className="p-2 sm:p-4 border border-gray-200 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold" style={{ color: '#64303A' }}>{remaining}</div>
            <div className="text-xs sm:text-sm text-gray-600">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourProgress;