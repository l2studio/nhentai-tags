import './dotenv'
import got from 'got'
import cheerio from 'cheerio'
import tunnel from 'tunnel'
import numeral from 'numeral'
import path from 'path'
import fs from 'fs'

const debug = require('debug')('lgou2w:nhentai-tag')

const PROXY = process.env.PROXY_HOST && process.env.PROXY_PORT
  ? { host: process.env.PROXY_HOST, port: parseInt(process.env.PROXY_PORT) }
  : undefined

if (PROXY) debug(':http proxy:', PROXY)

const FETCH = got.extend({
  prefixUrl: 'https://nhentai.net',
  agent: PROXY ? { https: tunnel.httpsOverHttp({ proxy: PROXY }) as any } : undefined
})

type Tag = {
  id: number
  name: string
  count: number
}

type Category = 'tags' | 'characters' | 'parodies'

const Categories: Category[] = ['tags', 'characters', 'parodies']

type ParsedResult<T extends Category> = {
  category: T
  page: number
  last: number
  tags: Tag[]
}

function parse (category: Category, html: string): ParsedResult<Category> {
  const $ = cheerio.load(html)
  const tags = $('div#tag-container a.tag').map((_, tag) => {
    const id = $(tag).attr('class')!.split(' ')[1].replace('tag-', '')
    const name = $('span.name', tag).text()
    const count = $('span.count', tag).text().toLowerCase()
    return <Tag> {
      id: parseInt(id),
      name,
      count: numeral(count).value()
    }
  }).get()
  const pagination = $('section.pagination')
  const page = $('a.page.current', pagination).text()
  const lastEl = $('a.last', pagination).first()
  const last = lastEl.length > 0 ? lastEl.attr('href')!.split('=', 2)[1] : page
  return {
    category,
    page: parseInt(page),
    last: parseInt(last),
    tags
  }
}

function fetchAndParse (category: Category, page?: number): Promise<ParsedResult<Category>> {
  return FETCH(category, { searchParams: { page } })
    .text()
    .then((html) => parse(category, html))
}

async function fetchAll (category: Category): Promise<{ category: Category, tags: Tag[] }> {
  debug(':fetchAll category:', category)
  const result: Tag[] = []
  let page = 1
  let last = 0
  do {
    debug(':fetchAll page:', page)
    const res = await fetchAndParse(category, page++)
    result.push(...res.tags)
    last = res.last

  } while (page <= last)

  return {
    category,
    tags: result
  }
}

/*
 * Fetched from https://nhentai.net/{CATEGORY} Generated on {DATE}
 *
 * @export: Record<string, { id: number, text: string, count: number }
 * @param: id - tag.id
 * @param: text - tag.name
 * @param: count - tag.count
 *
 * @code style: Standard JS
 */

function generateModuleCode (category: Category, tags: Tag[], sortTagsByCountDesc?: boolean): string {
  if (sortTagsByCountDesc === true) {
    debug(':sort tags...')
    tags = tags.sort((a, b) => a.count > b.count ? -1 : b.count > a.count ? 1 : 0)
  }
  debug(':generate module code:', category)
  const date = new Date().toISOString()
  const lines = tags.map(({ id, name, count }) => {
    const quotesKey = name.includes('-') || name.includes(' ') || name.includes('.') || !isNaN(parseInt(name.charAt(0)))
    const key = quotesKey ? `'${name}'` : name
    const val = `{ id: ${id}, text: '${name}', count: ${count} }`
    return `${key}: ${val}`
  }).join(',\n  ')

  return `/*
 * Fetched from https://nhentai.net/${category} Generated on ${date}
 */

const ${category}: Record<string, { id: number, text: string, count: number }> = {
  ${lines}
}

export default ${category}
`
}

const assetsDir = path.resolve(__dirname, '..', 'assets')
fs.existsSync(assetsDir) || fs.mkdirSync(assetsDir)

;(async () => {
  debug(':assets dir:', assetsDir)
  for (const category of Categories) {
    debug(':sync category:', category)
    const { tags } = await fetchAll(category)
    const filename = 'generated.' + category + '.ts'
    const code = generateModuleCode(category, tags, true)
    fs.writeFileSync(path.resolve(assetsDir, filename), code)
  }
})().catch((err) => {
  console.error('Sync failed:', err)
  process.exit(1)
})
