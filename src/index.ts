const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  LOG: 2,
  WARN: 3,
  ERROR: 4,
  NONE:100,
} as const;
type LOG_LEVEL = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];

const DEBUG_OUTPUT = {
  CONSOLE: "CONSOLE",
  ENDPOINT: "ENDPOINT",
} as const;
type DEBUG_OUTPUT = typeof DEBUG_OUTPUT[keyof typeof DEBUG_OUTPUT];

function defineConfig(config: UserConfig){
  return config;
}

export { MinLogger, LOG_LEVEL, DEBUG_OUTPUT, defineConfig };
class MinLogger {
  private endpointUrl =  '';
  private logKey = 'log';
  private outputLocalStorageLevel: number = LOG_LEVEL.WARN;
  private outputEndpointLevel: number = LOG_LEVEL.ERROR;
  private maxLogLocalStorage: number = 300;
  private unhandledErrorLevel: number = LOG_LEVEL.WARN;
  private debugOutput = sessionStorage.getItem('min-logger-debug-flag');

  public constructor() {
    try{
      const userConfig: UserConfig = require(process.env.BASE_URL + 'min-logger.config');
      this.endpointUrl = userConfig.endpointUrl ?? this.endpointUrl;
      this.logKey = userConfig.logKey ?? this.logKey;
      this.outputLocalStorageLevel = userConfig.outputLocalStorageLevel ?? this.outputLocalStorageLevel;
      this.outputEndpointLevel = userConfig.outputEndpointLevel ?? this.outputEndpointLevel;
      this.unhandledErrorLevel = userConfig.unhandledErrorLevel ?? this.unhandledErrorLevel;
      this.maxLogLocalStorage = userConfig.maxLogLocalStorage ?? this.maxLogLocalStorage;
    }catch{
      // 規定値の使用
    }
    // 未処理の例外をキャッチする
    window.addEventListener('error',(event: ErrorEvent)=>{
      this.storeSession(this.unhandledErrorLevel, new Date(),  `${event.type}: ${event.message}`)
    })
    // localStorageに格納する
    window.addEventListener('beforeunload', () => {
      const sessionLog = sessionStorage.getItem(this.logKey);
      if (sessionLog === null) {
          return;
      }
      const log = JSON.parse(sessionLog);
      const saveLog = log.filter((trace:any) => {
          return this.outputLocalStorageLevel <= trace.level;
      });
      if (saveLog.length === 0) {
          return;
      }
      const oldTrace = localStorage.getItem(this.logKey) ?? false;
      let trace :[];
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
  private storeSession(level: number, date: Date, ...args: [...any]){
    const oldTrace = sessionStorage.getItem(this.logKey) ?? false;
    if(!oldTrace){
      const trace = [{ date: date, level: level, details: [...args] }]
      sessionStorage.setItem(this.logKey, JSON.stringify(trace));
    }else{
      const trace = JSON.parse(oldTrace);
      trace.push({ date: date, level: level, details: [...args] })
      sessionStorage.setItem(this.logKey, JSON.stringify(trace));
    }
  };

  public setEndpointUrl(path: string){
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
    if (this.endpointUrl !== '' &&  this.outputEndpointLevel <= LOG_LEVEL.DEBUG || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
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
    if (this.endpointUrl !== '' &&  this.outputEndpointLevel <= LOG_LEVEL.INFO || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
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
    if (this.endpointUrl !== '' &&  this.outputEndpointLevel <= LOG_LEVEL.LOG || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
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
    if (this.endpointUrl !== '' &&  this.outputEndpointLevel <= LOG_LEVEL.WARN || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
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
    if (this.endpointUrl !== '' &&  this.outputEndpointLevel <= LOG_LEVEL.ERROR || this.debugOutput === DEBUG_OUTPUT.ENDPOINT) {
      const body = JSON.stringify({ date, level: LOG_LEVEL.ERROR, details: [...args] });
      fetch(this.endpointUrl, { body });
    }
  };

  public send(url?:string){
    const local = localStorage.getItem(this.logKey) ?? '';
    const session = sessionStorage.getItem(this.logKey) ?? '';
    const trace = JSON.parse(local).concat(JSON.parse(session));
    const body = JSON.stringify(trace);
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