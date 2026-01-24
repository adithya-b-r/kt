import { Book } from 'lucide-react';

const GettingStarted = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
          <Book className="h-4 w-4 sm:h-5 sm:w-5" />
          Getting Started
        </h3>
      </div>
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-medium mb-1">💡 Tip</p>
            <p className="text-gray-700">Start with yourself as the root person, then add parents and siblings.</p>
          </div>
          <div className="p-2 sm:p-3 border border-gray-200 rounded-lg">
            <p className="font-medium mb-1">📍 Next Step</p>
            <p className="text-gray-700">Ask elderly family members about their parents' names and birth places.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
