"use client";

import { useEffect, useState } from "react";

const categories = [
  "Groceries",
  "Home Improvement",
  "Pet Care",
  "Education",
  "Moving",
  "Technology",
  "Healthcare",
  "House Cleaning",
  "Elderly Care",
  "Child Care",
  "Transportation",
  "Event Assistance",
  "Gardening",
  "Maintenance & Repair",
  "Cooking & Meal Prep",
  "Fitness & Training",
  "Creative & Design",
  "Photography & Video",
  "Content Writing",
  "Marketing & Social Media",
  "Legal Assistance",
  "Financial Help",
  "Emergency Help",
  "Volunteering & NGO",
  "Delivery & Errands",
  "Personal Assistance",
] as const;


export default function AddTaskPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Groceries",
    priority: "Medium",
    urgency: false,
    deadline: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);
  const [message, setMessage] = useState("");

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      setLocating(false);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setMessage("Location permission denied");
        setLocating(false);
      }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((p) => ({
      ...p,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.latitude) {
      setMessage("Location required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          location: {
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
          },
        }),
      });

      if (!res.ok) throw new Error();
      setMessage("✅ Task created successfully");
      setForm((p) => ({
        ...p,
        title: "",
        description: "",
        urgency: false,
        deadline: "",
      }));
    } catch {
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all">
          <h1 className="text-3xl font-bold mb-2">📝 Create New Task</h1>
          <p className="text-gray-600 mb-8">
            Add task details and let volunteers help you faster
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section>
              <h2 className="text-lg font-semibold mb-4">📌 Task Info</h2>

              <div className="space-y-4">
                <input
                  name="title"
                  placeholder="Task title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-black"
                />

                <textarea
                  name="description"
                  placeholder="Describe the task..."
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-black"
                />
              </div>
            </section>

            {/* Meta */}
            <section className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border px-4 py-3"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border px-4 py-3"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border px-4 py-3"
                />
              </div>

              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  name="urgency"
                  checked={form.urgency}
                  onChange={handleChange}
                />
                <span className="font-medium">⚡ Mark as urgent</span>
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="text-lg font-semibold mb-4">📍 Location</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  value={form.latitude}
                  readOnly
                  placeholder="Latitude"
                  className="rounded-xl border px-4 py-3 bg-gray-100"
                />
                <input
                  value={form.longitude}
                  readOnly
                  placeholder="Longitude"
                  className="rounded-xl border px-4 py-3 bg-gray-100"
                />
              </div>

              {locating && (
                <p className="text-sm text-gray-600 mt-2">
                  Detecting location...
                </p>
              )}
            </section>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                disabled={loading || locating}
                className="bg-black text-white px-8 py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Task"}
              </button>

              {message && (
                <span className="text-sm font-medium">{message}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
