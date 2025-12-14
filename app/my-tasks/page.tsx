"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  status: string;
  deadline: string;
  postedBy: {
    _id: string;
    name: string;
  };
  assignedVolunteer?: {
    _id: string;
    name: string;
  } | null;
}

export default function MyTasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/tasks/mine")
        .then(res => res.json())
        .then(data => {
          setTasks(data.tasks || []);
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (loading) {
    return <p className="p-6">Loading your tasks...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">
        📝 My Posted Tasks
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-600">
          You haven’t posted any tasks yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div
              key={task._id}
              className="bg-white rounded-xl shadow p-5 space-y-3"
            >
              {/* Title */}
              <h2 className="text-lg font-semibold">
                {task.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-3">
                {task.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-1 bg-blue-100 rounded">
                  {task.category}
                </span>

                <span
                  className={`px-2 py-1 rounded ${
                    task.priority === "High"
                      ? "bg-red-100"
                      : task.priority === "Medium"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}
                >
                  {task.priority}
                </span>

                <span className="px-2 py-1 bg-gray-100 rounded">
                  {task.status}
                </span>
              </div>

              {/* Assigned Volunteer */}
              {task.assignedVolunteer && (
                <p className="text-sm text-green-700 font-medium">
                  Assigned to: {task.assignedVolunteer.name}
                </p>
              )}

              {/* Deadline */}
              <p className="text-xs text-gray-500">
                Deadline:{" "}
                {new Date(task.deadline).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}