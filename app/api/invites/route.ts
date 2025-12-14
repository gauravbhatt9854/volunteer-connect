import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Invite from "@/models/Invite";
import Task from "@/models/Task";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await req.json();

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Prevent self-invite
    if (task.postedBy.toString() === session.user.id) {
      return NextResponse.json(
        { message: "You cannot invite yourself" },
        { status: 400 }
      );
    }

    // Prevent duplicate invite
    const existingInvite = await Invite.findOne({
      task: taskId,
      sender: session.user.id,
    });

    if (existingInvite) {
      return NextResponse.json(
        { message: "Invite already sent" },
        { status: 400 }
      );
    }

    const invite = await Invite.create({
      task: taskId,
      sender: session.user.id,
      receiver: task.postedBy,
    });

    return NextResponse.json(
      { message: "Invite sent successfully", invite },
      { status: 201 }
    );
  } catch (error) {
    console.error("Invite Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
