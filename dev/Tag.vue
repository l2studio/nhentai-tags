<template>
  <div class="tag d-inline-block mr-2 mb-2" style="font-size: 0.725rem" :data-id="tag.id" :data-text="tag.text"
       :class="{
         'py-1 px-3 border': !edit,
         'bg-success text-white tag-translated': !!translate && !edit,
         'text-danger': translate && translate.endsWith('*'), // 未确认，多重翻译，歧义
         'text-indigo': translate && translate.endsWith('^'), // 原标签语法或拼写错误，或重复单词
         'tag-low': tag.count <= 10 }">                     <!-- 低优先度或略过，大部分为画师名，自建标签 -->
    <template v-if="!edit">
      <a v-if="!translate" style="color: inherit; text-decoration: underline"
         :href="'https://nhentai.net/tag/' + tag.text.replace(/\s/g, '-')" target="_blank">
        {{ translate || tag.text }}
      </a>
      <span v-else>{{ translate || tag.text }}</span>
      <b-icon-pencil-square @click="edit = true"/>
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
    tag: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      edit: false,
      translate: ''
    }
  },
  mounted () { this.reload() },
  methods: {
    submit () {
      if (!this.translate) return
      window.localStorage.setItem(LS_PREFIX + this.tag.id, this.translate)
      this.edit = false
    },
    reload () {
      this.translate = window.localStorage.getItem(LS_PREFIX + this.tag.id)
    }
  }
}
</script>

<style>
.tag {
  position: relative;

}
.tag .bi {
  color: var(--secondary);
  position: absolute;
  top: -3px;
  right: -3px;
  cursor: pointer;
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
