import express from "express";
import authRoute from "./routes/authRoutes"
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser())


//authintication routes
app.use("/api/auth",authRoute);

app.get("/", (_req, res) => {
  res.json({ status: "ok",success:true,
    message:"welcome to EventBook API"
   });
});  

export default app;