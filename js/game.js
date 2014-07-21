

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
  }, {
    _w: 540,
    _h: 130,
    _x: 250,
    _y: 180
  }, {
    _w: 400,
    _h: 120,
    _x: 350,
    _y: 600
  }];


/**
 * INIT CRAFTY GAME
 */
Crafty.init(1024, 748).canvas.init();

Crafty.background("#dedede");

Crafty.scene("Game");

// var Screen = { w: 1024, h: 748 };

// Crafty.init();
// Crafty.canvas.init();

// var scaler = function() {
//   var current = { w: Crafty.viewport.width,
//                   h: Crafty.viewport.height };

//   // This will reset the scale when it adjusts the canvas element
//   // dimensions, so do it right before setting the scale we want.
//   Crafty.viewport.reload();

//   if ( current.w > current.h ) {
//     // Landscape, scale to fit height
//     Crafty.viewport.scale( current.h / Screen.h );
//   } else {
//     // Portrait, scale to fit width
//     Crafty.viewport.scale( current.w / Screen.w );
//   }
// };

// // Avoid drawing entities before we're ready to scale.
// Crafty.removeEvent( Crafty, window, 'resize', Crafty.viewport.reload );

// // Adjust scale to fit inside resized window.
// Crafty.addEvent( Crafty, window, 'resize', scaler );

// // Run the scaler after scene changes, since they reset the scale.
// Crafty.bind( 'SceneChange', scaler );

// Crafty.scene("Game");

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

  socket.emit('msg', {
    action: 'coins',
    coins: coins
  });

}




socket.emit('clientCount', function (data) {
  clientCount = data.clientCount;
  console.log('clientCount: ' + clientCount);
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
        console.log(coin);
        coinEnt.push(ent);
      });
    });
  }
});