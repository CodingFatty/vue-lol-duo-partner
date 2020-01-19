<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <Search />
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import Search from '@/components/HomeSearch.vue'

export default {
  name: 'home',
  components: {
    // HelloWorld,
    Search
  }
}
</script>
