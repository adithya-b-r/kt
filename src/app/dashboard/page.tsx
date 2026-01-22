'use client';

import DashboardHeader from './DashboardHeader';
import LeftSection from './LeftSection';
import RightSection from './RightSection';
import { useState } from 'react';

const Dashboard = () => {
  // Mock data
  const [familyTree, setFamilyTree] = useState({
    id: '1',
    name: 'My Family Tree',
    description: 'A comprehensive family heritage tree',
    updated_at: new Date().toISOString(),
  });

  const [familyMembers] = useState([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Doe' },
    { id: '3', name: 'James Doe' },
  ]);

  const [loading] = useState(false);

  const handleCreateTree = async () => {
    if (!familyTree) {
      try {
        setFamilyTree({
          id: '1',
          name: 'My Family Tree',
          description: 'A comprehensive family heritage tree',
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to create family tree:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <LeftSection 
            familyTree={familyTree}
            familyMembers={familyMembers}
            loading={loading}
            onCreateTree={handleCreateTree}
          />
          <RightSection />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
