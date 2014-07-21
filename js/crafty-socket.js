// var socket = io('http://amc.pori.tut.fi:8081');
var socket = io('http://192.168.43.84:8081');

socket.on('msg', function(client, data) {
  //console.log(client + ' send data: ' + JSON.stringify(data)); // generate too much traffic when really moving objects
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