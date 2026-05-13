declare module "cors" {
  import type { RequestHandler } from "express";

  type CorsOptions = {
    origin?: boolean | string | string[];
    credentials?: boolean;
  };

  export default function cors(options?: CorsOptions): RequestHandler;
}
