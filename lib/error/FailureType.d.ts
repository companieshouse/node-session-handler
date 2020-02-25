import { ResponseHandler } from "./ErrorFunctions";
export declare type Failure = {
    errorFunction: ResponseHandler;
};
export declare const Failure: (errorFunction: ResponseHandler) => Failure;
