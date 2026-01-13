import { Schema, model, models, Document, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  category:
  | "Groceries"
  | "Home Improvement"
  | "Pet Care"
  | "Education"
  | "Moving"
  | "Technology"
  | "Healthcare"
  | "House Cleaning"
  | "Elderly Care"
  | "Child Care"
  | "Transportation"
  | "Event Assistance"
  | "Gardening"
  | "Maintenance & Repair"
  | "Cooking & Meal Prep"
  | "Fitness & Training"
  | "Creative & Design"
  | "Photography & Video"
  | "Content Writing"
  | "Marketing & Social Media"
  | "Legal Assistance"
  | "Financial Help"
  | "Emergency Help"
  | "Volunteering & NGO"
  | "Delivery & Errands"
  | "Personal Assistance";

  priority: "Low" | "Medium" | "High";
  urgency: boolean;
  deadline: Date;

  location: {
    address?: string;
    latitude: number;
    longitude: number;
  };

  postedBy: Types.ObjectId;
  assignedVolunteer?: Types.ObjectId | null;

  status: "Open" | "Assigned" | "In Progress" | "Completed" | "Cancelled";

  // 🔥 AI FIELDS
  extractedSkills?: string[];
  aiSimilarityScore?: number;
  lastAiProcessedAt?: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    category: {
      type: String,
      enum: [
        "Groceries",
        "Home Improvement",
        "Pet Care",
        "Education",
        "Moving",
        "Technology",
      ],
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    urgency: { type: Boolean, default: false },

    deadline: { type: Date, required: true },

    location: {
      address: String,
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },

    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedVolunteer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["Open", "Assigned", "In Progress", "Completed", "Cancelled"],
      default: "Open",
    },

    // 🔥 AI
    extractedSkills: { type: [String], default: [] },
    aiSimilarityScore: { type: Number, default: 0 },
    lastAiProcessedAt: { type: Date },
  },
  { timestamps: true }
);

TaskSchema.index({ aiSimilarityScore: -1 });

export default models.Task || model<ITask>("Task", TaskSchema);
