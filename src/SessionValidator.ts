import ApplicationLogger from "ch-logger/lib/ApplicationLogger";
import Encoding from "./encoding";
import config from "./config";

class SessionValidator {

    private signatureStart = 28;
    private signatureLength = 27;
    private cookieLength = 55;

    private sessionLengthError = "Encrypted session token not long enough.";
    private signatureCheckError = "Expected signature does not equal signature provided.";

    private logger: ApplicationLogger;
    private sessionCookie: string;

    constructor(sessionCookie: string, logger: ApplicationLogger) {

        this.logger = logger;
        this.sessionCookie = sessionCookie;
    }

    private validateTokenLength() {

        if (this.sessionCookie.length < this.cookieLength) {

            this.logger.error(this.sessionLengthError);
            throw new Error(this.sessionLengthError);
        }
    }

    private validateSignature(signature: string, sessionId: string) {

        if (signature !== Encoding.generateSha1SumBase64(sessionId + config.session.secret)) {

            this.logger.error(this.signatureCheckError);
            throw new Error(this.signatureCheckError);
        }
    }

    validateTokenAndRetrieveId() {

        this.validateTokenLength();

        const sessionId = this.sessionCookie.substring(0, this.signatureStart);
        const signature = this.sessionCookie.substring(this.signatureStart, this.sessionCookie.length);

        this.validateSignature(signature, sessionId);

        return sessionId;
    }
}

export = SessionValidator;
