// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { connectDB } from "@/lib/mongodb";
// import Task from "@/models/Task";
// import User from "@/models/User";
// import { skillTaskSimilarity } from "@/lib/geminiSimilarity";

// export async function GET() {
//   try {
//     await connectDB();

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const user = await User.findById(session.user.id);
//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     const userSkills = Array.isArray(user.skills) ? user.skills : [];

//     // ✅ Fetch tasks NOT posted by me + populate poster details
//     const tasks = await Task.find({
//       status: "Open",
//       postedBy: { $ne: session.user.id },
//     })
//       .populate("postedBy", "name email image")
//       .lean();

//     const results = [];

//     for (const task of tasks) {
//       let similarityScore = 0;

//       try {
//         similarityScore = await skillTaskSimilarity(
//           userSkills,
//           task.title,
//           task.description
//         );
//       } catch {
//         similarityScore = 0;
//       }

//       results.push({
//         task: {
//           ...task,
//           postedBy: task.postedBy, // ✅ name, email, image
//         },
//         similarityScore,
//       });
//     }

//     results.sort((a, b) => b.similarityScore - a.similarityScore);

//     return NextResponse.json(results, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";

async function getSimilarityScore(
  userSkills: string[],
  title: string,
  description: string
): Promise<number> {
  try {
    const res = await fetch(`${process.env.MODEL_URL}/similarity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_skills: userSkills,
        task_title: title,
        task_description: description,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Similarity service failed");
      return 0;
    }

    const data = await res.json();
    return typeof data.score === "number" ? data.score : 0;
  } catch (err) {
    console.error("Python service error:", err);
    return 0;
  }
}

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userSkills = Array.isArray(user.skills) ? user.skills : [];

    const tasks = await Task.find({
      status: "Open",
      postedBy: { $ne: session.user.id },
    })
      .populate("postedBy", "name email image")
      .lean();

    const results = [];

    for (const task of tasks) {
      const similarityScore = await getSimilarityScore(
        userSkills,
        task.title,
        task.description
      );

      results.push({
        task: {
          ...task,
          postedBy: task.postedBy,
        },
        similarityScore,
      });
    }

    results.sort((a, b) => b.similarityScore - a.similarityScore);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
