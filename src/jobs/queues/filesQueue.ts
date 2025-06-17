import { Queue } from "bullmq";
import connection from "../../service/redis-service";

const fileQueue = new Queue("FileQueue", { connection });

export default fileQueue;
