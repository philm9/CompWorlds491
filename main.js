var start = false;
var start2 = false;
var start3 = false;
var character = 0;
var score = 0;
var lives = 3;
this.damage = 0.3;
var originalHealth = 150;
var health = 150;
var scrollSpeed = 4;
var score = 0;
var level = 0;

var movX = 0;
var movY = 0;

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
    this.animationClick = new Animation(ASSET_MANAGER.getAsset("./img/button-start.png"), 0, 106, 150, 54, 0.1, 1, false, false);
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
        if (this.animationClick.isDone()) {
            this.removeFromWorld = true;
            start = true;
        }
    }
    else {
        this.animationWait.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

function PlayGame(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/aliencraft1.png"), 0, 0, 800, 576, 1, 1, true, false);
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
        //levelSelectionPanel(this.game);
        this.removeFromWorld = true;
    }
}

PlayGame.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function LevelSelect(game) {
    this.animationBackground = new Animation(ASSET_MANAGER.getAsset("./img/aliencraft1.png"), 0, 0, 800, 576, 1, 1, true, false);
    //this.animationFrame = new Animation(ASSET_MANAGER.getAsset("./img/frame.png"), 0, 0, 400, 300, 1, 1, true, false);
    this.animationLevel1 = new Animation(ASSET_MANAGER.getAsset("./img/level1.png"), 0, 0, 200, 150, 1, 1, true, false);
    Entity.call(this, game, 0, 0);
}

LevelSelect.prototype = new Entity();
LevelSelect.prototype.constructor = LevelSelect;

//PlayGame.prototype.reset = function () {
//    this.game.running = false;
//}
LevelSelect.prototype.update = function () {
    if (this.game.click) {
        if (this.game.click.x < 300 && this.game.click.y < 250 && this.game.click.x > 100 && this.game.click.y > 100) {
            start3 = true;
            this.removeFromWorld = true;
            level = 1;
        }
        else {
            start3 = true;
            this.removeFromWorld = true;
            level = 2;
        }
    }
    if (start3) {
        startPlaying(this.game);
        this.removeFromWorld = true;
    }
}

LevelSelect.prototype.draw = function (ctx) {
    this.animationBackground.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    this.animationLevel1.drawFrame(this.game.clockTick, ctx, 100, 100);
    Entity.prototype.draw.call(this);
}

function CharacterSelectionBackground(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/aliencraft1.png"), 0, 0, 800, 576, 1, 1, true, false);
    Entity.call(this, game, x, y);
}
CharacterSelectionBackground.prototype = new Entity();
CharacterSelectionBackground.prototype.constructor = CharacterSelectionBackground;

CharacterSelectionBackground.prototype.update = function () {
    if (start2) {
        levelSelectionPanel(this.game);
        //startPlaying(this.game);
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
    this.boxes = true;
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
    if (this.boxes) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    var grad;
    var offset = 0;

    grad = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
    grad.addColorStop(0, 'green');
    ctx.fillStyle = grad;

    ctx.fillRect(this.x, this.y, this.width, this.height);
}

//sleep, dealy, wait function
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function Background(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/background0.png"), 0, 0, 3840, 1080, 1, 1, true, false);
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
    if (!(this.x + 2600 < 800) && this.game.link.x >= 400) {
        this.game.link.x = 396;
        this.x -= 1;
        movX -= 4;
        for (var i = 0; i < tileArrBB.length; i++) {
            tileArrBB[i].right -= 4;
            tileArrBB[i].left -= 4;
        }
        for (var i = 0; i < this.game.coinsArr.length; i++) this.game.coinsArr[i].x -= 4;
        for (var i = 0; i < this.game.spikesArr.length; i++) this.game.spikesArr[i].x -= 4;
        for (var i = 0; i < this.game.flyArr.length; i++) this.game.flyArr[i].x -= 4;
        for (var i = 0; i < this.game.enemiesArr.length; i++) this.game.enemiesArr[i].x -= 4;
        for (var i = 0; i < this.game.dEnemy.length; i++) this.game.dEnemy[i].x -= 4;
    }
    //move map left
    if (!(this.x >= 0) && this.game.link.x <= 350) {
        this.game.link.x = 354;
        this.x += 1;
        movX += 4;
        for (var i = 0; i < tileArrBB.length; i++) {
            tileArrBB[i].right += 4;
            tileArrBB[i].left += 4;
        }
        for (var i = 0; i < this.game.coinsArr.length; i++)  this.game.coinsArr[i].x += 4;
        for (var i = 0; i < this.game.spikesArr.length; i++)  this.game.spikesArr[i].x += 4;
        for (var i = 0; i < this.game.flyArr.length; i++) this.game.flyArr[i].x += 4;
        for (var i = 0; i < this.game.enemiesArr.length; i++) this.game.enemiesArr[i].x += 4;
        for (var i = 0; i < this.game.dEnemy.length; i++) this.game.dEnemy[i].x += 4;
    }
    //move map up
    //if (!(this.y > 0) && this.game.link.y <= 200) {
    //    this.y += 1;
    //    movY += 4;
    //    for (var i = 0; i < tileArrBB.length; i++) {
    //        tileArrBB[i].top += 4;
    //        tileArrBB[i].bottom += 4;
    //    }
    //    for (var i = 0; i < this.game.coinsArr.length; i++) this.game.coinsArr[i].y += 4;
    //    for (var i = 0; i < this.game.spikesArr.length; i++) this.game.spikesArr[i].y += 4;
    //    for (var i = 0; i < this.game.flyArr.length; i++) this.game.flyArr[i].y += 4;
    //    for (var i = 0; i < this.game.enemiesArr.length; i++) this.game.enemiesArr[i].y += 4;
    //    for (var i = 0; i < this.game.dEnemy.length; i++) this.game.dEnemy[i].y += 4;
    //}
    //move map down
    //if (!(this.y + 846 < 576) && this.game.link.y >= 350) {
    //    this.game.link.y = 344;
        //this.game.link.falling = true;
    //    this.game.link.jumpAnimation.elapsedTime = 0;
    //    this.y -= 1;
    //    movY -= 4;
    //    for (var i = 0; i < tileArrBB.length; i++) {
    //        tileArrBB[i].top -= 4;
    //        tileArrBB[i].bottom -= 4;
    //    }
    //    for (var i = 0; i < this.game.coinsArr.length; i++) this.game.coinsArr[i].y -= 4;
    //    for (var i = 0; i < this.game.spikesArr.length; i++) this.game.spikesArr[i].y -= 4;
    //    for (var i = 0; i < this.game.flyArr.length; i++) this.game.flyArr[i].y -= 4;
    //    for (var i = 0; i < this.game.enemiesArr.length; i++) this.game.enemiesArr[i].y -= 4;
    //    for (var i = 0; i < this.game.dEnemy.length; i++) this.game.dEnemy[i].y -= 4;
    //}
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

function Enemy(game, x, y, health) {
    this.enemyAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 750, 70, 105, 95, 0.1, 5, true, false);
    this.boundingbox = new BoundingBox(this.x+10, this.y + 10, this.enemyAnimation.frameWidth - 80, this.enemyAnimation.frameHeight-20);
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.health = health;
    this.width = 105;
    this.height = 95;
    this.active = true;
    this.left = true;
    this.boxes = true;
    Entity.call(this, game, x, y);
}
Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

//var feet = 1000;
Enemy.prototype.update = function () {
    //console.log(this.x);
    //if (this.left) {
    //    feet--;
    //    this.x -= 1;
    //}
    //else {
    //    feet++;
    //    this.x += 1;
    //}

    //if (feet < 950) {
    //    this.left = false;
    //}
    //if (feet > 1050) {
    //    this.left = true;
    //}

    if (this.left) {
        this.boundingbox = new BoundingBox(this.x + 20, this.y + 20, this.width - 70, this.height - 40);
        this.weaponBox = new BoundingBox(this.x + 10, this.y + 10, this.enemyAnimation.frameWidth - 80, this.enemyAnimation.frameHeight - 20);
    }
    else {
        this.boundingbox = new BoundingBox(this.x + 40, this.y + 20, this.width - 70, this.height - 40);
        this.weaponBox = new BoundingBox(this.x + 70, this.y + 10, this.enemyAnimation.frameWidth - 80, this.enemyAnimation.frameHeight - 20);
    }
    this.areaBox = new BoundingBox(this.x - 100, this.y - 100, this.width + 180, this.height + 100);

     for (var i = 0; i < this.game.enemiesArr.length; i++) { //looping through all platforms
         var en = this.game.enemiesArr[i];
         //activate enemy when link is close enough
         if (this.game.link.boundingbox.collide(this.areaBox)) {
             //if (this.game.link.boundingbox.collide(this.areaBox.left)) this.left = true;
             //if (this.game.link.boundingbox.collide(this.areaBox.right)) this.left = false;
            //this.active = true;
            //if (this.left) {
            //    feet -= 2;
            //    this.x -= 2;
            //}
            //else {
            //    feet += 2;
            //    this.x += 2;
            //}
         }
         if (this.game.link.slash && this.game.link.swordBox.collide(this.boundingbox)) {
             //console.log('hit');
             //if (this.left) {
                 //feet += 50;
                 //this.x += 50;
             //}
             //else {
                 //feet -= 50;
                 //this.x -= 50;
             //}
             this.health -= damage;
         }

        //else this.active = false;
         //turn right
        //if (this.game.link.boundingbox.right > this.boundingbox.right) {
        //    this.left = false;
        //}
        // //turn left
        //if (this.game.link.boundingbox.left < this.boundingbox.left) {
        //    this.left = true;
        //}

         //lower health when touching enemy
         if (this.boundingbox.collide(this.game.link.boundingbox)) {
             if (this.left) this.game.link.x -= 50;
             if (this.right) this.game.link.x += 50;
            health -= 10;
        }
    }
    Entity.prototype.update.call(this);
}

Enemy.prototype.draw = function (ctx) {
    if (this.boxes) {
        if (this.left) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.x + 10, this.y + 10, this.enemyAnimation.frameWidth - 80, this.enemyAnimation.frameHeight - 20);
            ctx.strokeStyle = "green";
            ctx.strokeRect(this.x + 20, this.y + 20, this.width - 70, this.height - 40);
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.x - 100, this.y - 100, this.width + 180, this.height + 100);
        }
        else {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.x + 70, this.y + 10, this.enemyAnimation.frameWidth - 80, this.enemyAnimation.frameHeight - 20);
            ctx.strokeStyle = "green";
            ctx.strokeRect(this.x + 40, this.y + 20, this.width - 70, this.height - 40);
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.x - 100, this.y - 100, this.width + 180, this.height + 100);
        }
    }
    if (this.left) {
        ctx.save();
        ctx.scale(-1, 1);
        this.enemyAnimation.drawFrame(this.game.clockTick, ctx, -this.x - 70, this.y);
        ctx.restore();
    }
    else {
        this.enemyAnimation.drawFrame(this.game.clockTick, ctx, this.x+30, this.y);
    }

    if (this.health > 0) {
        ctx.fillStyle = "Red";
        ctx.fillRect(this.x+20, this.y, this.health, 5);
    }
    else this.removeFromWorld = true;




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

//function Map(game, x, y) {
//    this.startX = x;
//    this.startY = y;
//    this.tileAnimation = new Animation(ASSET_MANAGER.getAsset("./img/separatePng/tile_00.png"), 0, 0, 32, 32, 0.1, 1, true, false);
//    this.width = 32;
//    this.height = 32;
//    this.boundingbox = new BoundingBox(x, y, this.width, this.height);
//    this.x = x;
//    this.y = y;
//    Entity.call(this, game, x, y);
//}
//Map.prototype = new Entity();
//Map.prototype.constructor = Map;

//Map.prototype.update = function () {
//    this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
//}

//Map.prototype.draw = function (ctx) {
//    this.tileAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
//    Entity.prototype.draw.call(this);
//}





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
    this.x = x;
    this.y = y;
    Entity.call(this, game, x, y);
}
Coin.prototype = new Entity();
Coin.prototype.constructor = Coin;

Coin.prototype.update = function () {
    this.boundingbox = new BoundingBox(this.x, this.y, 44, 40);
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
        if (!(health <= 0)) {
            health -= 1;
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
    ctx.font = "24px serif";
    ctx.fillText("HP:", this.x - 50, this.y + 18);
    ctx.strokeStyle = "Black";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x - 3, this.y - 3, 150 + 6, this.height + 6);
    if (health > 0) {
        if (health < originalHealth / 1.5 && health > originalHealth /3) ctx.fillStyle = "Yellow";
        else if (health < originalHealth / 3) ctx.fillStyle = "Red";
        else ctx.fillStyle = "Green";
        ctx.fillRect(this.x, this.y, health, this.height);
    }
    Entity.prototype.draw.call(this);
}


function DEnemy(game, x, y, speed) {
    Entity.call(this, game, x, y);
    this.x = x;
    this.y = y;
    this.falling = true;
    this.boxes = true;
    this.left = false;
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/Slime_First Gen_Weak.png"), 8, 12, 19, 22, speed, 9, true, false);
    this.boundingbox = new BoundingBox(this.x+3, this.y, 19-6, 22);
}
DEnemy.prototype = new Entity();
DEnemy.prototype.constructor = DEnemy;

DEnemy.prototype.update = function () {
    if (this.falling) {
        this.lastBottom = this.boundingbox.bottom;
        this.y += this.game.clockTick / this.jumpAnimation.totalTime * 1 * 50;
        this.boundingbox = new BoundingBox(this.x+3, this.y, this.jumpAnimation.frameWidth-6, this.jumpAnimation.frameHeight);

        //for (var i = 0; i < this.game.platforms.length; i++) {
        //    var pf = this.game.platforms[i];
        //    if (this.boundingbox.collide(pf.boundingbox)) {
        //        this.falling = false;
        //        this.y = pf.boundingbox.top - this.jumpAnimation.frameHeight;
        //        this.platform = pf;
        //        this.jumpAnimation.elapsedTime = 0;
        //    }
        //}
    }
    if (!this.falling) {
        this.boundingbox = new BoundingBox(this.x+3, this.y, this.jumpAnimation.frameWidth-6, this.jumpAnimation.frameHeight);
        //if (this.boundingbox.right >= this.platform.boundingbox.right) this.left = true;
        //if (this.boundingbox.left <= this.platform.boundingbox.left) this.left = false;
    }

    if (this.jumpAnimation.currentFrame() >= 3 && this.jumpAnimation.currentFrame() <= 6) {
        if (this.left) this.x -= 0.5;
        else this.x += 0.5;
    }
}
DEnemy.prototype.draw = function (ctx) {
    //if (this.boxes) {
    //    ctx.strokeStyle = "red";
    //    ctx.strokeRect(this.x+3, this.y, 19-6, 22);
    //}
    this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
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
        if (health < 150) {
            if (150 - health < 50) {
                health += 150 - health;
            } else {
                health += 50;
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
   this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 465, 75, 101, 0.20, 3, false, false);
   this.runningAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 318, 75, 72, 0.05, 10, true, false);
   this.dyingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 669, 96, 99, 0.15, 3, false, false);
   this.deadAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 288, 742, 96, 99, 0.2, 1, true, false);
   this.downAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 225, 510, 75, 56, 1, 1, true, false);
   this.slash2Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 869, 150, 111, 0.1, 2, false, false);
   this.slash3Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1093, 125, 93, 0.1, 2, false, false);
   this.slash1Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1281, 140, 86, 0.1, 2, false, false);
    this.fallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 150, 465, 75, 101, 0.20, 1, true, false);
   //this.fallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 150, 465, 200, 101, 0.24, 1, true, false);


   this.lives = 3;
   this.left = false;
   this.sleeping = false;
   this.running = false;
   this.jumping = false;
   this.down = false;
   this.dying = false;
   this.dead = false;
   this.slash = false;
   this.falling = true;
   this.fallDead = false;
   this.tileT = tileArrBB[0];
   this.jumpHeight = 200;
   this.boundingbox = new BoundingBox(this.x + 25, this.y, this.runningAnimation.frameWidth - 40, this.runningAnimation.frameHeight);
   this.boxes = true;
   Entity.call(this, game, 100, 400);
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

    //if (this.falling) console.log('falling');
    //if (this.jumping) console.log('jumping');
    //if (this.running) console.log('running');
    //if (!this.falling && !this.jumping && !this.running) console.log('standing');

    if (this.boundingbox.bottom > 576) {
        this.fallDead = true;
    }
    if (this.boundingbox.bottom > 3000) {
        this.x = 100;
        this.y = 425;
        movX = 0;
        movY = 0;
        this.fallDead = false;
        lives--;
        this.game.background.x = this.game.background.startX
        this.game.background.y = this.game.background.startY;
        //for (var i = 0; i < tileArrBB.length; i++) {
        //    this.game.platforms[i].x = this.game.platforms[i].startX;
        //    this.game.platforms[i].y = this.game.platforms[i].startY;
        //}
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
        for (var i = 0; i < this.game.enemiesArr.length; i++) {
            this.game.enemiesArr[i].x = this.game.enemiesArr[i].startX;
            this.game.enemiesArr[i].y = this.game.enemiesArr[i].startY;
        }
    }
    linkX = this.x;
    Link.y = this.y;

   //*************************************//
   //****GET ORIENTATION OF MOVEMENTS*****//
   ////*************************************//
   if (this.game.A) this.left = true;
   if (this.game.D) this.left = false;

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
       this.boundingbox = new BoundingBox(this.x+5, this.y, this.runningAnimation.frameWidth -20, this.runningAnimation.frameHeight);
       //for (var i = 0; i < this.game.platforms.length; i++) { //looping through all platforms
       //    var pf = this.game.platforms[i];
       //    if (this.boundingbox.collide(pf.boundingbox)) {
       //         this.x -= linkSpeed;
       //     }
       //}
       /************************************************TEST***TEST****TEST*/
       for (var i = 0; i < tileArrBB.length; i++) {
           var tl = tileArrBB[i];
           if (this.boundingbox.collide(tl)) {
               this.x = tl.left - (this.boundingbox.right - this.boundingbox.left);
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
       this.boundingbox = new BoundingBox(this.x, this.y, this.runningAnimation.frameWidth - 25, this.runningAnimation.frameHeight);
       //for (var i = 0; i < this.game.platforms.length; i++) { //looping through all except first one, the base
       //     var pf = this.game.platforms[i];
       //     if (this.boundingbox.collide(pf.boundingbox)) this.x += linkSpeed;
       //     // console.log(falling);
       //}
       /************************************************TEST***TEST****TEST*/
       for (var i = 0; i < tileArrBB.length; i++) {
           var tl = tileArrBB[i];
           if (this.boundingbox.collide(tl)) this.x = tl.right;
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
   if (health <= 0 && !(health <= -1000)) this.dying = true;
   ////*************************************//
   ////*********ACTIVATE SLASH**************//
   ////*************************************//
   if (this.game.Q) {
       if (this.left) {
           this.swordBox = new BoundingBox(this.x - 80, this.y - 15, this.dyingAnimation.frameWidth, this.dyingAnimation.frameHeight);
       }
       else {
           this.swordBox = new BoundingBox(this.x + 32, this.y - 15, this.dyingAnimation.frameWidth, this.dyingAnimation.frameHeight);
       }
       this.slash = true;
   }


   if (!this.jumping && !this.falling) {
       if (this.boundingbox.left > this.tileT.right) this.falling = true;
       if (this.boundingbox.right < this.tileT.left) this.falling = true;
   }



   //*************************************//
   //***********JUMPING LOGIC*************//
    //*************************************//
   if (this.game.space && !this.jumping && !this.falling) {
       this.jumping = true;
       this.base = this.y;
   }
   if (this.jumping) {
       this.running = false;
       //this.falling = false;
       var height = 0;
       var duration = this.jumpAnimation.elapsedTime + this.game.clockTick;
       if (duration > this.jumpAnimation.totalTime / 2) duration = this.jumpAnimation.totalTime - duration;
       duration = duration / this.jumpAnimation.totalTime;

       // quadratic jump
       height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
       this.lastBottom = this.boundingbox.bottom;

       
       height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
       this.lastBottom = this.boundingbox.bottom;
       this.y = this.base - height;
       if (this.left) this.boundingbox = new BoundingBox(this.x + 5, this.y, this.jumpAnimation.frameWidth - 25, this.jumpAnimation.frameHeight - 22);
       else this.boundingbox = new BoundingBox(this.x + 5, this.y, this.jumpAnimation.frameWidth-30, this.jumpAnimation.frameHeight - 22);
       //for (var i = 0; i < this.game.platforms.length; i++) {
       //    var pf = this.game.platforms[i];
       //    if (this.boundingbox.collide(pf.boundingbox) &&
       //                     this.boundingbox.top+50 < pf.boundingbox.bottom+1000 &&
       //                     this.lastBottom > pf.boundingbox.bottom) {
       //        this.jumping = false;
       //        //this.y = pf.boundingbox.top - this.animation.frameHeight + 10;
       //        this.jumpAnimation.elapsedTime = 0;
       //        this.platform = pf;
       //        this.falling = true;
       //        //console.log('true');
       //    }
       //    if (this.boundingbox.collide(pf.boundingbox) && this.lastBottom < pf.boundingbox.top) {
       //        this.jumping = false;
       //        this.y = pf.boundingbox.top - this.jumpAnimation.frameHeight+25;
       //        this.platform = pf;
       //        this.jumpAnimation.elapsedTime = 0;
       //    }
       //}
       /************************************************TEST***TEST****TEST*/
       //for (var i = 0; i < this.game.tileMap.tileMap.length; i++) {
       //    for (var j = 0; j < 37; j++) {
       //        var sprite = this.game.tileMap.tileMap[i][j];
       //        if (sprite != 0 && this.boundingbox.collide(this.game.tileMap.boundingbox[i][j]) && this.lastBottom < this.game.tileMap.boundingbox[i][j].top) {
       //            this.jumping = false;
       //            this.y = this.game.tileMap.boundingbox[i][j].top - this.jumpAnimation.frameHeight + 25;
       //            this.tileT = this.game.tileMap.boundingbox[i][j];
       //            this.jumpAnimation.elapsedTime = 0;
       //        }
       //    }
       //}

       for (var i = 0; i < tileArrBB.length; i++) {
           var tl = tileArrBB[i];
           if (this.boundingbox.collide(tl) && this.lastBottom < tl.top) {
               this.jumping = false;
               this.y = tl.top - this.jumpAnimation.frameHeight + 25;
               this.tileT = tl;
               this.jumpAnimation.elapsedTime = 0;
           }
       }
       /*****************************END***************TEST***TEST****TEST*/
   }
   
    //console.log(this.y);
   if (this.falling) {
       //console.log(this.x);
       //console.log('falling');
       //this.jumpAnimation.elapsedTime = 0;
       this.running = false;
       this.jumping = false;
       //console.log(this.y);
       this.lastBottom = this.boundingbox.bottom;
       //ySpeed = this.game.clockTick / this.jumpAnimation.totalTime * 4 * this.jumpHeight;
       this.y += this.game.clockTick / this.jumpAnimation.totalTime * 4 * this.jumpHeight;

       if (this.left) this.boundingbox = new BoundingBox(this.x + 10, this.y, this.standAnimation.frameWidth, this.fallAnimation.frameHeight - 20);
       else this.boundingbox = new BoundingBox(this.x, this.y, this.fallAnimation.frameWidth - 25, this.fallAnimation.frameHeight - 20);

       //for (var i = 0; i < this.game.platforms.length; i++) {
       //    var pf = this.game.platforms[i];
       //    if (this.boundingbox.collide(pf.boundingbox)) { // && this.lastBottom < pf.boundingbox.top) {
       //        this.falling = false;
       //        this.y = pf.boundingbox.top - this.fallAnimation.frameHeight + 25;
       //        this.platform = pf;
       //        this.fallAnimation.elapsedTime = 0;
       //    }
       //}

       /************************************************TEST***TEST****TEST*/
       //for (var i = 0; i < this.game.tileMap.tileMap.length; i++) {
       //    for (var j = 0; j < 37; j++) {
       //        var sprite = this.game.tileMap.tileMap[i][j];
       //        if (sprite != 0 && this.boundingbox.collide(this.game.tileMap.boundingbox[i][j])) {
       //            this.falling = false;
       //            this.tileT = this.game.tileMap.boundingbox[i][j];
       //            this.y = this.game.tileMap.boundingbox[i][j].top - this.fallAnimation.frameHeight + 25;
       //            this.fallAnimation.elapsedTime = 0;
       //            //console.log(this.game.tileMap.boundingbox[i][j].right);
       //        }
       //    }
       //}

       for (var i = 0; i < tileArrBB.length; i++) {
           var tl = tileArrBB[i];
           if (this.boundingbox.collide(tl)) {
               this.falling = false;
               this.y = tl.top - this.standAnimation.frameHeight;
               this.tileT = tl;
               //console.log(tl.top);

               this.fallAnimation.elapsedTime = 0;
               //this.jumpAnimation.elapsedTime = 0;
           }
       }

       /************************************************TEST***TEST****TEST*/
   }

       /************************************************TEST***TEST****TEST*/
       /************************************************TEST***TEST****TEST*/
   //}

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
   //if (this.down) {
   //    if (this.downAnimation.isDone()) {
   //        this.downAnimation.elapsedTime = 0;
   //    }
   //}

   //*************************************//
   //*************DYING LOGIC*************//
   //*************************************//
   if (this.dying) {
       health = -1001;
       if (this.dyingAnimation.isDone()) {
           //console.log("hi its here");
           this.dying = false;
           this.dead = true;
           this.dyingAnimation.elapsedTime = 0;

       }

       //if (this.left) this.x += linkSpeed;
       //if (!this.left) this.x -= linkSpeed;
   }

   //*************************************//
   //**************DEAD LOGIC*************//
   //*************************************//
   if (this.dead) {
       if (this.deadAnimation.isDone()) {
           this.deadAnimation.elapsedTime = 0;
           this.fallDead;
           //this.game.reset();
           //return;
           //if (this.game.space) this.dying = false;
       }
   }

   //*************************************//
   //***********SLASH LOGIC***************//
   //*************************************//
   if (this.slash) {
       //animNum = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
       //needs optimization
       if (this.slash1Animation.isDone() || this.slash1Animation.isDone() ||
           this.slash2Animation.isDone() || this.slash2Animation.isDone() ||
           this.slash3Animation.isDone() || this.slash3Animation.isDone()) {
           this.slash1Animation.elapsedTime = 0;
           this.slash1Animation.elapsedTime = 0

           this.slash2Animation.elapsedTime = 0;
           this.slash2Animation.elapsedTime = 0;
           this.slash3Animation.elapsedTime = 0;
           this.slash3Animation.elapsedTime = 0;
           this.slash = false;
           if (animNum == 3) animNum = 1;
           else animNum++;
       }
   }

   //if standing
   if (!this.dying && !this.dead && !this.running &&
       !this.jumping && !this.down && !this.slash && !this.falling) {
       if (this.left) this.boundingbox = new BoundingBox(this.x+10, this.y, this.standAnimation.frameWidth, this.standAnimation.frameHeight);
       else this.boundingbox = new BoundingBox(this.x, this.y, this.standAnimation.frameWidth+5, this.standAnimation.frameHeight);
    //    this.x = this.x - 2;
       //linkSpeed = 4;
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
       else if (this.jumping) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x+5, this.y, this.jumpAnimation.frameWidth-20, this.jumpAnimation.frameHeight-22);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           ctx.save();
           ctx.scale(-1, 1);
           this.jumpAnimation.drawFrame(this.game.clockTick, ctx, -this.x-70, this.y - 21);
           ctx.restore();
           if (this.jumpAnimation.isDone()) {
               this.jumpAnimation.elapsedTime = 0;
               this.jumping = false;
               this.falling = true;
           }
       }
       else if (this.falling) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x, this.y, this.fallAnimation.frameWidth - 10, this.fallAnimation.frameHeight - 20);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           ctx.save();
           ctx.scale(-1, 1);
           this.fallAnimation.drawFrame(this.game.clockTick, ctx, -this.x-70, this.y - 21);
           ctx.restore();
       }
       else if (this.running) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x, this.y, this.runningAnimation.frameWidth-20, this.runningAnimation.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           ctx.save();
           ctx.scale(-1, 1);
           this.runningAnimation.drawFrame(this.game.clockTick, ctx, -this.x - 75, this.y + 5);
           ctx.restore();
       }
       else if (this.down) {
           ctx.save();
           ctx.scale(-1, 1);
           this.downAnimation.drawFrame(this.game.clockTick, ctx, -this.x - 55, this.y + 23);
           ctx.restore();
       }
       else if (this.dying) {
           ctx.save();
           ctx.scale(-1, 1);
           this.dyingAnimation.drawFrame(this.game.clockTick, ctx, -this.x - 50, this.y - 20);
           ctx.restore();
       }
       else if (this.dead) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x + 32, this.y - 32, this.deadAnimation.frameWidth, this.deadAnimation.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           ctx.save();
           ctx.scale(-1, 1);
           this.deadAnimation.drawFrame(this.game.clockTick, ctx, -this.x - 50, this.y + 53);
           ctx.restore();
       }
       else if (this.slash) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x-80, this.y - 15, this.dyingAnimation.frameWidth, this.dyingAnimation.frameHeight);
           }
           ctx.save();
           ctx.scale(-1, 1);
           if (animNum == 1) this.slash1Animation.drawFrame(this.game.clockTick, ctx, -this.x - 55, this.y - 7); //OK
           ctx.restore();
           ctx.save();
           ctx.scale(-1, 1);
           if (animNum == 2) this.slash2Animation.drawFrame(this.game.clockTick, ctx, -this.x - 55, this.y - 32); //OK
           ctx.restore();
           ctx.save();
           ctx.scale(-1, 1);
           if (animNum == 3) this.slash3Animation.drawFrame(this.game.clockTick, ctx, -this.x - 55, this.y - 5); //OK
           ctx.restore();
       }
       else {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x+10, this.y, this.standAnimation.frameWidth, this.standAnimation.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           ctx.save();
           ctx.scale(-1, 1);
           this.standAnimation.drawFrame(this.game.clockTick, ctx, -this.x - 55, this.y);
           ctx.restore();
       }
   }
   else {
       if (this.sleeping) {
           //this.sleepAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
       }
       else if (this.jumping) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x+5, this.y, this.jumpAnimation.frameWidth-30, this.jumpAnimation.frameHeight-22);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x-15, this.y - 21);
           if (this.jumpAnimation.isDone()) {
               this.jumpAnimation.elapsedTime = 0;
               this.jumping = false;
               this.falling = true;
           }
       }
       else if (this.falling) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x, this.y, this.fallAnimation.frameWidth-25, this.fallAnimation.frameHeight - 20);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           //console.log(this.x);
           this.fallAnimation.drawFrame(this.game.clockTick, ctx, this.x-15, this.y - 21);
       }
       else if (this.running) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x, this.y, this.runningAnimation.frameWidth -15, this.runningAnimation.frameHeight);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.runningAnimation.drawFrame(this.game.clockTick, ctx, this.x-15, this.y + 5);
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
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x + 32, this.y-15, this.dyingAnimation.frameWidth, this.dyingAnimation.frameHeight);
           }
           if (animNum == 1) this.slash1Animation.drawFrame(this.game.clockTick, ctx, this.x - 15, this.y - 7); //OK
           if (animNum == 2) this.slash2Animation.drawFrame(this.game.clockTick, ctx, this.x - 22, this.y - 32); //OK
           if (animNum == 3) this.slash3Animation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 5); //OK
       }
       else {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x, this.y, this.standAnimation.frameWidth, this.standAnimation.frameHeight);
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

function TileMap(game, ctx) {
    this.boxes = true;
    this.x = 0;
    this.y = 0;
    Entity.call(this, game, 0, 0);
    this.boundingbox = new Array(32);
    this.tileMap = new Array(32);
    for (var i = 0; i < this.tileMap.length; i++) {
        this.tileMap[i] = new Array(37);
        this.boundingbox[i] = new Array(37);
    }
    this.sprites = new Array(48);
    var testTileMap;
    if (level === 1) {
        testTileMap = [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 5, 0], //the column on the very right has to be all zeroes
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0], ///// bottom
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0], /// --> bottom
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //this row has to be all zeroes
        ];
    }
    else {
        testTileMap = [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
    }
    this.tileMap = testTileMap;

    this.sprites[0] = null;
    this.sprites[1] = ASSET_MANAGER.getAsset("./img/separatePng/tile_00.png");
    this.sprites[2] = ASSET_MANAGER.getAsset("./img/separatePng/tile_01.png");
    this.sprites[3] = ASSET_MANAGER.getAsset("./img/separatePng/tile_02.png");
    this.sprites[4] = ASSET_MANAGER.getAsset("./img/separatePng/tile_03.png");
    this.sprites[5] = ASSET_MANAGER.getAsset("./img/separatePng/tile_04.png");
    this.sprites[6] = ASSET_MANAGER.getAsset("./img/separatePng/tile_05.png");
    this.sprites[7] = ASSET_MANAGER.getAsset("./img/separatePng/tile_06.png");
    this.sprites[8] = ASSET_MANAGER.getAsset("./img/separatePng/tile_07.png");
    this.sprites[9] = ASSET_MANAGER.getAsset("./img/separatePng/tile_08.png");

    var len = 0;
    var wid = 0;
    var isub = 0;
    var jsub = 0;
    var isAloneLen = false;
    var isAloneWid = false;
    for (var j = 0; j < 37; j++) {
        for (var i = 0; i < this.tileMap.length; i++) {
            var x = (i * 32) + movX;
            var y = (j * 32 - 576) + movY;
            if (this.tileMap[i][j] != 0) {
                if (this.tileMap[i + 1][j] != 0) {
                    len += 32;
                    isub++;
                } else {
                    if (len > 0) {
                        len += 32;
                        tileArrBB.push(new BoundingBox(((i - isub) * 32) + movX, ((j) * 32 - 576) + movY, len, 32));
                        len = 0;
                        isub = 0;
                    }
                    else {
                        tileArrBB.push(new BoundingBox(((i - isub) * 32) + movX, ((j) * 32 - 576) + movY, 32, 32));
                        len = 0;
                        isub = 0;
                    }
                }
            }
        }
    }
    for (var i = 0; i < this.tileMap.length; i++) {
        for (var j = 0; j < 37; j++) {
            var x = (i * 32) + movX;
            var y = (j * 32 - 576) + movY;
            if (this.tileMap[i][j] != 0) {
                if (this.tileMap[i][j + 1] != 0) {
                    wid += 32;
                    jsub++;
                } else {
                    if (wid > 0) {
                        wid += 32;
                        tileArrBB.push(new BoundingBox(((i) * 32) + movX, ((j-jsub) * 32 - 576) + movY, 32, wid));
                        wid = 0;
                        jsub = 0;
                    }
                }
            }
        }
    }
}
TileMap.prototype = new Entity();
TileMap.prototype.constructor = TileMap;

TileMap.prototype.update = function () {
    Entity.prototype.update.call(this);
}
TileMap.prototype.draw = function (ctx) {
    // for(var i = 0; i < tileArrBB.length; i++) {
    //     ctx.strokeStyle = "red";
    //     ctx.strokeRect(tileArrBB[i].left, tileArrBB[i].top, tileArrBB[i].right - tileArrBB[i].left, tileArrBB[i].bottom - tileArrBB[i].top);
    // }
    for (var i = 0; i < this.tileMap.length; i++) {
        for (var j = 0; j < 37; j++) {
            var sprite = this.sprites[this.tileMap[i][j]];
            if (sprite) ctx.drawImage(sprite, (i * 32) + movX, (j * 32 - 576) + movY);
        }
    }
}

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/ChooseCharacterBackground.png");
ASSET_MANAGER.queueDownload("./img/LINK.png");
ASSET_MANAGER.queueDownload("./img/LINK-choose.png");
ASSET_MANAGER.queueDownload("./img/FierceLINK.png");
ASSET_MANAGER.queueDownload("./img/FierceLINK-Choose.png");
ASSET_MANAGER.queueDownload("./img/link-blueQUICK1.png");
ASSET_MANAGER.queueDownload("./img/button-start.png");

ASSET_MANAGER.queueDownload("./img/separatePng/tile_00.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_01.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_02.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_03.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_04.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_05.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_06.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_07.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_08.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_09.png");

ASSET_MANAGER.queueDownload("./img/level1.png");
ASSET_MANAGER.queueDownload("./img/frame.png");
ASSET_MANAGER.queueDownload("./img/aliencraft1.png");
ASSET_MANAGER.queueDownload("./img/coins.png");
ASSET_MANAGER.queueDownload("./img/background0.png");
ASSET_MANAGER.queueDownload("./img/Slime_First Gen_Weak.png");
ASSET_MANAGER.queueDownload("./img/spikes.png");

var platforms = [];
var coinsArr = [];
var spikesArr = [];
var flyArr = [];
var enemiesArr = []
var center = 200;
var dEnemy = [];
var tileArrBB = [];
ASSET_MANAGER.downloadAll(function () {
    console.log(start);
    var gameEngine = new GameEngine();
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
	gameEngine.ctx = ctx; 
    var pg = new PlayGame(gameEngine, 0, 0);
    gameEngine.addEntity(pg);

    var startButton = new StartButton(gameEngine, 320, 250);
    gameEngine.addEntity(startButton);

    gameEngine.ctx = ctx;
    gameEngine.init(ctx);
    gameEngine.start();

    console.log("starting up da sheild");
});

function startPlaying(gameEngine) {
    var bg = new Background(gameEngine, 0, -270, gameEngine.ctx);
    gameEngine.background = bg;
    gameEngine.addEntity(bg);


    //gameEngine.platforms = platforms;
    gameEngine.coinsArr = coinsArr
    gameEngine.spikesArr = spikesArr;

    /* Blocks start at bottom left at 1, 1. (X, Y)
         *
         */
    //Block 1,1 (0)
    //var pf = new Platform(gameEngine, -19, 0, 20, 800);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    ////pf = new Platform(gameEngine, 100, 500, 1850, 100);
    ////gameEngine.addEntity(pf);
    ////platforms.push(pf);
    //pf = new Platform(gameEngine, 400, 350, 100, 150);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 100, 200, 200, 20);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 2, 1 (800)
    //pf = new Platform(gameEngine, 1000, 350, 200, 200);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 1200, 200, 600, 200);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 3, 1 (1600)
    //pf = new Platform(gameEngine, 1900, 500, 50, 10);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 1950, 200, 100, 20);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 2100, 500, 800, 50);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 2200, 350, 600, 20);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 4, 1 (2400)
    //pf = new Platform(gameEngine, 2900, 250, 100, 20);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 3050, 125, 100, 20);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 5, 1 (3200)
    //pf = new Platform(gameEngine, 2800, 500, 6000, 200);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 3180, 0, 50, 800);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 6, 1 (4000)
    //pf = new Platform(gameEngine, 3200, 400, 200, 100);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 3600, 400, 200, 100);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 3400, 200, 100, 100);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 3850, 250, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 7, 1 (4800)
    //pf = new Platform(gameEngine, 4175, 250, 150, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 4200, 100, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 4475, 250, 150, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 4500, 100, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 4775, 100, 150, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 4800, -50, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 4825, -200, 50, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 8, 1 (5600)
    //pf = new Platform(gameEngine, 5050, 100, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 5275, 250, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 5275, -50, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 5525, 100, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 9, 1
    //pf = new Platform(gameEngine, 5800, 250, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 5800, -50, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 6000, -200, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);
    //pf = new Platform(gameEngine, 6000, 400, 100, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    //pf = new Platform(gameEngine, 6200, 100, 500, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 10,1(6400)
    //pf = new Platform(gameEngine, 6800, 250, 150, 25);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    ////Block 11, 1(7200)


    ////Block ?, ?
    //pf = new Platform(gameEngine, 50, 70, 50, 10);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    //pf = new Platform(gameEngine, 200, -120, 900, 10);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    //pf = new Platform(gameEngine, 400, -320, 100, 10);
    //gameEngine.addEntity(pf);
    //platforms.push(pf);

    //gameEngine.platf = pf;

    if (character = 1) {
        var link = new Link(gameEngine);
        gameEngine.link = link;
        gameEngine.addEntity(link);

    }

    /***********COINS***************/
    var coin = new Coin(gameEngine, 200, 450);
    gameEngine.addEntity(coin);
    coinsArr.push(coin);
    coin = new Coin(gameEngine, 632, 450);
    gameEngine.addEntity(coin);
    coinsArr.push(coin);
    coin = new Coin(gameEngine, 632, 300);
    gameEngine.addEntity(coin);
    coinsArr.push(coin);
    coin = new Coin(gameEngine, 632, 332);
    gameEngine.addEntity(coin);
    coinsArr.push(coin);
    coin = new Coin(gameEngine, 632, 364);
    gameEngine.addEntity(coin);
    coinsArr.push(coin);
    coin = new Coin(gameEngine, 250, 450);
    gameEngine.addEntity(coin);
    coinsArr.push(coin);
    coin = new Coin(gameEngine, 300, 450);
    gameEngine.addEntity(coin);
    coinsArr.push(coin)
    coin = new Coin(gameEngine, 4825, -250);
    gameEngine.addEntity(coin);
    coinsArr.push(coin);
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

    /*******************************/
    /*******************************/
    /*******************************/
    var sp = new Spikes(gameEngine, 500, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);

    sp = new Spikes(gameEngine, 520, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);

    sp = new Spikes(gameEngine, 3400, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 3420, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 3550, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 3570, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);


    //Spikes in block 3
    /***/
    /***/
    /***/
    sp = new Spikes(gameEngine, 2780, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2810, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2840, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2870, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2900, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2930, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2960, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2990, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 3020, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 3050, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 3080, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 3110, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 3140, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2930, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2960, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    sp = new Spikes(gameEngine, 2990, 480);
    gameEngine.addEntity(sp);
    spikesArr.push(sp);
    /***/
    /***/
    /***/

    gameEngine.spikes = sp;

    var hp = new Health(gameEngine, 600, 20, health, 20);
    gameEngine.health = hp;
    gameEngine.addEntity(hp);

    // var tile = new Map(gameEngine, 600, 470);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 632, 470);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 664, 470);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);


    // tile = new Map(gameEngine, 600, 450);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 632, 450);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 664, 450);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);

    // tile = new Map(gameEngine, 600, 425);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 632, 425);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 664, 425);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);

    // tile = new Map(gameEngine, 600, 400);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 632, 400);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 664, 400);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);

    // tile = new Map(gameEngine, 600, 375);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 632, 375);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 664, 375);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);

    // tile = new Map(gameEngine, 600, 350);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 632, 350);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 664, 350);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);

    // tile = new Map(gameEngine, 600, 325);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 632, 325);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 664, 325);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);

    // tile = new Map(gameEngine, 600, 300);
    // gameEngine.mapArr = mapArr;
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 632, 300);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);
    // tile = new Map(gameEngine, 664, 300);
    // gameEngine.addEntity(tile);
    // mapArr.push(tile);

    var enemy = new Enemy(gameEngine, 1400, 110, 150);
    gameEngine.enemiesArr = enemiesArr;
    gameEngine.addEntity(enemy);
    enemiesArr.push(enemy);

    enemy = new Enemy(gameEngine, 1700, 110, 20);
    gameEngine.addEntity(enemy);
    enemiesArr.push(enemy);
    enemy = new Enemy(gameEngine, 4000, 400, 300);
    gameEngine.addEntity(enemy);
    enemiesArr.push(enemy);
    enemy = new Enemy(gameEngine, 4500, 165, 100);
    gameEngine.addEntity(enemy);
    enemiesArr.push(enemy);
    
    var duEnemy = new DEnemy(gameEngine, 400, 300, 0.06);
    gameEngine.addEntity(duEnemy);
    dEnemy.push(duEnemy);
    duEnemy = new DEnemy(gameEngine, 200, 150, 0.1);
    gameEngine.addEntity(duEnemy);
    dEnemy.push(duEnemy);


    gameEngine.dEnemy = dEnemy;


    var tMap = new TileMap(gameEngine);
    gameEngine.addEntity(tMap);
    gameEngine.tileMap = tMap;
}

function characterSelection(gameEngine) {
    var charSelBackground = new CharacterSelectionBackground(gameEngine, 0, 0);
    gameEngine.addEntity(charSelBackground);

    var linkSelect = new LinkSelect(gameEngine, 0, 0);
    gameEngine.addEntity(linkSelect);
}

function levelSelectionPanel(gameEngine) {
    var lSelect = new LevelSelect(gameEngine);
    gameEngine.addEntity(lSelect);

    //var linkSelect = new LinkSelect(gameEngine, 0, 0);
    //gameEngine.addEntity(linkSelect);
}



