const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  LOG: 2,
  WARN: 3,
  ERROR: 4,
} as const;
type LOG_LEVEL = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];

export default class Logger {
  private static _logger: Logger;
  private static endpointUrl = process.env.npm_package_config_logger_endpointUrl ?? '';
  private static logKey = process.env.npm_package_config_logger_logKey ?? 'log';
  private static outputLocalStorageLevel: string = process.env.npm_package_config_logger_outputLocal ?? 'WARN';
  private static outputEndpointLevel: string = process.env.npm_package_config_logger_outputEndpoint ?? 'ERROR';

  public static useLogger(): Logger {
    if (!this._logger) {
      this._logger = new Logger();
    }
    return this._logger;
  }

  private constructor() {
    window.addEventListener('unload', () => {
      const sessionLog = sessionStorage.getItem(Logger.logKey);
      if (sessionLog) {
        const log = JSON.parse(sessionLog);
        const saveLog = log.filter((trace: any) => {
          return Logger.findValueByPrefix(LOG_LEVEL, Logger.outputLocalStorageLevel) < trace.level;
        });
        if (saveLog.length > 0) {
          const hasOld = localStorage.getItem(Logger.logKey) ?? false;
          const newTrace: any = [];
          if (hasOld) {
            newTrace.concat(JSON.parse(localStorage.getItem(Logger.logKey) ?? ''));
          }
          newTrace.concat(saveLog);
          localStorage.setItem(Logger.logKey, JSON.stringify(newTrace));
        }
      }
    });
  }
  private static storeSession = (level: number, date: Date, ...args: [...any]) => {
    const hasOld = sessionStorage.getItem(Logger.logKey) ?? false;
    const newTrace: any = [];
    if (hasOld) {
      newTrace.concat(JSON.parse(sessionStorage.getItem(Logger.logKey) ?? ''));
    }
    newTrace.push({ date: date, level: level, details: [...args] });
    sessionStorage.setItem(Logger.logKey, JSON.stringify(newTrace));
  };
  private static findValueByPrefix = (object: any, prefix: any) => {
    for (const property in object) {
      if (
        Object.prototype.hasOwnProperty.call(object, property) &&
        property.toString().startsWith(prefix)
      ) {
        return object[property];
      }
    }
  };

  static setEndPointUrl = (path: string) =>{
    Logger.endpointUrl = path;
  }

  static debug = (...args: [...any]) => {
    console.info([...args]);
    const date = new Date();
    this.storeSession(LOG_LEVEL.INFO, date, [...args]);
    if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.DEBUG) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
      fetch(Logger.endpointUrl, { body });
    }
  };

  static info = (...args: [...any]) => {
    console.info([...args]);
    const date = new Date();
    this.storeSession(LOG_LEVEL.INFO, date, [...args]);
    if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.INFO) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
      fetch(Logger.endpointUrl, { body });
    }
  };

  static log = (...args: [...any]) => {
    console.log([...args]);
    const date = new Date();
    this.storeSession(LOG_LEVEL.LOG, date, [...args]);
    if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.LOG) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
      fetch(Logger.endpointUrl, { body });
    }
  };

  static warn = (...args: [...any]) => {
    console.log([...args]);
    const date = new Date();
    this.storeSession(LOG_LEVEL.WARN, date, [...args]);
    if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.WARN) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
      fetch(Logger.endpointUrl, { body });
    }
  };

  static error = (...args: [...any]) => {
    console.error([...args]);
    const date = new Date();
    this.storeSession(LOG_LEVEL.ERROR, date, [...args]);
    if (this.findValueByPrefix(LOG_LEVEL, Logger.outputEndpointLevel) <= LOG_LEVEL.ERROR) {
      const date = new Date();
      const body = JSON.stringify({ date: date, level: LOG_LEVEL.ERROR, details: [...args] });
      fetch(Logger.endpointUrl, { body });
    }
  };

  static send = (url?:string) => {
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