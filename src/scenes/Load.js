class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        // Start load text
        this.loadingText = this.add.text(centerX, centerY, 'LOADING...', {
            fontFamily: 'Courier',
            fontSize: '50px',
            color: '#FF00FF',
            align: 'center',
        }).setOrigin(0.5, 0.5);
        // Load image assets
        this.load.atlas('player','./assets/final.png','./assets/final.json');
        this.load.image('cloud', './assets/bigCloud.png');
        this.load.image('ground', './assets/ground.png');
        this.load.image('invisibleGround', './assets/invisibleGround.png');
        this.load.image('background', './assets/background.png');
        this.load.image('log', './assets/log.png');
        this.load.image('psychicParticle', './assets/psychicParticle.png');
        this.load.image('psychicParticlePointer', './assets/psychicParticlePointer.png');
        this.load.image('timeSlowFilter', './assets/TimeSlowFilter.png');
        // Load audio assets
        this.load.audio('song', './assets/bgm.wav');
        this.load.audio('grunt', './assets/grunt.mp3');
        this.load.audio('death', './assets/death.mp3');
        this.load.audio('buttonsound', './assets/buttonsound.mp3');
        this.load.audio('grab', './assets/grab.mp3');
        this.load.audio('throw', './assets/throw.mp3');
    }

    create() {
        keyStart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Set some sounds to global variables with configs
        bgm = game.sound.add('song', { 
            mute: false,
            volume: globalVolume,
            rate: 1,
            loop: true 
        });

        grabSound = game.sound.add('grab', {
            mute: false,
            volume: globalVolume/2,
            rate: 1,
            loop: true 
        });

        throwSound = game.sound.add('throw', {
            mute: false,
            volume: globalVolume/2,
            rate: 1,
            loop: false 
        });

        gruntSound = game.sound.add('grunt', {
            mute: false,
            volume: globalVolume/2,
            rate: 1,
            loop: false 
        });

        // End load and prompt player to continue
        this.loadingText.destroy();
        this.add.text(centerX, centerY, 'Press ENTER to continue', {
            fontFamily: 'Courier',
            fontSize: '50px',
            color: '#FF00FF',
            align: 'center',
        }).setOrigin(0.5, 0.5);

    }
    update() {
        // Go to menu scene
        if (Phaser.Input.Keyboard.JustDown(keyStart)) {
            this.sound.play('buttonsound');
            this.scene.start('menuScene');
        }
    }
}