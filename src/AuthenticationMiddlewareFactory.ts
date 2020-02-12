"use strict";

import { Request, Response, NextFunction } from "express";

export type RedirectFunction = (response: Response) => void;
export const createAuthenticationMiddleware = (redirectFn: RedirectFunction) => (request: Request, response: Response, next: NextFunction): void => {

    if (!request.session || !request.session.signInData?.signedIn) {
        redirectFn(response);
    }

    next();

};
