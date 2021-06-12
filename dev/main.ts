import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, BIconPencilSquare, ToastPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.min.css'
import { saveAs } from 'file-saver'

Vue.use(BootstrapVue)
Vue.use(ToastPlugin)
Vue.component('b-icon-pencil-square', BIconPencilSquare)
Vue.prototype.$saveAs = saveAs

new Vue(App).$mount('#app')
