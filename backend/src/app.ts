import express from "express";
import authRoute from "./routes/authRoutes"
import eventRoute from "./routes/eventRoutes"
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoute from "./routes/adminRoutes";
import bookingRoute from "./routes/bookingRoutes";
const app = express();


app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    origin: [ process.env.FRONTEND_URL || "", "http://localhost:3000",
    /\.vercel\.app$/],
    credentials: true,
  })
);



//authintication routes
app.use("/api/auth",authRoute);
app.use("/api/events",eventRoute);
app.use("/api/admin/", adminRoute);
app.use("/api/bookings", bookingRoute);

app.get("/", (_req, res) => {
  res.json({ status: "ok",success:true,
    message:"welcome to EventBook API"
   });
});  

export default app;