class SessionError extends Error {
  constructor (message: string) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SessionError);
    }
    this.name = 'SessionError';
    this.message = message;
  }
}

export = SessionError;
