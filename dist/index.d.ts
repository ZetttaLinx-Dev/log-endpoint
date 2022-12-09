declare class Logger {
    private static _logger;
    private static endpointUrl;
    private static logKey;
    private static outputLocalStorageLevel;
    private static outputEndpointLevel;
    static useLogger(): Logger;
    private constructor();
    private static storeSession;
    private static findValueByPrefix;
    static setEndPointUrl: (path: string) => void;
    static debug: (...args: [...any]) => void;
    static info: (...args: [...any]) => void;
    static log: (...args: [...any]) => void;
    static warn: (...args: [...any]) => void;
    static error: (...args: [...any]) => void;
    static send: (url?: string) => void;
}
export { Logger };
