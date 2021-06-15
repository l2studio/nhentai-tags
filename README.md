# L2 Studio - NHentai Tags

<p>
<a href="https://www.npmjs.com/package/@l2studio/nhentai-tags"><img src="https://img.shields.io/npm/v/@l2studio/nhentai-tags?logo=npm&style=flat-square"/></a>
</p>

A tags chinese database of nhentai.net

## Install

```shell
npm install --save @l2studio/nhentai-tags
# or
pnpm i @l2studio/nhentai-tags
```

## API

```typescript
import tags, { version, date } from '@l2studio/nhentai-tags'

console.log(version) // 版本号
console.log(date)    // 构建日期

type Tag = { id: number, text: string } // 标签类型

typeof tags: Record<string, Tag | undefined> // 标签记录表类型

console.log(tags['full color'].text) // 全彩
console.log(tags['uncensored'].text) // 无修正

console.log(tags['未存在的标签名']) // undefined
```

## References

[`/assets/nhentai-tags.json`](./assets/nhentai-tags.json)

CC BY-SA 3.0

* Google
* Wikipedia

## License

Apache-2.0
