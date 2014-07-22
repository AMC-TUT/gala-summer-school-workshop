
/**
 * Public variables for the game
 */
var coinCount = 0,
  coinsEnt = null, // variables for coins text entity for updating the coin count.
  clients = [], // socket clients, except self
  carColor = '#' + new Date().getUTCMilliseconds() + new Date().getUTCMilliseconds(),
  clientCount = 0,
  coins = [],
  coinEnt = [],
  coinAreas = [{
    _w: 260,
    _h: 80,
    _x: 180,
    _y: 480
  }, {
    _w: 150,
    _h: 270,
    _x: 780,
    _y: 430
  }];


/**
 * INIT CRAFTY GAME
 */
Crafty.init(1024, 748).canvas.init();

// background for the canvas
//Crafty.background("#dedede");

Crafty.scene("Game");

/**
 * HELPER FUNCTIONS
 */
function createCoins() {
  _.each(coinAreas, function(coinArea, index) {
    var coin = Crafty.e('Coin')
      .attr({
        x: coinArea._x + Math.floor((Math.random() * coinArea._w) + 1),
        y: coinArea._y + Math.floor((Math.random() * coinArea._h) + 1)
      });
    coin.coinArea = index;

    coins = [];
    coins.push({ _x: coin._x, _y: coin._y, coinArea: index });
    coinEnt.push(coin);
  });

  /**
   * Tell the socket server where the coins are created.
   * Socket server keeps always current set of coins for the new player.
   */
  socket.emit('msg', {
    action: 'coins',
    coins: coins
  });

}


/**
 * Get the amount of connected clients
 * When the first player connects to the game coins will be created
 */

socket.emit('clientCount', function (data) {
  clientCount = data.clientCount;
  //console.log('clientCount: ' + clientCount);
  if (clientCount == 1) {
    createCoins();
  } else {
    socket.emit('getCoins', function (data){
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
        //console.log(coin);
        coinEnt.push(ent);
      });
    });
  }
});