import { Router } from "express";
import { Events } from "../models/event-votes.js";
import mongoose, { Connection, ObjectId } from "mongoose";
import { error } from "console";

const router = Router();

const getEvent = async (id: ObjectId | string) => {
  return await Events.findOne({ id });
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

router.get("showevent/:id", async (req, res) => {
  const id = req.params.id;
  const eventData = await getEvent(id);
  if (eventData) {
    res.status(200).send({
      data: eventData,
    });
  }
  res.status(500).send({
    error: "Event Not Found",
  });
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
    fduskjfsd: "fsdfds",
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

export default router;
