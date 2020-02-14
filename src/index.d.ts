import { Request } from "express";

declare global {
    namespace Express {
        export interface Request {
            session?: any;
        }
    }
}

export { };
