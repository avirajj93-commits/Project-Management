import express from "express";
import { Webhook } from "svix";
import prisma from "../configs/prisma.js";

const router = express.Router();

router.post("/clerk", async (req, res) => {
  try {
    const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const evt = wh.verify(JSON.stringify(payload), headers);

    // 🎯 HANDLE EVENT
    if (evt.type === "organization.created") {
      const org = evt.data;

      console.log("ORG CREATED 👉", org);

      // ✅ CREATE WORKSPACE IN DB
      await prisma.workspace.create({
        data: {
          name: org.name,
          clerkOrgId: org.id,
        },
      });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.log("Webhook error 👉", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;