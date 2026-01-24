import { 
  Camera,
  Search,
  Calendar,
  Book,
  Sparkles,
} from 'lucide-react';

const ComingSoonFeatures = () => {
  const features = [
    { icon: Camera, label: 'Photo Albums', desc: 'Store family photos' },
    { icon: Search, label: 'Records Search', desc: 'Search historical records' },
    { icon: Calendar, label: 'Cultural Calendar', desc: 'Family celebrations' },
    { icon: Book, label: 'AI Family Stories', desc: 'Generate heritage stories' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          Coming Soon
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Available in Heritage Explorer</p>
      </div>
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="space-y-2 sm:space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#f5e6e9' }}>
                <feature.icon className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#64303A' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs sm:text-sm truncate">{feature.label}</p>
                <p className="text-xs text-gray-600 truncate">{feature.desc}</p>
              </div>
              <span className="inline-block rounded-full border px-1.5 sm:px-2 py-0.5 text-xs shrink-0" style={{ borderColor: '#64303A', color: '#64303A' }}>Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComingSoonFeatures;
