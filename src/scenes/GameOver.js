class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    create() {
        keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keySlowmo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        keyStart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        let gameOverConfig = {
            fontFamily: 'Courier',
            fontSize: '40px',
            color: '#FFFFFF',
            align: 'center',
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
            },
            fixedWidth: 0
        }

        // Add text
        this.add.text(centerX, centerY - 2*textSpacer, 'You ran    meters of the Psychic Trials!', gameOverConfig).setOrigin(0.5);
        gameOverConfig.color = '#FF00FF';
        this.add.text(250, centerY - 2*textSpacer, currTime, gameOverConfig).setOrigin(0.5);
        if(currTime > highScore){
            highScore = currTime;
            this.add.text(centerX, centerY, 'NEW HIGH SCORE: ' + highScore, gameOverConfig).setOrigin(0.5);
        } else {
            this.add.text(centerX, centerY, 'High score: ' + highScore, gameOverConfig).setOrigin(0.5);
        }
        gameOverConfig.color = '#FFFFFF';
        this.add.text(centerX, centerY + 2*textSpacer, 'Press ENTER to return to menu', gameOverConfig).setOrigin(0.5);

        // Update globals
        isGameOver = false;
        timeSlowLock = false;
        cooldownCalled = false;
        isJumping = false;
        normalSoundRate = 1;
        bgm.rate = normalSoundRate;
    }

    update() {
        // Input to return to menu
        if (Phaser.Input.Keyboard.JustDown(keyStart)) {
            resetAudio = true;
            this.sound.play('buttonsound');
            this.scene.start('menuScene');
        }
    }
}