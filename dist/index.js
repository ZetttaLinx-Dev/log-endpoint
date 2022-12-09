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
export { Logger };
class Logger {
    endpointUrl = process.env.npm_package_config_logger_endpointUrl ?? '';
    logKey = process.env.npm_package_config_logger_logKey ?? 'log';
    outputLocalStorageLevel = process.env.npm_package_config_logger_outputLocal ?? 'WARN';
    outputEndpointLevel = process.env.npm_package_config_logger_outputEndpoint ?? 'ERROR';
    maxLogLocalStorage = Number(process.env.npm_package_config_logger_maxLogLocalStorage) ?? 300;
    debugOutput = sessionStorage.getItem('min-logger-debug-flag');
    constructor() {
        console.log(this.logKey);
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
            if (!oldTrace) {
                localStorage.setItem(this.logKey, JSON.stringify(saveLog));
            }
            else {
                const newTrace = JSON.parse(oldTrace).concat(saveLog);
                localStorage.setItem(this.logKey, JSON.stringify(newTrace));
            }
            const trace = JSON.parse(localStorage.getItem(this.logKey) ?? '');
            if (trace.length > this.maxLogLocalStorage) {
                trace.splice(0, trace.length - this.maxLogLocalStorage);
                localStorage.setItem(this.logKey, JSON.stringify(trace));
            }
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
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.DEBUG || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
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
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.INFO || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
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
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.LOG || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
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
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.WARN || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
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
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.ERROR || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
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