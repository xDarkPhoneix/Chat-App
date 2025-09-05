import mongoose from "mongoose";
import { DB_NAME } from "../constants/constants.js";

const connectDB = async () => {
  try {
    const connectioninstance = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);
    console.log(
      `MongoDb Database Connected ${connectioninstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDb Connection error", error);
    process.exit(1);
  }
};

export default connectDB
