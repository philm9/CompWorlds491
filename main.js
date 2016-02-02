var start = false;
var start2 = false;
var character = 0;
var score = 0;
var lives = 3;
var scrollSpeed = 4;
var score = 0;


function distance(a, b) {
    var difX = a.x - b.x;
    var difY = a.y - b.y;
    return Math.sqrt(difX * difX + difY * difY);
};

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
   this.spriteSheet = spriteSheet;
   this.startX = startX;
   this.startY = startY;
   this.frameWidth = frameWidth;
   this.frameDuration = frameDuration;
   this.frameHeight = frameHeight;
   this.frames = frames;
   this.totalTime = frameDuration * frames;
   this.elapsedTime = 0;
   this.loop = loop;
   this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
   var scaleBy = scaleBy || 1;
   this.elapsedTime += tick;
   if (this.loop) {
       if (this.isDone()) {
           this.elapsedTime = 0;
       }
   } else if (this.isDone()) {
       return;
   }
   var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
   var vindex = 0;
   if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
       index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
       vindex++;
   }
   while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
       index -= Math.floor(this.spriteSheet.width / this.frameWidth);
       vindex++;
   }

   var locX = x;
   var locY = y;
   var offset = vindex === 0 ? this.startX : 0;
   ctx.drawImage(this.spriteSheet,
                 index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 locX, locY,
                 this.frameWidth * scaleBy,
                 this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
   return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
   return (this.elapsedTime >= this.totalTime);
}

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {
    if (this.right >= oth.left && this.left <= oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
    return false;
}

function StartButton(game, x, y) {
    this.animationWait = new Animation(ASSET_MANAGER.getAsset("./img/button-start.png"), 0, 0, 150, 53, 1, 1, true, false);
    this.animationHover = new Animation(ASSET_MANAGER.getAsset("./img/button-start.png"), 0, 53, 150, 53, 1, 1, true, false);
    this.animationClick = new Animation(ASSET_MANAGER.getAsset("./img/button-start.png"), 0, 106, 150, 54, 1, 10, true, false);
    this.hover = false;
    this.click = false;
    Entity.call(this, game, x, y);
}
StartButton.prototype = new Entity();
StartButton.prototype.constructor = StartButton;

StartButton.prototype.update = function () {
    if (this.game.mouse) {
        if (this.game.mouse.x > this.x && this.game.mouse.x < this.x + 150 &&
                            this.game.mouse.y > this.y && this.game.mouse.y < this.y + 51) {
            if(!this.click) this.hover = true;
            if (this.game.click) {
                this.hover = false;
                this.click = true;
                start = true;
                this.removeFromWorld = true;
            }
        }
        else this.hover = false;
    }
    Entity.prototype.update.call(this);
}

StartButton.prototype.draw = function (ctx) {
    if (this.hover) {
        this.animationHover.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if (this.click){
        this.animationClick.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        this.animationWait.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

function PlayGame(game, x, y) {
    //console.log('hi');
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/long.png"), 0, 0, 7498, 1152, 1, 1, true, false);
    Entity.call(this, game, x, y);
}

PlayGame.prototype = new Entity();
PlayGame.prototype.constructor = PlayGame;

//PlayGame.prototype.reset = function () {
//    this.game.running = false;
//}
PlayGame.prototype.update = function () {
    if (start) {
        characterSelection(this.game);
        this.removeFromWorld = true;
    }
}

PlayGame.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x-255, this.y - 350);
    Entity.prototype.draw.call(this);
}

function CharacterSelectionBackground(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/ChooseCharacterBackground.png"), 0, 0, 800, 576, 1, 1, true, false);
    Entity.call(this, game, x, y);
}
CharacterSelectionBackground.prototype = new Entity();
CharacterSelectionBackground.prototype.constructor = CharacterSelectionBackground;

CharacterSelectionBackground.prototype.update = function () {
    if (start2) {
        startPlaying(this.game);
        this.removeFromWorld = true;
    }
}

CharacterSelectionBackground.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function LinkSelect(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/LINK.png"), 0, 0, 400, 288, 1, 1, true, false);
    this.animation2 = new Animation(ASSET_MANAGER.getAsset("./img/LINK-choose.png"), 0, 0, 400, 288, 1, 1, true, false);
    this.animation3 = new Animation(ASSET_MANAGER.getAsset("./img/FierceLINK.png"), 0, 0, 400, 288, 1, 1, true, false);
    this.animation4 = new Animation(ASSET_MANAGER.getAsset("./img/FierceLINK-Choose.png"), 0, 0, 400, 288, 1, 1, true, false);
    this.choose = false;
    this.choose2 = false;
    Entity.call(this, game, x, y);
}
LinkSelect.prototype = new Entity();
LinkSelect.prototype.constructor = LinkSelect;

LinkSelect.prototype.update = function () {
    if (this.game.mouse) {
        if (this.game.mouse.x < 300 && this.game.mouse.y < 288) this.choose = true;
        else if (this.game.mouse.x > 550 && this.game.mouse.y > 288) this.choose2 = true;
        else {
            this.choose = false;
            this.choose2 = false;
        }
    }
    if (this.game.click) {
        if (this.game.click.x < 300 && this.game.click.y < 288) {
            var link = new Link(this.game);
            character = 1;
            start2 = true;
            this.removeFromWorld = true;
        }
    }
    Entity.prototype.update.call(this);
}

LinkSelect.prototype.draw = function (ctx) {
    if (this.choose) {
        this.animation3.drawFrame(this.game.clockTick, ctx, this.x+400, this.y+300);
        this.animation2.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if (this.choose2) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        this.animation4.drawFrame(this.game.clockTick, ctx, this.x+400, this.y+300);
    }
    else {
        this.animation3.drawFrame(this.game.clockTick, ctx, this.x+400, this.y+300);
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

function Platform(game, x, y, width, height) {
    this.width = width;
    this.height = height;
    this.startX = x;
    this.startY = y;
    this.boundingbox = new BoundingBox(x, y, width, height);
    Entity.call(this, game, x, y);
}

Platform.prototype = new Entity();
Platform.prototype.constructor = Platform;

Platform.prototype.reset = function () {
    this.x = this.startX;
    this.y = this.startY;
}
var moveF = false;
Platform.prototype.update = function () {
    //if (moveF) {
        this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    //}
}

Platform.prototype.draw = function (ctx) {
    var grad;
    var offset = 0;

    grad = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
    grad.addColorStop(0, 'green');
    ctx.fillStyle = grad;

    ctx.fillRect(this.x, this.y, this.width, this.height);
}

function Background(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/background0.png"), 0, 0, 1920, 1080, 1, 1, true, false);
    this.startX = x;
    this.startY = y;
    Entity.call(this, game, x, y);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;
var moveUp = false;
var moveDown = false;
Background.prototype.update = function () {
    // move the map slowly
    /**************************/
    //move map right
    if (!(this.x + 1400 < 800) && this.game.link.x >= 400) {
        this.game.link.x = 396;
        this.x -= 1;
        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i].x;
            this.game.platforms[i].x -= 4;
            this.game.platf.update();
        }
        for (var i = 0; i < this.game.coinsArr.length; i++) { //looping through all coins
            var pf = this.game.coinsArr[i].x;
            this.game.coinsArr[i].x -= 4;
        }
        for (var i = 0; i < this.game.spikesArr.length; i++) { //looping through all coins
            var pf = this.game.spikesArr[i].x;
            this.game.spikesArr[i].x -= 4;
        }
        for (var i = 0; i < this.game.flyArr.length; i++) { //looping through all coins
            var pf = this.game.flyArr[i].x;
            this.game.flyArr[i].x -= 4;
        }
        for (var i = 0; i < this.game.mapArr.length; i++) { //looping through all map tiles
            var pf = this.game.mapArr[i].x;
            this.game.mapArr[i].x -= 4;
        }
    }
    //move map left
    if (!(this.x >= 0) && this.game.link.x <= 350) {
        this.game.link.x = 354;
        this.x += 1;
        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i].x;
            this.game.platforms[i].x += 4;
            this.game.platf.update();
        }
        for (var i = 0; i < this.game.coinsArr.length; i++) { //looping through all coins
            var pf = this.game.coinsArr[i].x;
            this.game.coinsArr[i].x += 4;
        }
        for (var i = 0; i < this.game.spikesArr.length; i++) { //looping through all coins
            var pf = this.game.spikesArr[i].x;
            this.game.spikesArr[i].x += 4;
        }
        for (var i = 0; i < this.game.flyArr.length; i++) { //looping through all coins
            var pf = this.game.flyArr[i].x;
            this.game.flyArr[i].x += 4;
        }
        for (var i = 0; i < this.game.mapArr.length; i++) { //looping through all map tiles
            var pf = this.game.mapArr[i].x;
            this.game.mapArr[i].x += 4;
        }
    }
    //move map up
    if (!(this.y > 0) && this.game.link.y <= 200) {
        //this.game.link.y = 210;  //doesnt work
        this.y += 1;
        for (var i = 0; i < this.game.platforms.length; i++) { //looping through all platforms
            var pf = this.game.platforms[i].y;
            this.game.platforms[i].y += 6;
            this.game.platf.update();
        }
        for (var i = 0; i < this.game.coinsArr.length; i++) { //looping through all platforms
            var pf = this.game.coinsArr[i].y;
            this.game.coinsArr[i].y += 6;
        }
        for (var i = 0; i < this.game.spikesArr.length; i++) { //looping through all coins
            var pf = this.game.spikesArr[i].y;
            this.game.spikesArr[i].y += 6;
        }
        for (var i = 0; i < this.game.flyArr.length; i++) { //looping through all coins
            var pf = this.game.flyArr[i].y;
            this.game.flyArr[i].y += 6;
        }
        for (var i = 0; i < this.game.mapArr.length; i++) { //looping through all coins
            var pf = this.game.mapArr[i].y;
            this.game.mapArr[i].y += 6;
        }
    }
    //move map down
    if (!(this.y + 846 < 576) && this.game.link.y >= 350) {
    //if (this.game.link.y >= 350) {
        this.game.link.y = 344;
        this.game.link.falling = true;
        this.y -= 1;
        for (var i = 0; i < this.game.platforms.length; i++) { //looping through all platforms
            var pf = this.game.platforms[i].y;
            this.game.platforms[i].y -= 6;
            this.game.platf.update();
        }
        for (var i = 0; i < this.game.coinsArr.length; i++) { //looping through all platforms
            var pf = this.game.coinsArr[i].y;
            this.game.coinsArr[i].y -= 6;
        }
        for (var i = 0; i < this.game.spikesArr.length; i++) { //looping through all coins
            var pf = this.game.spikesArr[i].y;
            this.game.spikesArr[i].y -= 6;
        }
        for (var i = 0; i < this.game.flyArr.length; i++) { //looping through all coins
            var pf = this.game.flyArr[i].y;
            this.game.flyArr[i].y -= 6;
        }
        for (var i = 0; i < this.game.mapArr.length; i++) { //looping through all coins
            var pf = this.game.mapArr[i].y;
            this.game.mapArr[i].y -= 6;
        }
    }
    Entity.prototype.update.call(this);
}

Background.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function Lives(game) {
    Entity.call(this, game, 200, 200);
}
Lives.prototype = new Entity();
Lives.prototype.constructor = Lives;

Lives.prototype.update = function () {

}

Lives.prototype.draw = function (ctx) {
    ctx.font = "24px serif";
    ctx.fillText("Lives: " + lives, 200, 30);
    Entity.prototype.draw.call(this);
}


function Score(game) {
    Entity.call(this, game, 0, 200);
}
Score.prototype = new Entity();
Score.prototype.constructor = Score;

Score.prototype.update = function () {

}

Score.prototype.draw = function (ctx) {
    ctx.font = "24px serif";
    ctx.fillText("Score: " + score, 10, 30);
    Entity.prototype.draw.call(this);
}

function Restart(game) {
    Entity.call(this, game, 0, 200);
}
Restart.prototype = new Entity();
Restart.prototype.constructor = Restart;

Restart.prototype.update = function () {

}

Restart.prototype.draw = function (ctx) {
    if (this.game.link.fallDead) {
        ctx.font = "24px serif";
        ctx.fillText("YOU DIED", 375, 280);
    }
    Entity.prototype.draw.call(this);
}

function Map(game, x, y) {
    this.startX = x;
    this.startY = y;
    this.tileAnimation = new Animation(ASSET_MANAGER.getAsset("./img/separatePng/tile_00.png"), 0, 0, 32, 32, 0.1, 1, true, false);
    this.width = 32;
    this.height = 32;
    this.boundingbox = new BoundingBox(x, y, this.width, this.height);
    this.x = x;
    this.y = y;
    Entity.call(this, game, x, y);
}
Map.prototype = new Entity();
Map.prototype.constructor = Map;

Map.prototype.update = function () {
    this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
}

Map.prototype.draw = function (ctx) {
    this.tileAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}





function Skills(game) {
    Entity.call(this, game, 0, 200);
}
Skills.prototype = new Entity();
Skills.prototype.constructor = Skills;

Skills.prototype.update = function () {

}

Skills.prototype.draw = function (ctx) {
    ctx.font = "24px serif";
    ctx.fillText("Score: " + score, 10, 30);
    Entity.prototype.draw.call(this);
}

function Coin(game, x, y) {
    this.coinAnimation = new Animation(ASSET_MANAGER.getAsset("./img/coins.png"), 0, 0, 44, 40, 0.1, 10, true, false);
    this.boundingbox = new BoundingBox(x, y, 44, 40);
    this.startX = x;
    this.startY = y;
    Entity.call(this, game, x, y);
}
Coin.prototype = new Entity();
Coin.prototype.constructor = Coin;

Coin.prototype.update = function () {
    if (this.boundingbox.collide(this.game.link.boundingbox)) {
        this.removeFromWorld = true;
        score++;
    }
}

Coin.prototype.draw = function (ctx) {
    this.coinAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function Spikes(game, x, y) {
    this.spikeAnimation = new Animation(ASSET_MANAGER.getAsset("./img/spikes.png"), 0, 0, 36, 20, 0.5, 1, true, false);
    this.boundingbox = new BoundingBox(x, y, 36, 20);
    this.startX = x;
    this.startY = y;
    Entity.call(this, game, x, y);
}
Spikes.prototype = new Entity();
Spikes.prototype.constructor = Spikes;

Spikes.prototype.update = function () {
    this.boundingbox = new BoundingBox(this.x, this.y, 36, 20);
    if (this.boundingbox.collide(this.game.link.boundingbox)) {
        if (!(this.game.health.width <= 0)) {
            this.game.health.width -= 0.1;
        }
        else this.game.link.fallDead = true;
    }
}

Spikes.prototype.draw = function (ctx) {
    this.spikeAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function Health(game, x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    Entity.call(this, game, this.x, this.y);
}
Health.prototype = new Entity();
Health.prototype.constructor = Health;

Health.prototype.update = function () {
}

Health.prototype.draw = function (ctx) {

    ctx.fillStyle = "Red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    Entity.prototype.draw.call(this);
}

function Fly(game, x, y) {
    this.x = x;
    this.y = y;
    this.flyAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 750, 0, 51, 29, 0.5, 2, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 51, 29);
    this.boxes = true;
    Entity.call(this, game, this.x, this.y);
}
Fly.prototype = new Entity();
Fly.prototype.constructor = Fly;

Fly.prototype.update = function () {
    this.boundingbox = new BoundingBox(this.x, this.y, 51, 29);
    if (this.boundingbox.collide(this.game.link.boundingbox)) {
        if (this.game.health.width < 150) {
            if (150 - this.game.health.width < 50) {
                this.game.health.width += 150 - this.game.health.width;
            } else {
                this.game.health.width += 50;
            }
            this.removeFromWorld = true;
        }
    }

   var jumpDistance = this.flyAnimation.elapsedTime / this.flyAnimation.totalTime;
   var totalHeight = 2;
   if (jumpDistance > 0.5)
       jumpDistance = 1 - jumpDistance;
   var height = jumpDistance * 2 * totalHeight;
   this.y -= height;
   this.y = this.y + 1;
   Entity.prototype.update.call(this);
}

Fly.prototype.draw = function (ctx) {
   this.flyAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
   Entity.prototype.draw.call(this);
}

function Link(game) {
   this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 0, 45, 79, 0.7, 2, true, false);
   //this.sleepAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 160, 45, 79, 1.5, 2, true, false);
   this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 465, 75, 101, 0.24, 3, false, false);
   this.runningAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 318, 75, 72, 0.05, 10, true, false);

   this.dyingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 669, 96, 99, 0.15, 3, false, false);
   this.dyingAnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 769, 96, 99, 0.1, 3, false, false);

   this.deadAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 288, 742, 96, 99, 0.2, 1, true, false);
   this.deadAnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 288, 842, 96, 99, 0.2, 1, true, false);

   this.downAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 225, 510, 75, 56, 1, 1, true, false);
   this.downAnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 225, 612, 75, 56, 1, 1, true, false);

   this.standAnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 81, 45, 79, 0.7, 2, true, false);
   //this.sleepAnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 240, 45, 79, 1.5, 2, true, false);
   //this.jumpingAnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 567, 75, 101, 0.3, 3, false, false);
   this.runningAnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 392, 75, 72, 0.05, 10, true, false);

   this.slash2Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 869, 150, 111, 0.1, 2, false, false);
   this.slash2AnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 981, 150, 111, 0.1, 2, false, false);

   this.slash3Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1093, 125, 93, 0.1, 2, false, false);
   this.slash3AnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1187, 125, 93, 0.1, 2, false, false);

   this.slash1Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1281, 140, 86, 0.1, 2, false, false);
   this.slash1AnimationReversed = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1368, 140, 86, 0.1, 2, false, false);

   this.fallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 150, 465, 75, 101, 2, 1, true, false);

   this.lives = 3;
   //game.lives.innerHTML = "Lives: " + this.lives;
   this.left = false;
   this.sleeping = false;
   this.running = false;
   this.jumping = false;
   this.down = false;
   this.dying = false;
   this.dead = false;
   this.slash = false;
   this.falling = false;
   this.fallDead = false;
   this.platform = platforms[0];
   this.tileM = mapArr[0];
   //console.log(platforms[0]);
   this.jumpHeight = 200;
   this.boundingbox = new BoundingBox(this.x + 25, this.y, this.runningAnimation.frameWidth - 40, this.runningAnimation.frameHeight);
   this.boxes = true;
   //this.radius = 50;
   //this.ground = 440;
   //var rect = this.getBoundingClientRect();
   Entity.call(this, game, 100, 425);
}

var linkSpeed = 4;
var linkX;
var animNum = 1;
Link.y;
Link.prototype = new Entity();
Link.prototype.constructor = Link;

//Link.prototype.reset = function () {
//    this.jumping = false;
//    this.falling = false;
//    this.dead = false;
//    this.lives--;
//    if (this.lives < 0) this.lives = 0;
//    this.game.lives.innerHTML = "Lives: " + this.lives;
//    this.x = 0;
//    this.y = 430;
//    this.platform = this.game.platforms[0];
//    this.boundingbox = new BoundingBox(this.x + 25, this.y, this.animation.frameWidth - 40, this.animation.frameHeight - 20);
//}

Link.prototype.update = function () {
    if (this.boundingbox.bottom > 576) {
        this.fallDead = true;
    }
    if (this.boundingbox.bottom > 3000) {
        this.x = 100;
        this.y = 425;
        this.fallDead = false;
        lives--;
        this.game.background.x = this.game.background.startX
        this.game.background.y = this.game.background.startY;
        for (var i = 0; i < this.game.platforms.length; i++) {
            this.game.platforms[i].x = this.game.platforms[i].startX;
            this.game.platforms[i].y = this.game.platforms[i].startY;
        }
        for (var i = 0; i < this.game.coinsArr.length; i++) {
            this.game.coinsArr[i].x = this.game.coinsArr[i].startX;
            this.game.coinsArr[i].y = this.game.coinsArr[i].startY;
        }
        for (var i = 0; i < this.game.spikesArr.length; i++) {
            this.game.spikesArr[i].x = this.game.spikesArr[i].startX;
            this.game.spikesArr[i].y = this.game.spikesArr[i].startY;
        }
        for (var i = 0; i < this.game.flyArr.length; i++) {
            this.game.flyArr[i].x = this.game.flyArr[i].startX;
            this.game.flyArr[i].y = this.game.flyArr[i].startY;
        }
        for (var i = 0; i < this.game.mapArr.length; i++) {
            this.game.mapArr[i].x = this.game.mapArr[i].startX;
            this.game.mapArr[i].y = this.game.mapArr[i].startY;
        }
    }
    //if(moveUp) this.y = 400;
    //console.log(this.y);
    linkX = this.x;
    Link.y = this.y;

   //*************************************//
   //****GET ORIENTATION OF MOVEMENTS*****//
   ////*************************************//
   if (this.game.A) this.left = true;
   if (this.game.D) this.left = false;
// console.log(this.x);
// console.log(move);
   ////*************************************//
   ////******CANCEL RUNNING ANIMATION*******//
   ////*************************************//
   if (!this.game.D || !this.game.A) {
       this.running = false;
   }

   ////*************************************//
   ////********CANCEL DOWN ANIMATION********//
   ////*************************************//
   //if (!this.game.S) this.down = false;

   ////*************************************//
   ////********CANCEL DEAD ANIMATION********//
   ////*************************************//
   //if (this.game.space || this.game.A || this.game.D) this.dead = false;

   ////*************************************//
   ////*********START RUNNING RIGHT*********//
   ////*************************************//
   if (this.game.D) {
       this.boundingbox = new BoundingBox(this.x, this.y, this.runningAnimation.frameWidth -15, this.runningAnimation.frameHeight);
       for (var i = 0; i < this.game.platforms.length; i++) { //looping through all platforms
           var pf = this.game.platforms[i];
           if (this.boundingbox.collide(pf.boundingbox)) {
                this.x -= linkSpeed;
            }
       }
       /************************************************TEST***TEST****TEST*/
       for (var i = 0; i < this.game.mapArr.length; i++) { //looping through all platforms
           var tile = this.game.mapArr[i];
           if (this.boundingbox.collide(tile.boundingbox)) {
               this.x -= linkSpeed;
           }
       }
       /************************************************TEST***TEST****TEST*/
       this.left = false;
       this.running = true;
       this.x += linkSpeed;
   }
   
   ////*************************************//
   ////*********START RUNNING LEFT**********//
   ////*************************************//
   if (this.game.A) {
       this.boundingbox = new BoundingBox(this.x-10, this.y, this.runningAnimationReversed.frameWidth - 20, this.runningAnimationReversed.frameHeight);
       for (var i = 0; i < this.game.platforms.length; i++) { //looping through all except first one, the base
            var pf = this.game.platforms[i];
            if (this.boundingbox.collide(pf.boundingbox)) this.x += linkSpeed;
            // console.log(falling);
       }
       /************************************************TEST***TEST****TEST*/
       for (var i = 0; i < this.game.mapArr.length; i++) { //looping through all except first one, the base
           var tile = this.game.mapArr[i];
           if (this.boundingbox.collide(tile.boundingbox)) this.x += linkSpeed;
           // console.log(falling);
       }
       /************************************************TEST***TEST****TEST*/
       this.left = true;
       this.running = true;
       this.x -= linkSpeed;
   }

   ////*************************************//
   ////*********ACTIVATE JUMPING************//
   ////*************************************//
   //if (this.game.space) this.jumping = true;
   ////*************************************//
   ////*********ACTIVATE "DOWN"*************//
   ////*************************************//
   //if (this.game.S) this.down = true;
   ////*************************************//
   ////*********ACTIVATE DYING**************//
   ////*************************************//
   //if (this.game.X) this.dying = true;
   ////*************************************//
   ////*********ACTIVATE SLASH**************//
   ////*************************************//
   //if (this.game.Q) {
   //    this.slash = true;
   //}
   //*************************************//
   //***********JUMPING LOGIC*************//
    //*************************************//
   if (this.game.space && !this.jumping && !this.falling) {
       this.jumping = true;
       this.base = this.y;
   }
   if (this.jumping) {
       //this.running = false;
       var height = 0;
       var duration = this.jumpAnimation.elapsedTime + this.game.clockTick;
       if (duration > this.jumpAnimation.totalTime / 2) duration = this.jumpAnimation.totalTime - duration;
       duration = duration / this.jumpAnimation.totalTime;

       // quadratic jump
       height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
       this.lastBottom = this.boundingbox.bottom;

       /*******************/
       //if (moveUp) {
       //    this.y = this.base - height + 500;
       //}
       /*******************/
   //else 
       this.y = this.base - height;
       this.boundingbox = new BoundingBox(this.x +5, this.y, this.jumpAnimation.frameWidth-30, this.jumpAnimation.frameHeight - 22);

       for (var i = 0; i < this.game.platforms.length; i++) {
           var pf = this.game.platforms[i];
           //console.log(this.boundingbox.top);
           //console.log(pf.boundingbox.bottom);
           if (this.boundingbox.collide(pf.boundingbox) &&
                            this.boundingbox.top+50 < pf.boundingbox.bottom+1000 &&
                            this.lastBottom > pf.boundingbox.bottom) {
               this.jumping = false;
               //this.y = pf.boundingbox.top - this.animation.frameHeight + 10;
               this.jumpAnimation.elapsedTime = 0;
               this.platform = pf;
               this.falling = true;
               //console.log('true');
           }
           //console.log(pf.y);
           if (this.boundingbox.collide(pf.boundingbox) && this.lastBottom < pf.boundingbox.top) {
               this.jumping = false;
               this.y = pf.boundingbox.top - this.jumpAnimation.frameHeight+25;
               this.platform = pf;
               this.jumpAnimation.elapsedTime = 0;
           }
       }
       /************************************************TEST***TEST****TEST*/
       for (var i = 0; i < this.game.mapArr.length; i++) {
           var tile = this.game.mapArr[i];
           //console.log(this.boundingbox.top);
           //console.log(tile.boundingbox.bottom);
           if (this.boundingbox.collide(tile.boundingbox) &&
                            this.boundingbox.top + 50 < tile.boundingbox.bottom + 1000 &&
                            this.lastBottom > tile.boundingbox.bottom) {
               this.jumping = false;
               //this.y = tile.boundingbox.top - this.animation.frameHeight + 10;
               this.jumpAnimation.elapsedTime = 0;
               this.tileM = tile;
               this.falling = true;
               //console.log('true');
           }
           //console.log(pf.y);
           if (this.boundingbox.collide(tile.boundingbox) && this.lastBottom < tile.boundingbox.top) {
               this.jumping = false;
               this.y = tile.boundingbox.top - this.jumpAnimation.frameHeight + 25;
               this.tileM = tile;
               this.jumpAnimation.elapsedTime = 0;
           }
       }
       /*****************************END***************TEST***TEST****TEST*/
   }
   
   //console.log(this.y);
   if (this.falling) {
       //console.log('falling');
       //this.jumpAnimation.elapsedTime = 0;
       this.jumping = false;
       //console.log(this.y);
        this.lastBottom = this.boundingbox.bottom;
        this.y += this.game.clockTick / this.fallAnimation.totalTime *10* this.jumpHeight;
        this.boundingbox = new BoundingBox(this.x, this.y+20, this.jumpAnimation.frameWidth -40, this.jumpAnimation.frameHeight+20);

        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i];
            if (this.boundingbox.collide(pf.boundingbox)) { // && this.lastBottom < pf.boundingbox.top) {
                this.falling = false;
                this.y = pf.boundingbox.top - this.fallAnimation.frameHeight + 25;
                //if(this.lastBottom-20 < pf.boundingbox.top-20) {
                    this.platform = pf;
                //}
                this.fallAnimation.elapsedTime = 0;
            }
        }

       /************************************************TEST***TEST****TEST*/
        for (var i = 0; i < this.game.mapArr.length; i++) {
            var tile = this.game.mapArr[i];
            if (this.boundingbox.collide(tile.boundingbox)) { // && this.lastBottom < tile.boundingbox.top) {
                this.falling = false;
                this.y = tile.boundingbox.top - this.fallAnimation.frameHeight + 25;
                //if(this.lastBottom-20 < tile.boundingbox.top-20) {
                this.tileM = tile;
                //}
                this.fallAnimation.elapsedTime = 0;
            }
        }


       /************************************************TEST***TEST****TEST*/
    }
    

   if (!this.jumping && !this.falling) {
       this.boundingbox = new BoundingBox(this.x, this.y, this.standAnimation.frameWidth, this.standAnimation.frameHeight);
       if (this.boundingbox.left > this.platform.boundingbox.right) this.falling = true;
       if (this.boundingbox.right < this.platform.boundingbox.left) this.falling = true;
   }

    /************************************************TEST***TEST****TEST*/
   //if (!this.jumping && !this.falling) {
   //    this.boundingbox = new BoundingBox(this.x, this.y, this.standAnimation.frameWidth, this.standAnimation.frameHeight);
   //    if (this.boundingbox.left > this.tileM.boundingbox.right) this.falling = true;
   //    if (this.boundingbox.right < this.tileM.boundingbox.left) this.falling = true;
   //}

    /************************************************TEST***TEST****TEST*/

   //*************************************//
   //**************DOWN LOGIC*************//
   //*************************************//
   if (this.down) {
       if (this.downAnimation.isDone()) {
           this.downAnimation.elapsedTime = 0;
       }
   }

   //*************************************//
   //*************DYING LOGIC*************//
   //*************************************//
   if (this.dying) {
       if (this.dyingAnimation.isDone() || this.dyingAnimationReversed.isDone()) {
           this.dead = true;
           this.dyingAnimation.elapsedTime = 0;
           this.dyingAnimationReversed.elapsedTime = 0;
           this.dying = false;
       }

       if (this.left) this.x += 2;
       if (!this.left) this.x -= 2;
   }

   //*************************************//
   //**************DEAD LOGIC*************//
   //*************************************//
   if (this.dead) {
       if (this.deadAnimation.isDone()) {
           this.deadAnimation.elapsedTime = 0;
           this.game.reset();
           return;
           //if (this.game.space) this.dying = false;
       }
   }

   //*************************************//
   //***********SLASH LOGIC***************//
   //*************************************//
   if (this.slash) {
       //animNum = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
       //needs optimization
       if (this.slash1Animation.isDone() || this.slash1AnimationReversed.isDone() ||
           this.slash2Animation.isDone() || this.slash2AnimationReversed.isDone() ||
           this.slash3Animation.isDone() || this.slash3AnimationReversed.isDone()) {
           this.slash1Animation.elapsedTime = 0;
           this.slash1AnimationReversed.elapsedTime = 0
           this.slash2Animation.elapsedTime = 0;
           this.slash2AnimationReversed.elapsedTime = 0;
           this.slash3Animation.elapsedTime = 0;
           this.slash3AnimationReversed.elapsedTime = 0;
           this.slash = false;
           if (animNum == 3) animNum = 1;
           else animNum++;
       }
   }

   //if standing
   if (!this.dying && !this.dead && !this.running &&
       !this.jumping && !this.down && !this.slash && !this.falling) {
       this.boundingbox = new BoundingBox(this.x, this.y, this.jumpAnimation.frameWidth-30, this.jumpAnimation.frameHeight-24);
    //    this.x = this.x - 2;
       linkSpeed = 4;
   }
   
   //*************************************//
   //************CHECK BOUNDS*************//
   //*************************************//
   if (this.x <= -20) {
       this.x = this.x + linkSpeed;
   }
   if (this.x >= 800-20) {   // frame width - sprite width
       this.x = this.x - linkSpeed;
   }
   Entity.prototype.update.call(this);
}

Link.prototype.draw = function (ctx) {
   if (this.left) {
       if (this.sleeping) {
           //this.sleepAnimationReversed.drawFrame(this.game.clockTick, ctx, this.x, this.y+1);
       }
       else if (this.falling) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x, this.y, this.fallAnimation.frameWidth - 10, this.fallAnimation.frameHeight - 20);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width-40, this.boundingbox.height - 40);
           }
           ctx.save();
           ctx.scale(-1, 1);
           this.fallAnimation.drawFrame(this.game.clockTick, ctx, -this.x-60, this.y - 21);
           ctx.restore();
       }
       else if (this.jumping) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x+5, this.y, this.jumpAnimation.frameWidth-20, this.jumpAnimation.frameHeight-22);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           ctx.save();
           ctx.scale(-1, 1);
           this.jumpAnimation.drawFrame(this.game.clockTick, ctx, -this.x-60, this.y - 21);
           ctx.restore();
       }
       else if (this.running) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x-10, this.y, this.runningAnimation.frameWidth-20, this.runningAnimation.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.runningAnimationReversed.drawFrame(this.game.clockTick, ctx, this.x, this.y + 5);
       }
       else if (this.down) {
           this.downAnimationReversed.drawFrame(this.game.clockTick, ctx, this.x, this.y + 23);
       }
       else if (this.dying) {
           this.dyingAnimationReversed.drawFrame(this.game.clockTick, ctx, this.x, this.y-20);
       }
       else if (this.dead) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x + 32, this.y - 32, this.deadAnimationReversed.frameWidth, this.deadAnimationReversed.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.deadAnimationReversed.drawFrame(this.game.clockTick, ctx, this.x, this.y + 53);
       }
       else if (this.slash) {
           if (animNum == 1) this.slash1AnimationReversed.drawFrame(this.game.clockTick, ctx, this.x - 79, this.y - 7); //OK
           if (animNum == 2) this.slash2AnimationReversed.drawFrame(this.game.clockTick, ctx, this.x - 81, this.y - 32); //OK
           if (animNum == 3) this.slash3AnimationReversed.drawFrame(this.game.clockTick, ctx, this.x - 77, this.y - 5); //OK
       }
       else {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x, this.y, this.standAnimationReversed.frameWidth, this.standAnimationReversed.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.standAnimationReversed.drawFrame(this.game.clockTick, ctx, this.x, this.y);
       }
   }
   else {
       if (this.sleeping) {
           //this.sleepAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
       }
       else if (this.falling) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x, this.y, this.fallAnimation.frameWidth, this.fallAnimation.frameHeight - 20);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height-40);
           }
           //console.log(this.x);
           this.fallAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 21);
       }
       else if (this.jumping) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x+5, this.y, this.jumpAnimation.frameWidth, this.jumpAnimation.frameHeight-22);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 21);
           if (this.jumpAnimation.isDone()) {
               this.jumpAnimation.elapsedTime = 0;
               this.jumping = false;
               this.falling = true;
           }
       }
       else if (this.running) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x, this.y, this.runningAnimation.frameWidth -15, this.runningAnimation.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.runningAnimation.drawFrame(this.game.clockTick, ctx, this.x-20, this.y + 5);
       }
       else if (this.down) {
           this.downAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y + 23);
       }
       else if (this.dying) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x + 32, this.y - 32, this.dyingAnimation.frameWidth, this.dyingAnimation.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.dyingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y-20);
       }
       else if (this.dead) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x + 32, this.y - 32, this.deadAnimation.frameWidth, this.deadAnimation.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.deadAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y + 53);
       }
       else if (this.slash) {
           if (animNum == 1) this.slash1Animation.drawFrame(this.game.clockTick, ctx, this.x - 15, this.y - 7); //OK
           if (animNum == 2) this.slash2Animation.drawFrame(this.game.clockTick, ctx, this.x - 22, this.y - 32); //OK
           if (animNum == 3) this.slash3Animation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 5); //OK
       }
       else {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x-2, this.y-2, this.standAnimation.frameWidth+2, this.standAnimation.frameHeight+2);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.standAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
       }
   }
   Entity.prototype.draw.call(this);
}


Link.prototype.collide = function (other) {
    console.log('collide true');
    return distance(this, other) < this.radius + other.radius;
};

Link.prototype.hitFly = function () {
   //needs further development
   return ((this.y <= Fly.y + 29 && this.y >= Fly.y ||
   this.y + 101 <= Fly.y + 29 && this.y + 101 >= Fly.y) &&
   (this.x + 75 >= Fly.x && this.x + 75 <= Fly.x + 51 ||
   this.x >= Fly.x && this.x <= Fly.x + 51));
}
//var ground = [ //this is a map
//    [],
//    [],
//    [0, 0, 0, 42, 43, 39],
//    [0, 0, 0, 0, 0, 0, 50, , , , , , 42, 39],
//    [0, 0, 0, 0, 0, 0, 50, , , , , , , , , , , , , 50],
//    [0, 0, 0, 0, 0, 0, 50, 37, 38, 0, , , , , , , , , 42, 43, 43, 43, 39],
//    [0, 0, 0, 0, 0, 0, 50],
//    [0, 0, 0, 0, 0, 0, 6, 50],
//    [0, 0, 0, 0, 0, 50, 6, 6, 50, , , , , , , , , 26],
//    [21, 22, 22, 22, 22, 22, 22, 22, 22, 62, 0, 0, 0, 0, 0, 0, 21, 22, 22, 22, 62],
//    [],
//    [, , , , , , , , , , , , , , 50],
//    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, , , 50, 6],
//    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 6, 6, 50],
//    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 21, 22, 22, 51, 51, 51, 51, 51, 62],
//    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, , , , 23, 4, 4, 8, 50, 50],
//    [0, 0, 0, 0, 44, 44, 0, 50, 0, 0, 0, 0, 0, 0, , 4, 4, 50, 50, 50],
//    [51, 51, 51, 51, 51, 51, 51, 1, 0, 0, 0, 0, 0, 0, 0, 61, 4, 51, 51, 51, 51, 51, 51, 51, 51, 51]
//];
//function Dungeon(game) {
//    Entity.call(this, game, 0, 0);
//
//    this.dungeon = new Array(32);
//    for (var i = 0; i < 32; i++) {
//        this.dungeon[i] = new Array(24);
//    }
//    this.sprites = new Array(48);
//
//    var testDungeon = [ [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0], // bottom --->>>
//                        [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
//                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
//
//    this.dungeon = testDungeon;
//
//    this.sprites[0] = null;
//    this.sprites[1] = ASSET_MANAGER.getAsset("./img/separatePng/tile_00.png");
//    this.sprites[2] = ASSET_MANAGER.getAsset("./img/separatePng/tile_01.png");
//    this.sprites[3] = ASSET_MANAGER.getAsset("./img/separatePng/tile_02.png");
//    this.sprites[4] = ASSET_MANAGER.getAsset("./img/separatePng/tile_03.png");
//    this.sprites[5] = ASSET_MANAGER.getAsset("./img/separatePng/tile_04.png");
//    this.sprites[6] = ASSET_MANAGER.getAsset("./img/separatePng/tile_05.png");
//    this.sprites[7] = ASSET_MANAGER.getAsset("./img/separatePng/tile_06.png");
//    this.sprites[8] = ASSET_MANAGER.getAsset("./img/separatePng/tile_07.png");
//    this.sprites[9] = ASSET_MANAGER.getAsset("./img/separatePng/tile_08.png");
//
//}
//Dungeon.prototype = new Entity();
//Dungeon.prototype.constructor = Dungeon;
  //
//Dungeon.prototype.update = function () {
//    if (this.game.click) {
//        if (this.game.click.x < 32) {
//            this.dungeon[this.game.click.x][this.game.click.y] = game.mouseShadow.tile;
//        }
//    }
//    Entity.prototype.update.call(this);
//}
//Dungeon.prototype.draw = function (ctx) {
//    for (var i = 0; i < 32; i++) {
//        for (var j = 0; j < 24; j++) {
//            var sprite = this.sprites[this.dungeon[i][j]];
//            if (sprite) {
//                ctx.drawImage(sprite, i * 32, j * 32);
//            }
//        }
//    }
//}
// function TilePalette(game) {
//     Entity.call(this, game, 33, 2);
//     this.sprites = new Array(15);
//     this.tiles = new Array(15);
//
//     this.sprites[0] = ASSET_MANAGER.getAsset("./img/separatePng/tile_00.png");
//     this.sprites[1] = ASSET_MANAGER.getAsset("./img/separatePng/tile_01.png");
//     this.sprites[2] = ASSET_MANAGER.getAsset("./img/separatePng/tile_02.png");
//     this.sprites[3] = ASSET_MANAGER.getAsset("./img/separatePng/tile_03.png");
//     this.sprites[4] = ASSET_MANAGER.getAsset("./img/separatePng/tile_04.png");
//     this.sprites[5] = ASSET_MANAGER.getAsset("./img/separatePng/tile_05.png");
//     this.sprites[6] = ASSET_MANAGER.getAsset("./img/separatePng/tile_06.png");
//     this.sprites[7] = ASSET_MANAGER.getAsset("./img/separatePng/tile_07.png");
//     this.sprites[8] = ASSET_MANAGER.getAsset("./img/separatePng/tile_08.png");
//
//     this.tiles[0] = 1;
//     this.tiles[1] = 2;
//     this.tiles[2] = 6;
//     this.tiles[3] = 10;
//     this.tiles[4] = 14;
//     this.tiles[5] = 16;
//     this.tiles[6] = 17;
//     this.tiles[7] = 21;
//     this.tiles[8] = 25;
//     this.tiles[9] = 29;
//     this.tiles[10] = 31;
//     this.tiles[11] = 32;
//     this.tiles[12] = 36;
//     this.tiles[13] = 40;
//     this.tiles[14] = 44;
//
// }
// TilePalette.prototype = new Entity();
// TilePalette.prototype.constructor = TilePalette;
// TilePalette.prototype.update = function () {
//     if (this.game.click) {
//         if ((this.game.click.x >= this.x * 32) && (this.game.click.x < (this.x + 1) * 32)) {
//             flag = false; //true if click on button
//             for (var i = 0; i < 15; i++) {
//                 if ((this.game.click.y >= (this.y + i) * 32 + 8 * i) && (this.game.click.y < (this.y + i + 1) * 32 + 8 * i)) {
//                     flag = true;
//                     break;
//                 }
//             }
//             if (flag) {
//                 this.game.mouseShadow.changeTile(this.tiles[i]);
//             }
//         }
//     }
// }
// TilePalette.prototype.draw = function () {
//     for (var i = 0; i < 15; i++) {
//         this.drawImage(this.sprites[i], this.x * 32, (this.y + i) * 32 + 8*i);
//     }
// }


var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/ChooseCharacterBackground.png");
ASSET_MANAGER.queueDownload("./img/LINK.png");
ASSET_MANAGER.queueDownload("./img/LINK-choose.png");
ASSET_MANAGER.queueDownload("./img/FierceLINK.png");
ASSET_MANAGER.queueDownload("./img/FierceLINK-Choose.png");
//ASSET_MANAGER.queueDownload("./img/Tiles-32x32NEW.png");
ASSET_MANAGER.queueDownload("./img/link-blueQUICK1.png");
ASSET_MANAGER.queueDownload("./img/button-start.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_00.png");
ASSET_MANAGER.queueDownload("./img/long.png");
ASSET_MANAGER.queueDownload("./img/coins.png");
ASSET_MANAGER.queueDownload("./img/background0.png");
//ASSET_MANAGER.queueDownload("./img/1.png");
ASSET_MANAGER.queueDownload("./img/spikes.png");

var platforms = [];
var coinsArr = [];
var spikesArr = [];
var flyArr = [];
var mapArr = [];
var center = 200;
ASSET_MANAGER.downloadAll(function () {
    console.log(start);
    var gameEngine = new GameEngine();
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var pg = new PlayGame(gameEngine, 0, 0);
    gameEngine.addEntity(pg);

    var startButton = new StartButton(gameEngine, 320, 250);
    gameEngine.addEntity(startButton);

    gameEngine.init(ctx);
    gameEngine.start();

    console.log("starting up da sheild");
});

function startPlaying(gameEngine) {
    var bg = new Background(gameEngine, 0, -270);
    gameEngine.background = bg;
    gameEngine.addEntity(bg);


    gameEngine.platforms = platforms;
    gameEngine.coinsArr = coinsArr
    gameEngine.spikesArr = spikesArr;

    var pf = new Platform(gameEngine, -19, 0, 20, 800);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 100, 500, 1850, 100);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 100, 900, 1850, 100);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 400, 350, 100, 150);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 100, 200, 200, 20);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1000, 350, 200, 300);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1200, 200, 600, 200);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1950, 200, 100, 20);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2200, 350, 600, 20);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2800, 500, 6000, 200);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2100, 500, 800, 50);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1900, 500, 50, 10);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3180, 0, 50, 800);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 50, 70, 50, 10);
    gameEngine.addEntity(pf);
    platforms.push(pf);

    pf = new Platform(gameEngine, 200, -120, 900, 10);
    gameEngine.addEntity(pf);
    platforms.push(pf);

    pf = new Platform(gameEngine, 400, -320, 100, 10);
    gameEngine.addEntity(pf);
    platforms.push(pf);

    gameEngine.platf = pf;

    if (character = 1) {
        var link = new Link(gameEngine);
        gameEngine.link = link;
        gameEngine.addEntity(link);

    }

    /***********COINS***************/
    var coin = new Coin(gameEngine, 200, 450);
    gameEngine.addEntity(coin);
    coinsArr.push(coin)
    coin = new Coin(gameEngine, 250, 450);
    gameEngine.addEntity(coin);
    coinsArr.push(coin)
    coin = new Coin(gameEngine, 300, 450);
    gameEngine.addEntity(coin);
    coinsArr.push(coin)
    /*********************************/
    var fly = new Fly(gameEngine, 1400, 110);
    flyArr.push(fly);
    gameEngine.addEntity(fly);
    gameEngine.flyArr = flyArr;

    var score = new Score(gameEngine);
    gameEngine.score = score;
    gameEngine.addEntity(score);

    var lives = new Lives(gameEngine);
    gameEngine.lives = lives;
    gameEngine.addEntity(lives);

    var skills = new Skills(gameEngine);
    gameEngine.skills = skills;
    gameEngine.addEntity(skills);

    var restart = new Restart(gameEngine);
    gameEngine.restart = restart;
    gameEngine.addEntity(restart);

    var sp = new Spikes(gameEngine, 500, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);

    gameEngine.spikes = sp;

    var hp = new Health(gameEngine, 600, 20, 150, 20);
    gameEngine.health = hp;
    gameEngine.addEntity(hp);

    var tile = new Map(gameEngine, 600, 300);
    gameEngine.mapArr = mapArr;
    gameEngine.addEntity(tile);
    mapArr.push(tile);
    tile = new Map(gameEngine, 632, 300);
    gameEngine.addEntity(tile);
    mapArr.push(tile);
    tile = new Map(gameEngine, 664, 300);
    gameEngine.addEntity(tile);
    mapArr.push(tile);
}

function characterSelection(gameEngine) {
    var charSelBackground = new CharacterSelectionBackground(gameEngine, 0, 0);
    gameEngine.addEntity(charSelBackground);

    var linkSelect = new LinkSelect(gameEngine, 0, 0);
    gameEngine.addEntity(linkSelect);
}



