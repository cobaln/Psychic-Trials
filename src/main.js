/*
Psychic Trials by Evan Li, Hoang Huynh, Henry Nguyen. Date completed: 5/3/20.

Technical creative tilt: Many small and medium sized projects were done in order to learn how some common video game
mechanics can be implemented. These include a pause menu, ability cooldown idicator, and (somewhat) wave based spawns.
The psychic throw stands out as the most difficult as it involved many interconnect components. Manipulating geom objects
used as particle emit zones, calculating and depicting velocity vectors with definied minimum and maximum states, and 
while maintaining class structure to support more complex behaviors such as the wave spawning were projects brought to life
through combing through Phaser documents.

Aesthetic creative tilt:
All art assets were created by Hoang and Henry. We chose to use vector art with contrasting solid colors in order to give
the game a clean look and a modern feel that is more popular in current media. The color palette is made up of mostly cool
colors, reinforcing this relaxing feel. To compliment this atmosphere, the background music was written by Hoang in an
F major key at 80 beats per minute, adding a positive feel to the game as well as amplifying the relaxing mood. Lastly, the
character animation is clean and fluid. These aesthetic choices compliment the sharp and naturalistic controls while also
encouraging the player to remain calm during stressful gameplay.
*/

var gravityY = 600;

// Define and configure main Phaser game object
let config = {
    parent: 'myGame',
    type: Phaser.AUTO,
    width: 1024,
    height: 576,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            gravity: {
                y: gravityY
            }
        }
    },
    scene: [ Load, Menu, Play, GameOver ]
}

// Define game
let game = new Phaser.Game(config);

// Audio Settings
var globalVolume = 1;
var normalSoundRate = 1;
var slowedSoundRate = normalSoundRate - 0.5*normalSoundRate;
var soundRateDifficultBump = 0.25;
var soundRateChange = 0.0026;
var volumeChange = 0.1;

// Audio
var bgm;
var grabSound;
var throwSound;
var gruntSound;

// Game measurements & text placement
var gameWidth = game.config.width;
var gameHeight = game.config.height;
var centerX = game.config.width/2;
var centerY = game.config.height/2;
var textSpacer = 80;
var playHUDHeight = 100;
var playHUDY = gameHeight - playHUDHeight/2;
var difficultY = 35;

// Text settings
var timeSlowReady = '#008000'; // Green
var timeSlowDuring = '#DA70D6'; // Orchid
var timeSlowNotReady = '#B22222'; // Crimson
var psychicThrowInit = '#DA70D6'; // Orchid
var psychicThrowDuring = '#FF00FF'; // Magenta

// Game globals
var isGameOver = false;
var resetAudio = true;
var isPaused = false;
var sceneClock;
var highScore = 0;
var currTime = 0;               // Track this round's time
var backgroundScroll = 2;
var groundScroll = 5;
var cloudScroll = 1;
var logCount;

// Difficulty settings
var nextDifficultyLevel = 30000; // Time until next increase in difficulty
var difficultyLevelMax = 2;     // Number of spawners spawned on max difficulty + 2
var thisDifficultyLevel = 1;
var spawnTimeMax = 4000;
var spawnTime = spawnTimeMax;
var spawnTimeMin = 2500;
var spawnTimeChange = 500;

// Obstacle settings
var logAngularVelocity = 540;
var logDespawnTime = 10000;
var logPreventInfiniteTime = 20000;

// Game objects
var background;
var ground;
var cloud;
var platform;
var player = null;
var pointer;
var pointerCircle;
var particleLine;
var particlePointer;
var particleVector;
var logParticles;
var playHUDBox;
var timeSlowFilter;

// Player statuses
var isJumping = false;
var isGrounded = false;
var timeSlowLock = false;
var cooldownCalled = false;
var isDuringSlow = false;
var timeSlowCooldown = 3000;
var isHit = false;

// Player run movemment
var maxVelocityX = 400;
var maxVelocityY = 1000;
var playerRunAccel = 40;
var groundDrag = 600;

// Player jump movemment
var holdJumpTime = 180;
var playerJumpSpeed = -50;
var playerInitSpeed = -500;
var playerGravity = 1000;

var playerAirAccel = 30;
var airDrag = 100;

// Player time slow
var normTimeScale = 0.75;
var slowedTimeScale = 1.5;
var slowmoTime = 5000;
var slowRate = 0.005; // change in physics times scale every frame
var filterMax = 0.4;
var filterChange = 0.005;

// Player pyschic throw
var preThrowDrag = 100;
var preThrowMinSpeed = 100;
var minThrowSpeed = 200;
var maxThrowSpeed = 600;
var psychicThrowTime = 500;

// Game controls
var keyLeft, keyRight, keyJump, keySlowmo, keyStart, keyMute, keyVolumeUp, keyVolumeDown;
var cursors;