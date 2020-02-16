import { Request, Response, NextFunction } from "express";
import { SessionKeys } from "./session/SessionKeys";

export type RedirectFunction = (response: Response) => void;
export const createAuthenticationMiddleware = (redirectFn: RedirectFunction) =>
    (request: Request, response: Response, next: NextFunction): void => {

        if (!request.session || !request.session.data[SessionKeys.SignInInfo]?.signedIn) {
            redirectFn(response);
        }

        next();

    };
