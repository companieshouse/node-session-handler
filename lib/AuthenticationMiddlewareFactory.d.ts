import { Request, Response, NextFunction } from "express";
export declare type RedirectFunction = (response: Response) => void;
export declare const createAuthenticationMiddleware: (redirectFn: RedirectFunction) => (request: Request<import("express-serve-static-core").ParamsDictionary>, response: Response, next: NextFunction) => void;
