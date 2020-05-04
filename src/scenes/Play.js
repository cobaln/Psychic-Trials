class Play extends Phaser.Scene {
    constructor() {
        super('playScene');
    }

    create() {
        // Add inputs to play scene
        keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keySlowmo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        keyStart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        keyMute = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);



        // Reset some globals to be safe
        isGameOver = false;
        timeSlowLock = false;
        cooldownCalled = false;
        isJumping = false;
        isHit = false;
        spawnTime = spawnTimeMax;
        normalSoundRate = 1;
        this.physics.world.timeScale = normTimeScale;

        let playConfig = {
            fontFamily: 'Courier',
            fontSize: '40px',
            color: '#00000',
            align: 'center',
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
            },
            fixedWidth: 0
        }
        let difficultyConfig = {
            fontFamily: 'Courier',
            fontSize: '40px',
            color: '#00000',
            align: 'center',
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
            },
            fixedWidth: 0
        }

        // Add scrolling background
        background = this.add.tileSprite(0, 0, gameWidth, gameHeight, 'background').setOrigin(0,0);
        ground = this.add.tileSprite(0, 0, gameWidth, gameHeight, 'ground').setOrigin(0,0);
        cloud = this.add.tileSprite(0, 0, gameWidth, gameHeight, 'cloud').setOrigin(0,0);

        background.setDepth(-10);
        ground.setDepth(-10);
        cloud.setDepth(-10);

        // Create walking animation
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'player',frame:"run2" },
                { key: 'player',frame:"run3" },
                { key: 'player',frame:"run4" },
                { key: 'player',frame:"run5" },
                { key: 'player',frame:"run6" },
                { key: 'player',frame:"run7" },
                { key: 'player',frame:"run8" },
                { key: 'player',frame:"run9" },
            ],
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [
                { key: 'player',frame:"jump1" },
                { key: 'player',frame:"jump2" },
                { key: 'player',frame:"jump3" },
                { key: 'player',frame:"jump4" },
                { key: 'player',frame:"jump5" },
                { key: 'player',frame:"jump6" },
            ],
            frameRate: 24,
            repeat: 0
        });

        // Create player
        player = this.physics.add.sprite(300, 330, 'player','run2')
        player.body.setSize(30, 80);
        player.setOffset(20, 20);
        player.setCollideWorldBounds(true);
        player.body.setMaxVelocity(maxVelocityX, maxVelocityY);
        player.body.setGravityY(playerGravity);
        
        // Ground platform
        platform = this.physics.add.staticGroup();
        platform.create(gameWidth - 100, 415, 'invisibleGround').setOrigin(0.5);
        this.physics.add.collider(player, platform);

        // ObstacleSpawner(scene, delayMin, delayMax, minX, maxX, minY, maxY, logBounce)
        this.spawner1 = new ObstacleSpawner(this, spawnTime, spawnTime + 1000, -150, -300, 0, 400, 1);

        // Time slow filter
        timeSlowFilter = this.add.image(0, 0, 'timeSlowFilter').setOrigin(0,0);
        timeSlowFilter.alpha = 0;

        // HUD boxes ---------------------------------------------------------------------------------
        this.add.rectangle(centerX, playHUDY, gameWidth, playHUDHeight, 0x808080).setOrigin(0.5,0.5);
        this.add.rectangle(centerX, playHUDY, gameWidth - 20, playHUDHeight - 20, 0xC0C0C0).setOrigin(0.5,0.5);

        // Difficulty level text
        this.add.rectangle(centerX, difficultY, 340, 70, 0x808080).setOrigin(0.5,0.5);
        this.add.rectangle(centerX, difficultY, 320, 50, 0xC0C0C0).setOrigin(0.5,0.5);
        thisDifficultyLevel = 1;
        this.difficultText = this.add.text(centerX, difficultY, 'Difficulty: ' + thisDifficultyLevel, difficultyConfig).setOrigin(0.5, 0.5);
        // Difficulty increase timer
        this.difficultyTimer = this.time.addEvent({
            delay: nextDifficultyLevel,
            callback: () => {
                thisDifficultyLevel++;
                // Sound rate increase on higher difficulty
                if(!isDuringSlow){
                    normalSoundRate += soundRateDifficultBump;
                    bgm.rate = normalSoundRate;
                }
                if(spawnTime != spawnTimeMin){
                    spawnTime -= spawnTimeChange;
                }
                this.difficultText.setStyle({
                    color: timeSlowDuring
                });
                this.difficultText.setText("Difficulty: " + thisDifficultyLevel, difficultyConfig);
                this.colorChange = this.time.delayedCall(3000, () => {
                        this.difficultText.setStyle({
                            color: '#000000'
                        })
                    },this);
            },
            callbackScope: this,
            repeat: difficultyLevelMax
        });

        // Current time/distance ran text
        this.timeTextTop = this.add.text(centerX/2 - 100, playHUDY - 15, 'Distance: ', playConfig).setOrigin(0.5, 0.5);
        this.timeTextLeft = this.add.text(50, playHUDY + 17, '0', playConfig).setOrigin(0.5, 0.5);
        this.timeTextRight = this.add.text(170, playHUDY + 17, 'meters', playConfig).setOrigin(0.5, 0.5);
        currTime = 0;
        sceneClock = this.time.addEvent({
            delay: 1000, 
            callback: () => {
                currTime ++;
                this.timeTextLeft.setText(currTime);
            }, 
            callbackContext: this,
            loop: true,
        });

        // High score text
        this.highScoreTop = this.add.text(centerX + centerX/2 + 120, playHUDY - 15, 'High Score: ', playConfig).setOrigin(0.5, 0.5);
        this.highScoreLeft = this.add.text(gameWidth - 240, playHUDY + 17, highScore, playConfig).setOrigin(0.5, 0.5);
        this.highScoreRight = this.add.text(gameWidth - 120, playHUDY + 17, 'meters', playConfig).setOrigin(0.5, 0.5);

        // Time slow text
        this.timeSlowText = this.add.text(centerX - 30, playHUDY, 'Time slow:', playConfig).setOrigin(0.5, 0.5);
        this.timeSlowText.setStyle({
            color: timeSlowReady
        });
        playConfig.fixedWidth = 100;
        this.timeSlowNum = this.add.text(centerX + 130, playHUDY, '', playConfig).setOrigin(0.5, 0.5);

        // Add particles ---------------------------------------------------------------------------------
        this.pointerParticles = this.add.particles('psychicParticlePointer');
        this.pointerParticles.setDepth(15);
        logParticles = this.add.particles('psychicParticle');
        logParticles.setDepth(10);
        // Initialize emit zones
        pointerCircle = new Phaser.Geom.Circle(0, 0, 5);
        particleLine = new Phaser.Geom.Line(-200, -200, gameWidth, gameHeight);
        // Particles to show psychic throw velocity vector
        particleVector = this.pointerParticles.createEmitter({
            emitZone: { source: particleLine },
            alpha: { start: 1, end: 0 },
            scale: { start: 0.75, end: 0 },
            speed: {min: 0, max: 10},
            lifespan: { min: 500, max: 1000 },
            frequency: 20,
            quantity: 2,
        });
        // Particles on initial click
        particlePointer = this.pointerParticles.createEmitter({
            emitZone: { source: pointerCircle},
            alpha: { start: 1, end: 0 },
            scale: { start: 1.5, end: 0 },
            speed: { min: 0, max: 20 },
            lifespan: { min: 3000, max: 4000 },
            frequency: 10000,
            quantity: 10,
        });
        particleVector.stop();
        particlePointer.stop();
    }

    update() {
        this.spawner1.update();
        isGrounded = player.body.touching.down;

        if(!isGameOver){
            if(isGrounded){
                // Ground movement
                if(keyLeft.isDown) {
                    player.body.velocity.x -= playerRunAccel;
                } else if(keyRight.isDown) {
                    player.body.velocity.x += playerRunAccel;
                } else {
                    // Set drag when not inputting movement 
                    player.body.setDragX(groundDrag);
                }
                player.play('walk', true);
            } else {
                // Air movement
                // Set drag always when in air, decreased control while in air
                player.body.setDragX(airDrag);
                if(keyLeft.isDown) {
                    player.body.velocity.x -= playerAirAccel;
                } else if(keyRight.isDown) {
                    player.body.velocity.x += playerAirAccel;
                }
            }

            // Min jump speed
            if(isJumping == false && isGrounded && Phaser.Input.Keyboard.JustDown(keyJump)){
                player.body.velocity.y += playerInitSpeed;
                isJumping = true;
                gruntSound.play();
                player.play('jump');
            }
            // Hold jump speed
            if(isJumping == true && Phaser.Input.Keyboard.DownDuration(keyJump, holdJumpTime)) {
                player.body.velocity.y += playerJumpSpeed;
            }
            // Let go of up key to jump again
            if(Phaser.Input.Keyboard.JustUp(keyJump)){
                isJumping = false;
            }

            /*
            Time slow
            Hold down SHIFT to start and continue time slow based on physics time scale where higher scale results
            in slower time. Time scale steadily increases until reaching the maximum. On releasing shift or
            reaching the max duration, time scale steadily decreases until it reaches the given normal time scale.
            Cooldown starts when player releases SHIFT. Until the cooldown is over, the player is locked out from
            using time slow again. 
            */
            if(timeSlowLock == false && Phaser.Input.Keyboard.DownDuration(keySlowmo, slowmoTime)) {
                isDuringSlow = true;
                // Show time slow being used
                this.timeSlowText.setStyle({
                    color: timeSlowDuring
                });
                // Increase timescale until reach slowedTimeScale
                if(this.physics.world.timeScale < slowedTimeScale){
                    this.physics.world.timeScale += slowRate;
                    // Slow down global sound rate
                    if(game.sound.rate > slowedSoundRate) { game.sound.rate -= soundRateChange; } else {
                        game.sound.rate = slowedSoundRate;
                    }
                    if(timeSlowFilter.alpha < filterMax) { timeSlowFilter.alpha += filterChange; } else {
                        timeSlowFilter.alpha = filterMax;
                    }
                } else {
                    this.physics.world.timeScale = slowedTimeScale;
                }
            // Either the player releases timeslow key or the duration is up
            } else if(this.physics.world.timeScale != normTimeScale) {
                // Prevent player from using again until cooldown
                timeSlowLock = true;
                if(!cooldownCalled){
                    this.timeSlowText.setStyle({
                        color: timeSlowNotReady
                    });
                }
                // After slowmoTime is up, decrease timescale until reach normTimeScale
                if(this.physics.world.timeScale > normTimeScale){
                    this.physics.world.timeScale -= slowRate;
                    // Speed up global sound rate
                    if(game.sound.rate < normalSoundRate) { game.sound.rate += soundRateChange; } else{
                        game.sound.rate = normalSoundRate;
                    }
                    if(timeSlowFilter.alpha > 0) { timeSlowFilter.alpha -= filterChange; } else {
                        timeSlowFilter.alpha = 0;
                    }
                } else {
                    this.physics.world.timeScale = normTimeScale;
                    isDuringSlow = false;
                }
            }
            // Start cooldown when conditions are met
            // Conditions: cooldownCalled needed to prevent multiple cooldowns, timeSlowLock to tell if has been
            // used, and justUp to force the player to release SHIFT to start the cooldown.
            if(cooldownCalled == false && timeSlowLock == true && Phaser.Input.Keyboard.JustUp(keySlowmo)){
                cooldownCalled = true;
                this.timeSlowDelay = this.time.delayedCall(timeSlowCooldown, () => {
                    timeSlowLock = false;
                    cooldownCalled = false;
                    // Show time slow is ready
                    this.timeSlowText.setStyle({
                        color: timeSlowReady
                    });
                }, null, this);
            }

            // Update time slow text
            // Based on percentage of time slow with 0 being normal and 100 being max time slow
            this.percentSlow = Math.round(140*(this.physics.world.timeScale-normTimeScale));
            if (this.percentSlow % 10 == 0){
                this.timeSlowNum.setText(this.percentSlow);
            }
        } else {
            // Stop bgm if game over
            bgm.stop();
        }

        // Pause scene, hide play scene, go to menu scene
        if (Phaser.Input.Keyboard.JustDown(keyStart)) {
            isPaused = true;
            this.scene.pause('playScene');
            this.scene.setVisible(false, 'playScene');
            this.sound.play('buttonsound');
            this.scene.run('menuScene');
        }

        // Update particle emit zone for pointer
        pointer = this.input.activePointer;
        pointerCircle.setPosition(pointer.worldX, pointer.worldY);

        // Scroll background and ground and modify based on time slow
        // Slows by 0.5 at 100% time slow and 0 at 0%
        background.tilePositionX += backgroundScroll - (0.5)*backgroundScroll*(this.percentSlow/100);
        ground.tilePositionX += groundScroll - (0.5)*groundScroll*(this.percentSlow/100);
        cloud.tilePositionX += cloudScroll - (0.5)*cloudScroll*(this.percentSlow/100);
    }
}