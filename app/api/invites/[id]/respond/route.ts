import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Invite from "@/models/Invite";
import Task from "@/models/Task";

/**
 * RESPOND TO INVITE
 * POST /api/invites/[id]/respond
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // 🔑 Required for Next.js 15/16
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { status } = await req.json();
    // Expected: "Accepted" | "Rejected"

    if (!["Accepted", "Rejected"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    // 🔍 Find invite
    const invite = await Invite.findById(id);
    if (!invite) {
      return NextResponse.json(
        { message: "Invite not found" },
        { status: 404 }
      );
    }

    // 🔐 Only task owner (receiver) can respond
    if (invite.receiver.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // 📝 Update invite status
    invite.status = status;
    await invite.save();

    // ✅ If accepted → assign task to the VOLUNTEER (invite.sender)
    if (status === "Accepted") {
      await Task.findByIdAndUpdate(invite.task, {
        assignedVolunteer: invite.sender, // 🔥 CORRECT FIX
        status: "Assigned",
      });
    }

    return NextResponse.json(
      {
        message: "Invite updated successfully",
        invite,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Invite respond error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
