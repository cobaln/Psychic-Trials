class Log extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, group, spawnX, spawnY, velocityX, velocityY, logBounce) {
        // Call Phaser Physics Sprite constructor
        super(scene, spawnX, spawnY, 'log').setOrigin(0.5, 0.5).setInteractive(); 
        // Set up physics sprite
        scene.add.existing(this); // add to existing scene, displayList, updateList
        scene.physics.add.existing(this); // add physics body
        this.setCircle(30, 5, 5);
        this.setAngularVelocity(-logAngularVelocity);
        this.setVelocityX(velocityX);
        this.setVelocityY(velocityY);
        this.setBounceY(logBounce);
        this.setDepth(-1);

        let log = this;
        this.exists = true;
        this.beenThrown = false;

        this.emitCircle = new Phaser.Geom.Circle(this.x, this.y, 30);
        log.particleTrail = logParticles.createEmitter({
            emitZone: { source: this.emitCircle },
            alpha: { start: 1, end: 0},
            scale: { start: 1, end: 0},
            speedX: this.body.velocity.x - (0.8)*this.body.velocity.x,
            speedY: this.body.velocity.y/10,
            lifespan: 2000,
            frequency: 50,
            quantity: 1,
        });
        log.particleTrail.stop();

        /*
        Psychic Throw
        Log is slowed on initial click and while holding click down. Log's velocity is set based on the
        vector formed by the distance between the pointer position on first clicking the log and the pointer
        position after releasing click. After releasing click, the log's velocity is set and it continues
        parallel to this vector for a short moment without gravity before gravity is returned. 
        */
        scene.input.setDraggable(this);
        this.on('dragstart', function (pointer) {
            this.beenThrown = true;
            // Slow log on initial click
            this.body.setDrag(preThrowDrag, 0);
            // Store this initial pointer position
            this.initPointerX = pointer.x;
            this.initPointerY = pointer.y;
            // Start log trailing particles and burst at pointer to show this pointer position (start)
            this.particleTrail.start();
            particlePointer.start();
            // Play grab sound
            grabSound.play();
        });
        this.on('dragend', function (pointer) {
            // No grav for now
            this.body.allowGravity = false;
            // Reset drag
            this.body.setDrag(0, 0);
            // Calculate measurements
            this.xDist = pointer.x - log.initPointerX;
            this.yDist = pointer.y - log.initPointerY;
            this.totalDist = Phaser.Math.Distance.Between(this.initPointerX, this.initPointerY, pointer.x, pointer.y);
            // Set particleLine
            particleLine.setTo(this.initPointerX, this.initPointerY, pointer.x, pointer.y);
            // Stop grab sound
            grabSound.stop();

            // Calculate throw velocity vector
            // Rare case where log disappears from trying to divide by 0 (mouse dragged a distance of 0)
            if(this.totalDist == 0){
                this.throwVelocityY = -minThrowSpeed;
            // Set velocity magnitude to minDragSpeed if drag distance is shorter than min
            } else if(this.totalDist < minThrowSpeed){
                // Converts the xDist, yDist components into xSpeed, ySpeed components in order to achieve minThrowSpeed (diagonal speed) on combining components. Uses Pythagorean theorum to solve for scaleFactor given a, b, and c where c is minThrowSpeed and a, b are xDist, yDist
                this.minScaleFactor = Math.sqrt(Math.pow(Math.abs(this.xDist), 2) + Math.pow(Math.abs(this.yDist), 2)) / minThrowSpeed;
                // Converts distance components into velocity components that total to minThrowSpeed
                this.throwVelocityX = this.xDist / this.minScaleFactor;       
                this.throwVelocityY = this.yDist / this.minScaleFactor;
                // Match particleLine to minThrowSpeed
                Phaser.Geom.Line.Extend(particleLine, 0, minThrowSpeed - this.totalDist);
            // Set velocity magnitude to maxThrowSpeed if drag distance is longer than max
            } else if (this.totalDist > maxThrowSpeed) {
                this.maxScaleFactor = Math.sqrt(Math.pow(Math.abs(this.xDist), 2) + Math.pow(Math.abs(this.yDist), 2)) / maxThrowSpeed;
                this.throwVelocityX = this.xDist / this.maxScaleFactor;       
                this.throwVelocityY = this.yDist / this.maxScaleFactor;
                // Match particleLine to maxThrowSpeed
                Phaser.Geom.Line.Extend(particleLine, 0, -(this.totalDist - maxThrowSpeed));
            // Set velocity magnitude to drag distance if between minThrowSpeed and maxThrowSpeed
            } else {
                this.throwVelocityX = this.xDist;       
                this.throwVelocityY = this.yDist;
            }
            
            this.body.velocity.x = this.throwVelocityX;
            this.body.velocity.y = this.throwVelocityY;

            // Create paticleVector that matches and parallels the psychic throw vector
            particleVector.start();
            // Play throw sound
            throwSound.play();
            
            // Return gravity after short duration
            this.gravityReturn = scene.time.delayedCall(psychicThrowTime, () => {
                this.body.allowGravity = true;
                // Stop all particles
                log.particleTrail.stop();
                particleVector.stop();
                particlePointer.stop();
            }, null, scene);
        });

        // Despawn after certain time to prevent player tossing logs up forever
        this.infinitePrevent = scene.time.delayedCall(logPreventInfiniteTime, () => {
            if(this.exists){
                this.exists = false;
                log.particleTrail.start();
                scene.input.setDraggable(this, false);
                this.body.velocity.y = 0;
                this.body.velocity.x = -200;
                this.setAlpha(0.5);
            }
        }, null, scene);

        this.group = group;
        this.scene = scene;
    }

    update() {
        // Update emit zone circle of this log
        this.emitCircle.setPosition(this.x, this.y);

        // Change angular velocity based on moving direction
        if(this.body.velocity.x < 0){
            this.setAngularVelocity(-logAngularVelocity);
        } else{
            this.setAngularVelocity(logAngularVelocity);
        }
        // Enforce pre throw slow down min speed
        if(Math.abs(this.body.velocity.x) < preThrowMinSpeed){
            this.body.setDrag(0, 0);
        }
        // Reflect log back left if log goes off right screen
        if(this.x > gameWidth + 50 && this.beenThrown) {
            this.body.velocity.x = -this.body.velocity.x/4;
            this.x = gameWidth + 25;
        }
        // Countdown remove log from group & scene when off left screen
        if(this.x < 0) {
            this.despawnTime = this.scene.time.delayedCall(logDespawnTime, () => {
                this.exists = false;
                this.particleTrail.remove();
                this.group.remove(this, true, true);
            }, null, this.scene);
        }
    }
}