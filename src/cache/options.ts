"use strict";

const createOptions = function (password, address, db) {
    return {
        password,
        address,
        db
    };
};

export = createOptions;
