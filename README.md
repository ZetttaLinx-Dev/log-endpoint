# min-logger

## 概要
- ゼッタリンクスプロジェクトのためのフロントエンドロギングツールです。
```Typescript
import { Logger } from 'min-logger'
const logger = new Logger();

logger.log('This is','how to use', 'min-logger')

```
- SesssionStorageにログデータを収集し、設定値に応じてLocalStorageに残す。またはエンドポイントにポストすることができます。
