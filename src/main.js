import Vue from 'vue'
import App from './App.vue'
import router from './router'

import axios from 'axios';
import VueAxios from 'vue-axios';

import Highcharts from 'highcharts';
import VueHighcharts from 'vue-highcharts';
import loadDrilldown from 'highcharts/modules/drilldown.js';

Vue.config.productionTip = false

Vue.use(VueAxios, axios);

loadDrilldown(Highcharts);
Vue.use(VueHighcharts, { Highcharts });

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
