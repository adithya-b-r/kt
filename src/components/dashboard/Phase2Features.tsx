import { 
  BookOpen,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const Phase2Features = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 bg-linear-to-r from-purple-50 to-blue-50">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5" style={{ color: '#64303A' }} />
          New: Your Legacy Features
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Transform your family tree into an emotional, story-driven legacy
        </p>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-4 flex flex-col">
          <Link href="/story">
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">AI Life Story</h4>
                    <p className="text-sm text-blue-700">
                      Generate a beautiful narrative from your profile data. No invented facts, just your story.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/timeline">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Timeline & Maps</h4>
                    <p className="text-sm text-green-700">
                      Visualize your life&apos;s journey across time and places. See where you&apos;ve been.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-green-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/profile">
            <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Complete Your Profile</h4>
                    <p className="text-sm text-gray-600">
                      Add your details to unlock all features
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Phase2Features;
