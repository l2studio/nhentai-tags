<template>
  <b-container class="my-4">
    <div class="info" style="font-size: 0.875rem">
      <div class="d-flex align-items-center">
        <div>当前分类：</div>
        <b-select v-model="ref" :options="options" style="width: 6rem" size="sm"/>
      </div>
      <span>当前项目数：{{ countItems }}</span>
      <br/>
      <span>总计项目数：{{ totalItems }}</span>
    </div>
    <div class="actions my-4 d-flex">
      <b-btn class="mr-2" variant="primary" size="sm" @click="sortByCountDesc = false" :disabled="busy">按名称排序</b-btn>
      <b-btn variant="danger" size="sm" @click="sortByCountDesc = true" :disabled="busy">重置排序</b-btn>
      <div class="ml-auto"></div>
      <b-btn class="mr-2 btn-import" variant="primary" size="sm" :disabled="busy">
        <span>导入数据</span>
        <b-form-file accept="application/json" @change="importData" :disabled="busy" plain/>
      </b-btn>
      <b-btn class="mr-2" variant="success" size="sm" @click="exportData" :disabled="busy">导出数据</b-btn>
      <b-btn variant="danger" size="sm" @click="clearData" :disabled="busy">清除本地数据</b-btn>
    </div>
    <div class="tags d-flex flex-wrap mt-4">
      <tag v-for="tag in computeTags" :key="tag.id" :tag="tag" ref="tags" :category="computeCategory" />
    </div>
  </b-container>
</template>

<script lang="ts">
import tags from '../assets/generated.tags'
import parodies from '../assets/generated.parodies'
import characters from '../assets/generated.characters'
import Tag from './Tag.vue'

const Tags = Object.values(tags)

// 仅先处理数量大于 10 的作品，太多属于小众作品或属于画师自定作品
const PrettyParodies = Object.values(parodies).filter((c) => c.count > 10)

// 仅先处理数量大于 10 的角色，太多属于小众角色或属于画师自定角色
const PrettyCharacters = Object.values(characters).filter((c) => c.count > 10)

const Items = [{
  value: Tags,
  count: Tags.length
}, {
  value: PrettyParodies,
  count: PrettyParodies.length
}, {
  value: PrettyCharacters,
  count: PrettyCharacters.length
}]

const IdMap = Items.map((a) => a.value).reduce((pv, cv) => {
  for (const tag of cv) {
    pv[tag.id.toString()] = tag.text
  }
  return pv
}, {}) as Record<string, string>

const Total = Items.reduce((pv, cv) => {
  pv += cv.count
  return pv
}, 0)

const Categories = ['tag', 'parody', 'character']

const LS_PREFIX = 'nhentai-tags-'

export default {
  name: 'child',
  components: { Tag },
  data () {
    return {
      totalItems: Total,
      sortByCountDesc: true,
      ref: 0,
      options: [
        { value: 0, text: '标签' },
        { value: 1, text: '作品' },
        { value: 2, text: '角色' }
      ],
      busy: false
    }
  },
  computed: {
    countItems () {
      return Items[this.ref].count
    },
    computeTags () {
      if (!this.sortByCountDesc)
        return Items[this.ref].value
      return [...Items[this.ref].value].sort((a, b) => b.count - a.count)
    },
    computeCategory () {
      return Categories[this.ref]
    }
  },
  methods: {
    clearData () {
      this.busy = true
      window.localStorage.clear()
      this.$refs.tags.forEach((tag) => tag.reload())
      this.busy = false
    },
    importData (evt: InputEvent) {
      const files = (evt.target as HTMLInputElement).files
      const file = files ? files.item(0) : null
      if (!file) {
        this.$bvToast.toast('请选择导入的文件！', {
          title: '错误：',
          autoHideDelay: 3000,
          variant: 'danger',
          solid: true,
          toaster: 'b-toaster-top-center'
        })
        return
      }
      this.busy = true
      file.text().then((lines) => {
        const data = JSON.parse(lines) as Record<string, string>
        let count = 0
        for (const key in data) {
          window.localStorage.setItem(LS_PREFIX + key, data[key])
          count++
        }
        this.$refs.tags.forEach((tag) => tag.reload())
        this.$bvToast.toast(`导入 ${count} 条数据`, {
          title: '信息：',
          autoHideDelay: 2500,
          variant: 'success',
          solid: true,
          toaster: 'b-toaster-top-center'
        })
      }).catch((err) => {
        console.error(err)
      }).finally(() => {
        this.busy = false
      })
    },
    exportData () {
      const len = window.localStorage.length
      if (!len || len <= 0) {
        this.$bvToast.toast('本地未存在任何数据！', {
          title: '信息：',
          autoHideDelay: 3000,
          variant: 'warning',
          solid: true,
          toaster: 'b-toaster-top-center'
        })
        return
      }
      this.busy = true
      const result: Record<string, string> = {}
      for (let i = 0; i < len; i++) {
        const key = window.localStorage.key(i)
        if (!key || !key.startsWith(LS_PREFIX)) continue
        const [, , id] = key.split('-')
        result[id] = window.localStorage.getItem(key)
      }
      const sorted = Object.keys(result).reduce((res, key) => {
        res[key] = result[key]
        return res
      }, {})
      const data = JSON.stringify(sorted, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      this.$saveAs(blob, 'nhentai-tags.json')
      this.busy = false
    }
  }
}
</script>

<style>
.actions .btn-import {
  position: relative;
}
.actions .btn-import .form-control-file {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  opacity: 0;
  width: 100%;
  height: 100%;
}
</style>
