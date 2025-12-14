"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <nav className="w-full bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
      {/* LEFT: Logo / Home */}
      <Link href="/" className="text-xl font-bold text-indigo-600">
        VolunteerHub
      </Link>

      {/* CENTER: Links */}
      <div className="hidden md:flex gap-6 font-medium">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>

        <Link href="/tasks" className="hover:text-indigo-600">
          Tasks
        </Link>

        <Link href="/tasks/add" className="hover:text-indigo-600">
          Find Help
        </Link>
      </div>

      {/* RIGHT: Auth Section */}
      {status === "loading" ? (
        <p className="text-sm">Loading...</p>
      ) : session ? (
        <div className="flex items-center gap-4">
          {/* Profile */}
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1 rounded-lg"
          >
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="profile"
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                {session.user?.name?.[0]}
              </div>
            )}

            <span className="hidden md:block font-medium">
              {session.user?.name}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Login
        </Link>
      )}
    </nav>
  );
}