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
    static _logger;
    static endpointUrl = process.env.npm_package_config_logger_endpointUrl ?? '';
    static logKey = process.env.npm_package_config_logger_logKey ?? 'log';
    static outputLocalStorageLevel = process.env.npm_package_config_logger_outputLocal ?? 'WARN';
    static outputEndpointLevel = process.env.npm_package_config_logger_outputEndpoint ?? 'ERROR';
    static get getLogger() {
        if (!this._logger) {
            this._logger = new Logger();
        }
        return this._logger;
    }
    constructor() {
        window.addEventListener('unload', () => {
            const sessionLog = sessionStorage.getItem(Logger.logKey);
            if (sessionLog) {
                const log = JSON.parse(sessionLog);
                const saveLog = log.filter((trace) => {
                    return Logger.findValueByPrefix(LOG_LEVEL, Logger.outputLocalStorageLevel) < trace.level;
                });
                if (saveLog.length > 0) {
                    const hasOld = localStorage.getItem(Logger.logKey) ?? false;
                    const newTrace = [];
                    if (hasOld) {
                        newTrace.concat(JSON.parse(localStorage.getItem(Logger.logKey) ?? ''));
                    }
                    newTrace.concat(saveLog);
                    localStorage.setItem(Logger.logKey, JSON.stringify(newTrace));
                }
            }
        });
    }
    static storeSession = (level, date, ...args) => {
        const hasOld = sessionStorage.getItem(Logger.logKey) ?? false;
        const newTrace = [];
        if (hasOld) {
            newTrace.concat(JSON.parse(sessionStorage.getItem(Logger.logKey) ?? ''));
        }
        newTrace.push({ date: date, level: level, details: [...args] });
        sessionStorage.setItem(Logger.logKey, JSON.stringify(newTrace));
    };
    static findValueByPrefix = (object, prefix) => {
        for (const property in object) {
            if (Object.prototype.hasOwnProperty.call(object, property) &&
                property.toString().startsWith(prefix)) {
                return object[property];
            }
        }
    };
    static setEndPointUrl = (path) => {
        Logger.endpointUrl = path;
    };
    static debug = (...args) => {
        console.info([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.INFO, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.DEBUG) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(Logger.endpointUrl, { body });
        }
    };
    static info = (...args) => {
        console.info([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.INFO, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.INFO) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(Logger.endpointUrl, { body });
        }
    };
    static log = (...args) => {
        console.log([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.LOG, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.LOG) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(Logger.endpointUrl, { body });
        }
    };
    static warn = (...args) => {
        console.log([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.WARN, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.WARN) {
            const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(Logger.endpointUrl, { body });
        }
    };
    static error = (...args) => {
        console.error([...args]);
        const date = new Date();
        this.storeSession(LOG_LEVEL.ERROR, date, [...args]);
        if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.ERROR) {
            const date = new Date();
            const body = JSON.stringify({ date: date, level: LOG_LEVEL.ERROR, details: [...args] });
            fetch(Logger.endpointUrl, { body });
        }
    };
    static send = (url) => {
        const body = localStorage.getItem(Logger.logKey) ?? '';
        fetch(url ?? Logger.endpointUrl, {
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
exports.default = Logger;
