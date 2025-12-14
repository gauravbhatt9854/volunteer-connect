"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Invite = {
  _id: string;
  status: "Pending" | "Accepted" | "Rejected";
  task: {
    _id: string;
    title: string;
  };
  sender: {
    name: string;
    email: string;
    image?: string;
  };
};

const FILTERS = ["Pending", "Accepted", "Rejected"] as const;

export default function IncomingInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [filter, setFilter] =
    useState<(typeof FILTERS)[number]>("Pending");
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    const res = await fetch("/api/invites/incoming");
    const data = await res.json();
    setInvites(data.invites || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const respond = async (
    id: string,
    status: "Accepted" | "Rejected"
  ) => {
    await fetch(`/api/invites/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchInvites();
  };

  const filtered = invites.filter(i => i.status === filter);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Incoming Requests
      </h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full border
              ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white"
              }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500">No requests found.</p>
      )}

      <div className="space-y-4">
        {filtered.map(invite => (
          <div
            key={invite._id}
            className="border rounded-xl p-5 flex justify-between"
          >
            <div className="flex gap-4">
              {invite.sender.image && (
                <Image
                  src={invite.sender.image}
                  alt="profile"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}

              <div>
                <h2 className="font-semibold">
                  {invite.sender.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {invite.sender.email}
                </p>
                <p className="mt-2 text-sm">
                  Task: <b>{invite.task.title}</b>
                </p>

                <span className="text-xs mt-2 inline-block px-3 py-1 rounded-full bg-gray-100">
                  {invite.status.toUpperCase()}
                </span>
              </div>
            </div>

            {invite.status === "Pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    respond(invite._id, "Accepted")
                  }
                  className="bg-green-600 text-white px-3 py-2 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    respond(invite._id, "Rejected")
                  }
                  className="bg-red-600 text-white px-3 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
