// PatientDashboard.tsx
import React, { useState } from 'react';
import MyProfile from './MyProfile';
import Marketplace from './Marketplace';
import Prescriptions from './Prescriptions';
import '../../css/PatientDashboard.css';

const PatientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'marketplace' | 'prescriptions'>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'marketplace':
        return <Marketplace />;
      case 'prescriptions':
        return <Prescriptions />;
      default:
        return <MyProfile />;
    }
  };

  return (
    <div className="patient-dashboard">
      <h1 className="dashboard-title">Patient Dashboard</h1>
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
        <button
          className={activeTab === 'marketplace' ? 'active' : ''}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace
        </button>
        <button
          className={activeTab === 'prescriptions' ? 'active' : ''}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions
        </button>
      </div>
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default PatientDashboard;
