import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // ✅ FIX: await params
    const { id } = await context.params;

    console.log("🆔 Task ID:", id);

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid task id" },
        { status: 400 }
      );
    }

    const task = await Task.findById(id).populate(
      "postedBy",
      "name email image"
    );

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task }, { status: 200 });

  } catch (error) {
    console.error("🔥 Task fetch error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
