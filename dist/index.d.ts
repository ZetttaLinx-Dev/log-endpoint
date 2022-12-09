declare const DEBUG_OUTPUT: {
    readonly CONSOLE: "CONSOLE";
    readonly ENDPOINT: "ENDPOINT";
};
type DEBUG_OUTPUT = typeof DEBUG_OUTPUT[keyof typeof DEBUG_OUTPUT];
declare class Logger {
    private endpointUrl;
    private logKey;
    private outputLocalStorageLevel;
    private outputEndpointLevel;
    private maxLogLocalStorage;
    private debugOutput;
    constructor();
    private storeSession;
    private findValueByPrefix;
    setEndPointUrl(path: string): void;
    onDebug(outout: DEBUG_OUTPUT): void;
    debug(...args: [...any]): void;
    info(...args: [...any]): void;
    log(...args: [...any]): void;
    warn(...args: [...any]): void;
    error(...args: [...any]): void;
    send(url?: string): void;
}
export { Logger };
