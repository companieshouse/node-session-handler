"use strict";

import AccessTokenData = require("./AccessTokenData");
import SignInData = require("./SignInData");
import SessionKeys = require("./SessionKeys");
import Dictionary = require("../Dictionary");

class Session {

    id: string;
    signInData: SignInData;

    constructor(id: string, data: Dictionary<any>) {

        this.id = id;
        this.signInData = new SignInData(data[SessionKeys.SignInInfo]);
    }

    validateExpiry() {

        const expiresIn = this.signInData.accessToken.expiresIn;

        if (expiresIn && expiresIn <= Date.now()) {
            throw new Error("Session has expired.");
        }
    }
}

export = Session;
