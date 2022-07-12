import { PrismaClient } from "@prisma/client";
import { Service } from "typedi";

@Service()
class PrismaService extends PrismaClient {
  constructor() {
    super({ log: ["query"] });
  }
}

export default PrismaService;
