// ----------

Crafty.c('Coin', {
  coinArea: null,
  init: function() {
    this.addComponent("2D, Canvas, Color")
      .color('gold') // http://craftyjs.com/api/Color.html
    .attr({
      w: 15,
      h: 15
    }); // http://craftyjs.com/api/Crafty%20Core.html#-attr
  }
});

Crafty.c('ClientCar', {
  init: function() {
    this.addComponent("2D, Canvas, Color")
      .color('dimgray')
      .attr({
        w: 20,
        h: 20,
        x: 50,
        y: 225,
        z: 4
      });
  }
});

Crafty.c('Bomb', {
  bombArea: null,
  init: function() {
    this.addComponent("2D, Canvas, Color")
      .color('red')
      .attr({
        w: 15,
        h: 15
      });
  }
});

Crafty.c('Grass', {
  init: function() {
    this.addComponent("2D, Canvas");
    //.color('orange'); // for debug use Color component
  }
});

Crafty.c('BombArea', {
  init: function() {
    this.addComponent("2D, Canvas");
    //.color('pink'); // for debug use Color component
  }
});

Crafty.c('CoinArea', {
  init: function() {
    this.addComponent("2D, Canvas");
    //.color('lime'); // for debug use Color component
  }
});

Crafty.c('PlayerCar', {
  yAngle: 0,
  xAngle: 0,
  carSpeed: 4,
  carColor: null,
  startDeviceOrientationListener: function() {
    var _this = this; // we need this because deviceOrientationListener has its own this (context)

    function deviceOrientationListener(event) {
      _this.xAngle = Math.round(-1 * (window.orientation / 90) * event.beta);
      _this.yAngle = Math.round(-1 * (window.orientation / 90) * event.gamma);
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", deviceOrientationListener);
    } else {
      console.log("Sorry, your browser doesn't support Device Orientation");
    }
  },

  init: function() {
    this.startDeviceOrientationListener();
    this.addComponent("2D, Canvas, Color, Multiway, Collision")
      .color(carColor)
      .attr({
        w: 20,
        h: 20,
        z: 99
      })
      .multiway(3, {
        UP_ARROW: -90,
        DOWN_ARROW: 90,
        RIGHT_ARROW: 0,
        LEFT_ARROW: 180
      }) // http://craftyjs.com/api/Multiway.html
    .bind("EnterFrame", function(frame) {

      // move car
      // x-axis
      if (this.xAngle > 10) {
        this.x = this._x - this.carSpeed;
      } // left
      else if (this.xAngle < -10) {
        this.x = this._x + this.carSpeed; // right
      }
      // y-axis
      if (this.yAngle > 10) {
        this.y = this._y + this.carSpeed;
      } // down
      else if (this.yAngle < -10) {
        this.y = this._y - this.carSpeed; // up
      }
      // coinsEnt.text(this.xAngle + ' ' + this.yAngle); // you can use coins entity as debug output or create a new Text entity for debug purpose.

      // boundaries min&max
      if (this._x < 11) {
        this.x = 11;
      } else if (this._x > 998) {
        this.x = 998;
      } else if (this._y < 162) {
        this.y = 162;
      } else if (this._y > 723) {
        this.y = 723;
      }
    })
      .bind("Move", function() {
        socket.emit('msg', {
          action: 'move',
          _x: this._x,
          _y: this._y,
          color: carColor
        });
      })
      .onHit("Grass", function() {
        this.carSpeed = 1;
      }, function() {
        // when hit ends
        this.carSpeed = 2;
      })
      .onHit("Coin", function(targets)  {
        // onHit return array but we can hit only one coin at one time so lets pick up the first object of the targets array
        var coin = _.first(targets).obj;

        var coinToRemove = _.find(coins, function(obj) { return obj._x == coin._x && obj._y == coin._y; });
        var coinEntToRemove = _.find(coinEnt, function(obj) { return obj == coin; });

        coins = _.without(coins, coinToRemove);
        console.log(coin.coinArea);
        // create new coin
        console.log(coin.coinArea);
        console.log(coinAreas);
        var newCoin = Crafty.e('Coin')
          .attr({
            x: coinAreas[coin.coinArea]._x + Math.floor((Math.random() * coinAreas[coin.coinArea]._w) + 1),
            y: coinAreas[coin.coinArea]._y + Math.floor((Math.random() * coinAreas[coin.coinArea]._h) + 1)
          });
        newCoin.coinArea = coin.coinArea;
        console.log(coin.coinArea);

        // destroy coin
        coin.destroy();

        coins.push({ _x: newCoin._x, _y: newCoin._y, coinArea: newCoin.coinArea });
        coinEnt.push(newCoin);

        socket.emit('msg', { action: 'coins', coins: coins });

        // add coin for players counter
        coinCount += 1;
        coinsEnt.text('Coins: ' + coinCount);
      })
      .onHit("Bomb", function(targets)  {
        // onHit return array but we can hit only one bomb at one time so lets pick up the first object of the targets array
        var bomb = _.first(targets).obj;

        // create new bomb after random timeout (max 12 second)
        setTimeout(function() {
          var newBomb = Crafty.e('Bomb')
            .attr({
              x: bomb.bombArea._x + Math.floor((Math.random() * bomb.bombArea._w) + 1),
              y: bomb.bombArea._y + Math.floor((Math.random() * bomb.bombArea._h) + 1)
            });
          newBomb.bombArea = bomb.bombArea;
        }, Math.floor((Math.random() * 12000) + 1));

        // destroy bomb
        bomb.destroy();

        // destroy car
        this.destroy();

        // create new car for player after small timeout (2 seconds)
        setTimeout(function() {
          var newCar = Crafty.e('PlayerCar').attr({
            x: 50,
            y: 225
          });
        }, 2000);
      });
  }
});