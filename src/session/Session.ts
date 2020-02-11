"use strict";

import AccessTokenData = require("./AccessTokenData");
import SignInData = require("./SignInData");

class Session {

    id: string;
    signInData?: SignInData;

    constructor(id: string, rawData?: any) {

        this.id = id;   
    }
}

export = Session;
