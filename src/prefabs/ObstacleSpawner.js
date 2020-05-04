class ObstacleSpawner extends Phaser.GameObjects.Group{
    constructor(scene, delayMin, delayMax, minX, maxX, minY, maxY, logBounce) {
        let groupConfig = {
            runChildUpdate: true,
            maxSize: 10000 // maxSize for testing purposes
        }
        super(scene, null, groupConfig);
        // Bounce on ground
        scene.physics.add.collider(this, platform);
        // Collide with the player
        scene.physics.add.overlap(player, this, this.playerHit, null, scene);
        // Spawn timer
        scene.timer = scene.time.addEvent({
            delay: Phaser.Math.Between(delayMin, delayMax), 
            callback: () => {
                if(!this.isFull()){
                    // Spawns number of logs equal to difficulty in a burst
                    // Each log has random x and y velocity and spawn position
                    // Log(scene, group, spawnX, spawnY, velocityX, velocityY, logBounce)
                    for(logCount = 0; logCount < thisDifficultyLevel; logCount++){
                        if(!this.isFull()){
                            // Spawns consecutive logs at least a little far apart 
                            let cascadeSpawn = gameWidth + 100 + logCount*Phaser.Math.Between(50, 300);
                            this.add(new Log(scene, this, cascadeSpawn, Phaser.Math.Between(100, centerY),
                        Phaser.Math.Between(minX, maxX), Phaser.Math.Between(minY, maxY), logBounce));
                        }
                    }
                }
            }, 
            callbackContext: scene,
            loop: true,
        });

        this.scene = scene;
    }

    update() {
        // Somehow needed to update children
        this.preUpdate();
        // this.scene.timer.getProgress()
    }

    playerHit() {
        if(!isHit){
            // Update variables
            isGameOver = true;
            isHit = true;
            sceneClock.paused = true;
            // Play death sound
            this.sound.play('death');
            // Camera effects
            this.cameras.main.flash(1000);
            this.cameras.main.shake(500, 0.01);
            player.setAlpha(0);
            // Delay change to game over scene
            this.time.delayedCall(3000, () => { this.scene.start('gameOverScene') })
        }
    }
}