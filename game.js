var sprites = {
 ship: { sx: 0, sy: 0, rw: 116 , rh: 130, frames: 1, w: 38 , h: 43 },
 missile: { sx: 685, sy: 0, rw: 18, rh: 104, frames: 1, w: 3.6, h: 20 },
 enemy_purple: { sx: 116 , sy: 0, rw: 242, rh: 162, frames: 1, w: 60.5, h: 40.5 },
 enemy_bee: { sx: 358 , sy: 0, rw: 66, rh: 230, frames: 1, w: 16.5, h: 57.5 },
 enemy_ship: { sx: 425 , sy: 0, rw: 83, rh: 160, frames: 1, w: 28, h: 53 },
 enemy_circle: { sx: 508 , sy: 0, rw: 177, rh: 175, frames: 1, w: 44.25, h: 43.75 },
 enemy_blueR: { sx: 704 , sy: 0, rw: 155, rh: 154, frames: 1, w: 39, h: 38 },
 enemy_blueL: { sx: 859 , sy: 0, rw: 155, rh: 154, frames: 1, w: 39, h: 38 },
 enemy_boss: { sx: 1015 , sy: 0, rw: 211, rh: 293, frames: 1, w: 211, h: 293 },
 enemy_missile: { sx: 1225 , sy: 0, rw: 56, rh: 54, frames: 1, w: 14, h: 14 },
 explosion: { sx: 0, sy: 243, rw: 64, rh: 64, frames: 12, w: 32, h: 32 }
};

var enemies = {
  straight: { x: 600,   y: -50, sprite: 'enemy_ship', health: 10, 
              E: 100 },
  ltr:      { x: 400,   y: -100, sprite: 'enemy_purple', health: 10, 
              B: 75, C: 1, E: 100  },
  circle:   { x: 500,   y: -50, sprite: 'enemy_circle', health: 10, 
              A: 0,  B: -200, C: 1, E: 20, F: 200, G: 1, H: Math.PI/2 },
  wiggle:   { x: 350, y: -50, sprite: 'enemy_bee', health: 20, 
              B: 50, C: 4, E: 100 },
  horizonR:  { x: 800, y: 600, sprite: 'enemy_blueR', health: 20, 
              A: -100 , E: -100 },
  horizonL:  { x: 0, y: 600, sprite: 'enemy_blueL', health: 20, 
              A: 100, E: -100 },
  step:     { x: 10,   y: -50, sprite: 'enemy_circle', health: 10,
              B: 400, C: 1.2, E: 75 },
  boss:     { x: 400,   y: -300, sprite: 'enemy_boss', health: 1000,
              B: 40, C: 1, E: 35 }
};

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16;
//记录当前摧毁的飞机数量
var count = 0;
var startGame = function() {
  Game.setBoard(0,new Starfield(20,0.4,100,true));
  Game.setBoard(1,new Starfield(50,0.6,100));
  Game.setBoard(2,new Starfield(100,1.0,50));
  Game.setBoard(3,new TitleScreen("Piexl Plane War", 
                                  "Press Space to start playing",
                                  playGame));
};

var level1 = [
 // 开始时间,   结束时间, 生成飞机的间隔,  类型,   重载位置函数
  [ 0,      4000,  500, 'step' ],
  [ 6000,   13000, 600, 'ltr' ],
  [ 10000,  16000, 550, 'circle' ],
  [ 17800,  20000, 650, 'straight', { x: 200 } ],
  [ 18200,  20000, 650, 'straight', { x: 400 } ],
  [ 18200,  20000, 650, 'straight', { x: 600 } ],
  [ 22000,  25000, 600, 'wiggle', { x: 200 }],
  [ 22000,  25000, 600, 'wiggle', { x: 600 }],
  [ 25000,  28000, 600, 'horizonR'],  
  [ 25000,  28000, 600, 'horizonL'],
  [ 29000,  31000, 800, 'ltr',{x: 300} ],
  [ 30000,  32000, 800, 'ltr',{x: 500} ],
  [ 31000,  31300, 400, 'boss',{x:400,sy:100,lastfire:0}],
  [ 31300,  31600, 600, 'boss',{x:100,sy:100,lastfire:0}]
];



var playGame = function() {
  count = 0
  var board = new GameBoard();
  board.add(new PlayerShip());
  board.add(new Level(level1,winGame));
  board.add(new ShowScreen())
  Game.setBoard(3,board);
};

var winGame = function() {
  Game.setBoard(3,new TitleScreen("You win!", 
                                  "Press Space to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(3,new TitleScreen("Game Over!", 
                                  "Press Space to play again",
                                  playGame));
};
//加载界面完毕初始化游戏
window.addEventListener("load", function() {
  //初始化视图之后回调startGame函数
  Game.initialize("game",sprites,startGame);

});

//绘制星空，三层星空自动随机生成星星
var Starfield = function(speed,opacity,numStars,clear) {

  // Set up the offscreen canvas
  var stars = document.createElement("canvas");
  stars.width = Game.width; 
  stars.height = Game.height;
  var starCtx = stars.getContext("2d");

  var offset = 0;

  // If the clear option is set, 
  // make the background black instead of transparent
  if(clear) {
    starCtx.fillStyle = "#000";
    starCtx.fillRect(0,0,stars.width,stars.height);
  }

  // Now draw a bunch of random 2 pixel
  // rectangles onto the offscreen canvas
  starCtx.fillStyle = "#FFF";
  starCtx.globalAlpha = opacity;
  for(var i=0;i<numStars;i++) {
    starCtx.fillRect(Math.floor(Math.random()*stars.width),
                     Math.floor(Math.random()*stars.height),
                     2,
                     2);
  }

  // This method is called every frame
  // to draw the starfield onto the canvas
  this.draw = function(ctx) {
    var intOffset = Math.floor(offset);
    var remaining = stars.height - intOffset;

    // Draw the top half of the starfield
    if(intOffset > 0) {
      ctx.drawImage(stars,
                0, remaining,
                stars.width, intOffset,
                0, 0,
                stars.width, intOffset);
    }

    // Draw the bottom half of the starfield
    if(remaining > 0) {
      ctx.drawImage(stars,
              0, 0,
              stars.width, remaining,
              0, intOffset,
              stars.width, remaining);
    }
  };

  // This method is called to update
  // the starfield
  this.step = function(dt) {
    offset += dt * speed;
    offset = offset % stars.height;
  };
};

//玩家控制的飞船
var PlayerShip = function() { 
  this.setup('ship', { vx: 0,vy : 0, reloadTime: 0.25, maxVel: 400 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - 10 - this.h;

  this.step = function(dt) {
    if(Game.keys['left']) { this.vx = -this.maxVel; }
    else if(Game.keys['right']) { this.vx = this.maxVel; }
    else { this.vx = 0; }
     
    if(Game.keys['up']) { this.vy = -this.maxVel; }
    else if(Game.keys['down']) { this.vy = this.maxVel; }
    else { this.vy = 0; }
     
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    //canvas的坐标从左上角开始为（0,0）
    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) { 
      this.x = Game.width - this.w;
    }

    if(this.y < 0) { this.y = 0; }
    else if(this.y > Game.height - this.h) { 
      this.y = Game.height - this.h;
    }
    // console.log("h is :" +this.h)
    // console.log("y is :" +this.y)
    this.reload-=dt;
    if(Game.keys['fire'] && this.reload < 0) {
      Game.keys['fire'] = false;
      this.reload = this.reloadTime;

      this.board.add(new PlayerMissile(this.x,this.y+this.h/2));
      this.board.add(new PlayerMissile(this.x+this.w,this.y+this.h/2));
    }
  };
};

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;

PlayerShip.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};


var PlayerMissile = function(x,y) {
  this.setup('missile',{ vy: -700, damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h; 
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y < -this.h) { 
      this.board.remove(this); 
  }
};

var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0 };
Enemy.prototype.step = function(dt) {
  this.t += dt;//0.03
  // var fire = Math.round((this.t)*100)/100
  if(this.sy != 0){
    if(this.y > this.sy){
      this.E = 0;
      this.B = 80;
    }
   // console.log("this time is "+this.t%0.3);
   if((this.t-this.lastfire) > 0.3){
       // console.log("fire!");
      var mvx = 200*Math.sin(this.t);
      var mvy = Math.sqrt(40000-mvx*mvx);
      if(Math.sin(this.t-Math.PI/2)>=0){

      }else{
              mvy = -mvy;
      }
       // console.log("vx is "+ mvx +" vy is "+mvy)
      this.board.add(new EnemyMissile(this.x+113,this.y+176,mvx,mvy));  
      this.lastfire = this.t;
      }
  }
  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;
  // console.log("x is "+ this.x);
  // console.log("y is "+ this.y)
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

// function count(){console.log(this.number)}
Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      count++;
      this.board.add(new Explosion(this.x + this.w/2, 
                                   this.y + this.h/2));
    }
  }
};
//boss的炮弹 
var EnemyMissile = function(x,y,vx,vy) {
  this.setup('enemy_missile',{vx: 0,vy: 0,damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h; 
  this.vx = vx;
  this.vy= vy;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

EnemyMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  this.x += this.vx * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y > Game.height) { 
      this.board.remove(this); 
  }
};

var Explosion = function(centerX,centerY) {
  this.setup('explosion', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
  this.frame++;
  if(this.frame >= 12) {
    this.board.remove(this);
  }
};



