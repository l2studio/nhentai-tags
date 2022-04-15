import React, { KeyboardEventHandler, useCallback, useState, useImperativeHandle, useRef } from 'react'
import classNames from 'classnames'
import Context, { Item, LS_PREFIX } from './Context'
import { Edit, Earth, Tag as IconTag } from './Icons'

const Handler = React.forwardRef<{
  reloadTags (): void
}>((props, ref) => {
  const tagRefs = useRef<{ reload (): void }[]>([])
  useImperativeHandle(ref, () => ({
    reloadTags () {
      tagRefs.current.forEach((ref) => ref.reload())
    }
  }))
  return (
    <div className="handler">
      <Context.Consumer>
        {(value) => (
          <>
            {value.dataset[value.activeIndex].value.map((item, i) => (
              <Tag key={item.id} category={value.dataset[value.activeIndex].category} item={item} ref={(c) => tagRefs.current[i] = c} />
            ))}
          </>
        )}
      </Context.Consumer>
    </div>
  )
})

export default Handler

const Tag = React.forwardRef<{
  reload (): void
}, { category: string, item: Item }>((props, ref) => {
  const [editing, setEditing] = useState(false)
  const [translate, setTranslate] = useState(localStorage.getItem(LS_PREFIX + props.item.id))
  const onKeyUp = useCallback<KeyboardEventHandler<HTMLInputElement>>((evt) => {
    switch (evt.key) {
      case 'Escape':
        setEditing(false)
        evt.preventDefault()
        break
      case 'Enter':
        const newValue = evt.currentTarget.value
        if (!newValue) {
          setTranslate(undefined)
          localStorage.removeItem(LS_PREFIX + props.item.id)
        } else if (newValue !== props.item.text) {
          setTranslate(newValue)
          localStorage.setItem(LS_PREFIX + props.item.id, newValue)
        }
        setEditing(false)
        evt.preventDefault()
        break
      default:
        break
    }
  }, [props.item])
  useImperativeHandle(ref, () => ({
    reload () {
      setTranslate(localStorage.getItem(LS_PREFIX + props.item.id))
    }
  }))
  const classes = classNames('tag', {
    editing,
    translated: !!translate,
    multiple: translate && translate.charAt(translate.length - 1) === '*',
    typo: translate && translate.charAt(translate.length - 1) === '^'
  })
  return (
    <div className={classes} data-text={props.item.text}>
      {!editing
        ? <>
            <span>{translate || props.item.text}</span>
            <Edit className="edit" onClick={() => setEditing(true)} />
            <Earth className="google" href={`https://google.com/search?q=${props.item.text}`} />
            <IconTag className="nhentai" href={`https://nhentai.net/${props.category}/${props.item.text.replace(/\s/g, '-').replace(/\./g, '')}`} />
          </>
        : <input defaultValue={translate || props.item.text} onKeyUp={onKeyUp} autoFocus />
      }
    </div>
  )
})
