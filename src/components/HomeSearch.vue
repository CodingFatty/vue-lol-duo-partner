<template>
  <div>
    <input v-model.trim="player1_name" placeholder="name1" />
    <input v-model.trim="player2_name" placeholder="name2" />
    <!-- @keyup.enter="submitName()"  -->
    <button @click="submitName()">Search!</button>
  </div>
</template>

<script>
export default {
  name: "HomeSearch",
  props: {
    msg: String
  },
  data() {
    return {
      player1_name: "ultraden",
      player2_name: "kenjiman"
    };
  },
  methods: {
    submitName() {
      this.$router.push({
        name: "result",
        query: {
          player1_name: this.player1_name,
          player2_name: this.player2_name
        }
      });
    }
  }
};
</script>