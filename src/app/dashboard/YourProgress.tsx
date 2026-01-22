import { Clock } from 'lucide-react';

interface YourProgressProps {
  familyMembersCount: number;
}

const YourProgress = ({ familyMembersCount }: YourProgressProps) => {
  const freeLimit = 25;
  const remaining = freeLimit - familyMembersCount;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5" />
          Your Progress
        </h3>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: '#64303A' }}>{familyMembersCount}</div>
            <div className="text-sm text-gray-600">Family Members</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: '#64303A' }}>{freeLimit}</div>
            <div className="text-sm text-gray-600">Free Limit</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: '#64303A' }}>{remaining}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourProgress;
