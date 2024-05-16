export { MinLogger, LOG_LEVEL, DEBUG_OUTPUT, defineConfig };
declare const LOG_LEVEL: {
    readonly DEBUG: 0;
    readonly INFO: 1;
    readonly LOG: 2;
    readonly WARN: 3;
    readonly ERROR: 4;
    readonly NONE: 100;
};
type LOG_LEVEL = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];
declare const DEBUG_OUTPUT: {
    readonly CONSOLE: "CONSOLE";
    readonly ENDPOINT: "ENDPOINT";
};
type DEBUG_OUTPUT = (typeof DEBUG_OUTPUT)[keyof typeof DEBUG_OUTPUT];
declare function defineConfig(config: UserConfig): UserConfig;
declare class MinLogger {
    private endpointUrl;
    private logKey;
    private outputLocalStorageLevel;
    private outputEndpointLevel;
    private maxLogLocalStorage;
    private unhandledErrorLevel;
    private debugOutput;
    constructor(userConfig?: UserConfig);
    /**
     * 外部config注入用
     * @param {string} configUrl 外部設定値のURL
     */
    injectConfig(configUrl: string): Promise<void>;
    /**
     * SessionStorageに格納する
     * @param {number} level ログレベル
     * @param {Date} date 日付
     * @param {...any} args ログ内容
     */
    private storeSession;
    /**
     * エンドポイントURL変更用
     * @param {string} path
     */
    setEndpointUrl(path: string): void;
    /**
     * 全てのログを出力する
     * @param  {"CONSOLE" | "ENDPOINT"} output 出力先
     */
    onDebug(output: DEBUG_OUTPUT): void;
    /**
     * ロギング関数
     * @param level
     * @param args
     */
    private logging;
    debug(...args: [...any]): void;
    info(...args: [...any]): void;
    log(...args: [...any]): void;
    warn(...args: [...any]): void;
    error(...args: [...any]): void;
    send(url?: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map