<template>
  <div class="about">
    <h1>This is an result page</h1>
    <highcharts :options="chartOptions"></highcharts>
  </div>
</template>

<script>
import _ from "lodash";
import { info } from "./test.js";

export default {
  name: "Result",
  data() {
    return {
      history: info,
      winRate: {
        solo: {
          totalWin: 0,
          totalLose: 0
        },
        duo: {
          totalWin: 0,
          totalLose: 0
        }
      },
      championId: {},
      chartOptions: {
        chart: {
          type: "pie"
        },
        title: {
          text: "Solo/Duo Win Rate"
        },
        subtitle: {
          // text: 'Click the slices to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>'
        },
        plotOptions: {
          series: {
            dataLabels: {
              enabled: true,
              format: "{point.name}: {point.y:.1f}%"
            }
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
          pointFormat:
            '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
        series: [
          {
            name: "Solo/Duo Win Rate",
            colorByPoint: true,
            data: [
              {
                name: "Solo",
                y: 62.74,
                drilldown: "Solo"
              },
              {
                name: "Duo",
                y: 10.57,
                drilldown: "Duo"
              }
            ]
          }
        ],
        drilldown: {
          series: [
            {
              name: "Solo",
              id: "Solo",
              data: [
                ["v65.0", 0.1],
                ["v64.0", 1.3],
                ["v63.0", 53.02],
                ["v62.0", 1.4],
                ["v61.0", 0.88],
                ["v60.0", 0.56]
              ]
            },
            {
              name: "Duo",
              id: "Duo",
              data: [
                ["v58.0", 1.02],
                ["v57.0", 7.36],
                ["v56.0", 0.35],
                ["v55.0", 0.11],
                ["v54.0", 0.1],
                ["v52.0", 0.95],
                ["v51.0", 0.15],
                ["v50.0", 0.1],
                ["v48.0", 0.31],
                ["v47.0", 0.12]
              ]
            }
          ]
        }
      }
    };
  },
  mounted() {
    // this.getSummonerHistory();
    let player1 = info.Player1;
    let size1 = _.size(_.filter(player1, ["role", "SOLO"]));
    let size2 = _.size(_.filter(player1, p1 => p1.role !== "SOLO"));
    _.forEach(info.Player1, obj => {
      // Calculate KDA, total game, Win rate for each champion
      if (!_.has(this.championId, obj.championId)) {
        let champObj = {
          kills: obj.kills,
          assists: obj.assists,
          deaths: obj.deaths,
          totalGame: 1
        };
        obj.victory
          ? ((champObj.win = 1), (champObj.lose = 0))
          : ((champObj.win = 0), (champObj.lose = 1));
        this.championId[obj.championId] = champObj;
      } else {
        this.championId[obj.championId].kills += obj.kills;
        this.championId[obj.championId].assists += obj.assists;
        this.championId[obj.championId].deaths += obj.deaths;
        this.championId[obj.championId].totalGame += 1;
        obj.victory
          ? this.championId[obj.championId].win++
          : this.championId[obj.championId].lose++;
      }

      //   Calculate solo + role Win rate
      let role = "";
      let victory = "";
      let total = "";
      obj.role === "SOLO" ? (role = "solo") : (role = "duo");
      obj.victory === true
        ? ((victory = "win"), (total = "totalWin"))
        : ((victory = "lose"), (total = "totalLose"));
      this.winRate[role][obj.lane]
        ? this.winRate[role][obj.lane][victory]
          ? (this.winRate[role][obj.lane][victory]++,
            this.winRate[role][total]++)
          : ((this.winRate[role][obj.lane][victory] = 1),
            this.winRate[role][total]++)
        : (this.winRate[role][obj.lane] = {});
    });
    console.log(
      size1,
      size2,
      JSON.parse(JSON.stringify(this.winRate)),
      this.championId
    );
  },
  methods: {
    getSummonerHistory() {
      console.log(this.$route.query.player1_name);
      //   let self = this;
      this.axios
        .post("http://localhost:8000/result", {
          player1_name: this.$route.query.player1_name,
          player2_name: this.$route.query.player2_name
        })
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
  // watch: {
  //   '$route.query.player1_name': function () {
  //     this.getSummonerHistory();
  //   },
  // },
};
</script>