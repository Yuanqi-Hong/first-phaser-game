# Create a scene

Basic setup is

    var gamescene = {
      preload: preload,
      create: create,
      update: update
    }

    function preload () {

    }

    function create () {

    }

    function update () {

    }

    const config = {
        type: Phaser.AUTO,
        width: width,
        height: height,
        scene: [gamescene]
    }

    const game = new Phaser.Game(config)

Phaser.AUTO: renderer (Phaser.CANVAS Phaser.WEBGL or Phaser.AUTO)

scene is a screen - could be a loading screen, or the game itself, or whatever.

Phaser game has THREE PARTS
  preload - load our assets
  create
  update

# Add an image

games use images, and we need to load them before we do anything else, so that's going to go into 'preload'

this.load.image('sky', 'assets/sky.png')
  'sky' is an asset key, you can make it anything (i assume it has to be unique)
  assets are in http://localhost:8000/assets
  the image is at http://localhost:8000/assets/sky.png

this.add.image(400, 300, 'sky')
  positioned according to the center

this.add.image(0, 0, 'sky').setOrigin(0, 0)
  say place it as 0,0 but position it according to the top left (0,0)

# Load other assets

Load the other assets

bomb
platform
star

Maybe throw a star on in there, a platform in there

    this.add.image(400, 300, 'star')

...but character.png is weird. We'll get to it.

# But first.

Add some physics.

    physics: {
      default: 'arcade',
      arcade: {
        debug: true
      }
    },

Because platforms and character are going to be interacting with each other, not just random images spread about.

# Platforms

need to add something that interacts, so you add a bunch of objects that you can interact with. a group! inside physics!

    platforms = this.physics.add.staticGroup()
    platforms.create(400, 568, 'platform').setScale(2).refreshBody()
    platforms.create(600, 400, 'platform')
    platforms.create(50, 250, 'platform')
    platforms.create(750, 220, 'platform')    

static body vs. dynamic body - platforms don't run around.

# Dynamic body

    player = this.physics.add.sprite(400, 350, 'star')

But it needs to interact with something, right?

    gravity: { y: 300 },

and maybe not fall off the screen?

    player.setBounce(0.2)
    player.setCollideWorldBounds(true)

And not fall through the platforms?

    this.physics.add.collider(player, platforms)

And let's make it a character sprite instead

    player = this.physics.add.sprite(400, 350, 'character')

But that looks weird.

# Spritesheets

It's a SPRITESHEET. Spritesheets are multiple sprites in one image. You combine them to make animations.

    this.load.spritesheet('character', 
        'assets/character.png',
        { frameWidth: 32, frameHeight: 48 }
    )

and then in create

    this.anims.create({
      key: 'face',
      frames: [ { key: 'character', frame: 4 } ],
      frameRate: 20
    })

No idea what frameRate does. And after you show it:

    player.anims.play('face')

Here have some more for 'create':

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('character', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    })

Try using .play with those, too!

    player.body.setGravityY(-300)

# Add some movement

  in create:

    cursors = this.input.keyboard.createCursorKeys()

  in update:

    if (cursors.left.isDown) {
      // go left
      player.anims.play('left', true)
    } else if (cursors.right.isDown) {
      // go right
      player.anims.play('right', true)
    } else {
      // stop!
      player.anims.play('turn')
    }

    if (cursors.up.isDown && player.body.touching.down) {
      // Go up!
    }

# Add some stars

in create

    stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    })

    stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })

but make sure they land

    this.physics.add.collider(stars, platforms)

# Interaction

Let's test for interaction

    this.physics.add.overlap(player, stars, collectStar, null, this)

which means 'let's run collectStar when they overlap'

    function collectStar (player, star) {
      star.disableBody(true, true)
    }

Deletes the star when it's touched

# Scoring

up above everything

    var score = 0
    var scoreText

create

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' })

collectStar

    score += 10
    scoreText.setText('Score: ' + score)

# Bombs

Add a group

    bombs = this.physics.add.group()
    this.physics.add.collider(bombs, platforms)
    this.physics.add.collider(player, bombs, hitBomb, null, this)

Add what happens when you hit a bomb

    function hitBomb (player, bomb)
    {
      this.physics.pause()
      player.setTint(0xff0000)
      player.anims.play('turn')
      gameOver = true
    }

And update collectStar

    if (stars.countActive(true) === 0) {
      stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true)
      })

      var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
      var bomb = bombs.create(x, 16, 'bomb')
      bomb.setBounce(1)
      bomb.setCollideWorldBounds(true)
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
      bomb.allowGravity = false
    }

# Particles

    var particles = this.add.particles('red')

    var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    })

    emitter.startFollow(player)

# What if we turn off gravity?

How do we navigate?

# What now?

Docs:
https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
https://phaser.io/news/2018/03/gamefromscratch-phaser-3-video
https://phaser.io/tutorials/making-your-first-phaser-3-game
http://www.html5gamedevs.com/topic/35471-generic-platformer-es6-webpack-4-boilerplate/ (or use Parcel!)

Style:
https://github.com/nostalgic-css/NES.css (but test on mobile!)

Sprites and assets:
https://www.kenney.nl/assets
https://itch.io/game-assets/free
https://opengameart.org/
http://spritedatabase.net/
https://www.spriters-resource.com/