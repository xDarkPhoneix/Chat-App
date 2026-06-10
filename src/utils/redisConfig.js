import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

let redisConnection = null;

let pubClient = null;

let subClient = null;

/* =====================================================
   REDIS CONFIG
===================================================== */

const redisConfig = {
  host: process.env.AIVEN_HOST,
  port: 26724,
  username: process.env.AIVEN_USERNAME,
  password: process.env.AIVEN_PASSWORD,
  tls: {},
  maxRetriesPerRequest: null,
};

/* =====================================================
   CONNECT REDIS
===================================================== */

const connectRedis = async () => {
  try {
    
     console.log(process.env.AIVEN_HOST);
     
    /* ---------- MAIN CONNECTION ---------- */

    redisConnection = new IORedis(redisConfig);

    /* ---------- PUB CLIENT ---------- */

    pubClient = new IORedis(redisConfig);

    /* ---------- SUB CLIENT ---------- */

    subClient = new IORedis(redisConfig);

    /* ---------- EVENTS ---------- */

    redisConnection.on("connect", () => {
      console.log("✅ Redis Connected");
    });

    redisConnection.on("ready", () => {
      console.log("🚀 Redis Ready");
    });

    redisConnection.on("error", (err) => {
      console.error(
        "❌ Redis Error:",
        err.message
      );
    });

    pubClient.on("connect", () => {
      console.log("✅ Pub Connected");
    });

    subClient.on("connect", () => {
      console.log("✅ Sub Connected");
    });

    /* ---------- PING TEST ---------- */

    await redisConnection.ping();

    console.log("🏓 Redis Ping Successful");

    return {
      redisConnection,
      pubClient,
      subClient,
    };

  } catch (error) {

    console.error(
      "❌ Failed to connect Redis:",
      error.message
    );

    process.exit(1);
  }
};

/* =====================================================
   GETTERS
===================================================== */

const getRedis = () => {
  if (!redisConnection) {
    throw new Error(
      "Redis not initialized"
    );
  }

  return redisConnection;
};

const getPub = () => {
  if (!pubClient) {
    throw new Error(
      "Pub client not initialized"
    );
  }

  return pubClient;
};

const getSub = () => {
  if (!subClient) {
    throw new Error(
      "Sub client not initialized"
    );
  }

  return subClient;
};

export {
  connectRedis,
  getRedis,
  getPub,
  getSub,
};