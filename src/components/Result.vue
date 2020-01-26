<template>
  <v-container fill-height fluid>
    <v-row justify="center" style="height: 10%">
      <h1>{{$route.query.player1_name}} vs {{$route.query.player2_name}}</h1>
    </v-row>
    <div v-if="loaded" style="height:90%, width: 100%">
      <v-row>
        <v-col v-for="option in SDchartOptions" :key="option.name">
          <highcharts :options="option"></highcharts>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="option in championChartOption" :key="option.name">
          <highcharts :options="option"></highcharts>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="option in championWRChartOptions" :key="option.name">
          <highcharts :options="option"></highcharts>
        </v-col>
      </v-row>
    </div>
    <v-row v-else align="start" justify="center" style="height: 90%">
      <v-progress-circular
        :indeterminate="indeterminate"
        :rotate="rotate"
        :size="size"
        :width="width"
        color="light-blue"
      ></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script>
import _ from "lodash";

export default {
  name: "Result",
  data() {
    return {
      indeterminate: true,
      rotate: 0,
      size: 64,
      width: 4,
      ddragonList: {},
      playerObj: {
        Player1: {
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
          championChartData: [],
          SDchart: {
            title: {
              text: "Solo/Duo Total Game and Win Rate"
            },
            series: {
              name: "Solo/Duo Win Rate",
              colorByPoint: true,
              data: []
            },
            drilldown: {
              series: []
            }
          },
          championWRChart: {
            title: {
              text: "Champions Win Rate"
            },
            series: {
              name: "Champions Win Rate",
              colorByPoint: true,
              data: []
            },
            drilldown: {
              series: []
            }
          }
        },
        Player2: {
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
          championChartData: [],
          SDchart: {
            title: {
              text: "Solo/Duo Total Game and Win Rate"
            },
            series: {
              name: "Solo/Duo Win Rate",
              colorByPoint: true,
              data: []
            },
            drilldown: {
              series: []
            }
          },
          championWRChart: {
            title: {
              text: "Champions Win Rate"
            },
            series: {
              name: "Champions Win Rate",
              colorByPoint: true,
              data: []
            },
            drilldown: {
              series: []
            }
          }
        }
      }
    };
  },
  async created() {
    // Fill out summoner & champ info
    await this.getSummonerHistory();
    await this.fetchDdragon();
    
    // Init charts details
    this.InitChampInfo("Player1");
    this.initSDchart("Player1");
    this.initchampionWRchart("Player1");
    this.InitChampInfo("Player2");
    this.initSDchart("Player2");
    this.initchampionWRchart("Player2");
  },
  methods: {
    InitChampInfo(id) {
      _.forEach(this.playerObj[id].championId, async (value, key) => {
        let champData = [];
        let name = this.getchamp(key);
        champData.push(name);
        champData.push((value.kills + value.assists) / value.deaths);
        this.playerObj[id].championChartData.push(champData);
      });
    },
    async getSummonerHistory() {
      return await this.axios
        .post("https://duo-analysis.herokuapp.com/result", {
          player1_name: this.$route.query.player1_name,
          player2_name: this.$route.query.player2_name
        })
        .then(res => {
          this.playerObj.Player1.winRate = res.data.Player1.OverallWinRate;
          this.playerObj.Player1.championId = res.data.Player1.championWinRate;
          this.playerObj.Player2.winRate = res.data.Player2.OverallWinRate;
          this.playerObj.Player2.championId = res.data.Player2.championWinRate;
        })
        .catch(err => {
          return err;
        });
    },
    async fetchDdragon() {
      if (_.isEmpty(this.ddragonList)) {
        let response = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/10.2.1/data/en_US/champion.json`
        );
        let champJson = await response.json();
        this.ddragonList = champJson.data;
      }
    },
    getchamp(key) {
      return _.findKey(this.ddragonList, ["key", key]);
    },
    initSDchart(id) {
      this.playerObj[id].SDchart.series.data = [
        {
          name: "Solo",
          y:
            ((this.playerObj[id].winRate.solo.totalWin +
              this.playerObj[id].winRate.solo.totalLose) /
              (this.playerObj[id].winRate.solo.totalWin +
                this.playerObj[id].winRate.solo.totalLose +
                this.playerObj[id].winRate.duo.totalWin +
                this.playerObj[id].winRate.duo.totalLose)) *
            100,
          drilldown: "Solo"
        },
        {
          name: "Duo",
          y:
            ((this.playerObj[id].winRate.duo.totalWin +
              this.playerObj[id].winRate.duo.totalLose) /
              (this.playerObj[id].winRate.solo.totalWin +
                this.playerObj[id].winRate.solo.totalLose +
                this.playerObj[id].winRate.duo.totalWin +
                this.playerObj[id].winRate.duo.totalLose)) *
            100,
          drilldown: "Duo"
        }
      ];
      this.playerObj[id].SDchart.drilldown.series = [
        {
          name: "Solo",
          id: "Solo",
          data: [
            [
              "Win",
              (this.playerObj[id].winRate.solo.totalWin /
                (this.playerObj[id].winRate.solo.totalWin +
                  this.playerObj[id].winRate.solo.totalLose)) *
                100
            ],
            [
              "Lose",
              (this.playerObj[id].winRate.solo.totalLose /
                (this.playerObj[id].winRate.solo.totalWin +
                  this.playerObj[id].winRate.solo.totalLose)) *
                100
            ]
          ]
        },
        {
          name: "Duo",
          id: "Duo",
          data: [
            [
              "Win",
              (this.playerObj[id].winRate.duo.totalWin /
                (this.playerObj[id].winRate.duo.totalWin +
                  this.playerObj[id].winRate.duo.totalLose)) *
                100
            ],
            [
              "Lose",
              (this.playerObj[id].winRate.duo.totalLose /
                (this.playerObj[id].winRate.duo.totalWin +
                  this.playerObj[id].winRate.duo.totalLose)) *
                100
            ]
          ]
        }
      ];
    },
    initchampionWRchart(id) {
      let totalGamePlayed = 0;
      _.forEach(this.playerObj[id].championId, value => {
        totalGamePlayed += value.totalGame;
      });

      let championData = [];
      let drilldownData = [];
      _.forEach(this.playerObj[id].championId, async (value, key) => {
        // championData
        let name = this.getchamp(key);
        let champObj = {
          name,
          y: (value.totalGame / totalGamePlayed) * 100,
          drilldown: name
        };
        championData.push(champObj);

        // drilldownData
        let drilldownObj = {
          name,
          id: name,
          data: [
            ["Win", (value.win / value.totalGame) * 100],
            ["Lose", (value.lose / value.totalGame) * 100]
          ]
        };
        drilldownData.push(drilldownObj);
      });
      this.playerObj[id].championWRChart.series.data = championData;
      this.playerObj[id].championWRChart.drilldown.series = drilldownData;
    }
  },
  computed: {
    loaded() {
      if (!_.isEmpty(this.playerObj.Player2.championWRChart.drilldown.series)) {
        return true;
      }
      return false;
    },
    SDchartOptions() {
      return [
        {
          chart: {
            type: "pie"
          },
          title: {
            text: "Solo/Duo Total Game and Win Rate"
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
            headerFormat:
              '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat:
              '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
          },
          series: [
            {
              name: "Solo/Duo Win Rate",
              colorByPoint: true,
              data: this.playerObj["Player1"].SDchart.series.data
            }
          ],
          drilldown: {
            series: this.playerObj["Player1"].SDchart.drilldown.series
          }
        },
        {
          chart: {
            type: "pie"
          },
          title: {
            text: "Solo/Duo Total Game and Win Rate"
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
            headerFormat:
              '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat:
              '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
          },
          series: [
            {
              name: "Solo/Duo Win Rate",
              colorByPoint: true,
              data: this.playerObj["Player2"].SDchart.series.data
            }
          ],
          drilldown: {
            series: this.playerObj["Player2"].SDchart.drilldown.series
          }
        }
      ];
    },
    championChartOption() {
      return [
        {
          chart: {
            type: "column"
          },
          title: {
            text: "KDA for champions played"
          },
          subtitle: {
            // text: 'Source: <a href="http://en.wikipedia.org/wiki/List_of_cities_proper_by_population">Wikipedia</a>'
          },
          xAxis: {
            type: "category",
            labels: {
              rotation: -45,
              style: {
                fontSize: "13px",
                fontFamily: "Verdana, sans-serif"
              }
            }
          },
          yAxis: {
            min: 0,
            title: {
              text: "KDA"
            }
          },
          legend: {
            enabled: false
          },
          tooltip: {
            pointFormat: "KDA: <b>{point.y:.1f}</b>"
          },
          series: [
            {
              name: "Population",
              data: this.playerObj["Player1"].championChartData,
              dataLabels: {
                enabled: true,
                rotation: -90,
                color: "#FFFFFF",
                align: "right",
                format: "{point.y:.1f}", // one decimal
                y: 10, // 10 pixels down from the top
                style: {
                  fontSize: "13px",
                  fontFamily: "Verdana, sans-serif"
                }
              }
            }
          ]
        },
        {
          chart: {
            type: "column"
          },
          title: {
            text: "KDA for champions played"
          },
          subtitle: {
            // text: 'Source: <a href="http://en.wikipedia.org/wiki/List_of_cities_proper_by_population">Wikipedia</a>'
          },
          xAxis: {
            type: "category",
            labels: {
              rotation: -45,
              style: {
                fontSize: "13px",
                fontFamily: "Verdana, sans-serif"
              }
            }
          },
          yAxis: {
            min: 0,
            title: {
              text: "KDA"
            }
          },
          legend: {
            enabled: false
          },
          tooltip: {
            pointFormat: "KDA: <b>{point.y:.1f}</b>"
          },
          series: [
            {
              name: "Population",
              data: this.playerObj["Player2"].championChartData,
              dataLabels: {
                enabled: true,
                rotation: -90,
                color: "#FFFFFF",
                align: "right",
                format: "{point.y:.1f}", // one decimal
                y: 10, // 10 pixels down from the top
                style: {
                  fontSize: "13px",
                  fontFamily: "Verdana, sans-serif"
                }
              }
            }
          ]
        }
      ];
    },
    championWRChartOptions() {
      return [
        {
          chart: {
            type: "pie"
          },
          title: {
            text: "Champions Win Rate"
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
            headerFormat:
              '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat:
              '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
          },
          series: [
            {
              name: "Champions Win Rate",
              colorByPoint: true,
              data: this.playerObj["Player1"].championWRChart.series.data
            }
          ],
          drilldown: {
            series: this.playerObj["Player1"].championWRChart.drilldown.series
          }
        },
        {
          chart: {
            type: "pie"
          },
          title: {
            text: "Champions Win Rate"
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
            headerFormat:
              '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat:
              '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
          },
          series: [
            {
              name: "Champions Win Rate",
              colorByPoint: true,
              data: this.playerObj["Player2"].championWRChart.series.data
            }
          ],
          drilldown: {
            series: this.playerObj["Player2"].championWRChart.drilldown.series
          }
        }
      ];
    }
  }
};
</script>