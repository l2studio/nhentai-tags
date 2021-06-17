<template>
  <div class="tag d-inline-block mr-3 mb-3" style="font-size: 0.725rem" :data-id="tag.id" :data-text="tag.text"
       :class="{
         'py-2 px-4 border': !edit,
         'bg-success text-white tag-translated': !!translate && !edit,
         'bg-danger text-white': translate && translate.endsWith('*'), // 未确认，多重翻译，歧义
         'text-indigo': translate && translate.endsWith('^'), // 原标签语法或拼写错误，或重复单词
         'tag-low': tag.count <= 10 }">                     <!-- 低优先度或略过，大部分为画师名，自建标签 -->
    <template v-if="!edit">
      <a v-if="!translate" style="color: inherit; text-decoration: underline"
         :href="'https://nhentai.net/' + category + '/' + tag.text.replace(/\s/g, '-')" target="_blank">
        {{ translate || tag.text }}
      </a>
      <span v-else>{{ translate || tag.text }}</span>
      <b-icon-pencil-square class="i i-edit" @click="edit = true" scale="1.3"/>
      <a v-if="category !== 'tag'" class="i i-wiki" :href="'https://www.google.com/search?q=' + tag.text" target="_blank"><b-icon-globe scale="1.3"/></a>
      <b-icon-check-circle-fill v-if="category !== 'tag'" class="i i-check" :class="{ 'checked': translateChecked }" @click="translateCheck" scale="1.3"/>
    </template>
    <template v-else>
      <b-input v-model="translate" class="py-1 px-2" :placeholder="tag.text" style="width: 5rem" size="sm" autofocus
               @keyup.esc="edit = false" @keyup.enter="submit"></b-input>
    </template>
  </div>
</template>

<script lang="ts">

const LS_PREFIX = 'nhentai-tags-'

export default {
  props: {
    category: {
      type: String,
      required: true
    },
    tag: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      edit: false,
      translate: '',
      translateChecked: false
    }
  },
  mounted () { this.reload() },
  methods: {
    submit () {
      if (this.translate) window.localStorage.setItem(LS_PREFIX + this.tag.id, this.translate)
      else window.localStorage.removeItem(LS_PREFIX + this.tag.id)
      this.edit = false
    },
    reload () {
      this.translate = window.localStorage.getItem(LS_PREFIX + this.tag.id)
      this.translateChecked = window.localStorage.getItem('check-' + this.tag.id) === 'true'
    },
    translateCheck () {
      this.translateChecked = !this.translateChecked
      window.localStorage.setItem('check-' + this.tag.id, this.translateChecked ? 'true' : undefined)
    }
  }
}
</script>

<style>
.tag {
  position: relative;
}
.tag .i {
  position: absolute;
  cursor: pointer;
}
.tag .i.i-edit {
  top: -3px;
  right: -3px;
  color: var(--orange);
}
.tag .i.i-wiki {
  top: -7px;
  left: 16px;
  color: var(--indigo);
}
.tag .i.i-check {
  top: -3px;
  left: -3px;
  color: var(--secondary);
}
.tag .i.i-check.checked {
  color: var(--danger);
}
.tag.tag-translated::before {
  content: attr(data-text);
  position: absolute;
  display: flex;
  visibility: hidden;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: var(--primary);
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}
.tag.tag-translated:hover::before {
  visibility: visible;
}
.tag.text-indigo {
  color: var(--indigo) !important;
}
.tag.tag-low a, .tag.tag-low span {
  border-bottom: var(--danger) 1px dotted !important;
}
</style>
