var socket = io('http://amc.pori.tut.fi:8081');

var coins = 0,
  coinsEnt = null, // variables for coins text entity for updating the coin count.
  clients = []; // socket clients, except self

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
        w: 15,
        h: 15,
        x: 50,
        y: 225
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
      .color('deepskyblue')
      .attr({
        w: 15,
        h: 15,
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
      if(this.xAngle > 10) {
        this.x = this._x - this.carSpeed; } // left
      else if(this.xAngle < -10) {
        this.x = this._x + this.carSpeed; // right
      }
      // y-axis
      if(this.yAngle > 10) {
        this.y = this._y + this.carSpeed; } // down
      else if(this.yAngle < -10) {
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
          _y: this._y
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

      // create new coin after random timeout (max 6 second)
      setTimeout(function() {
        var newCoin = Crafty.e('Coin')
          .attr({
            x: coin.coinArea._x + Math.floor((Math.random() * coin.coinArea._w) + 1),
            y: coin.coinArea._y + Math.floor((Math.random() * coin.coinArea._h) + 1)
          });
        newCoin.coinArea = coin.coinArea;
      }, Math.floor((Math.random() * 6000) + 1));

      // destroy coin
      coin.destroy();

      // add coin for players counter
      coins += 1;
      coinsEnt.text('Coins: ' + coins);
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


Crafty.scene("Game", function() {

  Crafty.background("url(img/track.png)");

  coinsEnt = Crafty.e("2D, Canvas, Text").attr({
    x: 30,
    y: 30,
    w: 200,
    h: 100
  }).text("Coins: " + coins).textColor('#111111').textFont({
    size: '40px',
    weight: 'bold'
  });

  var car = Crafty.e('PlayerCar')
    .attr({
      x: 50,
      y: 225
    });

  var grass1 = Crafty.e('Grass').attr({
    w: 228,
    h: 131,
    x: 296,
    y: 327
  });
  var grass2 = Crafty.e('Grass').attr({
    w: 216,
    h: 253,
    x: 523,
    y: 327
  });
  var grass3 = Crafty.e('Grass').attr({
    w: 137,
    h: 416,
    x: 12,
    y: 322
  });
  var grass4 = Crafty.e('Grass').attr({
    w: 169,
    h: 93,
    x: 149,
    y: 645
  });
  var grass5 = Crafty.e('Grass').attr({
    w: 96,
    h: 227,
    x: 917,
    y: 162
  });

  var bombArea = Crafty.e('BombArea').attr({
    w: 540,
    h: 130,
    x: 250,
    y: 180
  });

  var bomb = Crafty.e('Bomb')
    .attr({
      x: bombArea._x + Math.floor((Math.random() * bombArea._w) + 1),
      y: bombArea._y + Math.floor((Math.random() * bombArea._h) + 1)
    });
  bomb.bombArea = {
    _x: bombArea._x,
    _y: bombArea._y,
    _w: bombArea._w,
    _h: bombArea._h
  };

  var bombArea = Crafty.e('BombArea').attr({
    w: 400,
    h: 120,
    x: 350,
    y: 600
  });

  var bomb = Crafty.e('Bomb')
    .attr({
      x: bombArea._x + Math.floor((Math.random() * bombArea._w) + 1),
      y: bombArea._y + Math.floor((Math.random() * bombArea._h) + 1)
    });
  bomb.bombArea = {
    _x: bombArea._x,
    _y: bombArea._y,
    _w: bombArea._w,
    _h: bombArea._h
  };

  var coinArea = Crafty.e('CoinArea').attr({
    w: 260,
    h: 80,
    x: 180,
    y: 480
  });

  var coin = Crafty.e('Coin')
    .attr({
      x: coinArea._x + Math.floor((Math.random() * coinArea._w) + 1),
      y: coinArea._y + Math.floor((Math.random() * coinArea._h) + 1)
    });
  coin.coinArea = {
    _x: coinArea._x,
    _y: coinArea._y,
    _w: coinArea._w,
    _h: coinArea._h
  };

  var coinArea = Crafty.e('CoinArea').attr({
    w: 150,
    h: 270,
    x: 780,
    y: 430
  });

  var coin = Crafty.e('Coin')
    .attr({
      x: coinArea._x + Math.floor((Math.random() * coinArea._w) + 1),
      y: coinArea._y + Math.floor((Math.random() * coinArea._h) + 1)
    });
  coin.coinArea = {
    _x: coinArea._x,
    _y: coinArea._y,
    _w: coinArea._w,
    _h: coinArea._h
  };

}); // Game scene

var isiPad = navigator.userAgent.match(/iPad/i) !== null;

Crafty.init(1024, 748).canvas.init();

Crafty.background("#dedede");

Crafty.scene("Game");

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
        })
      });
    }
  }
});

socket.on('disconnected', function(client) {
  console.log(client + ' disconnected');
  // remove client from clients array when client disconnect
  clients = _.without(clients, _.findWhere(clients, {
    client: client
  }));
});

socket.on('connected', function(client) {
  console.log(client + ' connected');
});