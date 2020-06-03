declare const Session: {
    /**
     * Set up default parameters
     *
     * @param req - the request object as supplied the the consumer
     * @return <void>
     */
    _setUp: (req: any) => void;
    /**
     * Bootsrap a session
     *
     * @param req - the request object as supplied the the consumer
     * @param res - the response object as supplied the the consumer
     * @return <void>
     */
    start: (req: any, res: any) => Promise<void>;
    /**
     * Read data from session
     *
     * @param type - the type of read to be performed
     * @return <Promise>
     */
    read: (type: any) => Promise<any>;
    /**
     * Write data to session
     *
     * @param res - the response object as supplied the the consumer
     * @param data - data to be written to memory and to Cache
     * @return <Promise>
     */
    write: (res: any, data: any) => Promise<boolean>;
    /**
     * Delete app data from session
     *
     * @param res - the response object as supplied the the consumer
     * @return <Promise>
     */
    delete: (res: any) => Promise<boolean>;
    /**
     * Decodes data saved against a user sessionId by the accounts team
     *
     * @param data - user data from cache to be decoded
     * @return <Object>
     */
    decodeAccountData: (data: any) => any;
};
export = Session;
