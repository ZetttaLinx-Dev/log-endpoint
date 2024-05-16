# min-logger

## 概要

- ゼッタリンクスのフロントエンドプロジェクトのためのロギングツール

```Typescript
import { MinLogger } from 'min-logger'
const minLogger = new MinLogger();
minLogger.log('This is','how to use', 'min-logger')
```

- SesssionStorage にログデータを収集し、設定値に応じて LocalStorage に残す、またはエンドポイントへ送信することができます。ログデータの SessionStorage から LocalStorage への移動は'beforeunload'イベントにフックしている
- SessionStotage には通常保存しておくことはしない/してはいけない（GAS 経由で吸い上げたドキュメントの内容など）が、エラー解析の際に必要となるデータを格納

# インストール

```
npm i git+https://github.com/ZetttaLinx-Dev/log-endpoint
// or
yarn add git+https://github.com/ZetttaLinx-Dev/log-endpoint
```

# 使い方

- debug, info, log, warn, error の 5 つのログレベルの設定が可能

```Typescript
import { MinLogger } from 'min-logger'
const minLogger = new MinLogger();
minLogger.debug('debug')
minLogger.info('info')
minLogger.log('log')
minLogger.warn('warn')
minLogger.error('error')
```

- StorageAPI 内に保存してあるログをユーザー操作により指定したエンドポイントへ送信可能

```Typescript
import { MinLogger } from 'min-logger'
const minLogger = new MinLogger();
minLogger.send();
// 実行後window.alert()「ログを送信しました」or「ログの送信に失敗しました」というメッセージが表示されます。
// 引数に特定のURLを指定するとことによって設定値以外のエンドポイントに送信することもできます。
```

- 一時的に全てのログを console に出力、もしくはエンドポイント URL に送信できる

```Typescript
import { MinLogger, DEBUG_OUTPUT } from 'min-logger'
const minLogger = new MinLogger();
minLogger.onDebug(DEBUG_OUTPUT.CONSOLE); //引数にDEBUG_OUTPUT.CONSOLE or DEBUG_OUTPUT.ENDPOINTを指定できます。
```

- ログは下記のオブジェクトで出力されます。StorageAPI にはこのオブジェクトが配列で格納される

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

# 設定

- ~~プロジェクトのルートディレクトリに`min-logger.config.js`を配置することにより以下の config を設定可能~~
- 初期化時に設定値を注入可能

```Typescript
const minLogger = new MinLogger({
  endpointUrl: '',//ポストするエンドポイントのURLを指定します。規定値は空
  logKey: 'log', // StorageAPIに格納する際のkeyを指定します。規定値は'log'
  outputLocalStorageLevel: LOG_LEVEL.WARN, // localStorageに格納するログレベルを指定します。LOG_LEVEL.DEBUG ~ LOG_LEVEL.ERRORが指定可能規定値はLOG_LEVEL.WARN
  outputEndpointLevel: LOG_LEVEL.ERROR, // エンドポイントに出力するログレベルを指定します。LOG_LEVEL.DEBUG ~ LOG_LEVEL.ERRORが指定可能規定値はLOG_LEVEL.ERROR
  maxLogLocalStorage: 300 // localStorageに格納する最大数を指定します。整数値を指定可能規定値は300
});
```

- 外部から設定値を持ってくる際は`injectConfig()`を使用する。

```Typescript
const minLogger = new MinLogger();
minLogger.injectConfig("https://hogehoge.json")
//type:UserConfigと一致すること
```
