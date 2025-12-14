import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";

/**
 * GET MY TASKS
 * GET /api/tasks/mine
 */
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const myTasks = await Task.find({
      postedBy: session.user.id,
    })
      .populate("postedBy", "name email")
      .populate("assignedVolunteer", "name email") // ✅ ADD THIS
      .sort({ createdAt: -1 });

    return NextResponse.json({ tasks: myTasks }, { status: 200 });
  } catch (error) {
    console.error("Fetch My Tasks Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
