import express from "express";
import authRoute from "./routes/authRoutes"
import eventRoute from "./routes/eventRoutes"
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes";

const app = express();


app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);



//authintication routes
app.use("/api/auth",authRoute);
app.use("/api/events",eventRoute);
app.use("/api/admin/events", adminRoutes);

app.get("/", (_req, res) => {
  res.json({ status: "ok",success:true,
    message:"welcome to EventBook API"
   });
});  

export default app;