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
            const userConfig = require(`${process.env.BASE_URL}min-logger.config`);
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
     * 外部config注入用
     * @param {string} configUrl 外部設定値のURL
     */
    async injectConfig(configUrl) {
        await fetch(configUrl)
            .then((res) => {
            return res.json();
        })
            .then((config) => {
            this.endpointUrl =
                config.endpointUrl ?? this.endpointUrl;
            this.logKey = config.logKey ?? this.logKey;
            this.outputLocalStorageLevel =
                config.outputLocalStorageLevel ??
                    this.outputLocalStorageLevel;
            this.outputEndpointLevel =
                config.outputEndpointLevel ??
                    this.outputEndpointLevel;
            this.unhandledErrorLevel =
                config.unhandledErrorLevel ??
                    this.unhandledErrorLevel;
            this.maxLogLocalStorage =
                config.maxLogLocalStorage ?? this.maxLogLocalStorage;
        })
            .catch((e) => {
            this.storeSession(LOG_LEVEL.WARN, new Date(), e.name, e.message);
        });
    }
    /**
     * SessionStorageに格納する
     * @param {number} level ログレベル
     * @param {Date} date 日付
     * @param {...any} args ログ内容
     */
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
     * @param {string} path
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
    /**
     * ロギング関数
     * @param level
     * @param args
     */
    logging(level, ...args) {
        const date = new Date();
        this.storeSession(level, date, ...args);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.info([...args]);
        }
        if ((this.endpointUrl !== '' && this.outputEndpointLevel <= level) ||
            this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({
                date,
                level: level,
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
    debug(...args) {
        this.logging(LOG_LEVEL.DEBUG, ...args);
    }
    info(...args) {
        this.logging(LOG_LEVEL.INFO, ...args);
    }
    log(...args) {
        this.logging(LOG_LEVEL.LOG, ...args);
    }
    warn(...args) {
        this.logging(LOG_LEVEL.WARN, ...args);
    }
    error(...args) {
        this.logging(LOG_LEVEL.ERROR, ...args);
    }
    async send(url) {
        const local = localStorage.getItem(this.logKey) ?? '';
        const session = sessionStorage.getItem(this.logKey) ?? '';
        let trace;
        if (local === '' && session === '') {
            window.alert('ログがありませんでした');
            return;
        }
        else if (local !== '' && session === '') {
            trace = JSON.parse(local);
        }
        else if (local === '' && session !== '') {
            trace = JSON.parse(session);
        }
        else {
            trace = JSON.parse(local).concat(JSON.parse(session));
        }
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
            console.error(e);
            window.alert('ログの送信に失敗しました');
        });
    }
}
//# sourceMappingURL=index.js.map