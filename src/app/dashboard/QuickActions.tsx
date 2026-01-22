import { 
  Users,
  Search,
  Plus,
  Upload,
} from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  familyTree: any;
}

const QuickActions = ({ familyTree }: QuickActionsProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Plus className="h-5 w-5" />
          Quick Actions
        </h3>
      </div>
      <div className="px-6 py-4">
        <div className="grid md:grid-cols-3 gap-4">
          <Link href={familyTree ? `/tree/${familyTree.id}` : "#"}>
            <button 
              className="h-20 w-full flex flex-col items-center justify-center gap-2 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: '#64303A' }}
              disabled={!familyTree}
            >
              <Users className="h-5 w-5" />
              Add Family Member
            </button>
          </Link>
          
          {/* Coming Soon Features */}
          <div>
            <button 
              className="h-20 w-full flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-600 opacity-60 cursor-not-allowed"
              disabled
            >
              <Search className="h-5 w-5" />
              Search Records
            </button>
          </div>
          
          <div>
            <button 
              className="h-20 w-full flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-600 opacity-60 cursor-not-allowed"
              disabled
            >
              <Upload className="h-5 w-5" />
              Upload Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
