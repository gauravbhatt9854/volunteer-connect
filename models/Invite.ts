import { Schema, model, models, Types, Document } from "mongoose";

export interface IInvite extends Document {
  task: Types.ObjectId;
  sender: Types.ObjectId;   // volunteer
  receiver: Types.ObjectId; // task owner
  status: "Pending" | "Accepted" | "Rejected";
}

const InviteSchema = new Schema<IInvite>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default models.Invite || model<IInvite>("Invite", InviteSchema);
