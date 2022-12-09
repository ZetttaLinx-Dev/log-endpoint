declare class Logger {
    private endpointUrl;
    private logKey;
    private outputLocalStorageLevel;
    private outputEndpointLevel;
    constructor();
    private storeSession;
    private findValueByPrefix;
    setEndPointUrl: (path: string) => void;
    debug: (...args: [...any]) => void;
    info: (...args: [...any]) => void;
    log: (...args: [...any]) => void;
    warn: (...args: [...any]) => void;
    error: (...args: [...any]) => void;
    send: (url?: string) => void;
}
declare const _default: Logger;
export default _default;
