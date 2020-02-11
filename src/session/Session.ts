"use strict";

import AccessTokenData = require("./AccessTokenData");

class Session {

    id: string;
    accessToken?: AccessTokenData;

    constructor(id: string, accessToken?: AccessTokenData) {

        this.id = id;
        this.accessToken = accessToken;
    }
}

export = Session;
