var keypress = require('keypress'),
  _ = require('lodash');

keypress(process.stdin);

var players = [
  { name: 'Player 1', key: 'a', laps: 0 },
  { name: 'Player 2', key: 's', laps: 0 },
  { name: 'Player 3', key: 'd', laps: 0 },
  { name: 'Player 4', key: 'f', laps: 0 }
];

function printSituation() {
  console.log();
  console.log('-----------------');
  _.each(players, function (player) { console.log(player.name + ': ' + player.laps); });
  console.log('-----------------');
}

function addLap(key) {
  var matchingPlayers = _.filter(players, function (player) { return player.key === key.name; });
  if (matchingPlayers.length > 0) {
    matchingPlayers[0].laps++;
  }
}

process.stdin.on('keypress', function (character, key) {
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  } else {
    addLap(key);
    printSituation();
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();