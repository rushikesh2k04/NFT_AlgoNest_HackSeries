import React from "react";
import { useUser } from "../../contexts/UserContext";
import "../../css/DoctorDashboard.css"


const DoctorMyProfile: React.FC = () => {
  const { profile } = useUser();
  if (!profile) return <div>Loading...</div>;
  return (
    <div>
      <h2>Doctor Profile</h2>
      <div>Name: {profile.name}</div>
      <div>Speciality: {profile.speciality}</div>
      <div>License: {profile.license}</div>
      <div>Phone: {profile.phone}</div>
      <div>Email: {profile.email}</div>
    </div>
  );
};

export default DoctorMyProfile;
