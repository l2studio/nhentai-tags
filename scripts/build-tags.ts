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

export type Category = 'tags' | 'parodies' | 'characters'
export type Entry = { id: number, text: string }
export type EntryWithCategory = Entry & { category: Category }

export type TagsTable = {
  tags: Record<string, Entry | undefined>
  parodies: Record<string, Entry | undefined>
  characters: Record<string, Entry | undefined>
  resolve (name: string): EntryWithCategory[] | undefined
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
  resolve (name: string): EntryWithCategory[] | undefined {
    const result: EntryWithCategory[] = []
    const tag = this.tags[name]
    const parody = this.parodies[name]
    const character = this.characters[name]
    tag && (result.push({ ...tag, category: 'tags' }))
    parody && (result.push({ ...parody, category: 'parodies' }))
    character && (result.push({ ...character, category: 'characters' }))
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
