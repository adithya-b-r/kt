import QuickActions from './QuickActions';
import FamilyTreeHero from './FamilyTreeHero';
import YourProgress from './YourProgress';
import Phase2Features from './Phase2Features';

interface LeftSectionProps {
  familyTree: any;
  familyMembers: any[];
  loading: boolean;
  onCreateTree: () => void;
}

const LeftSection = ({ familyTree, familyMembers, loading, onCreateTree }: LeftSectionProps) => {
  return (
    <div className="lg:col-span-8 space-y-4 sm:space-y-8">
      <QuickActions familyTree={familyTree} />
      <Phase2Features />
      <FamilyTreeHero 
        familyTree={familyTree} 
        familyMembers={familyMembers} 
        loading={loading}
        onCreateTree={onCreateTree}
      />
      <YourProgress familyMembersCount={familyMembers.length} />
    </div>
  );
};

export default LeftSection;
