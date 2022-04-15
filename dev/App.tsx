import React, { useState, useRef, useCallback } from 'react'
import Status from './Status'
import Actions from './Actions'
import Handler from './Handler'
import Context, { Values, TotalItems } from './Context'
import './app.css'

export default function App () {
  const [activeIndex, setActiveIndex] = useState(0)
  const value = { activeIndex, setActiveIndex, dataset: Values, totalItems: TotalItems }
  const handlerRef = useRef<{ reloadTags (): void }>()
  const reloadTags = useCallback(() => { handlerRef.current.reloadTags() }, [handlerRef.current])
  return (
    <div className="app">
      <h1>NHentai Tags</h1>
      <Context.Provider value={value}>
        <Status />
        <Actions onImported={reloadTags} onCleaned={reloadTags} />
        <p>数据：</p>
        <Handler ref={handlerRef} />
      </Context.Provider>
    </div>
  )
}
