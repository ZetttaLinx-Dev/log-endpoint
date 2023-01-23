export { MinLogger, LOG_LEVEL, DEBUG_OUTPUT, defineConfig };
const LOG_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    LOG: 2,
    WARN: 3,
    ERROR: 4,
    NONE: 100,
};
const DEBUG_OUTPUT = {
    CONSOLE: 'CONSOLE',
    ENDPOINT: 'ENDPOINT',
};
function defineConfig(config) {
    return config;
}
class MinLogger {
    endpointUrl = '';
    logKey = 'log';
    outputLocalStorageLevel = LOG_LEVEL.WARN;
    outputEndpointLevel = LOG_LEVEL.ERROR;
    maxLogLocalStorage = 300;
    unhandledErrorLevel = LOG_LEVEL.WARN;
    debugOutput = sessionStorage.getItem('min-logger-debug-flag');
    constructor() {
        try {
            const userConfig = require(process.env.BASE_URL +
                'min-logger.config');
            this.endpointUrl = userConfig.endpointUrl ?? this.endpointUrl;
            this.logKey = userConfig.logKey ?? this.logKey;
            this.outputLocalStorageLevel =
                userConfig.outputLocalStorageLevel ?? this.outputLocalStorageLevel;
            this.outputEndpointLevel =
                userConfig.outputEndpointLevel ?? this.outputEndpointLevel;
            this.unhandledErrorLevel =
                userConfig.unhandledErrorLevel ?? this.unhandledErrorLevel;
            this.maxLogLocalStorage =
                userConfig.maxLogLocalStorage ?? this.maxLogLocalStorage;
        }
        catch {
            // 規定値の使用
        }
        // 全ての未処理の例外をロギングする
        window.addEventListener('error', (event) => {
            this.storeSession(this.unhandledErrorLevel, new Date(), event.type, event.message);
        });
        // beforeunloadにフックしてlocalStorageに格納する
        window.addEventListener('beforeunload', () => {
            const sessionLog = sessionStorage.getItem(this.logKey);
            if (sessionLog === null) {
                return;
            }
            const log = JSON.parse(sessionLog);
            const saveLog = log.filter((trace) => {
                return this.outputLocalStorageLevel <= trace.level;
            });
            if (saveLog.length === 0) {
                return;
            }
            const oldTrace = localStorage.getItem(this.logKey) ?? false;
            let trace;
            if (!oldTrace) {
                trace = saveLog;
            }
            else {
                trace = JSON.parse(oldTrace).concat(saveLog);
            }
            if (trace.length > this.maxLogLocalStorage) {
                trace.splice(0, trace.length - this.maxLogLocalStorage);
            }
            localStorage.setItem(this.logKey, JSON.stringify(trace));
        });
    }
    /**
     *
     * @param configUrl 外部設定値のURL
     * @returns
     */
    static async build(configUrl) {
        const minLogger = new MinLogger();
        if (configUrl) {
            await fetch(configUrl)
                .then((res) => {
                return res.json();
            })
                .then((config) => {
                minLogger.endpointUrl =
                    config.endpointUrl ?? minLogger.endpointUrl;
                minLogger.logKey = config.logKey ?? minLogger.logKey;
                minLogger.outputLocalStorageLevel =
                    config.outputLocalStorageLevel ??
                        minLogger.outputLocalStorageLevel;
                minLogger.outputEndpointLevel =
                    config.outputEndpointLevel ??
                        minLogger.outputEndpointLevel;
                minLogger.unhandledErrorLevel =
                    config.unhandledErrorLevel ??
                        minLogger.unhandledErrorLevel;
                minLogger.maxLogLocalStorage =
                    config.maxLogLocalStorage ??
                        minLogger.maxLogLocalStorage;
            })
                .catch((e) => {
                minLogger.storeSession(LOG_LEVEL.WARN, new Date(), e.name, e.message);
            })
                .finally(() => {
                return minLogger;
            });
        }
        return minLogger;
    }
    storeSession(level, date, ...args) {
        const oldTrace = sessionStorage.getItem(this.logKey) ?? false;
        if (!oldTrace) {
            const trace = [{ date: date, level: level, details: [...args] }];
            sessionStorage.setItem(this.logKey, JSON.stringify(trace));
        }
        else {
            const trace = JSON.parse(oldTrace);
            trace.push({ date: date, level: level, details: [...args] });
            sessionStorage.setItem(this.logKey, JSON.stringify(trace));
        }
    }
    /**
     * エンドポイントURL変更用
     * @param path
     */
    setEndpointUrl(path) {
        this.endpointUrl = path;
    }
    /**
     * 全てのログを出力する
     * @param  {"CONSOLE" | "ENDPOINT"} output 出力先
     */
    onDebug(output) {
        this.debugOutput = output;
    }
    debug(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.DEBUG, date, ...args);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.info([...args]);
        }
        if ((this.endpointUrl !== '' &&
            this.outputEndpointLevel <= LOG_LEVEL.DEBUG) ||
            this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({
                date,
                level: LOG_LEVEL.DEBUG,
                details: [...args],
            });
            fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify([body]),
            });
        }
    }
    info(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.INFO, date, ...args);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.info([...args]);
        }
        if ((this.endpointUrl !== '' && this.outputEndpointLevel <= LOG_LEVEL.INFO) ||
            this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({
                date,
                level: LOG_LEVEL.INFO,
                details: [...args],
            });
            fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify([body]),
            });
        }
    }
    log(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.LOG, date, [...args]);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.log([...args]);
        }
        if ((this.endpointUrl !== '' && this.outputEndpointLevel <= LOG_LEVEL.LOG) ||
            this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({
                date,
                level: LOG_LEVEL.LOG,
                details: [...args],
            });
            fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify([body]),
            });
        }
    }
    warn(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.WARN, date, ...args);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.warn([...args]);
        }
        if ((this.endpointUrl !== '' && this.outputEndpointLevel <= LOG_LEVEL.WARN) ||
            this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({
                date,
                level: LOG_LEVEL.WARN,
                details: [...args],
            });
            fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify([body]),
            });
        }
    }
    error(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.ERROR, date, ...args);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.error([...args]);
        }
        if ((this.endpointUrl !== '' &&
            this.outputEndpointLevel <= LOG_LEVEL.ERROR) ||
            this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify([
                { date, level: LOG_LEVEL.ERROR, details: [...args] },
            ]);
            fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify([body]),
            });
        }
    }
    async send(url) {
        const local = localStorage.getItem(this.logKey) ?? '';
        const session = sessionStorage.getItem(this.logKey) ?? '';
        console.log(local);
        console.log(session);
        const trace = JSON.parse(local).concat(JSON.parse(session));
        const body = JSON.stringify(trace);
        await fetch(url ?? this.endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body,
        })
            .then(() => {
            window.alert('ログを送信しました');
        })
            .catch((e) => {
            console.log('error:' + e);
            window.alert('ログの送信に失敗しました');
        });
    }
}
//# sourceMappingURL=index.js.map