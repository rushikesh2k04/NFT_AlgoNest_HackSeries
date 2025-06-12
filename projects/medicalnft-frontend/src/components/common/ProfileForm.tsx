import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import "../../css/ProfileForm.css";

const ProfileForm: React.FC = () => {
  const { role, setProfile } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    speciality: "",
    license: "",
    age: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      ...form,
      age: form.age ? Number(form.age) : undefined,
    });

    // Redirect based on role
    switch (role) {
      case "doctor":
        navigate("/doctor");
        break;
      case "patient":
        navigate("/patient");
        break;
      case "pharmacy":
        navigate("/pharmacy");
        break;
      default:
        navigate("/");
    }
  };

  // Role-specific heading
  const getHeading = () => {
    switch (role) {
      case "doctor":
        return "Doctor Profile Form";
      case "patient":
        return "Patient Profile Form";
      case "pharmacy":
        return "Pharmacy Profile Form";
      default:
        return "User Profile Form";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>{getHeading()}</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      {role === "doctor" && (
        <>
          <input name="speciality" placeholder="Speciality" value={form.speciality} onChange={handleChange} required />
          <input name="license" placeholder="License" value={form.license} onChange={handleChange} required />
        </>
      )}
      {role === "patient" && (
        <input name="age" placeholder="Age" value={form.age} onChange={handleChange} required />
      )}
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <button type="submit">Save Profile</button>
    </form>
  );
};

export default ProfileForm;
