import './dotenv'
import path from 'path'
import fs from 'fs'

const debug = require('debug')('lgou2w:nhentai-tags')

const assetsDir = path.resolve(__dirname, '..', 'assets')
const buildDir = path.resolve(__dirname, '..', 'build')
fs.existsSync(assetsDir) || fs.mkdirSync(assetsDir)
fs.existsSync(buildDir) || fs.mkdirSync(buildDir)

const dataFile = path.resolve(assetsDir, 'nhentai-tags.json')
if (!fs.existsSync(dataFile)) {
  console.error(new Error('未找到导出的数据文件：' + dataFile))
  process.exit(1)
}

type GeneratedTag = {
  id: number
  text: string
  count: number
}

;(() => {
  debug(':read package.json')
  const pkgFile = path.resolve(__dirname, '..', 'package.json')
  const { version } = JSON.parse(fs.readFileSync(pkgFile, { encoding: 'utf-8' }))
  debug(':read data')
  const outFile = path.resolve(buildDir, 'index.ts')
  const data = JSON.parse(fs.readFileSync(dataFile, { encoding: 'utf-8' })) as Record<string, string>

  const tags: Record<string, GeneratedTag> = require('../assets/generated.tags').default
  const parodies: Record<string, GeneratedTag> = require('../assets/generated.parodies').default
  const characters: Record<string, GeneratedTag>  = require('../assets/generated.characters').default

  const transform = function (category: string, target: Record<string, GeneratedTag>) {
    debug(':transform category:', category)
    const result: string[] = []
    const start = Date.now()
    let total = 0, transformed = 0
    for (const k in target) {
      const tag = target[k]
      const finished = tag ? data[tag.id] : undefined
      if (finished) {
        const quotesKey = k.includes('-') || k.includes(' ') || k.includes('.') || !isNaN(parseInt(k.charAt(0)))
        const key = quotesKey ? `'${k}'` : k
        const safelyFinished = finished.indexOf('\'') !== -1 ? finished.replace(/'/g, '\\\'') : finished
        const val = `{ id: ${tag.id}, text: '${safelyFinished}' }`
        result.push(`${key}: ${val}`)
        transformed++
      }
      total++
    }
    const time = Date.now() - start
    debug(':transformed', time + 'ms')
    debug('  total:', total)
    debug('  finished:', transformed)
    return result
  }

  const rTags = transform('tags', tags)
  const rParodies = transform('parodies', parodies)
  const rCharacters = transform('characters', characters)

  const date = new Date().toISOString()
  const code = `/*
 * Built by https://github.com/l2studio/nhentai-tags and lgou2w's on ${date}
 */

export type Namespace = 'tags' | 'parodies' | 'characters' | 'languages' | 'categories'
export type Entry = { id: number, text: string }
export type EntryWithNamespace = Entry & { namespace: Namespace }

export type TagsTable = {
  tags: Record<string, Entry | undefined>
  parodies: Record<string, Entry | undefined>
  characters: Record<string, Entry | undefined>
  languages: Record<string, Entry | undefined>
  categories: Record<string, Entry | undefined>
  resolve (name: string): EntryWithNamespace[] | undefined
}

const tagsTable: TagsTable = {
  tags: {
    ${rTags.join(',\n    ')}
  },
  parodies: {
    ${rParodies.join(',\n    ')}
  },
  characters: {
    ${rCharacters.join(',\n    ')}
  },
  languages: {
    chinese: { id: 29963, text: '中文' },
    english: { id: 12227, text: '英文' },
    japanese: { id: 6346, text: '日文' },
    rewrite: { id: 33252, text: '重写' },
    speechless: { id: 33680, text: '无言' },
    'text-cleaned': { id: 33705, text: '文字清除' },
    translated: { id: 17249, text: '已翻译' }
  },
  categories: {
    artistcg: { id: 36320, text: '画师CG' },
    doujinshi: { id: 33172, text: '同人志' },
    imageset: { id: 34191, text: '图片集' },
    manga: { id: 33173, text: '漫画' },
    misc: { id: 97152, text: '其他' },
    'non-h': { id: 34065, text: '无H' },
    western: { id: 34125, text: '西方' }
  },
  resolve (name: string): EntryWithNamespace[] | undefined {
    const result: EntryWithNamespace[] = []
    const tag = this.tags[name]
    const parody = this.parodies[name]
    const character = this.characters[name]
    const language = this.languages[name]
    const category = this.categories[name]
    tag && (result.push({ ...tag, namespace: 'tags' }))
    parody && (result.push({ ...parody, namespace: 'parodies' }))
    character && (result.push({ ...character, namespace: 'characters' }))
    language && (result.push({ ...language, namespace: 'languages' }))
    category && (result.push({ ...category, namespace: 'categories' }))
    return result.length > 0 ? result : undefined
  }
}

export const version = '${version}'
export const date = new Date('${date}')

export default tagsTable
`
  fs.writeFileSync(outFile, code)
  debug('done')
})()
