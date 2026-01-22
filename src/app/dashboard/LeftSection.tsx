import QuickActions from './QuickActions';
import FamilyTreeHero from './FamilyTreeHero';
import YourProgress from './YourProgress';

interface LeftSectionProps {
  familyTree: any;
  familyMembers: any[];
  loading: boolean;
  onCreateTree: () => void;
}

const LeftSection = ({ familyTree, familyMembers, loading, onCreateTree }: LeftSectionProps) => {
  return (
    <div className="lg:col-span-8 space-y-8">
      <QuickActions familyTree={familyTree} />
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
