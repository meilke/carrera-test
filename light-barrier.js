var _ = require('lodash'),
    blessed = require('blessed'),
    contrib = require('blessed-contrib'),
    screen = blessed.screen({term: 'windows-ansi'}),
    exec = require('child_process').execSync,
    Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    photo = new Gpio(4, 'in', 'both'),
    now = Date.now(),
    players = [],
    status = '# Hello \n blessed-contrib renders markdown using `marked-terminal`';

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});
var line = grid.set(0, 0, 4, 6, contrib.line, 
                  {
                    style: { line: 'yellow', text: 'green', baseline: 'black' },
                    xLabelPadding: 3,
                    xPadding: 5,
                    label: 'Lap times',
                    wholeNumbersOnly: false
                  });

var table = grid.set(4, 0, 4, 6, contrib.table, {
      keys: false
     , interactive: false
     , fg: 'green'
     , label: 'Laps (Player 1)'
     , width: '30%'
     , height: '30%'
     , border: {type: "line", fg: "cyan"}
     , columnSpacing: 10 //in chars
     , columnWidth: [5, 12, 12]  });

var tablePositions = grid.set(4, 6, 4, 6, contrib.table, {
      keys: false
     , interactive: false
     , fg: 'green'
     , label: 'Rankings'
     , width: '30%'
     , height: '30%'
     , border: {type: "line", fg: "cyan"}
     , columnSpacing: 5 //in chars
     , columnWidth: [5, 15, 5, 5]  });

var markdown = grid.set(0, 6, 4, 6, contrib.markdown);

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

function updateTable(players) {
  var player1 = players[0];
  var data = _.map(player1.lapData, function (lap, index) {
    return [index + 1, lap.elapsedSec, index > 0 ? lap.elapsedSec - player1.lapData[index - 1].elapsedSec : ''];
  });
  table.setData({headers: ['Lap', 'Time', 'Diff'], data: data.slice(-12)});
  table.rows.select(400);
}

function getLastLap(player) {
  if (player.lapData.length == 0) {
    return {elapsedSec: 0};
  }
  return _.last(player.lapData);
}

function getBestLap(player) {
  if (player.lapData.length == 0) {
    return {elapsedSec: 0};
  }
  return _.sortByOrder(player.lapData, ['elapsedSec'], ['asc'])[0];
}

function updatePositionsTable(players) {
  var data = _.sortByOrder(players, ['laps', 'lastTime'], ['desc', 'asc']);
  data = _.map(data, function (player, index) { return [index + 1, player.name, getBestLap(player).elapsedSec, getLastLap(player).elapsedSec]; });
  tablePositions.setData({headers: ['#', 'Name', 'Best', 'Last'], data: data});
  tablePositions.rows.select(400);
}

function reset() {
  now = Date.now();
  players = [
    { name: 'Player 1', key: 'a', laps: 0, lapData: [], lastTime: now, color: 'red' },
    { name: 'Player 2', key: 's', laps: 0, lapData: [], lastTime: now, color: 'yellow' },
    { name: 'Player 3', key: 'd', laps: 0, lapData: [], lastTime: now, color: 'blue' },
    { name: 'Player 4', key: 'f', laps: 0, lapData: [], lastTime: now, color: 'green' }
  ];
  update();
}

function update() {
  updateLine(players);
  updateTable(players);
  updatePositionsTable(players);
  markdown.setMarkdown(status);
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

screen.key(['r'], function(ch, key) {
  reset();
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  led.writeSync(1);
  led.unexport();
  photo.unexport();
  process.exit(0);
});

exec('gpio mode 7 up');

led.writeSync(0);
photo.watch(function (err, value) {
  if (value) {
    addLap({name: 'a'});
    update();
  }
});

reset();
