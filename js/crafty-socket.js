/**
 * Sockets IP adress to make the game work on multiple devices at the same time
 */
// var socket = io('http://amc.pori.tut.fi:8081');
var socket = io('http://amc.pori.tut.fi:8081');

/**
 * When clients get broadcasted messages
 * if type is MOVE the car position is updated
 * if type is COINS the coin is drawn again (someone has collected it)
 */
socket.on('msg', function(client, data) {
  if (data.action === 'move') {
    car = _.find(clients, function(obj) {
      return obj.client === client;
    });
    if (_.isObject(car)) { // car found from clients. lets update its location
      car.ent.attr({
        x: data._x,
        y: data._y
      });
    } else { // if car not exists then create one new car and push it to clients array for new update
      clients.push({
        client: client,
        ent: Crafty.e('ClientCar').attr({
          x: data._x,
          y: data._y
        }).color(data.color) // set car color too at the first time
      });
    }
  }
  if (data.action === 'coins') {
    coins = data.coins;
    _.each(coinEnt, function (ent) {
      ent.destroy();
    });
    coinEnt = [];
    _.each(data.coins, function (coin) {
      var ent = Crafty.e('Coin')
        .attr({
          x: coin._x,
          y: coin._y
        });
      ent.coinArea = coin.coinArea;
      console.log(coin);
      coinEnt.push(ent);
    });
  }
});

/**
 * When client disconnects it will be removed from client list
 * Car must also remove to avoid ghost cars in the game
 */
socket.on('disconnected', function(client) {
  console.log(client + ' disconnected');
  // remove client from clients array when client disconnect
  var clientToRemove = _.findWhere(clients, {
    client: client
  });
  clientToRemove.ent.destroy();
  clients = _.without(clients, clientToRemove);
});

socket.on('connected', function(client) {
  console.log(client + ' connected');
});