// DoctorDashboard.tsx
import React, { useState } from 'react';
import MyProfile from './MyProfile';
import MedicalServices from './MedicalServices';
import Marketplace from './Marketplace';
import "../../css/DoctorDashboard.css";

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'marketplace'>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return <MedicalServices />;
      case 'marketplace':
        return <Marketplace />;
      default:
        return <MyProfile />;
    }
  };

  return (
    <div className="doctor-dashboard">
      <h1 className="dashboard-title">Doctor Dashboard</h1>
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
        <button
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          Medical Services
        </button>
        <button
          className={activeTab === 'marketplace' ? 'active' : ''}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace
        </button>
      </div>
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default DoctorDashboard;
