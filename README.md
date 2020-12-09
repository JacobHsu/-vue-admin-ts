# vue-admin-ts

vue-element-admin [guide](https://panjiachen.github.io/vue-element-admin-site/zh/guide/)
Typescript 版: [vue-typescript-admin-template](https://github.com/Armour/vue-typescript-admin-template)

## setting

mock-server.ts

```js
const app = express()
const port = 9528
```

vue.config.js

```js
const devServerPort = 9527 // TODO: get this variable from setting.ts
const mockServerPort = 9528 // TODO: get this variable from setting.ts
```

## mock

package.json

```js
  "scripts": {
    "mock": "cd mock && ts-node-dev mock-server.ts"
  },
```

yarn mock

http://localhost:9528/mock-api/v1/articles

## add mock data

add mock\swagger.yml   src\api\yourapi.ts match
add src\api\types.d.ts

views\permission\role.vue

```js
interface IRole {
  key: number
  name: string
  description: string
  routes: RouteConfig[]
}
```

src\api\types.d.ts

```js
export interface IRoleData {
  key: string
  name: string
  description: string
  routes: any
}
```

## mock api

mock\account\index.ts

```js
export const getAccounts = (req: Request, res: Response) => {
  return res.json({
    code: 20000,
    data: {
      total: account.length,
      items: account
    }
  })
}
```

src\api\accounts.ts

```js
import request from '@/utils/request'

export const getAccounts = (params: any) =>
  request({
    url: '/accounts',
    method: 'get',
    params
  })
```

## vue cli

```js
  "dependencies": {
    "core-js": "^2.6.5",
    "vue": "^2.6.10",
    "vue-class-component": "^7.0.2",
    "vue-property-decorator": "^8.1.0",
    "vue-router": "^3.0.3",
    "vuex": "^3.0.1"
  },
```

## typescript

`vue-class-component` 是一個 Class Decorator,也就是類的裝飾器
`vue-property-decorator` 是基於 vue 組織裡 vue-class-component 所做的拓展
`vuex-module-decorators`: 用 typescript 寫 vuex 很好用的一個庫

## vue.config.js

style-resources-loader

## filters

main.ts

```js
import * as filters from '@/filters'
```

filters\index.ts

```js
export { parseTime } from '@/utils'
```

utils\index.ts

```js
export const parseTime = (
  time?: object | string | number | null,
  cFormat?: string
): string | null => {
```

views\table\draggable-table.vue

```js
<template slot-scope="{row}">
  <span>{{ row.timestamp | parseTime }}</span>
</template>
```

## axios debug

> xxx does not exist on type ‘AxiosResponse’.Vetur

[【ts】vue-typescript-admin类型报错](https://blog.csdn.net/ann295258232/article/details/106342977)

.新建axios.d.ts文件，如在该目录： src/types/axios/axios.d.ts
axios.d.ts文件内容

src\types\axios.d.ts

```js
import * as axios from 'axios'

declare module 'axios' {
  interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<any>
  }
}
```

修改项目第一层目录下的tsconfig.json配置文件

tsconfig.json

```js
  "typeRoots": [
    "./node_modules/@types",
    "./src/types/",
  ]
```

## auth

permission.ts

```js
import { UserModule } from '@/store/modules/user'
await UserModule.GetUserInfo()
```

store\modules\user.ts

```js
import { login, logout, getUserInfo } from '@/api/users'
const { data } = await getUserInfo
```

api\users.ts

```js
export const getUserInfo = (data: any) =>
  request({
    url: '/users/info',
    method: 'post',
    data
  })
```
res "data":{"user":{"id":0,"username":"admin","password" ...


## References

[手摸手，帶你用vue擼後臺 系列五(v4.0新版本)](https://www.mdeditor.tw/pl/23F5/zh-tw)