import Dictionary from "../Dictionary";
import SessionKeys from "./SessionKeys";

class UserProfileData {

    email: string;
    forename: string;
    id: string;
    locale: string;
    permissions: Dictionary<any> = {};
    scope: string;
    surname: string;

    constructor(data: Dictionary<any>) {

        this.email = data[SessionKeys.Email];
        this.forename = data[SessionKeys.Forename];
        this.id = data[SessionKeys.UserId];
        this.locale = data[SessionKeys.Locale];
        this.scope = data[SessionKeys.Scope];
        this.surname = data[SessionKeys.Surname];

        const permissionData = data[SessionKeys.Permissions];

        if (permissionData) {
            Object.keys(permissionData)
                .forEach((key) => this.permissions[key] = permissionData[key] === 1);
        }
    }
}

export = UserProfileData;
