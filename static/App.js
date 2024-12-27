import Vue from 'vue'
import App from './App.vue'
import './static/css/index.css'

Vue.config.productionTip = false

const app = new Vue({
  ...App
})
app.$mount() 