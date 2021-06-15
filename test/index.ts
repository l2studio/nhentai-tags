import tagsTable, { date } from '../build'

console.log('Built', date.toLocaleString())
console.log(tagsTable.tags['full color'])
console.log(tagsTable.tags['lolicon'])
console.log(tagsTable.parodies['popn music'])
console.log(tagsTable.resolve('nijisanji')) // tags and parodies
