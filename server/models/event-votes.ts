import { Schema, model } from "mongoose";

export interface IVotes {
  date: string;
  people: string[];
}
export interface IEvents extends Document {
  _id: Schema.Types.ObjectId;
  name: string;  
  imageUrl: string;
  dates: string[];
}

export const EventSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true },
    dates: {type:Array<string>, required: true,},
    imageUrl:{type:String,}
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
