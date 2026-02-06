import QuickActions from './QuickActions';
import FamilyTreeHero from './FamilyTreeHero';
import YourProgress from './YourProgress';
import Phase2Features from './Phase2Features';

interface LeftSectionProps {
  familyTree: any;
  familyMembers: any[];
  relationships: any[];
  loading: boolean;
  onCreateTree: () => void;
  user: any;
}

const LeftSection = ({ familyTree, familyMembers, relationships, loading, onCreateTree, user }: LeftSectionProps) => {
  return (
    <div className="lg:col-span-8 space-y-4 sm:space-y-8">
      <FamilyTreeHero
        familyTree={familyTree}
        familyMembers={familyMembers}
        relationships={relationships}
        loading={loading}
        onCreateTree={onCreateTree}
      />
      <QuickActions familyTree={familyTree} />
      <Phase2Features />
      <YourProgress familyMembersCount={familyMembers.length} user={user} />
    </div>
  );
};

export default LeftSection;
