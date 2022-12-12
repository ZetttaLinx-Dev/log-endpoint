declare const LOG_LEVEL: {
    readonly DEBUG: 0;
    readonly INFO: 1;
    readonly LOG: 2;
    readonly WARN: 3;
    readonly ERROR: 4;
};
type LOG_LEVEL = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];
declare const DEBUG_OUTPUT: {
    readonly CONSOLE: "CONSOLE";
    readonly ENDPOINT: "ENDPOINT";
};
type DEBUG_OUTPUT = typeof DEBUG_OUTPUT[keyof typeof DEBUG_OUTPUT];
declare function defineConfig(config: UserConfig): UserConfig;
export { MinLogger, LOG_LEVEL, DEBUG_OUTPUT, defineConfig };
declare class MinLogger {
    private endpointUrl;
    private logKey;
    private outputLocalStorageLevel;
    private outputEndpointLevel;
    private maxLogLocalStorage;
    private debugOutput;
    constructor();
    private storeSession;
    setEndPointUrl(path: string): void;
    onDebug(outout: DEBUG_OUTPUT): void;
    debug(...args: [...any]): void;
    info(...args: [...any]): void;
    log(...args: [...any]): void;
    warn(...args: [...any]): void;
    error(...args: [...any]): void;
    send(url?: string): void;
}
//# sourceMappingURL=index.d.ts.map