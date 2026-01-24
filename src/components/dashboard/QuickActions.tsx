import { 
  Users,
  Search,
  Plus,
  Upload,
  BookOpen,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  familyTree: any;
}

const QuickActions = ({ familyTree }: QuickActionsProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Quick Actions
        </h3>
      </div>
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          <Link href={familyTree ? `/tree/${familyTree.id}` : "#"}>
            <button 
              className="h-16 sm:h-20 w-full flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm"
              style={{ backgroundColor: '#64303A' }}
              disabled={!familyTree}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Add Member</span>
            </button>
          </Link>
          
          <Link href="/story">
            <button 
              className="h-16 sm:h-20 w-full flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-lg text-white font-medium hover:opacity-90 transition-all text-xs sm:text-sm"
              style={{ backgroundColor: '#2563eb' }}
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              My Story
            </button>
          </Link>
          
          <Link href="/timeline">
            <button 
              className="h-16 sm:h-20 w-full flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-lg text-white font-medium hover:opacity-90 transition-all text-xs sm:text-sm"
              style={{ backgroundColor: '#059669' }}
            >
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              Timeline
            </button>
          </Link>
          
          <div>
            <button 
              className="h-16 sm:h-20 w-full flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-lg border border-gray-300 bg-white text-gray-600 opacity-60 cursor-not-allowed text-xs sm:text-sm"
              disabled
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Search</span>
            </button>
          </div>
          
          <div>
            <button 
              className="h-16 sm:h-20 w-full flex flex-col items-center justify-center gap-1 sm:gap-2 rounded-lg border border-gray-300 bg-white text-gray-600 opacity-60 cursor-not-allowed text-xs sm:text-sm"
              disabled
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
