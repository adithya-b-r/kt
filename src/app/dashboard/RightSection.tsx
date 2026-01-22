import ComingSoonFeatures from './ComingSoonFeatures';
import GettingStarted from './GettingStarted';

const RightSection = () => {
  return (
    <div className="lg:col-span-4 space-y-6">
      <ComingSoonFeatures />
      <GettingStarted />
    </div>
  );
};

export default RightSection;
