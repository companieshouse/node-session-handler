import AccessTokenData = require("./AccessTokenData");

class SignInData {

    adminPermissions: boolean;
    signedIn: boolean;
    companyNumber: number;

    accessToken: AccessTokenData;
    userProfile: UserProfileData;

    constructor() {
        
    }
}

export = SignInData;
