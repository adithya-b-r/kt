import {
  TreePine,
  Star,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface FamilyTreeHeroProps {
  familyTree: any;
  familyMembers: any[];
  loading: boolean;
  onCreateTree: () => void;
}

const FamilyTreeHero = ({ familyTree, familyMembers, loading, onCreateTree }: FamilyTreeHeroProps) => {
  return (
    <div className="rounded-lg border-2 bg-white shadow-sm" style={{ borderColor: '#d4c5cb' }}>
      <div className="border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold flex-wrap">
            <TreePine className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: '#64303A' }} />
            Your Family Tree
            <span className="inline-block rounded-full bg-green-100 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-green-700">
              <Star className="inline h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              Hero Feature
            </span>
          </h3>
          {!familyTree && (
            <button className="inline-flex items-center justify-center gap-1 sm:gap-2 rounded-md border border-gray-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 shrink-0" onClick={onCreateTree} disabled={loading}>
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Create Tree</span>
              <span className="sm:hidden">Create</span>
            </button>
          )}
        </div>
      </div>
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: '#64303A' }}></div>
            <p className="text-xs sm:text-sm text-gray-600">Loading your family tree...</p>
          </div>
        ) : familyTree ? (
          <div className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: '#64303A' }}>
                <TreePine className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm sm:text-base truncate">{familyTree.name}</h4>
                  <span className="text-xs bg-blue-50 text-blue-700 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">{familyMembers.length} members</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{familyTree.description || 'Your family tree'}</p>
              </div>
            </div>
            <Link href={`/tree/${familyTree.id}`}>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#64303A' }} />
              </button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <TreePine className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-xs sm:text-sm text-gray-500 mb-4">No family tree yet</p>
            <button className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={onCreateTree} disabled={loading}>
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              Create Your First Tree
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyTreeHero;
