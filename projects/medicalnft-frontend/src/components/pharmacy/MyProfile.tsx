import React from "react";
import { useUser } from "../../contexts/UserContext";

const PharmacyMyProfile: React.FC = () => {
  const { profile } = useUser();
  if (!profile) return <div>Loading...</div>;
  return (
    <div>
      <h2>Pharmacy Profile</h2>
      <div>Name: {profile.name}</div>
      <div>Phone: {profile.phone}</div>
      <div>Email: {profile.email}</div>
    </div>
  );
};

export default PharmacyMyProfile;
