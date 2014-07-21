Crafty.scene("Game", function() {

  // Crafty.background("url(img/track.png)");
  /**
   * Create TRACK
   */
  var track = Crafty.e("2D, Canvas, Color").attr({
    x: 10,
    y: 160,
    w: 1004,
    h: 580
  }).color('#585858');


  /**
   * Create COINS
   */
  coinsEnt = Crafty.e("2D, Canvas, Text").attr({
    x: 30,
    y: 30,
    w: 200,
    h: 100
  }).text("Coins: " + coins).textColor('#111111').textFont({
    size: '40px',
    weight: 'bold'
  });

  /**
   * Create CAR
   */
  var car = Crafty.e('PlayerCar').attr({
    x: 50,
    y: 225
  });

  /**
   * Create GRASS
   * This is used to modify the track, create more grass variables to make your own tracks
   */
  var grass1 = Crafty.e('Grass, Color').attr({
    w: 228,
    h: 131,
    x: 296,
    y: 327,
    z: 2
  }).color('#04B404');
  var grass2 = Crafty.e('Grass, Color').attr({
    w: 216,
    h: 253,
    x: 523,
    y: 327,
    z: 2
  }).color('#04B404');
  var grass3 = Crafty.e('Grass, Color').attr({
    w: 137,
    h: 416,
    x: 12,
    y: 322,
    z: 2
  }).color('#04B404');
  var grass4 = Crafty.e('Grass, Color').attr({
    w: 169,
    h: 93,
    x: 149,
    y: 645,
    z: 2
  }).color('#04B404');
  var grass5 = Crafty.e('Grass, Color').attr({
    w: 96,
    h: 227,
    x: 917,
    y: 162,
    z: 2
  }).color('#04B404');

}); // Game scene