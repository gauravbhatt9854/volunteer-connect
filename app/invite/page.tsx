"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Invite = {
  _id: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  task: {
    _id: string;
    title: string;
  };
  sender: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
};

const FILTERS = ["all", "pending", "accepted", "rejected"] as const;

export default function IncomingInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await fetch("/api/invites/incoming");
      const data = await res.json();
      setInvites(data.invites || []);
    } catch (err) {
      console.error("Failed to load invites");
    } finally {
      setLoading(false);
    }
  };

  const respondToInvite = async (
    inviteId: string,
    action: "accepted" | "rejected"
  ) => {
    await fetch(`/api/invites/${inviteId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });

    fetchInvites(); // refresh list
  };

  const filteredInvites =
    filter === "all"
      ? invites
      : invites.filter((i) => i.status === filter);

  if (loading) {
    return <p className="p-6">Loading invites...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Incoming Invites</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium border
              ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700"
              }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Empty */}
      {filteredInvites.length === 0 && (
        <p className="text-gray-500">No invites found.</p>
      )}

      {/* Invite Cards */}
      <div className="space-y-4">
        {filteredInvites.map((invite) => (
          <div
            key={invite._id}
            className="bg-white border rounded-xl p-5 flex justify-between items-start"
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
                  Task:{" "}
                  <span className="font-medium">
                    {invite.task.title}
                  </span>
                </p>

                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium
                    ${
                      invite.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : invite.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {invite.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Actions */}
            {invite.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    respondToInvite(invite._id, "accepted")
                  }
                  className="px-3 py-2 text-sm rounded bg-green-600 text-white"
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    respondToInvite(invite._id, "rejected")
                  }
                  className="px-3 py-2 text-sm rounded bg-red-600 text-white"
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