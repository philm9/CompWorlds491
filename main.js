// var moveFly = false;
// Fly.radius = 25;
// Fly.x;
// Fly.y;
// var score = 0;

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
var platformSpeed = 4;
//var frameWidth = 800;
var moveF = false;
Platform.prototype.update = function () {
    // if (!this.game.running) return;
    if (moveF) {
        //moveF = false;
        //for (var i = 0; i < this.game.platforms.length; i++) {
        //    var pf = this.game.platforms[i];
        //    this.pf.x = 100;
        //}
        // console.log(move);
        // this.x -= 200 * this.game.clockTick;
        // this.x = this.x - platformSpeed;
        // if (this.x + this.width < 0) this.x += 1000;
        // if (linkX >= 720) {
            // linkX = 4;
            // this.x += 800;
            // move = false;
        // }
         this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
        
     }
    // Entity.prototype.update.call(this);
}

Platform.prototype.draw = function (ctx) {
    var grad;
    var offset = 0;

    grad = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
    grad.addColorStop(0, 'green');
    ctx.fillStyle = grad;


    ctx.fillRect(this.x, this.y, this.width, this.height);
}

// function Background(game) {
//    Entity.call(this, game, 0, 400);
//    this.radius = 20;
// }
//
// Background.prototype = new Entity();
// Background.prototype.constructor = Background;
//
// Background.prototype.update = function () {
// }
//
// Background.prototype.draw = function (ctx) {
//    ctx.fillStyle = "SaddleBrown";
//    ctx.fillRect(0, 500, 800, 300);
//    ctx.fillRect(300, 350, 300, 40);
//    ctx.font = "18px serif";
//    ctx.fillText("Control:", 10, 50);
//    ctx.fillText("Space = jump, A = move left, D = move right, S = get down", 10, 80);
//    ctx.fillText("Q = attack, X = die (press space, A, or D to resurrect", 10, 100);
//    Entity.prototype.draw.call(this);
// }
//
// function Fly(game) {
//    this.flyAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 750, 0, 51, 29, 0.5, 2, true, false);
//    this.radius = Fly.radius;
//    Entity.call(this, game, 210, 210);
// }
// Fly.prototype = new Entity();
// Fly.prototype.constructor = Fly;
// Fly.prototype.update = function () {
//    Fly.x = this.x;
//    Fly.y = this.y;
//    if (this.flyAnimation.isDone()) {
//        this.flyAnimation.elapsedTime = 0;
//    }
//    var jumpDistance = this.flyAnimation.elapsedTime / this.flyAnimation.totalTime;
//    var totalHeight = 2;
//    if (jumpDistance > 0.5)
//        jumpDistance = 1 - jumpDistance;
//    var height = jumpDistance * 2 * totalHeight;
//    //var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
//    this.y -= height;
//    this.y = this.y + 1;
//    if (moveFly) {
//        moveFly = false;
//        //this.game.removeFromWorld = true;
//        this.x = Math.floor(Math.random() * (750 - 50 + 1)) + 50;
//        this.y = Math.floor(Math.random() * (210 - 400 + 1)) +400;     
//        // console.log('false');
//    }
//    //console.log(moveFly);
//    Entity.prototype.update.call(this);
// }
//
// Fly.prototype.draw = function (ctx) {
//    this.flyAnimation.drawFrame(this.game.clockTick, ctx, this.x-23, this.y-10);
//    Entity.prototype.draw.call(this);
// }

var x;
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

   this.fallAnimation = new Animation(ASSET_MANAGER.getAsset("./img/link-blueQUICK1.png"), 150, 465, 75, 101, 0.24, 1, true, false);

   this.left = false;
   this.sleeping = false;
   this.running = false;
   this.jumping = false;
   this.down = false;
   this.dying = false;
   this.dead = false;
   this.slash = false;
   this.falling = false;
   this.platform = platforms[0];
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
Link.prototype = new Entity();
Link.prototype.constructor = Link;

Link.prototype.update = function () {

    
    
    
    linkX = this.x;
    // x = this.x;
    // console.log(x);
//    if (this.hitFly()) {
//        //Fly.removeFromWorld = true;
//        //console.log(Fly.removeFromWorld);
//        moveFly = true;
//        //console.log(moveFly);
//            //Math.floor(Math.random() * (750 - 50 + 1)) + 50;
//        //console.log(Math.floor(Math.random() * (750 - 50 + 1)) + 50);
//        //Entity.prototype.update.call(this);
//        //this.removeFromWorld = true;
//        //this.game.lives -= 1;
//        console.log(true);
//    }

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
       //    platformSpeed = 0;
       //this.x--;
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
            // else this.falling = true;
            // console.log(falling);
       }
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
   if (this.game.space && !this.jumping) {
       this.jumping = true;
       this.base = this.y;
   }
   if (this.jumping) {
    //    this.running = false;
    //    console.log(this.y);
       var height = 0;
       var duration = this.jumpAnimation.elapsedTime + this.game.clockTick;
       if (duration > this.jumpAnimation.totalTime / 2) duration = this.jumpAnimation.totalTime - duration;
       duration = duration / this.jumpAnimation.totalTime;

       // quadratic jump
       height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
       this.lastBottom = this.boundingbox.bottom;
       //console.log(this.base);
       this.y = this.base - height;
       this.boundingbox = new BoundingBox(this.x - 15, this.y, this.jumpAnimation.frameWidth + 15, this.jumpAnimation.frameHeight - 22);

       for (var i = 0; i < this.game.platforms.length; i++) {
           var pf = this.game.platforms[i];
           //console.log(this.boundingbox.top);
           //console.log(pf.boundingbox.bottom);
           if (this.boundingbox.collide(pf.boundingbox) &&
                            this.boundingbox.top < pf.boundingbox.bottom &&
                            this.boundingbox.bottom > pf.boundingbox.bottom) {
               this.jumping = false;
               this.jumpAnimation.elapsedTime = 0;
               this.falling = true;
               console.log('true');
           }
           //console.log(pf.y);
           if (this.boundingbox.collide(pf.boundingbox) && this.lastBottom < pf.boundingbox.top) {
               this.jumping = false;
               this.y = pf.boundingbox.top - this.jumpAnimation.frameHeight+25;
               this.platform = pf;
               this.jumpAnimation.elapsedTime = 0;
           }
       }
   }
   
   if (!this.jumping && !this.falling) {
        this.boundingbox = new BoundingBox(this.x, this.y, this.standAnimation.frameWidth, this.standAnimation.frameHeight);
        if (this.boundingbox.left > this.platform.boundingbox.right) this.falling = true;
        if (this.boundingbox.right < this.platform.boundingbox.left) this.falling = true;
   }

   //console.log(this.y);
   if (this.falling) {
       this.jumping = false;
       //console.log(this.y);
        this.lastBottom = this.boundingbox.bottom;
        this.y += this.game.clockTick / this.jumpAnimation.totalTime *2.5* this.jumpHeight;
        this.boundingbox = new BoundingBox(this.x, this.y, this.fallAnimation.frameWidth -40, this.fallAnimation.frameHeight+20);

        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i];
            if (this.boundingbox.collide(pf.boundingbox)) { // && this.lastBottom < pf.boundingbox.top) {
                this.falling = false;
                    this.y = pf.boundingbox.top - this.fallAnimation.frameHeight + 25;
                if(this.lastBottom < pf.boundingbox.top) {
                    this.platform = pf;
                }
                this.fallAnimation.elapsedTime = 0;
            }
        }
    }
    

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
    //    platformSpeed = 0;
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
   
   
   
   
   
       //move the map
   if (this.x >= 770) {
        this.x = 0;
        for (var i = 0; i < this.game.platforms.length; i++) { //looping through all platforms
            var pf = this.game.platforms[i].x;
            //console.log(this.game.platforms[i].x);
            this.game.platforms[i].x -= 800;
        }
        moveF = true;
   }
   if (this.x <= -10) {
       this.x = 750;
       for (var i = 0; i < this.game.platforms.length; i++) { //looping through all platforms
           var pf = this.game.platforms[i].x;
           //console.log(this.game.platforms[i].x);
           this.game.platforms[i].x += 800;
       }
       moveF = true;
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
               ctx.strokeRect(this.x-15, this.y, this.jumpAnimation.frameWidth+15, this.jumpAnimation.frameHeight-22);
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
           this.fallAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 21);
       }
       else if (this.jumping) {
           if (this.boxes) {
               ctx.strokeStyle = "red";
               ctx.strokeRect(this.x-15, this.y, this.jumpAnimation.frameWidth+15, this.jumpAnimation.frameHeight-22);
               ctx.strokeStyle = "green";
               ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
           }
           this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 21);
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




// Link.prototype.hitFly = function () {
//    //needs further development
//    return ((this.y <= Fly.y + 29 && this.y >= Fly.y ||
//    this.y + 101 <= Fly.y + 29 && this.y + 101 >= Fly.y) &&
//    (this.x + 75 >= Fly.x && this.x + 75 <= Fly.x + 51 ||
//    this.x >= Fly.x && this.x <= Fly.x + 51));
// }
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

ASSET_MANAGER.queueDownload("./img/Tiles-32x32NEW.png");
ASSET_MANAGER.queueDownload("./img/link-blueQUICK1.png");
ASSET_MANAGER.queueDownload("./img/button-start.png");
ASSET_MANAGER.queueDownload("./img/separatePng/tile_00.png");

var platforms = [];
var center = 200;
ASSET_MANAGER.downloadAll(function () {
    var gameEngine = new GameEngine();
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var pf = new Platform(gameEngine, 0, 500, 1850, 100);
    gameEngine.addEntity(pf);
    platforms.push(pf);

    pf = new Platform(gameEngine, 0, 0, 20, 800);
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

    // var fly = new Fly(gameEngine);
    var link = new Link(gameEngine);
    //var dungeon = new Dungeon(gameEngine);
    // var tp = new TilePalette(gameEngine);
    // gameEngine.addEntity(fly);
    //gameEngine.addEntity(dungeon);
    // gameEngine.addEntity(tp);
    gameEngine.addEntity(link);
    
    gameEngine.platforms = platforms;
    gameEngine.init(ctx);
    gameEngine.start();
});