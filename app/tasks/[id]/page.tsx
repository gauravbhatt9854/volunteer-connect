"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tasks/${id}`)
      .then(res => res.json())
      .then(data => {
        setTask(data.task);
        setLoading(false);
      });
  }, [id]);

  const sendInvite = async () => {
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: id }),
    });

    const data = await res.json();
    setMessage(data.message);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!task) return <p className="p-6">Task not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{task.title}</h1>

      <p className="text-gray-600 mt-3">{task.description}</p>

      <div className="mt-4 space-y-2 text-sm">
        <p><strong>Category:</strong> {task.category}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        <p><strong>Deadline:</strong> {new Date(task.deadline).toDateString()}</p>
      </div>

      {/* Posted By */}
      <div className="mt-6 flex items-center gap-3">
        <img
          src={task.postedBy.image || "/avatar.png"}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium">{task.postedBy.name}</p>
          <p className="text-xs text-gray-500">{task.postedBy.email}</p>
        </div>
      </div>

      {/* Invite Button */}
      <button
        onClick={sendInvite}
        className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
      >
        Send Invite
      </button>

      {message && (
        <p className="mt-3 font-medium text-green-600">
          {message}
        </p>
      )}
    </div>
  );
}