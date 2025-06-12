import React from "react";
import { useUser } from "../../contexts/UserContext";

const PatientMyProfile: React.FC = () => {
  const { profile } = useUser();
  if (!profile) return <div>Loading...</div>;
  return (
    <div>
      <h2>Patient Profile</h2>
      <div>Name: {profile.name}</div>
      <div>Age: {profile.age}</div>
      <div>Phone: {profile.phone}</div>
      <div>Email: {profile.email}</div>
    </div>
  );
};

export default PatientMyProfile;
