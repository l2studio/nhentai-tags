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
import tagsTable, { version, date } from '@l2studio/nhentai-tags'

console.log(version) // 版本号
console.log(date)    // 构建日期

type Namespace = 'tags' | 'parodies' | 'characters' | 'languages' | 'categories' // 命名空间
type Entry = { id: number, text: string }                  // 条目
type EntryWithNamespace = Entry & { namespace: Namespace } // 带命名空间的条目

// 标签记录表类型
type TagsTable = {
  tags: Record<string, Entry | undefined>                  // 所有标签的条目
  parodies: Record<string, Entry | undefined>              // 所有作品的条目
  characters: Record<string, Entry | undefined>            // 所有角色的条目
  languages: Record<string, Entry | undefined>             // 所有语言的条目
  categories: Record<string, Entry | undefined>            // 所有分类的条目
  resolve (name: string): EntryWithNamespace[] | undefined // 从给定名查找所有匹配的条目
}

console.log(tagsTable.tags['full color'].text) // 全彩
console.log(tagsTable.tags['uncensored'].text) // 无修正
console.log(tagsTable.tags['未存在的标签名']) // undefined

console.log(tagsTable.resolve('nijisanji')) // 包含多个分类的标签
```

## References

[`/assets/nhentai-tags.json`](./assets/nhentai-tags.json)

CC BY-SA 3.0

* Google
* Wikipedia

## Translation

翻译进度:

* tags: `~90%`
  * 大部分标签
  * 忽略画师名或自建标签
* parodies: `~50%`
  * 本数量大于 10 的
* characters: `~20%`
  * 本数量大于 100 的

## License

Apache-2.0
