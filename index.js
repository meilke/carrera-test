var _ = require('lodash'),
    blessed = require('blessed'),
    contrib = require('blessed-contrib'),
    screen = blessed.screen({term: 'windows-ansi'});

var now = Date.now();
var players = [
  { name: 'Player 1', key: 'a', laps: 0, lapData: [], lastTime: now, color: 'red' },
  { name: 'Player 2', key: 's', laps: 0, lapData: [], lastTime: now, color: 'yellow' },
  { name: 'Player 3', key: 'd', laps: 0, lapData: [], lastTime: now, color: 'blue' },
  { name: 'Player 4', key: 'f', laps: 0, lapData: [], lastTime: now, color: 'green' }
];

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});
var bar = grid.set(4, 0, 4, 12, contrib.bar,
                  {
                    label: 'Laps',
                    barWidth: 20,
                    barSpacing: 6,
                    xOffset: 2,
                    maxHeight: 50
                  });

var line = grid.set(0, 0, 4, 12, contrib.line, 
                  {
                    style: { line: 'yellow', text: 'green', baseline: 'black' },
                    xLabelPadding: 3,
                    xPadding: 5,
                    label: 'Lap times',
                    wholeNumbersOnly: false
                  });

function updateBar(data) {
  bar.setData({
    titles: _.map(players, 'name'),
    data: data
  });
}

function updateLine(players) {
  line.setData(_.map(players, function (onePlayer) {
    var index = 0;
    return {
      x: _.map(onePlayer.lapData, function (d) { return 'l' + (index++); }),
      y: _.map(onePlayer.lapData, 'elapsedSec'),
      style: { line: onePlayer.color }
    };
  }));
}

function update() {
  updateBar(_.map(players, 'laps'));
  updateLine(players);
  screen.render();
}

function addLap(key) {
  var matchingPlayers = _.filter(players, function (player) { return player.key === key.name; });
  if (matchingPlayers.length > 0) {
    var m = matchingPlayers[0];
    m.laps++;
    var newTime = Date.now();
    var elapsedMs = newTime - m.lastTime;
    m.lapData.push({elapsedMs: elapsedMs, elapsedSec: elapsedMs/1000});
    m.lastTime = newTime;
  }
}

screen.key(['a', 's', 'd', 'f'], function(ch, key) {
  addLap(key);
  update();
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

update();