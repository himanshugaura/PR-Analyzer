import type { User } from "../../generated/prisma/client.js";

declare global {
  interface BigInt {
    toJSON(): string;
  }

  namespace Express {
    interface Request {
      rawBody?: string;
      user?: User;
    }
  }
}

export {};
