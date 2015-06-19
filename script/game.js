
var Game = function(){
    var BULLET = Math.pow(2,2);
    var ENEMIES = Math.pow(2,3);
    this._width = 1200;
    this._height = 720;

    //background canvas:
    /*this.bgRenderer = new PIXI.autoDetectRenderer(this._width, this._height, null, false);
    document.body.appendChild(this.bgRenderer.view);
    this.bgStage = new PIXI.Container();*/

    //rendering surface:
    this.renderer = new PIXI.autoDetectRenderer(this._width, this._height);//last param: isTransparent
    document.body.appendChild(this.renderer.view);
    this.stage = new PIXI.Container();

    this.world = new p2.World({
        gravity: [0,0]
    });

    this.speed = 200;
    this.turnSpeed = 3;

    var touchable = 'createTouch' in document;
    if(touchable){
        window.addEventListener('touchstart', this.onTouchStart, false);
        window.addEventListener('touchmove', this.onTouchMove, false);
        window.addEventListener('touchend', this.onTouchEnd, false);
    }

    window.addEventListener('keydown', function(event){
        this.handleKeys(event.keyCode, true);
    }.bind(this), false);
    window.addEventListener('keyup', function(event){
        this.handleKeys(event.keyCode, false);
    }.bind(this), false);

    this.enemyBodies = [];
    this.enemyGraphics = [];
    this.removeObjs = [];

    this.bulletBodies = [];

    this.build();
};

Game.prototype = {
    build: function(){
        //this.drawStars();
        this.setupBoundaries();
        this.setupAudio();
        this.createShip();
        this.createEnemies();
        requestAnimationFrame(this.tick.bind(this));
    },
    setupAudio: function(){
        this.sounds = new Howl({
            urls: ['audio/sounds.mp3', 'audio/sounds.ogg'],
            sprite: {
                boom1: [0, 636],
                boom2: [2012, 2342],
                boom3: [4992, 3030]
            }
        });
        /*this.music = new Howl({
            urls: ['audio/music.mp3', 'audio/music.ogg'],
            buffer: false,
            autoplay: true,
            volume:0.09,
            loop: true
            });*/
    },
    createShip: function(){
        this.ship = new p2.Body({
            mass: 1,
            angularVelocity: 0,
            damping: 0,
            angularDamping: 0, //prevents velocities from slowing down over time
            position: [Math.round(this._width / 2), Math.round(this._height / 2)]
        });
        this.shipShape = new p2.Rectangle(52,69);
        this.ship.addShape(this.shipShape);
        this.world.addBody(this.ship);

        this.shipGraphics = new PIXI.Graphics();
        this.shipGraphics.beginFill(0x20d3fe);
        this.shipGraphics.moveTo(0,0);
        this.shipGraphics.lineTo(-26, 60);
        this.shipGraphics.lineTo(26, 60);
        this.shipGraphics.endFill();

        //add engine:
        this.shipGraphics.beginFill(0x1495d1);
        this.shipGraphics.drawRect(-15,60,30,8); //(x,y,width,height)
        this.shipGraphics.endFill();

        //position the ship:
        //this.shipGraphics.x = Math.round(this._width / 2);
        //this.shipGraphics.y = Math.round(this._height / 2);

        this.stage.addChild(this.shipGraphics);

        //user interaction for flight:


        /*N
        Mousetrap.bind('w', function(){
            this.shipGraphics.rotation = 0;
            this.moveShip('n');
        }.bind(this));
        //S
        Mousetrap.bind('s', function(){
            this.shipGraphics.rotation = 180 * (Math.PI / 180);
            this.moveShip('s');
        }.bind(this));
        //R
        Mousetrap.bind('d', function(){
            this.shipGraphics.rotation = 90 * (Math.PI / 180);
            this.moveShip('e');
        }.bind(this));
        //L
        Mousetrap.bind('a', function(){
            this.shipGraphics.rotation = 270 * (Math.PI / 180);
            this.moveShip('w');
        }.bind(this));*///mousetrap (not compatible with p2 physics engine)
    },
    createEnemies: function(){
        this.enemyTimer = setInterval(function(){
            //create enemy physics body:
            var x = Math.round(Math.random() * this._width);
            var y = Math.round(Math.random() * this._height);
            var vx = (Math.random() - 0.5) * this.speed;
            var vy = (Math.random() - 0.5) * this.speed;
            var va = (Math.random() - 0.5) * this.speed;
            var enemy  = new p2.Body({
                position: [x,y],
                mass: 1,
                damping: 0,
                angularDamping: 0,
                velocity: [vx,vy],
                angularVelocity: va
            });
            var enemyShape = new p2.Circle(20);
            enemyShape.sensor = true;
            enemy.addShape(enemyShape);
            this.world.addBody(enemy);

            //create graphics object:
            var enemyGraphics = new PIXI.Graphics();
            enemyGraphics.beginFill(0x38d41a);
            enemyGraphics.drawCircle(0,0,20);
            enemyGraphics.endFill();
            enemyGraphics.beginFill(0x2aff00);
            enemyGraphics.lineStyle(1, 0x239d0b, 1);
            enemyGraphics.drawCircle(0,0,10);
            enemyGraphics.endFill();

            this.stage.addChild(enemyGraphics);

            //track enemies:
            this.enemyBodies.push(enemy);
            this.enemyGraphics.push(enemyGraphics);
        }.bind(this), 1000);

        this.world.on('beginContact', function(event){
            if(event.bodyB.id == this.ship.id){
                this.removeObjs.push(event.bodyA);
            }
        }.bind(this));
    },
    createBulletShapes: function(){
        this.bulletShape = new p2.Particle();
        this.bulletShape.collisionGroup = BULLET;
        this.bulletShape.collisionMask = ENEMIES;

    },
    fireBullets: function(){
        var bulletBody = new p2.Body({
            mass: 0.05,
            position: ship.position
        }).noDamping();
        bulletBody.addShape(bulletShape);
        bulletBodies.push(bulletBody);
        


    },
    handleKeys: function(code, state){//(keycode, boolean)
        switch(code){
            case 65: //A
                this.keyLeft = state;
                break;
            case 68: //D
                this.keyRight = state;
                break;
            case 87: //W
                this.keyUp = state;
                break;
            case 32: //spacebar = zero-grav brakes
                this.stop = true;
                break;
        }
    },
    onTouchStart: function(event){

    },
    onTouchMove: function(event){
        event.preventDefault();
        console.log("changedTouches event: " + JSON.stringify(event.changedTouches));
    },
    onTouchEnd: function(event){

    },
    /*moveShip: function(direction){
        var speed = 30;
        //increment x/y value based on direction:
        switch(direction){
            case 'n':
                this.shipGraphics.y -= speed;
                break;
            case 's':
                this.shipGraphics.y += speed;
                break;
            case 'e':
                this.shipGraphics.x += speed;
                break;
            case 'w':
                this.shipGraphics.x -= speed;
                break;
        }

    },*///moveShip (not based on p2 physics either)
    drawStars: function(){
        for(var i=0; i<=100; i++){
            var x = Math.round(Math.random() * this._width);
            var y = Math.round(Math.random() * this._height);
            var rad = Math.ceil(Math.random() * 2);
            var alpha = Math.min(Math.random() * 0.25, 1);

            var star = new PIXI.Graphics();
            star.beginFill(0xFFFFFF, alpha);
            star.drawCircle(x, y, rad);
            star.endFill();
            this.stage.addChild(star);
        }
        //render the stars once:
        //this.bgRenderer.render(this.bgStage);
    },
    setupBoundaries: function(){
        var walls = new PIXI.Graphics();
        walls.beginFill(0XFFFFFF, 0.5);
        walls.drawRect(0,0,this._width,10);
        walls.drawRect(this._width - 10, 10,10, this._height - 20);
        walls.drawRect(0,this._height - 10, this._width, 10);
        walls.drawRect(0,10,10,this._height - 20);

        this.stage.addChild(walls);
        //render boundaries once:
        this.renderer.render(this.stage);
    },
    engageBrakes: function(on){
        if(on){
            this.ship.damping = .5;
            this.ship.angularDamping = .5;
        }else{
            this.stop = false;
            this.ship.damping = 0;
            this.ship.angularDamping = 0;
        }
    },
    updatePhysics: function(){
        //update ship's angular velocities for rotation:
        if(this.stop){
            this.engageBrakes(true);
        }
        if(this.keyLeft){
            this.engageBrakes(false);
            this.ship.angularVelocity = -1 * this.turnSpeed;
        }else if(this.keyRight){
            this.engageBrakes(false);
            this.ship.angularVelocity = this.turnSpeed;
        } else{
            this.ship.angularVelocity = 0;
        }

        if(this.keyUp){
            var angle = this.ship.angle + Math.PI / 2;
            this.ship.force[0] -= this.speed *  Math.cos(angle);
            this.ship.force[1] -= this.speed * Math.sin(angle);
        }

        //update the position of the graphics based on the
        //physics simulation's position:
        this.shipGraphics.x = this.ship.position[0];
        this.shipGraphics.y = this.ship.position[1];
        this.shipGraphics.rotation = this.ship.angle;

        //warp the ship to the other side if out of bounds:
        if(this.ship.position[0] > this._width){
            this.ship.position[0] = 0;
        }else if (this.ship.position[0] < 0){
            this.ship.position[0] = this._width;
        }
        if(this.ship.position[1] > this._height){
            this.ship.position[1] = 0;
        }else if (this.ship.position[1] < 0){
            this.ship.position[1] = this._height;
        }

        //update enemy positions:
        for(var i = 0; i < this.enemyBodies.length; i++){
            this.enemyGraphics[i].x = this.enemyBodies[i].position[0];
            this.enemyGraphics[i].y = this.enemyBodies[i].position[1];
        }

        //step the physics simulation forward:
        this.world.step(1/60);

        //remove enemy bodies:
        for(var i = 0; i < this.removeObjs.length; i++){
            this.world.removeBody(this.removeObjs[i]);

            var index = this.enemyBodies.indexOf(this.removeObjs[i]);
            if(index){
                this.enemyBodies.splice(index, 1);
                this.stage.removeChild(this.enemyGraphics[index]);
                this.enemyGraphics.splice(index, 1);
            }

            //play random boom sound:
            this.sounds.play('boom' + (Math.ceil((Math.random() * 3))), function(){

            });
        }
        this.removeObjs.length = 0;
    },
    tick: function(){
        this.updatePhysics();
        this.renderer.render(this.stage);
        requestAnimationFrame(this.tick.bind(this));
    }

};

p2.Body.prototype.noDamping = function(){
    this.damping = this.angularDamping = 0;
    return this;
};