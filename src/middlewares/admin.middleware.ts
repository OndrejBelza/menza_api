import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types/context";

export const AdminGuard: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  if (context.req.headers.authorization !== process.env.ADMIN_KEY)
    throw new Error(`This is only for admins`);
  else return next();
};
