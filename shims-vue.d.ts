import type FileSaver from 'file-saver'

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

// 另见：/dev/main.ts
declare module 'vue/types/vue' {
  interface Vue {
    $saveAs: typeof FileSaver.saveAs
  }
}
