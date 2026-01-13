"use client";

import { useEffect, useState } from "react";

type TaskItem = {
  task: {
    _id: string;
    title: string;
    description: string;
    postedBy: {
      name: string;
      email: string;
      image?: string;
    };
  };
  similarityScore: number;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks/relevant");
        const data = await res.json();

        if (!Array.isArray(data)) {
          setError(data.message || "Failed to load tasks");
          setTasks([]);
        } else {
          setTasks(data);
        }
      } catch (err) {
        setError("Something went wrong while loading tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // ⏳ Loading
  if (loading) {
    return <p className="p-6">Loading recommended tasks...</p>;
  }

  // ❌ Error
  if (error) {
    return <p className="p-6 text-red-600 font-medium">{error}</p>;
  }

  // 📭 No tasks
  if (tasks.length === 0) {
    return <p className="p-6 text-gray-500">No relevant tasks found.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Recommended Tasks For You</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((item) => (
          <div
            key={item.task._id}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
          >
            {/* Title */}
            <h2 className="font-semibold text-lg">{item.task.title}</h2>

            {/* Description */}
            <p className="text-gray-600 mt-2 line-clamp-3">
              {item.task.description}
            </p>

            {/* Posted By */}
            <div className="flex items-center gap-3 mt-4">
              {item.task.postedBy.image ? (
                <img
                  src={item.task.postedBy.image}
                  alt="profile"
                  className="w-9 h-9 rounded-full"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                  {item.task.postedBy.name.charAt(0)}
                </div>
              )}

              <div>
                <p className="text-sm font-medium">{item.task.postedBy.name}</p>
                <p className="text-xs text-gray-500">
                  {item.task.postedBy.email}
                </p>
              </div>
            </div>

            {/* Match Score */}
            <div className="mt-4">
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Match: {item.similarityScore}%
              </span>
            </div>
            <button
              onClick={() => (window.location.href = `/tasks/${item.task._id}`)}
              className="mt-4 w-full border border-indigo-600 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
