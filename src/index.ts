const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  LOG: 2,
  WARN: 3,
  ERROR: 4,
} as const;
type LOG_LEVEL = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];

const DEBUG_OUTPUT = {
  CONSOLE: "CONSOLE",
  ENDPOINT: "ENDPOINT",
} as const;
type DEBUG_OUTPUT = typeof DEBUG_OUTPUT[keyof typeof DEBUG_OUTPUT];

class Logger {
  private endpointUrl = process.env.npm_package_config_logger_endpointUrl ?? '';
  private logKey = process.env.npm_package_config_logger_logKey ?? 'log';
  private outputLocalStorageLevel: string = process.env.npm_package_config_logger_outputLocal ?? 'WARN';
  private outputEndpointLevel: string = process.env.npm_package_config_logger_outputEndpoint ?? 'ERROR';
  private maxLogLocalStorage: number = Number(process.env.npm_package_config_logger_maxLogLocalStorage) ?? 1000; 
  private debugOutput = sessionStorage.getItem('min-logger-debug-flag');

  public constructor() {
    window.addEventListener('unload', () => {
      const sessionLog = sessionStorage.getItem(this.logKey);
      if (sessionLog) {
        const log = JSON.parse(sessionLog);
        const saveLog = log.filter((trace: any) => {
          return this.findValueByPrefix(LOG_LEVEL, this.outputLocalStorageLevel) < trace.level;
        });
        if (saveLog.length > 0) {
          const hasOld = localStorage.getItem(this.logKey) ?? false;
          const newTrace: any[] = [];
          if (hasOld) {
            newTrace.concat(JSON.parse(localStorage.getItem(this.logKey) ?? ''));
          }
          newTrace.concat(saveLog);
          if(newTrace.length > this.maxLogLocalStorage){
            newTrace.splice(0, newTrace.length - this.maxLogLocalStorage);
          }
          localStorage.setItem(this.logKey, JSON.stringify(newTrace));
        }
      }
    });
  }
  private storeSession(level: number, date: Date, ...args: [...any]){
    const hasOld = sessionStorage.getItem(this.logKey) ?? false;
    const newTrace: any = [];
    if (hasOld) {
      newTrace.concat(JSON.parse(sessionStorage.getItem(this.logKey) ?? ''));
    }
    newTrace.push({ date: date, level: level, details: [...args] });
    sessionStorage.setItem(this.logKey, JSON.stringify(newTrace));
  };
  private findValueByPrefix(object: any, prefix: any){
    for (const property in object) {
      if (
        Object.prototype.hasOwnProperty.call(object, property) &&
        property.toString().startsWith(prefix)
      ) {
        return object[property];
      }
    }
  };

  public setEndPointUrl(path: string){
    this.endpointUrl = path;
  }

  public onDebug(outout: DEBUG_OUTPUT){
    this.debugOutput = outout;
  }

  public debug(...args: [...any]){
    const date = new Date();
    this.storeSession(LOG_LEVEL.DEBUG, date, [...args]);
    if(this.debugOutput === DEBUG_OUTPUT.CONSOLE){
      console.info([...args]);
    } 
    if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.DEBUG || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.DEBUG, details: [...args] });
      fetch(this.endpointUrl, { body });
    }
  };

  public info(...args: [...any]){
    const date = new Date();
    this.storeSession(LOG_LEVEL.INFO, date, [...args]);
    if(this.debugOutput === DEBUG_OUTPUT.CONSOLE){
      console.info([...args]);
    } 
    if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.INFO || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.INFO, details: [...args] });
      fetch(this.endpointUrl, { body });
    }
  };

  public log(...args: [...any]){
    const date = new Date();
    this.storeSession(LOG_LEVEL.LOG, date, [...args]);
    if(this.debugOutput === DEBUG_OUTPUT.CONSOLE){
      console.log([...args]);
    } 
    if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.LOG || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.LOG, details: [...args] });
      fetch(this.endpointUrl, { body });
    }
  };

  public warn(...args: [...any]){
    const date = new Date();
    this.storeSession(LOG_LEVEL.WARN, date, [...args]);
    if(this.debugOutput === DEBUG_OUTPUT.CONSOLE){
      console.warn([...args]);
    } 
    if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.WARN || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.WARN, details: [...args] });
      fetch(this.endpointUrl, { body });
    }
  };

  public error(...args: [...any]){
    const date = new Date();
    this.storeSession(LOG_LEVEL.ERROR, date, [...args]);
    if(this.debugOutput === DEBUG_OUTPUT.CONSOLE){
      console.error([...args]);
    } 
    if (this.findValueByPrefix(LOG_LEVEL, this.outputEndpointLevel) <= LOG_LEVEL.ERROR || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
      fetch(this.endpointUrl, { body });
    }
  };

  public send(url?:string){
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

export const logger = (): Logger =>{
  return new Logger();
}