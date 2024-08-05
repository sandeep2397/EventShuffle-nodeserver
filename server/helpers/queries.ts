import mongoose, { ObjectId } from "mongoose";
import { Events } from "../models/event-votes.js";

export const getAggregateEventResults = async (
  eventObjId: mongoose.Types.ObjectId
) => {
  try {
    const aggregatedRes = await Events.aggregate()
      .match({
        _id: eventObjId,
      })
      .lookup({
        from: "UserEvents",
        localField: "_id",
        foreignField: "eventVotes.event_id",
        as: "userVotes",
      })
      .unwind({ path: "$userVotes" })
      .project({
        name: 1,
        dates: 1,
        eventVotes: {
          $arrayElemAt: [
            {
              $map: {
                input: {
                  $filter: {
                    input: "$userVotes.eventVotes",
                    as: "eventVote",
                    cond: {
                      $eq: ["$$eventVote.event_id", eventObjId],
                    },
                  },
                },
                as: "filteredVote",
                in: {
                  dates: "$$filteredVote.dates",
                },
              },
            },
            0,
          ],
        },
        username: "$userVotes.username",
      })
      .project({
        name: 1,
        dates: 1,
        username: 1,
        userVotedDates: "$eventVotes.dates",
      })
      .unwind({
        path: "$userVotedDates",
      })
      .group({
        _id: "$userVotedDates",
        name: { $first: "$name" },
        dates: { $first: "$dates" },
        event_id: { $first: "$_id" },
        people: { $push: "$$ROOT" },
      })
      .project({
        _id: 0,
        dates: 1,
        name: 1,
        date: "$_id",
        event_id: 1,
        "people.username": 1,
      })
      .group({
        _id: "$event_id",
        votes: { $push: "$$ROOT" },
      })
      .project({
        _id: 1,
        name: { $first: "$votes.name" },
        dates: { $first: "$votes.dates" },
        "votes.people": 1,
        "votes.date": 1,
      });
    return aggregatedRes?.[0] || {};
  } catch (err) {
    return err;
  }
};
