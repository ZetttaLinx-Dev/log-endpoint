export { MinLogger, LOG_LEVEL, DEBUG_OUTPUT, defineConfig };
declare const LOG_LEVEL: {
    readonly DEBUG: 0;
    readonly INFO: 1;
    readonly LOG: 2;
    readonly WARN: 3;
    readonly ERROR: 4;
    readonly NONE: 100;
};
type LOG_LEVEL = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];
declare const DEBUG_OUTPUT: {
    readonly CONSOLE: "CONSOLE";
    readonly ENDPOINT: "ENDPOINT";
};
type DEBUG_OUTPUT = typeof DEBUG_OUTPUT[keyof typeof DEBUG_OUTPUT];
declare function defineConfig(config: UserConfig): UserConfig;
declare class MinLogger {
    private endpointUrl;
    private logKey;
    private outputLocalStorageLevel;
    private outputEndpointLevel;
    private maxLogLocalStorage;
    private unhandledErrorLevel;
    private debugOutput;
    constructor();
    /**
     *
     * @param configUrl 外部設定値のURL
     * @returns
     */
    static build(configUrl?: string): Promise<MinLogger>;
    private storeSession;
    /**
     * エンドポイントURL変更用
     * @param path
     */
    setEndpointUrl(path: string): void;
    /**
     * 全てのログを出力する
     * @param  {"CONSOLE" | "ENDPOINT"} output 出力先
     */
    onDebug(output: DEBUG_OUTPUT): void;
    debug(...args: [...any]): void;
    info(...args: [...any]): void;
    log(...args: [...any]): void;
    warn(...args: [...any]): void;
    error(...args: [...any]): void;
    send(url?: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map