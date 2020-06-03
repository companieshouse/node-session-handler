declare const Cache: {
    client: any;
    _setClient: () => void;
    set: (key: string, value: string, ttl: number) => Promise<boolean>;
    get: (key: string) => Promise<string>;
    delete: (key: string) => Promise<boolean>;
};
export = Cache;
