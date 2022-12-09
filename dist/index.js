"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LOG_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    LOG: 2,
    WARN: 3,
    ERROR: 4,
};
class Logger {
    endpointUrl = process.env.npm_package_config_logger_endpointUrl ?? '';
    logKey = process.env.npm_package_config_logger_logKey ?? 'log';
    outputLocalStorageLevel = process.env.npm_package_config_logger_outputLocal ?? 'WARN';
    outputEndpointLevel = process.env.npm_package_config_logger_outputEndpoint ?? 'ERROR';
    constructor() {
        window.addEventListener('unload', () => {
            const sessionLog = sessionStorage.getItem(this.logKey);
            if (sessionLog) {
                const log = JSON.parse(sessionLog);
                const saveLog = log.filter((trace) => {
                    return this.findValueByPrefix(LOG_LEVEL, this.outputLocalStorageLevel) < trace.level;
                });
                if (saveLog.length > 0) {
                    const hasOld = localStorage.getItem(this.logKey) ?? false;
                    const newTrace = [];
                    if (hasOld) {
                        newTrace.concat(JSON.parse(localStorage.getItem(this.logKey) ?? ''));
                    }
                    newTrace.concat(saveLog);
                    localStorage.setItem(this.logKey, JSON.stringify(newTrace));
                }
            }
        });
    }
    storeSession = (level, date, ...args) => {
        const hasOld = sessionStorage.getItem(this.logKey) ?? false;
        const newTrace = [];
        if (hasOld) {
            newTrace.concat(JSON.parse(sessionStorage.getItem(this.logKey) ?? ''));
        }
        newTrace.push({ date: date, level: level, details: [...args] });
        sessionStorage.setItem(this.logKey, JSON.stringify(newTrace));
    };
    findValueByPrefix = (object, prefix) => {
        for (const property in object) {
            if (Object.prototype.hasOwnProperty.call(object, property) &&
                property.toString().startsWith(prefix)) {
                return object[property];
            }
        }
    };
    setEndPointUrl = (path) => {
        this.endpointUrl = path;
    };
    debug = (...args) => {
        console.info([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.INFO, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.DEBUG) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    };
    info = (...args) => {
        console.info([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.INFO, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.INFO) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    };
    log = (...args) => {
        console.log([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.LOG, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.LOG) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    };
    warn = (...args) => {
        console.log([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.WARN, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.WARN) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    };
    error = (...args) => {
        console.error([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.ERROR, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.ERROR) {
            const date = new Date();
            const body = JSON.stringify({ date: date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(this.endpointUrl, { body });
        }
    };
    send = (url) => {
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
    };
}
exports.default = new Logger();
