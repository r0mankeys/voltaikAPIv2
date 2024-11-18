import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import initialEmployees from "./public/initialEmployees.js";
import Employee from "./public/model/model.js";
import employeeRouter from "./public/routes/employee.routes.js";
import { rateLimit } from 'express-rate-limit'
import { slowDown } from 'express-slow-down'
import MongoStore from "rate-limit-mongo";


const app = express();
const PORT = 8080;

const uri = process.env.MONGO_URI;

const requestLimiter = rateLimit({
    windowMS: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMS (per 10 minutes)
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "Too many requests, please try again in a few minutes", // message to send as a response if the limit is exceeded
    store: new MongoStore({
        uri: uri,
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD,
        collectionName: "rateLimit",
        expireTimeMS: 10 * 60 * 1000,
        errorHandler: (error) => {
            console.error("MongoStore error", error);
        },
    })
})

const speedLimiter = slowDown({
    windowMS: 10 * 60 * 1000,
    delayAfter: 100,
    delayMS: (seconds) => seconds * 1000, // 1 second delay after 100 requests
});

app.use(express.json());
app.use(express.static("./"));
app.use(requestLimiter);
app.use(speedLimiter);

async function connectToDatabase() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const database = await mongoose.connection.db.listCollections().toArray();
    if (database.length === 0) {
        console.log("Database empty, adding data...");
        const employees = initialEmployees.map(employee => new Employee(employee));
        await Promise.all(employees.map(employee => employee.save()));
    }
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  } 
}


app.get("/", (request, response) => {
    response.status(200).sendFile("./index.html");
})

app.use("/api/v2/employees", employeeRouter);


app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await connectToDatabase();
})

export default app;
