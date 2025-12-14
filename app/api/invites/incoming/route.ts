import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Invite from "@/models/Invite";

export async function GET() {
  try {
    await connectDB();

    // 🔐 Get logged-in user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 📥 Incoming invites = where receiver is current user
    const invites = await Invite.find({
      receiver: session.user.id,
    })
      .populate("sender", "name email image")
      .populate("task", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { invites },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Incoming Invites Error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}