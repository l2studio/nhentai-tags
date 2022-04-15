import React from 'react'
import tags from '../assets/generated.tags'
import parodies from '../assets/generated.parodies'
import characters from '../assets/generated.characters'

export const LS_PREFIX = 'nhentai-tags-'

export const Tags = Object.values(tags)
export const Parodies = Object.values(parodies)
export const Characters = Object.values(characters)
export const Values = [
  { text: '标签', category: 'tag', value: Tags, length: Tags.length },
  { text: '作品', category: 'parodiy', value: Parodies, length: Parodies.length },
  { text: '角色', category: 'character', value: Characters, length: Characters.length }
]
export const TotalItems = Values.reduce((acc, cur) => acc + cur.length, 0)

export type Item = typeof Tags[number] | typeof Parodies[number] | typeof Characters[number]

export interface State {
  readonly totalItems: number
  readonly dataset: typeof Values
  readonly activeIndex: number
  setActiveIndex: (index: number) => void
}

const Context = React.createContext<State>({
  totalItems: TotalItems,
  dataset: Values,
  activeIndex: 0,
  setActiveIndex: () => {}
})

export default Context
