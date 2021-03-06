import './dotenv'
import path from 'path'
import fs from 'fs'

const debug = require('debug')('lgou2w:nhentai-tags')

const assetsDir = path.resolve(__dirname, '..', 'assets')
const buildDir = path.resolve(__dirname, '..', 'build')
fs.existsSync(assetsDir) || fs.mkdirSync(assetsDir)
fs.existsSync(buildDir) || fs.mkdirSync(buildDir)

let dataFile = path.resolve(assetsDir, 'nhentai-tags.json')
if (!fs.existsSync(dataFile)) {
  console.error(new Error('未找到导出的数据文件：' + dataFile))
  process.exit(1)
}
if (fs.existsSync(path.resolve(buildDir, 'nhentai-tags.json'))) {
  dataFile = path.resolve(buildDir, 'nhentai-tags.json')
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
  const artists: Record<string, GeneratedTag> = require('../assets/generated.artists').default
  const parodies: Record<string, GeneratedTag> = require('../assets/generated.parodies').default
  const characters: Record<string, GeneratedTag>  = require('../assets/generated.characters').default
  const groups: Record<string, GeneratedTag> = require('../assets/generated.groups').default

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
  const rArtists = transform('artists', artists)
  const rParodies = transform('parodies', parodies)
  const rCharacters = transform('characters', characters)
  const rGroups = transform('groups', groups)

  const date = new Date().toISOString()
  const code = `/*
 * Built by https://github.com/l2studio/nhentai-tags and lgou2w's on ${date}
 */

export type Namespace = 'tags' | 'artists' | 'parodies' | 'characters' | 'groups' | 'languages' | 'categories'
export type Entry = { id: number, text: string }
export type EntryWithNamespace = Entry & { namespace: Namespace }

export type TagsTable = {
  tags: Record<string, Entry | undefined>
  artists: Record<string, Entry | undefined>
  parodies: Record<string, Entry | undefined>
  characters: Record<string, Entry | undefined>
  groups: Record<string, Entry | undefined>
  languages: Record<string, Entry | undefined>
  categories: Record<string, Entry | undefined>
  resolve (name: string): EntryWithNamespace[] | undefined
}

const tagsTable: TagsTable = {
  tags: {
    ${rTags.join(',\n    ')}
  },
  artists: {
    ${rArtists.join(',\n    ')}
  },
  parodies: {
    ${rParodies.join(',\n    ')}
  },
  characters: {
    ${rCharacters.join(',\n    ')}
  },
  groups: {
    ${rGroups.join(',\n    ')}
  },
  languages: {
    japanese: { id: 6346, text: '日文' },
    translated: { id: 17249, text: '已翻译' },
    english: { id: 12227, text: '英文' },
    chinese: { id: 29963, text: '中文' },
    rewrite: { id: 33252, text: '重写' },
    speechless: { id: 33680, text: '无言' },
    'text-cleaned': { id: 33705, text: '文字清除' }
  },
  categories: {
    doujinshi: { id: 33172, text: '同人志' },
    manga: { id: 33173, text: '漫画' },
    'non-h': { id: 34065, text: '无H' },
    western: { id: 34125, text: '西方' },
    imageset: { id: 34191, text: '图片集' },
    artistcg: { id: 36320, text: '画师CG' },
    misc: { id: 97152, text: '其他' }
  },
  resolve (name: string): EntryWithNamespace[] | undefined {
    const result: EntryWithNamespace[] = []
    const tag = this.tags[name]
    const artist = this.artists[name]
    const parody = this.parodies[name]
    const character = this.characters[name]
    const group = this.groups[name]
    const language = this.languages[name]
    const category = this.categories[name]
    tag && (result.push({ ...tag, namespace: 'tags' }))
    artist && (result.push({ ...artist, namespace: 'artists' }))
    parody && (result.push({ ...parody, namespace: 'parodies' }))
    character && (result.push({ ...character, namespace: 'characters' }))
    language && (result.push({ ...language, namespace: 'languages' }))
    category && (result.push({ ...category, namespace: 'categories' }))
    group && (result.push({ ...group, namespace: 'groups' }))
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
