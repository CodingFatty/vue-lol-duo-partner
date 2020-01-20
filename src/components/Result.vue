<template>
  <div v-if="loaded">
    <h1>{{$route.query.player1_name}} vs {{$route.query.player2_name}}</h1>
    <div :class="'graph'">
      <div v-for="option in SDchartOptions" :key="option.name">
        <highcharts :options="option"></highcharts>
      </div>
    </div>
    <div :class="'graph'">
      <div v-for="option in championChartOption" :key="option.name">
        <highcharts :options="option"></highcharts>
      </div>
    </div>
    <div :class="'graph'">
      <div v-for="option in championWRChartOptions" :key="option.name">
        <highcharts :options="option"></highcharts>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "Result",
  data() {
    return {
      // show: false,
      history: {},
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
    await this.getSummonerHistory();
    console.log(this.history);
    let player1 = this.history.Player1;
    let player2 = this.history.Player2;

    this.InitPlayerInfo(player1, "Player1");
    this.InitPlayerInfo(player2, "Player2");
    // console.log(
    //   size1,
    //   size2,
    //   JSON.parse(JSON.stringify(this.playerObj.Player1.winRate)),
    //   this.playerObj.Player2.championId
    // );

    this.InitChampInfo("Player1");
    this.initSDchart("Player1");
    this.initchampionWRchart("Player1");
    this.InitChampInfo("Player2");
    this.initSDchart("Player2");
    this.initchampionWRchart("Player2");
  },
  methods: {
    InitPlayerInfo(player, id) {
      _.forEach(player, obj => {
        // Calculate KDA, total game, Win rate for each champion
        if (!_.has(this.playerObj[id].championId, obj.championId)) {
          let champObj = {
            kills: obj.kills,
            assists: obj.assists,
            deaths: obj.deaths,
            totalGame: 1
          };
          obj.victory
            ? ((champObj.win = 1), (champObj.lose = 0))
            : ((champObj.win = 0), (champObj.lose = 1));
          this.playerObj[id].championId[obj.championId] = champObj;
        } else {
          this.playerObj[id].championId[obj.championId].kills += obj.kills;
          this.playerObj[id].championId[obj.championId].assists += obj.assists;
          this.playerObj[id].championId[obj.championId].deaths += obj.deaths;
          this.playerObj[id].championId[obj.championId].totalGame += 1;
          obj.victory
            ? this.playerObj[id].championId[obj.championId].win++
            : this.playerObj[id].championId[obj.championId].lose++;
        }

        //   Calculate solo + role Win rate
        let role = "";
        let victory = "";
        let total = "";
        obj.role === "SOLO" ? (role = "solo") : (role = "duo");
        obj.victory === true
          ? ((victory = "win"), (total = "totalWin"))
          : ((victory = "lose"), (total = "totalLose"));
        this.playerObj[id].winRate[role][obj.lane]
          ? this.playerObj[id].winRate[role][obj.lane][victory]
            ? (this.playerObj[id].winRate[role][obj.lane][victory]++,
              this.playerObj[id].winRate[role][total]++)
            : ((this.playerObj[id].winRate[role][obj.lane][victory] = 1),
              this.playerObj[id].winRate[role][total]++)
          : (this.playerObj[id].winRate[role][obj.lane] = {});
      });
    },
    InitChampInfo(id) {
      _.forEach(this.playerObj[id].championId, async (value, key) => {
        let champData = [];
        let { name } = await this.getchamp(key);
        champData.push(name);
        champData.push((value.kills + value.assists) / value.deaths);
        this.playerObj[id].championChartData.push(champData);
      });
    },
    async getSummonerHistory() {
      //   let self = this;
      return await this.axios
        .post("http://localhost:8000/result", {
          player1_name: this.$route.query.player1_name,
          player2_name: this.$route.query.player2_name
        })
        .then(res => {
          this.history = res.data;
          return true;
        })
        .catch(err => {
          console.log(err);
        });
    },
    async getchamp(key) {
      let championByIdCache = {};
      let championJson = {};

      async function getLatestChampionDDragon(language) {
        if (championJson[language]) return championJson[language];

        let response;
        let versionIndex = 0;
        do {
          // I loop over versions because 9.22.1 is broken
          const version = (
            await fetch(
              "http://ddragon.leagueoflegends.com/api/versions.json"
            ).then(async r => await r.json())
          )[versionIndex++];

          response = await fetch(
            `https://ddragon.leagueoflegends.com/cdn/${version}/data/${language}/champion.json`
          );
        } while (!response.ok);

        championJson[language] = await response.json();
        return championJson[language];
      }

      async function getChampionByKey(key, language) {
        // Setup cache
        if (!championByIdCache[language]) {
          let json = await getLatestChampionDDragon(language);

          championByIdCache[language] = {};
          for (var championName in json.data) {
            if (!json.data.hasOwnProperty(championName)) continue;

            const champInfo = json.data[championName];
            championByIdCache[language][champInfo.key] = champInfo;
          }
        }

        return championByIdCache[language][key];
      }
      return await getChampionByKey(key, "en_US");
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
        let { name } = await this.getchamp(key);
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
  // watch: {
  //   '$route.query.player1_name': function () {
  //     this.getSummonerHistory();
  //   },
  // },
};
</script>
<style scoped>
.graph {
  display: flex;
  justify-content: center;
}
</style>