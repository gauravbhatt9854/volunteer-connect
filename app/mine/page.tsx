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
  status: "Open" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
  deadline: string;
  assignedVolunteer?: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

export default function MyTasksPage() {
  const { status } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks/mine", {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchTasks();
    }
  }, [status, router]);

  // ✅ Mark completed
  const markCompleted = async (id: string) => {
    if (!confirm("Mark this task as completed?")) return;

    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      credentials: "include",
    });

    fetchTasks();
  };

  // 🔁 Unassign volunteer
  const unassignTask = async (id: string) => {
    if (!confirm("Unassign volunteer and reopen task?")) return;

    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "unassign" }),
    });

    fetchTasks();
  };

  // 🗑 Delete task
  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task permanently?")) return;

    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchTasks();
  };

  // ✉️ Ask volunteer for progress (ADVANCED EMAIL)
  const contactVolunteer = (task: Task) => {
    if (!task.assignedVolunteer) return;

    const subject = encodeURIComponent(
      `Progress update request: ${task.title}`
    );

    const body = encodeURIComponent(
      `Hello ${task.assignedVolunteer.name},\n\n` +
      `I hope you're doing well.\n\n` +
      `I wanted to check in regarding the progress of the task "${task.title}". ` +
      `Please let me know how things are going and if you need any assistance.\n\n` +
      `Thank you for your efforts!\n`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${task.assignedVolunteer.email}&su=${subject}&body=${body}`;

    const isChrome = navigator.userAgent.includes("Chrome");

    if (isChrome) {
      window.open(gmailUrl, "_blank");
    } else {
      window.location.href = `mailto:${task.assignedVolunteer.email}?subject=${subject}&body=${body}`;
    }
  };

  if (loading) {
    return <p className="p-6">Loading your tasks...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        📝 My Posted Tasks
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-600 text-lg">
          You haven’t posted any tasks yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="
                bg-white/90 backdrop-blur
                rounded-2xl
                p-6
                shadow-md
                hover:shadow-2xl
                hover:-translate-y-1
                transition-all
                duration-300
                space-y-4
              "
            >
              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-800">
                {task.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-3">
                {task.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {task.category}
                </span>

                <span
                  className={`px-3 py-1 rounded-full ${task.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : task.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                    }`}
                >
                  {task.priority}
                </span>

                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {task.status}
                </span>
              </div>

              {/* Assigned Volunteer */}
              {task.assignedVolunteer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  <p>
                    <b>Assigned to:</b>{" "}
                    {task.assignedVolunteer.name}
                  </p>
                  <p
                    onClick={() => contactVolunteer(task)}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                    title="Click to contact volunteer"
                  >
                    {task.assignedVolunteer.email}
                  </p>
                </div>
              )}

              {/* Deadline */}
              <p className="text-xs text-gray-500">
                ⏰ Deadline:{" "}
                {new Date(task.deadline).toLocaleDateString()}
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 pt-2">
                {task.status === "Assigned" && (
                  <>
                    <button
                      onClick={() => markCompleted(task._id)}
                      className="
                        flex-1 bg-green-600 text-white px-3 py-2
                        rounded-lg hover:bg-green-700 active:scale-95 transition
                      "
                    >
                      ✔ Completed
                    </button>

                    <button
                      onClick={() => unassignTask(task._id)}
                      className="
                        flex-1 bg-yellow-500 text-white px-3 py-2
                        rounded-lg hover:bg-yellow-600 active:scale-95 transition
                      "
                    >
                      ↩ Unassign
                    </button>
                  </>
                )}

                {task.status !== "Completed" && (
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="
                      flex-1 bg-red-600 text-white px-3 py-2
                      rounded-lg hover:bg-red-700 active:scale-95 transition
                    "
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
