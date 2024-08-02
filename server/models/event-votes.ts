import { Connection, Schema, model } from "mongoose";

export interface IVotes {
  date: string;
  people: string[];
}
export interface IEvents extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  dates: string[];
  votes: IVotes[]
}

export const EventSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true },
    dates: {type:Array<string>, required: true,}
  },
  {
    collection: "Events",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const Events = model<IEvents>("Events", EventSchema);
