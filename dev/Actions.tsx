import React, { ChangeEvent, useCallback } from 'react'
import { LS_PREFIX } from './Context'
import saveAs from 'file-saver'

interface Props {
  onImported? (count: number): void
  onExported? (): void
  onCleaned? (): void
}

export default function Actions (props: Props) {
  const importData = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    const files = evt.target.files
    const file = files ? files[0] : null
    if (!file) {
      window.alert('请选择导入的文件！') // FIXME: Alert
      return
    }
    ;(async () => {
      const lines = await file.text()
      const data = JSON.parse(lines) as Record<string, string>
      let count = 0
      for (const key in data) {
        window.localStorage.setItem(LS_PREFIX + key, data[key])
        count++
      }
      typeof props.onImported === 'function' && props.onImported(count)
      window.alert(`导入了 ${count} 条数据！`) // FIXME: Alert
    })().catch((err) => {
      console.error(err)
      window.alert(err.message) // FIXME: Alert
    })
  }, [])
  const exportData = useCallback(() => {
    const data: Record<string, string> = {}
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(LS_PREFIX)) {
        data[key.substring(LS_PREFIX.length)] = window.localStorage.getItem(key)
      }
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    saveAs(blob, 'nhentai-tags.json')
    typeof props.onExported === 'function' && props.onExported()
  }, [])
  const cleanData = useCallback(() => {
    window.localStorage.clear()
    typeof props.onCleaned === 'function' && props.onCleaned()
  }, [])
  return (
    <div className="actions">
      <button className="import">
        <span>导入数据</span>
        <input type="file" accept="application/json" onChange={importData} />
      </button>
      <button className="export" onClick={exportData}>导出数据</button>
      <button className="clean" onClick={cleanData}>清除本地数据</button>
    </div>
  )
}
