class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }

    create() {
        keyStart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        keyVolumeUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyVolumeDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyMute = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);


        if(resetAudio == true){
            bgm.play();
            resetAudio = false;
        }

        let menuConfig = {
            fontFamily: 'Courier',
            fontSize: '100px',
            color: '#FF00FF',
            align: 'center',
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
            },
            fixedWidth: 0
        }
        // Add menu screen text
        this.add.text(centerX, 80, 'Psychic Trials', menuConfig).setOrigin(0.5);
        menuConfig.fontSize = '30px';
        this.add.text(centerX - 120, 160 + 4*textSpacer, 'High score: ' + highScore, menuConfig)
        
        this.add.text(50, 160, 'A', menuConfig)
        menuConfig.color = '#FFFFFF';
        this.add.text(90, 160, 'move left', menuConfig)
        menuConfig.color = '#FF00FF';
        this.add.text(435, 160, 'D', menuConfig)
        menuConfig.color = '#FFFFFF';
        this.add.text(475, 160, 'move right', menuConfig)
        menuConfig.color = '#FF00FF';
        this.add.text(850, 160, 'W', menuConfig)
        menuConfig.color = '#FFFFFF';
        this.add.text(890, 160, 'jump', menuConfig)
        menuConfig.color = '#FF00FF';
        this.add.text(50, 160 + textSpacer, 'Hold SHIFT', menuConfig);
        menuConfig.color = '#FFFFFF';
        this.add.text(250, 160 + textSpacer, 'time slow', menuConfig);
        menuConfig.color = '#FF00FF';
        this.add.text(550, 160 + textSpacer, 'Dodge', menuConfig);
        menuConfig.color = '#FFFFFF';
        this.add.text(650, 160 + textSpacer, 'the bouncing logs!', menuConfig);
        menuConfig.color = '#FF00FF';
        this.add.text(90, 160 + 2*textSpacer, 'Click, drag, release logs', menuConfig)
        menuConfig.color = '#FFFFFF';
        this.add.text(560, 160 + 2*textSpacer, 'to use Psychic Throw', menuConfig)
        this.add.text(20, 160 + 3*textSpacer, 'Press        here to start or return to menu elsewhere', menuConfig)
        menuConfig.color = '#FF00FF';
        this.add.text(135, 160 + 3*textSpacer, 'ENTER', menuConfig)
        menuConfig.color = '#FFFFFF';
        this.volumeText = this.add.text(gameWidth - 350, 160 + 4*textSpacer, '↑Game volume↓: ' + game.sound.volume, menuConfig)
        this.muteText = this.add.text(20, 160 + 4*textSpacer, '(M)uted: ' + game.sound.mute, menuConfig)
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keyStart)) {
            this.scene.setVisible(false, 'menuScene');
            this.scene.setVisible(true, 'playScene');
            this.sound.play('buttonsound');
            this.scene.run('playScene');
        }
        if (Phaser.Input.Keyboard.JustDown(keyVolumeDown)) {
            if(game.sound.volume - volumeChange >= 0){
                game.sound.volume -= volumeChange;
            } else {
                game.sound.volume = 0;
            }
        }
        if (Phaser.Input.Keyboard.JustDown(keyVolumeUp)) {
            if(game.sound.volume + volumeChange <= 1){
                game.sound.volume += volumeChange;
            } else {
                game.sound.volume = 1;
            }
        }
        if (Phaser.Input.Keyboard.JustDown(keyMute)) {
            if(game.sound.mute == false){
                game.sound.mute = true;
            } else {
                game.sound.mute = false;
            }
        }
        this.volumeText.setText('↑Game volume↓: ' + Math.round(game.sound.volume * 100));
        this.muteText.setText('(M)uted: ' + game.sound.mute);
    }
}