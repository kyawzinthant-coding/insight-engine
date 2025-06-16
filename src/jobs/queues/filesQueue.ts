import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT) | 6379,
});

const fileQueue = new Queue("FileQueue", { connection });

export default fileQueue;
