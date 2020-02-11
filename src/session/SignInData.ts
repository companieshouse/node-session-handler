import AccessTokenData = require("./AccessTokenData");
import SessionKeys = require("./SessionKeys");
import Dictionary = require("../Dictionary");
import UserProfileData = require("./UserProfileData");

class SignInData {

    adminPermissions: boolean;
    signedIn: boolean;
    companyNumber: number;

    accessToken: AccessTokenData;
    userProfile: UserProfileData;

    constructor(data: Dictionary<any>) {

        this.adminPermissions = data[SessionKeys.AdminPermissions] === "1";
        this.signedIn = data[SessionKeys.SignedIn] === 1;
        this.companyNumber = data[SessionKeys.CompanyNumber];

        this.accessToken = new AccessTokenData(data[SessionKeys.AccessToken]);
        this.userProfile = new UserProfileData(data[SessionKeys.UserProfile]);
    }
}

export = SignInData;
