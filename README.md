# min-logger

## 概要

- ゼッタリンクスのフロントエンドプロジェクトのためのロギングツールです。

```Typescript
import { MinLogger } from 'min-logger'
const logger = new MinLogger();
logger.log('This is','how to use', 'min-logger')
```

- SesssionStorage にログデータを収集し、設定値に応じて LocalStorage に残す、またはエンドポイントへ送信することができます。ログデータの SessionStorage から LocalStorage への移動は'unload'イベントにフックされています。

# インストール

```
npm i git+https://github.com/ter4uchi/min-logger.git
// or
yarn add git+https://github.com/ter4uchi/min-logger.git
```

# 使い方

- debug, info, log, warn, error の 5 つのログレベルの設定が可能です。

```Typescript
import { MinLogger } from 'min-logger'
const minLogger = new MinLogger();
minLogger.debug('debug')
minLogger.info('info')
minLogger.log('log')
minLogger.warn('warn')
minLogger.error('error')
```

- StorageAPI 内に保存してあるログをユーザー操作により指定したエンドポイントへ送信可能です。

```Typescript
import { MinLogger } from 'min-logger'
const minLogger = new MinLogger();
minLogger.send();
// 実行後window.alert()「ログを送信しました」or「ログの送信に失敗しました」というメッセージが表示されます。
// 引数に特定のURLを指定するとことによって設定値以外のエンドポイントに送信することもできます。
```

- 一時的に全てのログを console に出力、もしくはエンドポイント URL に送信できます。

```Typescript
import { MinLogger, DEBUG_OUTPUT } from 'min-logger'
const minLogger = new MinLogger();
minLogger.debugOn(DEBUG_OUTPUT.CONSOLE); //引数にDEBUG_OUTPUT.CONSOLE or DEBUG_OUTPUT.ENDPOINTを指定できます。
```

- プロジェクトのルートディレクトリに`min-logger.config.js`を配置することにより以下の config を設定可能です。

```Typescript
const { defineConfig, LOG_LEVEL } = require('min-logger');
module.exports = defineConfig({
  endpointUrl: '',//ポストするエンドポイントのURLを指定します。規定値は空です。
  logKey: 'log', // StorageAPIに格納する際のkeyを指定します。規定値は'log'です。
  outputLocalStorageLevel: LOG_LEVEL.WARN, // localStorageに格納するログレベルを指定します。LOG_LEVEL.DEBUG ~ LOG_LEVEL.ERRORが指定可能です。規定値はLOG_LEVEL.WARNです。
  outputEndpointLevel: LOG_LEVEL.ERROR, // エンドポイントに出力するログレベルを指定します。LOG_LEVEL.DEBUG ~ LOG_LEVEL.ERRORが指定可能です。規定値はLOG_LEVEL.ERRORです。
  maxLogLocalStorage: 300 // localStorageに格納する最大数を指定します。整数値を指定可能です。規定値は300です。
});

```

- ログは下記のオブジェクトで出力されます。StorageAPI にはこのオブジェクトが配列で格納されます。

```js
{
  date: "2022-12-09T11:11:23.745Z",// 日付
  level: 3,// ログレベルと対応しています。下を参照
  details: [[]] //引数が二次元配列で格納されます。
}
```

```js
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  LOG: 2,
  WARN: 3,
  ERROR: 4,
};
```
