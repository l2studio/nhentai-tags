import React, { useContext } from 'react'
import Context from './Context'

export default function Status () {
  const { activeIndex, setActiveIndex } = useContext(Context)
  return (
    <div className="status">
      <Context.Consumer>
        {(value) => (
          <>
            <label>当前分类：</label>
            <select value={activeIndex} onChange={(evt) => setActiveIndex(parseInt(evt.target.value))}>
              {Object.values(value.dataset).map((item, index) => (
                <option key={index} value={index}>{item.text}</option>
              ))}
            </select>
            <br />
            <span>当前项目数：{value.dataset[value.activeIndex].length}</span>
            <br />
            <span>总计项目数：{value.totalItems}</span>
          </>
        )}
      </Context.Consumer>
    </div>
  )
}
