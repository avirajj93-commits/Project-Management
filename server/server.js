import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();

// ⚠️ IMPORTANT: order matters
app.use(cors());

// 👉 Clerk webhook needs raw body sometimes
app.use(express.json());

// Clerk middleware
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.send('Server is Live!');
});

// ✅ Inngest route
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});