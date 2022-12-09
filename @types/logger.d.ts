declare class Logger {
  constructor();
  setEndPointUrl(path: string): void;
  onDebug(outout: number): void;
  debug(...args: [...any]): void;
  info(...args: [...any]): void;
  log(...args: [...any]): void;
  warn(...args: [...any]): void;
  error(...args: [...any]): void;
  send(url?: string): void;
}