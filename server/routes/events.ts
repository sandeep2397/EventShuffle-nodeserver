import { Router } from "express";
import { Events } from "../models/event-votes.js";
import mongoose, { Connection } from "mongoose";
import { error } from "console";
import { UserEvents } from "../models/user-event-votes.js";
import _ from "lodash";
import { ObjectId } from "mongodb";
import { getAggregateEventResults } from "../helpers/queries.js";
const router = Router();

const getEvent = async (id: ObjectId | string) => {
  try {
    return await Events.findById(id);
  } catch (err) {
    return err;
  }
};

router.get("/list", async (req, res) => {
  try {
    const PAGE_SIZE = 10;
    const page = req.query?.page ? Number(req.query?.page) : 1;
    const limit = PAGE_SIZE;
    const skip = (page - 1) * limit;

    const items = await Events.find({}).skip(skip).limit(limit);
    const total = await Events.countDocuments();

    res.status(200).send({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      events: items,
    });
  } catch (err) {
    res.status(500).send({ status: "failed" });
  }
});

router.get("/showevent/:id", async (req, res) => {
  const id = req.params.id;
  const eventData = await getEvent(id);
  if (eventData) {
    res.status(200).send({
      data: eventData,
    });
  } else {
    res.status(500).send({
      error: "Event Not Found",
    });
  }
});

router.post("/createMany", async (req, res) => {
  const inputData = req.body?.events || [];
  try {
    const events = await Events.insertMany(inputData);
    res.status(200).send({
      events,
    });
  } catch (err: any) {
    res.status(500).send({
      err: err?.message,
    });
  }
});

router.post("/create", async (req, res) => {
  const inputData = req.body?.event || {};
  const Event = new Events({
    _id: new mongoose.Types.ObjectId(), // Unique ID for this entry
    name: inputData?.name,
    dates: inputData?.dates,
  });
  try {
    const eventData = await Event.save();
    res.status(200).send({
      eventData,
    });
  } catch (err: any) {
    res.status(500).send({
      err: err?.message,
    });
    throw new Error(err);
  }
});

router.put("/:id/votes", async (req, res) => {
  const eventId = req.params.id;
  const name = req.body?.name;
  const votedDates = req.body?.votes || [];
  const eventData: any = await getEvent(eventId);

  if (eventData) {
    try {
      const userData: any = await UserEvents.findOne({ username: name });
      if (userData) {
        const newEventObjId = new mongoose.Types.ObjectId(eventId);
        let newEventDates = {
          event_id: newEventObjId,
          dates: votedDates,
        };

        let newlyAddedEventVotes: Array<any> = userData?.eventVotes || [];
        let userEventVotes = userData?.eventVotes || [];
        newlyAddedEventVotes = userEventVotes?.filter((eventInfo: any) => {
          if (!eventInfo?.event_id.equals(newEventDates?.event_id)) {
            return eventInfo;
          }
        });
        newlyAddedEventVotes?.push(newEventDates);

        try {
          const updatedUser = await UserEvents.updateOne(
            { _id: userData?._id },
            {
              $set: {
                eventVotes: newlyAddedEventVotes,
              },
            }
          );
          if (updatedUser) {
            console.log(
              "**************User Vote saved successfully for the event"
            );
            const aggregatedResult: any = await getAggregateEventResults(
              newEventObjId
            );

            res.status(200).send({
              event: aggregatedResult || {},
            });
          }
        } catch (err: any) {
          res.status(400).send({
            message: err?.message,
          });
        }
      }
    } catch (err) {
      console.error("user Events err", err);
    }
  } else {
    res.status(500).send({
      error: "Event Not Found",
    });
  }
});

router.get("/:id/results", async (req, res) => {
  const eventId = req.params.id;
  const newEventObjId = new mongoose.Types.ObjectId(eventId);
  try {
    const aggregatedResult = await getAggregateEventResults(newEventObjId);
    const collectedVotes = aggregatedResult?.votes || [];
    const finalRes = collectedVotes?.reduce((acc: any, currVal: any) => {
      const peopleList = currVal?.people || [];
      const prevPeopleList = acc?.people || [];
      if (peopleList?.length > prevPeopleList?.length) {
        acc = currVal;
      }
      return acc;
    }, {});
    res.status(200).send({
      id: aggregatedResult?._id,
      name: aggregatedResult?.name,
      suitableDates: finalRes,
    });
  } catch (err: any) {
    res.status(400).send({
      message: err?.message,
    });
  }
});

export default router;
