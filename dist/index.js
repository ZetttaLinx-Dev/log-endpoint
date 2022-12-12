const LOG_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    LOG: 2,
    WARN: 3,
    ERROR: 4,
};
const DEBUG_OUTPUT = {
    CONSOLE: "CONSOLE",
    ENDPOINT: "ENDPOINT",
};
function defineConfig(config) {
    return config;
}
export { MinLogger, LOG_LEVEL, DEBUG_OUTPUT, defineConfig };
class MinLogger {
    endpointUrl = '';
    logKey = 'log';
    outputLocalStorageLevel = LOG_LEVEL.WARN;
    outputEndpointLevel = LOG_LEVEL.ERROR;
    maxLogLocalStorage = 300;
    debugOutput = sessionStorage.getItem('min-logger-debug-flag');
    constructor() {
        try {
            const userConfig = require(process.env.BASE_URL + 'min-logger.config');
            this.endpointUrl = userConfig.endpointUrl ?? this.endpointUrl;
            this.logKey = userConfig.logKey ?? this.logKey;
            this.outputLocalStorageLevel = userConfig.outputLocalStorageLevel ?? this.outputLocalStorageLevel;
            this.outputEndpointLevel = userConfig.outputEndpointLevel ?? this.outputEndpointLevel;
            this.maxLogLocalStorage = userConfig.maxLogLocalStorage ?? this.maxLogLocalStorage;
        }
        catch {
            // 規定値の使用
        }
        window.addEventListener('unload', () => {
            const sessionLog = sessionStorage.getItem(this.logKey);
            if (sessionLog === null) {
                return;
            }
            const log = JSON.parse(sessionLog);
            const saveLog = log.filter((trace) => {
                return this.findValueByPrefix(LOG_LEVEL, this.outputLocalStorageLevel) <= trace.level;
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
    ;
    findValueByPrefix(object, prefix) {
        for (const property in object) {
            if (Object.prototype.hasOwnProperty.call(object, property) &&
                property.toString().startsWith(prefix)) {
                return object[property];
            }
        }
    }
    ;
    setEndPointUrl(path) {
        this.endpointUrl = path;
    }
    onDebug(outout) {
        this.debugOutput = outout;
    }
    debug(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.DEBUG, date, [...args]);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.info([...args]);
        }
        if (this.endpointUrl !== '' && this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.DEBUG || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.DEBUG, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    }
    ;
    info(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.INFO, date, [...args]);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.info([...args]);
        }
        if (this.endpointUrl !== '' && this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.INFO || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.INFO, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    }
    ;
    log(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.LOG, date, [...args]);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.log([...args]);
        }
        if (this.endpointUrl !== '' && this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.LOG || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.LOG, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    }
    ;
    warn(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.WARN, date, [...args]);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.warn([...args]);
        }
        if (this.endpointUrl !== '' && this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.WARN || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.WARN, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    }
    ;
    error(...args) {
        const date = new Date();
        this.storeSession(LOG_LEVEL.ERROR, date, [...args]);
        if (this.debugOutput === DEBUG_OUTPUT.CONSOLE) {
            console.error([...args]);
        }
        if (this.endpointUrl !== '' && this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.ERROR || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    }
    ;
    send(url) {
        const body = localStorage.getItem(this.logKey) ?? '';
        fetch(url ?? this.endpointUrl, {
            body,
        })
            .then(() => {
            window.alert('ログを送信しました');
        })
            .catch(() => {
            window.alert('ログの送信に失敗しました');
        });
    }
    ;
}
//# sourceMappingURL=index.js.map