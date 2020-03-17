import { ResponseHandler } from "./ErrorFunctions";

export type Failure = { errorFunction: ResponseHandler; };

export const Failure = (errorFunction: ResponseHandler): Failure => {
    return {
        errorFunction
    };
};
