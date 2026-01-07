import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";

/* ===================== HELPERS ===================== */

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

// Haversine formula (distance in KM)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function priorityWeight(priority: "Low" | "Medium" | "High") {
  if (priority === "High") return 0.2;
  if (priority === "Medium") return 0.1;
  return 0.05;
}

function urgencyWeight(urgency: boolean) {
  return urgency ? 0.25 : 0;
}

function deadlineWeight(deadline: Date) {
  const hoursLeft =
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursLeft <= 24) return 0.25;
  if (hoursLeft <= 72) return 0.15;
  return 0.05;
}

function locationWeight(distanceKm: number) {
  if (distanceKm <= 5) return 0.25;
  if (distanceKm <= 15) return 0.15;
  if (distanceKm <= 30) return 0.05;
  return 0;
}

/* ===================== AI SERVICE ===================== */

async function getSimilarityScore(payload: any): Promise<number> {
  try {
    const res = await fetch(`${process.env.MODEL_URL}/similarity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) return 0;

    const data = await res.json();
    return typeof data.score === "number" ? data.score : 0;
  } catch (err) {
    console.error("AI service error:", err);
    return 0;
  }
}

/* ===================== API ===================== */

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userSkills = user.skills ?? [];
    const userLocation = user.location;

    const tasks = await Task.find({
      status: "Open",
      postedBy: { $ne: session.user.id },
    })
      .populate("postedBy", "name email image")
      .lean();

    const results = [];

    for (const task of tasks) {
      /* ---------- AI SCORE ---------- */
      const aiScore = await getSimilarityScore({
        user_skills: userSkills,
        task_title: task.title,
        task_description: task.description,
        priority: task.priority,
        urgency: task.urgency,
        deadline: task.deadline,
      });

      /* ---------- LOCATION SCORE ---------- */
      let distanceKm = Infinity;
      let locWeight = 0;

      if (
        userLocation?.latitude &&
        task.location?.latitude
      ) {
        distanceKm = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          task.location.latitude,
          task.location.longitude
        );
        locWeight = locationWeight(distanceKm);
      }

      /* ---------- FINAL SCORE ---------- */
      const finalScore =
        aiScore +
        locWeight +
        priorityWeight(task.priority) +
        urgencyWeight(task.urgency) +
        deadlineWeight(task.deadline);

      results.push({
        task: {
          ...task,
          distanceKm: Math.round(distanceKm * 10) / 10,
        },
        similarityScore: Number(finalScore.toFixed(3)),
      });
    }

    results.sort((a, b) => b.similarityScore - a.similarityScore);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
