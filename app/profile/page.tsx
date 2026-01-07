"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    name: "",
    role: "User",
    skills: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔥 Fetch profile data
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          setForm({
            name: data.name || "",
            role: data.role || "User",
            skills: data.skills?.join(", ") || "",
            latitude: data.location?.latitude || "",
            longitude: data.location?.longitude || "",
          });
        });
    }
  }, [session]);

  // 🔥 Auto-detect location (Geolocation API)
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
      },
      (error) => {
        console.warn("Location permission denied", error);
      }
    );
  }, []);

  if (status === "loading") return <p className="p-6">Loading...</p>;

  if (!session) {
    return <p className="p-6">Please login to edit your profile.</p>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        role: form.role,
        skills: form.skills.split(",").map((s) => s.trim()),
        location: {
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },
      }),
    });

    setLoading(false);

    if (res.ok) {
      setMessage("✅ Profile updated successfully");
    } else {
      setMessage("❌ Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex justify-center items-start p-6">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {form.name ? form.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <p className="text-sm text-white/80">
                Keep your details updated
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="User">User</option>
              <option value="Volunteer">Volunteer</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Skills
            </label>
            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Teaching, First Aid, Coding"
              className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            {/* Skill chips preview */}
            {form.skills && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.skills.split(",").map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Latitude
              </label>
              <input
                type="number"
                value={form.latitude}
                readOnly
                className="w-full rounded-xl border px-4 py-3 bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Longitude
              </label>
              <input
                type="number"
                value={form.longitude}
                readOnly
                className="w-full rounded-xl border px-4 py-3 bg-gray-100 text-gray-600"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          {message && (
            <p className="text-center text-sm font-medium mt-2">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );

}
