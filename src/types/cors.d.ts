declare module "cors" {
  import type { RequestHandler } from "express";

  export type CorsOptions = {
    origin?: boolean | string | RegExp | Array<string | RegExp>;
    credentials?: boolean;
  };

  export default function cors(options?: CorsOptions): RequestHandler;
}
