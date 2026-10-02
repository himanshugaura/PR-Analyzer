import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

const validatePart = (part: "body" | "params" | "query", input: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await input.parseAsync(req[part]);

      if (part === "query") {
        Object.defineProperty(req, "query", {
          value: parsed,
          writable: true,
          configurable: true,
        });
      } else if (part === "params") {
        req.params = parsed as Request["params"];
      } else {
        req.body = parsed;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBody = (input: ZodTypeAny) => validatePart("body", input);
export const validateParams = (input: ZodTypeAny) => validatePart("params", input);
export const validateQuery = (input: ZodTypeAny) => validatePart("query", input);

export const validate = (schemas: {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as Request["params"];
      }
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        Object.defineProperty(req, "query", {
          value: parsedQuery,
          writable: true,
          configurable: true,
        });
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};