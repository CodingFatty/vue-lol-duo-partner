<template>
  <div>
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-text-field v-model.trim="player1_name" label="Summoner1"></v-text-field>
        <v-text-field v-model.trim="player2_name" label="Summoner2" ></v-text-field>
        <!-- @keyup.enter="submitName()"  -->
        <v-btn @click="submitName()" text>Search!</v-btn>
      </v-row>
    </v-container>
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
      player1_name: "",
      player2_name: ""
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