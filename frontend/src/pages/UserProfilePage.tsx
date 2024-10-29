import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.token) return;
      try {
        const response = await api.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setProfile(response.data);
      } catch (err) {
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.token) return;
    try {
      await api.put("/user/profile", profile, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">User Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block">Username</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            className="border p-2 mb-2"
          />
        </div>
        <div>
          <label className="block">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="border p-2 mb-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
