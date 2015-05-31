var _ = require('lodash'),
    blessed = require('blessed'),
    contrib = require('blessed-contrib'),
    screen = blessed.screen({term: 'windows-ansi'});

var players = [
  { name: 'Player 1', key: 'a', laps: 0 },
  { name: 'Player 2', key: 's', laps: 0 },
  { name: 'Player 3', key: 'd', laps: 0 },
  { name: 'Player 4', key: 'f', laps: 0 }
];

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});
var bar = grid.set(4, 6, 4, 3, contrib.bar,
                  {
                    label: 'Race!',
                    barWidth: 4,
                    barSpacing: 6,
                    xOffset: 2,
                    maxHeight: 50
                  });

function updateBar(data) {
  bar.setData({
    titles: _.map(players, 'name'),
    data: data
  });
}

function update() {
  updateBar(_.map(players, 'laps'));
  screen.render();
}

function addLap(key) {
  var matchingPlayers = _.filter(players, function (player) { return player.key === key.name; });
  if (matchingPlayers.length > 0) {
    matchingPlayers[0].laps++;
  }
}

bar.setData(
   { titles: ['Player 1', 'Player 2', 'Player 3', 'Player 4']
   , data: [0, 0, 0, 0]})

screen.key(['a', 's', 'd', 'f'], function(ch, key) {
  addLap(key);
  update();
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

update();