import ApplicationLogger from "ch-logger/lib/ApplicationLogger";
import Encoding from "./encoding";
import config from "./config";

class SessionValidator {

    private _signatureStart = 28;
    private _signatureLength = 27;
    private _cookieLength = 55;

    private _sessionLengthError = "Encrypted session token not long enough.";
    private _signatureCheckError = "Expected signature does not equal signature provided.";

    private _logger: ApplicationLogger;
    private _sessionCookie: string;

    constructor(sessionCookie: string, logger: ApplicationLogger) {

        this._logger = logger;
        this._sessionCookie = sessionCookie;
    }

    private validateTokenLength() {

        if (this._sessionCookie.length < this._cookieLength) {

            this._logger.error(this._sessionLengthError);
            throw new Error(this._sessionLengthError);
        }
    }

    private validateSignature(signature: string, sessionId: string) {

        if (signature !== Encoding.generateSha1SumBase64(sessionId + config.session.secret)) {

            this._logger.error(this._signatureCheckError);
            throw new Error(this._signatureCheckError);
        }
    }

    validateTokenAndRetrieveId() {

        this.validateTokenLength();

        const sessionId = this._sessionCookie.substring(0, this._signatureStart);
        const signature = this._sessionCookie.substring(this._signatureStart, this._sessionCookie.length);

        this.validateSignature(signature, sessionId);

        return sessionId;
    }
}

export = SessionValidator;
