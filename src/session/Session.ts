"use strict";

import { SessionData } from "./SessionData";

class Session {

    id: string;
    expires: number;
    data: SessionData;

    constructor(id: string, expires: number, data: SessionData) {

        this.id = id;
        this.expires = expires;
        this.data = data;
    }
}

export = Session;
