import { Connection, Schema, model } from "mongoose";

export interface IVotes {
  date: string;
  people: string[];
}
export interface IUserEventVotes extends Document {
  event_id: Schema.Types.ObjectId;
  dates: IVotes[]
}

export interface IUserEvents extends Document {
  _id: Schema.Types.ObjectId;
  username: string;
  eventVotes: IUserEventVotes[]
}

export const UserEventsSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    username: { type: String, required: true, unique: true },
    eventVotes: {type:Array<IUserEventVotes>,}
  },
  {
    collection: "UserEvents",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const UserEvents = model<IUserEvents>("UserEvents", UserEventsSchema);
