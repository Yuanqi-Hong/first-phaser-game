let gamescene = {
  preload: preload,
  create: create,
  update: update
}

function collectStar (player, star) {
  // console.log('You are on a star')
  // make the star disappear
  star.disableBody(true, true)

  score += 100
  scoreText.setText('Score: ' + score)
}

function preload () {
  // load your assets
  this.load.image('background', 'assets/background.png')
  // this.load.image('sky', 'assets/sky.png')
  // this.load.image('platform', 'assets/platform.png')
  this.load.image('platform', 'assets/platform1.png')
  this.load.image('star', 'assets/star.png')
  this.load.image('bomb', 'assets/bomb.png')
  this.load.image('blue', 'assets/particle.png')

  // our character is in a spritesheet, it's not a normal image
  this.load.spritesheet(
    'character',
    'assets/character.png',
    { frameWidth: 32, frameHeight: 48 }
  )
}

function create () {
  jumps = 0
  score = 0
  // x, y, name of image
  // x, y tells phaser where to put the CENTER of the image
  // this.add.image(400, 300, 'sky')
  this.add.image(400, 300, 'background').setScale(0.4)
  // the order of you adding things MATTERS
  // the thing that comes later goes on top
  // this.add.image(400, 300, 'star')

  particles = this.add.particles('blue')
  emitter = particles.createEmitter({
    speed: 100,
    scale: { start: 0.2, end: 0 },
    blendMode: 'ADD'
  })

  // staticGroup: things that don't change and can interact with other things
  // when you have debug set to true down in your physics config, you have blue boxes around your staticGroups
  platforms = this.physics.add.staticGroup()
  platforms.create(400, 568, 'platform').setScale(2).refreshBody()
  platforms.create(600, 400, 'platform')
  platforms.create(50, 250, 'platform')
  platforms.create(750, 220, 'platform')

  // sprite is like the same thing as an image (but they can move and follows the physics rules?)
  player = this.physics.add.sprite(200, 200, 'character')
  player.setCollideWorldBounds(true)
  player.setBounce(0.1)

  emitter.startFollow(player)

  // create the stars
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  })

  // the stars have different bounciness, ranging from 0.4 to 0.7
  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.7))
  })

  // we say: player and platforms can collide, etc.
  this.physics.add.collider(player, platforms)
  this.physics.add.collider(stars, platforms)

  // we say: let's test for overlaps between the player and the stars (not collision)
  // when overlapping happens, we call collectStar function
  this.physics.add.overlap(player, stars, collectStar, null, this)

  cursors = this.input.keyboard.createCursorKeys()

  // let's make an animation called 'face'
  this.anims.create({
    key: 'face',
    frames: [{ key: 'character', frame: 4 }],
    frameRate: 20
  })

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

  // start off using the 'face' animation
  player.anims.play('face')

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: 'white' })
}

function update () {
  if (cursors.left.isDown) {
    // console.log('left')
    player.anims.play('left', true)
    player.setVelocityX(-160)
  } else if (cursors.right.isDown) {
    // console.log('left')
    player.anims.play('right', true)
    player.setVelocityX(160)
  } else {
    player.anims.play('face')
    player.setVelocityX(0)
  }

  // jumping
  let onGround = player.body.touching.down

  // single jumps
  // if (cursors.up.isDown && onGround) {
  //   player.setVelocityY(-330)
  // }

  // double jumps
  if (onGround) {
    jumps = 0
  }
  if (cursors.up.isDown) {
    if (!jumpPressed) {
      jumpPressed = true
      if (jumps < 2) {
        jumps++
        player.setVelocityY(-450);
      }
    }    
  } else {
    jumpPressed = false
  }
  // console.log(jumpPressed)
}

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 1000 }, // pixels per second is the unit used here and x and y determine the axis of gravity
        debug: false // if you don't want to see the boxes around your objects you set debug to false
      }
    },
    scene: [gamescene]
}

const game = new Phaser.Game(config)