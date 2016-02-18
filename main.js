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
var readyToPutForeground = false;
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

function reset(game) {
    this.game.end.removeFromWorld = true;
    character = 1;
    score = 0;
    lives = 3;
    health = 150;
    this.game.background.removeFromWorld = true;
    for (var i = 0; i < this.game.coinsArr.length; i++) this.game.coinsArr[i].removeFromWorld = true;
    for (var i = 0; i < this.game.spikesArr.length; i++) this.game.spikesArr[i].removeFromWorld = true;
    for (var i = 0; i < this.game.flyArr.length; i++) this.game.flyArr[i].removeFromWorld = true;
    for (var i = 0; i < this.game.enemiesArr.length; i++) this.game.enemiesArr[i].removeFromWorld = true;
    for (var i = 0; i < this.game.dEnemy.length; i++) this.game.dEnemy[i].removeFromWorld = true;
    coinsArr = [];
    spikesArr = [];
    flyArr = [];
    enemiesArr = [];
    dEnemy = [];
    tileArrBB = [];
    this.game.tileMap.removeFromWorld = true;
    this.game.score.removeFromWorld = true;
    this.game.lives.removeFromWorld = true;
    this.game.skills.removeFromWorld = true;
    this.game.restart.removeFromWorld = true;
    this.game.spikes.removeFromWorld = true;
    this.game.health.removeFromWorld = true;
    //this.game.tileMapFront.removeFromWorld = true;
    //this.game.door.removeFromWorld = true;
    startPlaying(this.game);
}

function StartButton(game, x, y) {
    this.animationWait = new Animation(ASSET_MANAGER.getAsset("./img/button-start.png"), 0, 0, 150, 53, 1, 1, true, false);
    this.animationHover = new Animation(ASSET_MANAGER.getAsset("./img/button-start.png"), 0, 53, 150, 53, 1, 1, true, false);
    this.animationClick = new Animation(ASSET_MANAGER.getAsset("./img/button-start.png"), 0, 106, 150, 54, 0.1, 1, false, false);
    this.x = x;
    this.y = y;
    this.hover = false;
    this.click = false;
    this.boundingbox = new BoundingBox(x, y, 150, 53);
    Entity.call(this, game, x, y);
}
StartButton.prototype = new Entity();
StartButton.prototype.constructor = StartButton;

StartButton.prototype.update = function () {
    this.boundingbox = new BoundingBox(this.x, this.y, 150, 53);
    if (this.game.mouse) {
        if(this.game.mouse.x > this.boundingbox.left && 
            this.game.mouse.x < this.boundingbox.right &&
            this.game.mouse.y > this.boundingbox.top &&
            this.game.mouse.y < this.boundingbox.bottom) {
                if(!this.click) this.hover = true;
                if (this.game.click) {
                    this.hover = false;
                    this.click = true;
                }
        } else this.hover = false;
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
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/aliencraft1.png"), 0, 0, 1280, 768, 1, 1, true, false);
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
    this.animationBackground = new Animation(ASSET_MANAGER.getAsset("./img/aliencraft1.png"), 0, 0, 1280, 768, 1, 1, true, false);
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
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/aliencraft1.png"), 0, 0, 1280, 768, 1, 1, true, false);
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
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/LINK.png"), 0, 0, 330, 460, 1, 1, true, false);
    this.animation2 = new Animation(ASSET_MANAGER.getAsset("./img/LINK-choose.png"), 0, 0, 330, 460, 1, 1, true, false);
    this.choose = false;
    this.choose2 = false;
    Entity.call(this, game, x, y);
}
LinkSelect.prototype = new Entity();
LinkSelect.prototype.constructor = LinkSelect;

LinkSelect.prototype.update = function () {
    if (this.game.mouse) {
        if ((this.game.mouse.x < ((1280 / 2) - (330 / 2) +330)) && this.game.mouse.x > (1280 / 2 - 330 / 2) &&
            this.game.mouse.y > 0 && this.game.mouse.y < 460) this.choose = true;
        else this.choose = false;
    }
    if (this.game.click) {
        if ((this.game.click.x < ((1280 / 2) - (330 / 2) + 330)) && this.game.click.x > (1280 / 2 - 330 / 2) &&
            this.game.click.y > 0 && this.game.click.y < 460) {
            var link = new Link(this.game);
            character = 1;
            start2 = true;
            this.removeFromWorld = true;
        }
    }
    Entity.prototype.update.call(this);
}

LinkSelect.prototype.draw = function (ctx) {
    if (this.choose) this.animation2.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    else  this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function Door(game, x, y) {
    this.animationDoorClosed = new Animation(ASSET_MANAGER.getAsset("./img/door.png"), 0, 0, 97, 143, 1, 1, true, false);
    this.animationDoorOpened = new Animation(ASSET_MANAGER.getAsset("./img/door.png"), 97, 0, 97, 143, 0.1, 3, false, false);
    this.animationDoorStay = new Animation(ASSET_MANAGER.getAsset("./img/door.png"), 388, 0, 97, 143, 1, 1, true, false);
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.openDoor = false;
    this.openedDoor = false;
    this.boxes = true;
    this.boundingbox = new BoundingBox(this.x, this.y, 97, 143);
    Entity.call(this, game, x, y);
}

Door.prototype = new Entity();
Door.prototype.constructor = Door;

Door.prototype.reset = function () {
    this.x = this.startX;
    this.y = this.startY;
}
Door.prototype.update = function () {
        this.boundingbox = new BoundingBox(this.x, this.y, 97, 143);
        if(this.boundingbox.collide(this.game.link.boundingbox)) {
            this.openDoor = true;
            if(this.animationDoorOpened.isDone()) {
                this.openDoor = false;
                this.openedDoor = true;
                this.game.link.removeFromWorld = true;
            }
            scorePanel(this.game);
        }

}

Door.prototype.draw = function (ctx) {
    if (this.boxes) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x, this.y, 97, 143);
    }
    if(this.openDoor) this.animationDoorOpened.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    else if (this.openedDoor) this.animationDoorStay.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    else this.animationDoorClosed.drawFrame(this.game.clockTick, ctx, this.x, this.y);
}

function EndScore(game) {
    this.boundingbox = new BoundingBox(490, 786 / 2 - 80, 120, 40)
    this.boundingbox2 = new BoundingBox(660, 786 / 2 - 80, 160, 40)
    this.clickReplay = false;
    this.clickContinue = false;
    Entity.call(this, game, 1280/2-200, 786/2-100);
}
EndScore.prototype = new Entity();
EndScore.prototype.constructor = EndScore;

EndScore.prototype.update = function () {
    if (this.game.mouse) {
        if(this.game.mouse.x > this.boundingbox.left && 
            this.game.mouse.x < this.boundingbox.right &&
            this.game.mouse.y > this.boundingbox.top &&
            this.game.mouse.y < this.boundingbox.bottom) {
            if (this.game.click) {
                //level = 1;
                this.game.end.removeFromWorld = true;
                character = 1;
                score = 0;
                lives = 3;
                health = 150;
                this.game.background.removeFromWorld = true;
                for (var i = 0; i < this.game.coinsArr.length; i++) this.game.coinsArr[i].removeFromWorld = true;
                for (var i = 0; i < this.game.spikesArr.length; i++) this.game.spikesArr[i].removeFromWorld = true;
                for (var i = 0; i < this.game.flyArr.length; i++) this.game.flyArr[i].removeFromWorld = true;
                for (var i = 0; i < this.game.enemiesArr.length; i++) this.game.enemiesArr[i].removeFromWorld = true;
                for (var i = 0; i < this.game.dEnemy.length; i++) this.game.dEnemy[i].removeFromWorld = true;
                coinsArr = [];
                spikesArr = [];
                flyArr = [];
                enemiesArr = [];
                dEnemy = [];
                tileArrBB = [];
                this.game.tileMap.removeFromWorld = true;
                this.game.score.removeFromWorld = true;
                this.game.lives.removeFromWorld = true;
                this.game.skills.removeFromWorld = true;
                this.game.restart.removeFromWorld = true;
                this.game.spikes.removeFromWorld = true;
                this.game.health.removeFromWorld = true;
                //this.game.tileMapFront.removeFromWorld = true;
                //this.game.door.removeFromWorld = true;
                startPlaying(this.game);
            }
        } else if (this.game.mouse.x > this.boundingbox2.left && 
            this.game.mouse.x < this.boundingbox2.right &&
            this.game.mouse.y > this.boundingbox2.top &&
            this.game.mouse.y < this.boundingbox2.bottom) {
            if (this.game.click) {
                level++;
                this.game.end.removeFromWorld = true;
                character = 1;
                score = 0;
                lives = 3;
                health = 150;
                this.game.background.removeFromWorld = true;
                for (var i = 0; i < this.game.coinsArr.length; i++) this.game.coinsArr[i].removeFromWorld = true;
                for (var i = 0; i < this.game.spikesArr.length; i++) this.game.spikesArr[i].removeFromWorld = true;
                for (var i = 0; i < this.game.flyArr.length; i++) this.game.flyArr[i].removeFromWorld = true;
                for (var i = 0; i < this.game.enemiesArr.length; i++) this.game.enemiesArr[i].removeFromWorld = true;
                for (var i = 0; i < this.game.dEnemy.length; i++) this.game.dEnemy[i].removeFromWorld = true;
                coinsArr = [];
                spikesArr = [];
                flyArr = [];
                enemiesArr = [];
                dEnemy = [];
                tileArrBB = [];
                this.game.tileMap.removeFromWorld = true;
                this.game.score.removeFromWorld = true;
                this.game.lives.removeFromWorld = true;
                this.game.skills.removeFromWorld = true;
                this.game.restart.removeFromWorld = true;
                this.game.spikes.removeFromWorld = true;
                this.game.health.removeFromWorld = true;
                //this.game.tileMapFront.removeFromWorld = true;
                //this.game.door.removeFromWorld = true;
                startPlaying(this.game);
            }
        }
    }
}

EndScore.prototype.draw = function (ctx) {
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
    ctx.strokeRect(this.boundingbox2.x, this.boundingbox2.y, this.boundingbox2.width, this.boundingbox2.height);

    ctx.font = "40px serif";
    ctx.fillText("Your Score: " + score, 1280/2-100, 786/2-100);

    ctx.font = "40px serif";
    ctx.fillText("Replay", 1280/2-150, 786/2-50);

    ctx.font = "40px serif";
    ctx.fillText("Continue", 1280/2+20, 786/2-50);
    Entity.prototype.draw.call(this);
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
    this.tileX = 0;
    Entity.call(this, game, x, y);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;
var moveUp = false;
var moveDown = false;

Background.prototype.update = function () {

    music.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
    }, false);
    music.play();

    // move the map slowly
    /**************************/
    //move map right
    if (!(this.x + 2600 < 1280) && this.game.link.x >= 400) {
        this.tileX -= 4;
        this.game.link.x = 396;
        this.x -= 1;
        movX -= 4;
        this.game.dragon.x -= 4;
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
        this.tileX += 4;
        this.game.link.x = 354;
        this.x += 1;
        movX += 4;
        this.game.dragon.x += 4;
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
        coin = new Audio('./img/coin.mp3');
        coin.play();
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


function DEnemy(game, x, y, speed, moveSpeed) {
    this.mSpeed = moveSpeed;
    Entity.call(this, game, x, y);
    this.x = x;
    this.y = y;
    this.falling = true;
    this.boxes = true;
    this.left = false;
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/Slime_First Gen_Weak.png"), 12, 15, 40, 53, speed, 9, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 39, 53);
    this.boundingboxDanger = new BoundingBox(this.x, this.y, 0, 0);
}
DEnemy.prototype = new Entity();
DEnemy.prototype.constructor = DEnemy;

DEnemy.prototype.update = function () {
    if (this.falling) {
        this.lastBottom = this.boundingbox.bottom;
        this.y += this.game.clockTick / this.jumpAnimation.totalTime * 1 * 50;
        this.boundingbox = new BoundingBox(this.x, this.y, this.jumpAnimation.frameWidth, this.jumpAnimation.frameHeight);
        this.boundingboxDanger = new BoundingBox(this.boundingbox.x - 100, this.boundingbox.y, this.boundingbox.width + 200, this.boundingbox.height);

        for (var i = 0; i < tileArrBB.length; i++) {
            var tl = tileArrBB[i];
            if (this.boundingbox.collide(tl)) {
                this.falling = false;
                this.y = tl.top - this.jumpAnimation.frameHeight + 2;
                this.tileT = tl;
                this.jumpAnimation.elapsedTime = 0;
            }
        }

    }
    if (!this.falling) {
        this.boundingbox = new BoundingBox(this.x, this.y, this.jumpAnimation.frameWidth, this.jumpAnimation.frameHeight);
        this.boundingboxDanger = new BoundingBox(this.boundingbox.x - 100, this.boundingbox.y, this.boundingbox.width + 200, this.boundingbox.height);
        if (this.boundingbox.right >= this.tileT.right) this.left = true;
        if (this.boundingbox.left <= this.tileT.left) this.left = false;
    }

    if (this.jumpAnimation.currentFrame() >= 3 && this.jumpAnimation.currentFrame() <= 6) {
        if (this.left) this.x -= this.mSpeed;
        else this.x += this.mSpeed;
    }
    if (this.game.link.boundingbox.collide(this.boundingbox)) {
        health -= 5;
        if (this.game.link.left) this.game.link.x += 10;
        if (!this.game.link.left) this.game.link.x -= 10;
    }
    if (this.game.link.boundingbox.collide(this.boundingboxDanger)) {
        if (this.game.link.boundingbox.left > this.boundingbox.right) this.left = false;
        if (this.game.link.boundingbox.right < this.boundingbox.left) this.left = true;
    }
    if(this.game.link.swordBox.collide(this.boundingbox)) this.removeFromWorld = true;
}
DEnemy.prototype.draw = function (ctx) {
    if (this.boxes) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.boundingboxDanger.x, this.boundingboxDanger.y, this.boundingboxDanger.width, this.boundingboxDanger.height);
    }
    this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function Dragon(game, x, y) {
    //this.mSpeed = moveSpeed;
    Entity.call(this, game, x, y);
    this.x = x;
    this.y = y;
    this.falling = true;
    this.boxes = true;
    this.left = true;
    this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/dragon.png"), 0, 84, 204, 170, 3, 1, true, false);
    this.breathAnimation = new Animation(ASSET_MANAGER.getAsset("./img/dragon.png"), 204, 84, 204, 170, 0.18, 2, false, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 102, 85);
    this.breath = false;
    this.boundingboxDanger = new BoundingBox(this.x, this.y, 0, 0);
    this.fireEnabled = false;
}
Dragon.prototype = new Entity();
Dragon.prototype.constructor = Dragon;

Dragon.prototype.update = function () {
    if (this.falling) {
        this.lastBottom = this.boundingbox.bottom;
        this.y += this.game.clockTick / this.breathAnimation.totalTime * 1 * 50;
        if (this.left) this.boundingbox = new BoundingBox(this.x - 204, this.y + 70, this.breathAnimation.frameWidth, this.breathAnimation.frameHeight - 70);
        else this.boundingbox = new BoundingBox(this.x, this.y, this.breathAnimation.frameWidth, this.breathAnimation.frameHeight);
        //this.boundingboxDanger = new BoundingBox(this.boundingbox.x - 100, this.boundingbox.y, this.boundingbox.width + 200, this.boundingbox.height);

        for (var i = 0; i < tileArrBB.length; i++) {
            var tl = tileArrBB[i];
            if (this.boundingbox.collide(tl)) {
                this.falling = false;
                this.y = tl.top - this.breathAnimation.frameHeight + 2;
                this.tileT = tl;
                this.breathAnimation.elapsedTime = 0;
            }
        }

    }
    if (!this.falling) {
        if (this.left) this.boundingbox = new BoundingBox(this.x - 204, this.y + 70, this.breathAnimation.frameWidth, this.breathAnimation.frameHeight - 70);
        else this.boundingbox = new BoundingBox(this.x, this.y, this.breathAnimation.frameWidth, this.breathAnimation.frameHeight);
        this.boundingboxDanger = new BoundingBox(this.boundingbox.x - 400, this.boundingbox.y, this.boundingbox.width + 800, this.boundingbox.height);
        if (this.boundingbox.right >= this.tileT.right) this.left = true;
        if (this.boundingbox.left <= this.tileT.left) this.left = false;
    }
    if (this.game.link.boundingbox.collide(this.boundingbox)) {
        health -= 5;
        if (this.game.link.left) this.game.link.x += 10;
        if (!this.game.link.left) this.game.link.x -= 10;
    }
    if (this.game.link.boundingbox.collide(this.boundingboxDanger)) {
        if (this.game.link.boundingbox.left > this.boundingbox.right) this.left = false;
        if (this.game.link.boundingbox.right < this.boundingbox.left) this.left = true;
    }
    if (this.game.link.swordBox.collide(this.boundingbox)) this.removeFromWorld = true;

    if (this.game.link.boundingbox.right > this.boundingbox.left - 400 && this.game.link.boundingbox.bottom > this.boundingbox.top) {
        this.standAnimation.elapsedTime = 0;
        this.breath = true;
    }

    if (this.breathAnimation.isDone()) {
        this.fireEnabled = true;
        this.breathAnimation.elapsedTime = 0;
        this.breath = false;
        var fire = new Fire(this.game, this.x - 282, this.y)
        this.game.addEntity(fire);
    }
}
Dragon.prototype.draw = function (ctx) {
    if (this.boxes) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
        //ctx.strokeStyle = "black";
        //ctx.strokeRect(this.boundingboxDanger.x, this.boundingboxDanger.y, this.boundingboxDanger.width, this.boundingboxDanger.height);
    }
    ctx.save();
    ctx.scale(-1, 1);
    if (this.breath) this.breathAnimation.drawFrame(this.game.clockTick, ctx, -this.x, this.y + 5);
    else this.standAnimation.drawFrame(this.game.clockTick, ctx, -this.x, this.y + 5);
    ctx.restore();
    Entity.prototype.draw.call(this);
}

function Fire(game, x, y) {
    Entity.call(this, game, x, y);
    this.x = x;
    this.y = y;
    this.boxes = true;
    this.left = true;
    this.fireAnimation1 = new Animation(ASSET_MANAGER.getAsset("./img/dragon.png"), 612, 62, 282, 124, 0.18, 4, false, false);
    this.fireAnimation2 = new Animation(ASSET_MANAGER.getAsset("./img/dragon.png"), 612, 186, 292, 147, 0.18, 4, false, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 102, 85);
    this.fire1 = true;
}
Fire.prototype = new Entity();
Fire.prototype.constructor = Fire;

Fire.prototype.update = function () {
    this.x -= 5;
}
Fire.prototype.draw = function (ctx) {
    if (this.boxes) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
        //ctx.strokeStyle = "black";
        //ctx.strokeRect(this.boundingboxDanger.x, this.boundingboxDanger.y, this.boundingboxDanger.width, this.boundingboxDanger.height);
    }
    ctx.save();
    ctx.scale(-1, 1);
    if (this.fire1) {
        this.fireAnimation1.drawFrame(this.game.clockTick, ctx, -this.x - 80, this.y + 80);
        if (this.fireAnimation1.isDone()) this.fire1 = false;
    }
    else {
        if (this.fireAnimation1.isDone()) {
            this.fireAnimation2.drawFrame(this.game.clockTick, ctx, -this.x - 80, this.y + 80);
            if (this.fireAnimation2.isDone()) this.removeFromWorld = true;
        }
    }
    ctx.restore();
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
   // this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 0, 45, 79, 0.7, 2, true, false);
   // this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 465, 75, 101, 0.20, 3, false, false);
   // this.runningAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 318, 75, 72, 0.05, 10, true, false);
   // this.dyingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 669, 96, 99, 0.15, 3, false, false);
   // this.deadAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 288, 742, 96, 99, 0.2, 1, true, false);
   // this.downAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 225, 510, 75, 56, 1, 1, true, false);
   // this.slash2Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 869, 150, 111, 0.05, 2, false, false);
   // this.slash3Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1093, 125, 93, 0.05, 2, false, false);
   // this.slash1Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1281, 140, 86, 0.05, 2, false, false);
   // this.fallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 150, 465, 75, 101, 0.20, 1, true, false);
   //this.fallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 150, 465, 200, 101, 0.24, 1, true, false);

   //this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 0, 45, 79, 0.7, 2, true, false);
    //this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 0, 38, 58, 0.4, 3, true, false);
    this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 0, 57, 80, 0.4, 3, true, false);
    //this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 465, 75, 101, 0.20, 3, false, false);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 84, 50, 83, 0.7, 1, false, false);
    //this.runningAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 318, 75, 72, 0.05, 10, true, false);
    this.runningAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 168, 61, 77, 0.1, 6, true, false);
   this.dyingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1004, 144, 149, 0.15, 3, false, false);
   this.deadAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 432, 1113, 144, 149, 0.2, 1, true, false);
   this.downAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 338, 765, 113, 84, 1, 1, true, false);
   //this.slash2Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 869, 150, 111, 0.05, 2, false, false);
   this.slash2Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 570, 285, 176, 119, 0.05, 3, false, false);
   //this.slash3Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1093, 125, 93, 0.05, 2, false, false);
   this.slash3Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 1305, 285, 188, 119, 0.05, 2, false, false);
    //this.slash1Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 1281, 140, 86, 0.05, 2, false, false);
   this.slash1Animation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 300, 132, 119, 0.05, 2, false, false);
    //slash1//this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 200, 88, 79, 0.4, 2, true, false);
    //slash2//this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 380, 190, 117, 79, 0.4, 3, true, false);
   //slash3//this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 870, 190, 125, 79, 0.4, 2, true, false);
   //this.fallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 150, 465, 75, 101, 0.20, 1, true, false);
   this.fallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 0, 84, 50, 83, 0.7, 1, true, false);

   this.swordBox = new BoundingBox(this.x - 80, this.y - 15, 96, 99);
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
   Entity.call(this, game, 50, 100);
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
    if (this.boundingbox.bottom > 768) {
        this.fallDead = true;
    }
    if (this.boundingbox.bottom > 3000) {
        //reset(this.game);
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
   ////*********START RUNNING RIGHT*********//
   ////*************************************//
   if (this.game.D) {
       this.slash = false;
       this.boundingbox = new BoundingBox(this.x+5, this.y, this.runningAnimation.frameWidth -20, this.runningAnimation.frameHeight);
       for (var i = 0; i < tileArrBB.length; i++) {
           var tl = tileArrBB[i];
           if (this.boundingbox.collide(tl)) {
               this.x -= linkSpeed;//this.x = tl.left - (this.boundingbox.right - this.boundingbox.left);
           }
       }
       this.left = false;
       this.running = true;
       this.x += linkSpeed;
   }
   
   ////*************************************//
   ////*********START RUNNING LEFT**********//
   ////*************************************//
   if (this.game.A) {
       this.slash = false;
       this.boundingbox = new BoundingBox(this.x, this.y, this.runningAnimation.frameWidth - 25, this.runningAnimation.frameHeight);
       for (var i = 0; i < tileArrBB.length; i++) {
           var tl = tileArrBB[i];
           if (this.boundingbox.collide(tl)) this.x += linkSpeed; //this.x = tl.right;
       }
       this.left = true;
       this.running = true;
       this.x -= linkSpeed;
   }

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
   if (this.game.Q && !this.falling && !this.jumping && !this.running) {
       slash = new Audio('./img/sword.mp3');
       slash.play();
       if (this.left) {
           this.swordBox = new BoundingBox(this.x - 80, this.y - 15, 96, 99);
       }
       else {
           this.swordBox = new BoundingBox(this.x + 32, this.y - 15, 96, 99);
       }
       this.slash = true;
   }

    //if off the ledge then start falling
   if (!this.jumping && !this.falling) {
       if (this.boundingbox.left > this.tileT.right) this.falling = true;
       if (this.boundingbox.right < this.tileT.left) this.falling = true;
   }



   //*************************************//
   //***********JUMPING LOGIC*************//
    //*************************************//
   if (this.game.space && !this.jumping && !this.falling) {
       jump = new Audio('./img/jump.wav');
       jump.play();
       this.jumping = true;
       this.base = this.y;
   }
    this.lastBottom = this.boundingbox.bottom;
    this.lastTop = this.boundingbox.top;
   if (this.jumping) {
       this.slash = false;
       this.running = false;
       var height = 0;
       var duration = this.jumpAnimation.elapsedTime + this.game.clockTick;
       if (duration > this.jumpAnimation.totalTime / 2) duration = this.jumpAnimation.totalTime - duration;
       duration = duration / this.jumpAnimation.totalTime;

       height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
       this.y = this.base - height;
       if (this.left) this.boundingbox = new BoundingBox(this.x + 5, this.y, this.jumpAnimation.frameWidth - 25, this.jumpAnimation.frameHeight - 22);
       else this.boundingbox = new BoundingBox(this.x + 5, this.y, this.jumpAnimation.frameWidth-30, this.jumpAnimation.frameHeight - 22);

       for (var i = 0; i < tileArrBB.length; i++) {
           var tl = tileArrBB[i];
           // if (this.boundingbox.collide(tl) && this.lastTop <= tl.bottom) {
           //      this.falling = true;
           //      this.jumpAnimation.elapsedTime = 0;
           // }
           if (this.boundingbox.collide(tl) && tl != this.tileT && this.boundingbox.bottom >= tl.bottom && this.boundingbox.top <= tl.bottom) {
                console.log('top');
                this.jumping = false;
                this.y = tl.bottom+5;
                this.falling = true;
                this.jumpAnimation.elapsedTime = 0;
           }
           else if (this.boundingbox.collide(tl) && this.lastBottom >= tl.top) {
            console.log('bottom');
               this.jumping = false;
               this.y = tl.top - this.jumpAnimation.frameHeight + 25;
               this.tileT = tl;
               this.jumpAnimation.elapsedTime = 0;
           }
           // if (this.boundingbox.collide(tl) && this.boundingbox.top < tl.bottom &&
           //                 this.lastBottom > tl.bottom) {
           //  if (this.boundingbox.collide(tl) && this.lastTop <= tl.bottom) {
           //     // this.jumping = false;
           //     // this.jumpAnimation.elapsedTime = 0;
           //     // this.tileT = tl; //??????????
           //     // this.falling = true;
           //     this.y = tl.bottom+5;
           // }
       }
   }
   
   if (this.falling) {
       this.slash = false;
       this.running = false;
       this.jumping = false;
       // this.lastBottom = this.boundingbox.bottom;
       this.y += this.game.clockTick / this.jumpAnimation.totalTime * 4 * this.jumpHeight;

       if (this.left) this.boundingbox = new BoundingBox(this.x + 10, this.y, this.standAnimation.frameWidth, this.fallAnimation.frameHeight - 20);
       else this.boundingbox = new BoundingBox(this.x, this.y, this.fallAnimation.frameWidth - 25, this.fallAnimation.frameHeight - 20);

       for (var i = 0; i < tileArrBB.length; i++) {
           var tl = tileArrBB[i];

           if (this.boundingbox.collide(tl) && this.lastBottom >= tl.top) {
               this.falling = false;
               this.y = tl.top - this.standAnimation.frameHeight+2;
               this.tileT = tl;
               this.fallAnimation.elapsedTime = 0;
           }
            // if (this.boundingbox.collide(tl) && this.lastTop <= tl.bottom) {
           //      // this.falling = true;
           //      // this.jumpAnimation.elapsedTime = 0;
           //      // this.y = tl.bottom+5;
           // }
          // if (this.boundingbox.collide(tl) && this.lastTop <= tl.bottom) {
       //         this.falling = false;
       //         // this.y = tl.top - this.standAnimation.frameHeight+2;
       //         // this.tileT = tl;
       //         this.fallAnimation.elapsedTime = 0;
           // }
       }
   }

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
               ctx.strokeRect(this.x - 80, this.y - 15, 96, 99);
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
               ctx.strokeRect(this.x + 32, this.y-15, 96, 99);
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
    this.boundingbox = new Array(51);
    this.tileMap = new Array(51);
    for (var i = 0; i < this.tileMap.length; i++) {
        this.tileMap[i] = new Array(24);
        this.boundingbox[i] = new Array(24);
    }
    this.sprites = new Array(48);
    var testTileMap;
    var backgroundTileMap;
    if (level === 1) {
        //active/colliding tiles
        testTileMap = [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 0, 0], //the column on the very right has to be all zeroes
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0], ///// bottom
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0], /// --> bottom
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0], //this row has to be all zeroes
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        ];
        //background tiles
        backgroundTileMap =[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0], //the column on the very right has to be all zeroes
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0, 0, 0, 5, 0], ///// bottom
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0], /// --> bottom
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], //this row has to be all zeroes
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                         ];
    }
    else { //2nd level
        testTileMap = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 0], //the column on the very right has to be all zeroes
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0], ///// bottom
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0], /// --> bottom
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //this row has to be all zeroes
        ];
        backgroundTileMap = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0], //the column on the very right has to be all zeroes
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0], ///// bottom
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0], /// --> bottom
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //this row has to be all zeroes
        ];
    }
    this.tileMap = testTileMap;
    this.backgroundTileMap = backgroundTileMap;

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
    for (var j = 0; j < 24; j++) {
        for (var i = 0; i < this.tileMap.length; i++) {
            var x = (i * 32) + movX;
            var y = (j * 32) + movY;
            if (this.tileMap[i][j] != 0) {
                if (this.tileMap[i + 1][j] != 0) {
                    len += 32;
                    isub++;
                } else {
                    if (len > 0) {
                        len += 32;
                        tileArrBB.push(new BoundingBox(((i - isub) * 32) + movX, ((j) * 32) + movY, len, 32));
                        len = 0;
                        isub = 0;
                    }
                    else {
                        tileArrBB.push(new BoundingBox(((i - isub) * 32) + movX, ((j) * 32) + movY, 32, 32));
                        len = 0;
                        isub = 0;
                    }
                }
            }
        }
    }
    // for (var i = 0; i < this.tileMap.length; i++) {
    //     for (var j = 0; j < 24; j++) {
    //         var x = (i * 32) + movX;
    //         var y = (j * 32) + movY;
    //         if (this.tileMap[i][j] != 0) {
    //             if (this.tileMap[i][j + 1] != 0) {
    //                 wid += 32;
    //                 jsub++;
    //             } else {
    //                 if (wid > 0) {
    //                     wid += 32;
    //                     tileArrBB.push(new BoundingBox(((i) * 32) + movX, ((j - jsub) * 32) + movY, 32, wid));
    //                     wid = 0;
    //                     jsub = 0;
    //                 }
    //             }
    //         }
    //     }
    // }
}
TileMap.prototype = new Entity();
TileMap.prototype.constructor = TileMap;

TileMap.prototype.update = function () {
    Entity.prototype.update.call(this);
}
TileMap.prototype.draw = function (ctx) {
     for(var i = 0; i < tileArrBB.length; i++) {
         ctx.strokeStyle = "red";
         ctx.strokeRect(tileArrBB[i].left, tileArrBB[i].top, tileArrBB[i].right - tileArrBB[i].left, tileArrBB[i].bottom - tileArrBB[i].top);
     }
    /*********************************************************/
    /*****************TILE MAP BACKGROUND*********************/
    // for (var i = 0; i < this.backgroundTileMap.length; i++) {
    //     for (var j = 0; j < 24; j++) {
    //         var sprite = this.sprites[this.backgroundTileMap[i][j]];
    //         if (sprite) ctx.drawImage(sprite, (i * 32) + movX, (j * 32) + movY);
    //     }
    // }
    // *******************************************************
    // /*****************TILE MAP REAL***************************/
    // for (var i = 0; i < this.tileMap.length; i++) {
    //     for (var j = 0; j < 24; j++) {
    //         var sprite = this.sprites[this.tileMap[i][j]];
    //         if (sprite) ctx.drawImage(sprite, (i * 32) + movX, (j * 32) + movY);
    //     }
    // }
}



function TileMapFront(game, ctx) {
    this.boxes = true;
    this.x = 0;
    this.y = 0;
    Entity.call(this, game, 0, 0);
    this.tileMapFront = new Array(32);
    for (var i = 0; i < this.tileMapFront.length; i++) {
        this.tileMapFront[i] = new Array(24);
    }
    this.sprites = new Array(48);
    var testTileMapFront;
    if (level === 1) {
        //frontground tiles
        testTileMapFront = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0], //the column on the very right has to be all zeroes
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0], ///// bottom
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0], /// --> bottom
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //this row has to be all zeroes
        ];
    }
    else { //2nd level
        testTileMapFront = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 0], //the column on the very right has to be all zeroes
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0], ///// bottom
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0], /// --> bottom
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //this row has to be all zeroes
        ];
    }
    this.tileMapFront = testTileMapFront;

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
}
TileMapFront.prototype = new Entity();
TileMapFront.prototype.constructor = TileMapFront;

TileMapFront.prototype.update = function () {
    Entity.prototype.update.call(this);
}
TileMapFront.prototype.draw = function (ctx) {
    for (var i = 0; i < this.tileMapFront.length; i++) {
        for (var j = 0; j < 24; j++) {
            var sprite = this.sprites[this.tileMapFront[i][j]];
            if (sprite) ctx.drawImage(sprite, (i * 32) + movX, (j * 32) + movY);
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
ASSET_MANAGER.queueDownload("./img/door.png");
ASSET_MANAGER.queueDownload("./img/dragon.png");

var coinsArr = [];
var spikesArr = [];
var flyArr = [];
var enemiesArr = []
var dEnemy = [];
var tileArrBB = [];
var music;
ASSET_MANAGER.downloadAll(function () {
    music = new Audio('./img/music.mp3');

    console.log(start);
    var gameEngine = new GameEngine();
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
	gameEngine.ctx = ctx; 
    var pg = new PlayGame(gameEngine, 0, 0);
    gameEngine.addEntity(pg);

    var startButton = new StartButton(gameEngine, 1280/2 - 150/2, 768/2-53/0.3);
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



    var tMap = new TileMap(gameEngine);
    gameEngine.addEntity(tMap);
    gameEngine.tileMap = tMap;


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

    gameEngine.spikes = sp;

    var hp = new Health(gameEngine, 600, 20, health, 20);
    gameEngine.health = hp;
    gameEngine.addEntity(hp);

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
    
    var duEnemy = new DEnemy(gameEngine, 800, 300, 0.08, 1);
    gameEngine.addEntity(duEnemy);
    dEnemy.push(duEnemy);
    duEnemy = new DEnemy(gameEngine, 200, 250, 0.06, 2);
    gameEngine.addEntity(duEnemy);
    dEnemy.push(duEnemy);

    gameEngine.dEnemy = dEnemy;

    var drag = new Dragon(gameEngine, 1100, 500);
    gameEngine.addEntity(drag);
    gameEngine.dragon = drag;

    //var tMapfront = new TileMapFront(gameEngine);
    //gameEngine.addEntity(tMapfront);
    //gameEngine.tileMapFront = tMapfront;

    //var door = new Door(gameEngine, 350, 400);
    //gameEngine.addEntity(door);
    //gameEngine.door = door;
}

function characterSelection(gameEngine) {
    var charSelBackground = new CharacterSelectionBackground(gameEngine, 0, 0);
    gameEngine.addEntity(charSelBackground);

    var linkSelect = new LinkSelect(gameEngine, 1280/2-330/2, 0);
    gameEngine.addEntity(linkSelect);
}

function levelSelectionPanel(gameEngine) {
    var lSelect = new LevelSelect(gameEngine);
    gameEngine.addEntity(lSelect);
}

function scorePanel(gameEngine) {
    var end = new EndScore(gameEngine);
    gameEngine.addEntity(end);
    gameEngine.end = end;
}


