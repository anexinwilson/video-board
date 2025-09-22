// Lambda adapter for Express using @vendia/serverless-express.
import serverlessExpress from "@vendia/serverless-express";
import app from "./app";

export const handler = serverlessExpress({ app });
