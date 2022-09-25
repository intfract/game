Engine = Matter.Engine
Render = Matter.Render
Runner = Matter.Runner
MouseConstraint = Matter.MouseConstraint
Mouse = Matter.Mouse
Composite = Matter.Composite
Bodies = Matter.Bodies
Body = Matter.Body
Events = Matter.Events
Constraint = Matter.Constraint

const color = {
  blue: '#357BF2',
  green: '#45b65c',
  cave: '#204473',
  red: '#ff8080',
}

function yeet(x, y) {
  Body.setPosition(player.body, vector(x, y))
}

function round(n, to) {
  if (!to) to = 1
  return Math.round(n / to) * to
}

function vector(x, y) {
  if (!x) x = 0
  if (!y) y = 0
  return {
    x: x,
    y: y,
  }
}

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function deg(rad) {
  return rad * Math.PI / 180
}

function box(x, y, w, h, offset, static, render, friction, radius) {
  let label = 'box'
  if (!static) static = false
  if (!render) render = {
    visible: true,
    fillStyle: '#FFFFFF',
  }
  if (!offset) {
    offset = [0, 0]
  }
  if (!radius) {
    radius = 0
  }
  if (static) label = 'ground'
  return Bodies.rectangle(x + (offset[0] * w / 2), y + (offset[1] * h / 2), w, h, {
    isStatic: static,
    friction: friction,
    render: render,
    chamfer: {
      radius: radius,
    },
    label: label,
    o: vector(x, y)
  })
}

function triangle(x, y, w, h, offset, static, render) {
  if (!static) static = false
  if (!render) render = {
    visible: true,
    fillStyle: '#FFFFFF',
  }
  if (!offset) {
    offset = [0, 0]
  }
  return shape(x + w / 6 + (offset[0] * w / 2), y + h / 6 + (offset[1] * h / 2), [vector(0, 0), vector(w, 0), vector(w, -h)], static, render)
}

function shape(x, y, vertices, static, render) {
  if (!static) static = false
  if (!render) render = {
    visible: true,
    fillStyle: '#FFFFFF',
  }
  return Bodies.fromVertices(x, y, vertices, {
    isStatic: static,
    render: render,
  })
}

function balance(x, y, w, h, render) {
  const platform = Bodies.rectangle(x, y, w, h, {
    render: render
  })
  const constraint = Constraint.create({
    pointA: vector(platform.position.x, platform.position.y),
    bodyB: platform,
    length: 0
  })
  return [
    platform,
    constraint,
  ]
}

// create engine
var engine = Engine.create(),
  world = engine.world;

// create renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    showVelocity: false,
    wireframes: false,
    showAngleIndicator: false,
    background: '#99ccff'
  }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

const map = [
  box(-960, 30, 960, 600 + 600, [0, -1], true, {
    fillStyle: color.cave
  }), // left wall 

  box(-960 - 960 / 2, 30, 960 * 4, 300, [1, 1], true, {
    fillStyle: color.cave
  }), // floor 

  triangle(480, 30, 240, 240, [-1, -1], true, {
    fillStyle: color.cave
  }), // slope 

  box(960, 30, 960, 240, [0, -1], true, {
    fillStyle: color.cave
  }), // side platform  

  box(0, -210 - 360, 960, 600, [0, -1], true, {
    fillStyle: color.cave
  }), // roof 

  box(480 + 120, -420, 960 - 240, 60, [1, 0], true, {
    fillStyle: color.cave
  }), // lower ledge 

  box(480 + 0, -600, 960 - 120, 60, [1, 0], true, {
    fillStyle: color.cave
  }), // ledge 

  box(960 * 2, 30, 960, 600 + 540, [0, -1], true, {
    fillStyle: color.cave
  }), // right wall 

  box(-1440, -1170, 960 * 4, 60 + 480, [1, -1], true, {
    fillStyle: color.cave
  }), // tunnel roof 

  ...balance(840, -840, 240, 60, {
    fillStyle: color.cave
  }),

  ...balance(1140, -960, 240, 60, {
    fillStyle: color.cave
  }),

  box(1920 + 480, -1170, 960, 60, [1, -1], true, {
    fillStyle: color.cave
  }),

  box(1920 + 480 + 90, -1110, 960 - 90, 600 + 540, [1, 1], true, {
    fillStyle: color.cave
  }),

  ...balance(30 * 100, -30 * 48, 240, 60, {
    fillStyle: color.cave
  }),
]

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const level = Composite.create()
Composite.add(level, map)

// add bodies
Composite.add(world, level)

const boxes = [
  // push box 
  box(480 + 240, -480, 60, 60, [1, -1], false, false, 0.05, 10),
  box(30 * 49, -1170, 60, 60, [1, 1], false, false, 0.05, 10),
  // box(30 * 100, -30 * 50, 60, 60, [0, 0], false, false, 0.05, 10),
]
Composite.add(world, boxes)

// add mouse control
var mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    collisionFilter: {
      group: -1,
    },
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });

Composite.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs

  for (let i = 0; i < pairs.length; i++) {
    let pair = pairs[i]
    if (pair.bodyA === player.body) {
      if (pair.bodyB.bozo || (pair.bodyB.hammer && pair.bodyB.velocity.y > 15)) {
        mortify()
      }
    }

    if (pair.bodyB === player.body) {
      if (pair.bodyA.bozo || (pair.bodyA.hammer && pair.bodyA.velocity.y > 15)) {
        mortify()
      }
    }

    if (pair.bodyA === boss.body) {
      if (pair.bodyB.bozo || (pair.bodyB.hammer && pair.bodyB.velocity.y > 15)) {
        if (pair.bodyB.hostile) {
          boss.body.health--
          console.log(boss.body.health)
          Composite.remove(world, pair.bodyB)
        } else {
          pair.bodyB.hostile = true
        }
      }
    }

    if (pair.bodyB === boss.body) {
      if (pair.bodyA.bozo || (pair.bodyA.hammer && pair.bodyA.velocity.y > 15)) {
        if (pair.bodyA.hostile) {
          boss.body.health--
          console.log(boss.body.health)
          Composite.remove(world, pair.bodyA)
        } else {
          pair.bodyA.hostile = true
        }
      }
    }
  }
})

Events.on(engine, 'collisionActive', function(event) {
  var pairs = event.pairs

  // change object colours to show those in an active collision (e.g. resting contact)
  for (let i = 0; i < pairs.length; i++) {
    let pair = pairs[i]
    if (pair.bodyA === player.sensor || pair.bodyB === player.sensor) {
      if (round(player.body.velocity.y) === 0) {
        player.ground = true
      }
    }
  }
});

Events.on(engine, 'collisionEnd', function(event) {
  var pairs = event.pairs

  for (var i = 0; i < pairs.length; i++) {
    let pair = pairs[i]
    if (pair.bodyA === player.sensor || pair.bodyB === player.sensor) {
      player.ground = false
    }
  }
});

class Player {
  constructor() {
    this.body = Bodies.circle(0, 0, 30, {
      restitution: 0,
      label: 'player',
      render: {
        fillStyle: color.blue
      }
    })
    this.sensor = Bodies.rectangle(0, 0, 30, 2, {
      render: {
        visible: false,
      }
    })
    this.ground = false
    this.axis = {
      x: 0,
      y: 0,
    }
    this.body.cps = []
  }

  get x() {
    return this.body.position.x
  }

  get y() {
    return this.body.position.y
  }

  get position() {
    return this.body.position
  }
}

class Bozo {
  constructor(x, y, xv, yv, dynamic) {
    if (!xv) xv = 0
    if (!yv) yv = 0
    this.body = Bodies.circle(x, y, 30, {
      restitution: 1,
      label: 'bozo',
      render: {
        fillStyle: color.red
      }
    })
    this.body.bozo = true
    this.body.o = {
      x: x,
      y: y,
    }
    this.sensor = Bodies.rectangle(0, 0, 30, 2, {
      render: {
        visible: false,
      }
    })
    this.ground = false
    this.axis = {
      x: 0,
      y: 0,
    }
    this.body.collisionFilter.group = -2
    this.sensor.collisionFilter.group = -2
    this.body.xv = xv
    this.body.yv = yv
    this.body.dynamic = dynamic
    Body.setVelocity(this.body, vector(xv, yv))
    this.parts = [this.body]
  }

  get x() {
    return this.body.position.x
  }

  get y() {
    return this.body.position.y
  }

  get position() {
    return this.body.position
  }
}

class Boss {
  constructor(x, y) {
    this.body = Bodies.rectangle(x, y, 240, 240, {
      render: {
        fillStyle: color.red,
      },
      chamfer: {
        radius: 40,
      }
    })
    this.body.o = vector(x, y)
    this.body.label = 'boss'
    this.body.health = 10
    this.cool = 0
  }
}

function hammer(x, y, xv, yv) {
  const body = Bodies.rectangle(x, y, 120, 480, {
    render: {
      fillStyle: color.cave,
    },
  })
  body.hammer = true
  Body.setVelocity(body, vector(xv, yv))
  return body
}

const player = new Player()
player.body.collisionFilter.group = -1
player.sensor.collisionFilter.group = -1

const bozos = [
  ...(new Bozo(0, -120)).parts,
  ...(new Bozo(-120, -120)).parts,
  ...(new Bozo(-240, -120)).parts,
  ...(new Bozo(480, -480, -30, 0)).parts,
  ...(new Bozo(480, -480, 0, 30)).parts,
]

const boss = new Boss(0, -30 * 69)

Composite.add(world, [player.body, player.sensor])
Composite.add(world, bozos)
Composite.add(world, boss.body)

var keys = {}

window.addEventListener('keydown', ({ keyCode }) => {
  keys[keyCode] = true
})

window.addEventListener('keyup', ({ keyCode }) => {
  keys[keyCode] = false
})

function handle(codes) {
  for (const code of codes) {
    if (!keys[code]) keys[code] = false
  }
}

function move() {
  player.axis.x = keys[68] - keys[65]
  player.axis.y = keys[87] * 1
  if (Math.abs(player.axis.x)) {

    if (player.body.velocity.x < 8 && player.axis.x > 0) {
      Body.setVelocity(player.body, vector(player.body.velocity.x + player.axis.x * 2, player.body.velocity.y))
    } else if (player.body.velocity.x > -8 && player.axis.x < 0) {
      Body.setVelocity(player.body, vector(player.body.velocity.x + player.axis.x * 2, player.body.velocity.y))
    }

    if (player.body.velocity.y > 30) {
      Body.setVelocity(player.body, vector(player.body.velocity.x, 30))
    }

    if (player.body.velocity.y < -30) {
      Body.setVelocity(player.body, vector(player.body.velocity.x, -30))
    }

    if (player.body.velocity.x > 30) {
      Body.setVelocity(player.body, vector(30, player.body.velocity.y))
    }

    if (player.body.velocity.x < -30) {
      Body.setVelocity(player.body, vector(-30, player.body.velocity.y))
    }
  }

  if (player.ground) {
    Body.applyForce(player.body, player.position, {
      x: 0,
      y: -(player.axis.y * 0.06),
    })
  }
}

function mortify() {
  const bodies = Composite.allBodies(world)
  for (let i = 0; i < bodies.length; i++) {
    let body = bodies[i]
    if (body.label === 'bozo') {
      Body.setVelocity(body, vector(body.xv, body.yv))
      Body.setPosition(body, body.o)
      Composite.remove(world, body)
    } else if (body.label === 'box') {
      Body.setVelocity(body, vector())
      Body.setPosition(body, body.o)
      Body.setAngle(body, 0)
      Composite.remove(world, body)
    } else if (body.hammer) {
      Composite.remove(world, body)
    }
  }
  count = 0
  hammers = 0
  throws = 0
  boss.body.health = 10
  player.body.cps = []
  Body.setVelocity(player.body, vector())
  Body.setPosition(player.body, vector())
  yeet(960, -1800)
  Composite.add(world, bozos)
  Composite.add(world, boxes)
}

function text(message, color, x, y, size, baseline) {
  if (!baseline) {
    baseline = 'middle'
  }
  ctx.font = `${size * canvas.width / ratio}px Lexend Deca`
  ctx.fillStyle = color
  ctx.textBaseline = baseline
  ctx.textAlign = 'center'
  const fx = Math.round((x - player.body.position.x) * canvas.width / (ratio * 2) + canvas.width / 2)
  const fy = Math.round((y - player.body.position.y) * canvas.width / (ratio * 2) + canvas.height / 2)
  ctx.fillText(message, fx, fy)
}

function hover() {
  if (boss.cool > 0) {
    boss.cool--
  }
  Body.setVelocity(boss.body, vector())
  let wave = Math.sin(deg(count)) * 60
  Body.setPosition(boss.body, vector(boss.body.o.x, boss.body.o.y + wave))
  // Body.setAngle(boss.body, count)
  Body.setAngularVelocity(boss.body, deg(5))

  const d = distance(player.body.position, boss.body.position)

  if (d < 960) {
    // Composite.add(world, [
    //   ...(new Bozo(boss.body.position.x, boss.body.position.y, 30, 0)).parts
    // ])
    if (hammers > 8) {
      hammers = 0
      const bodies = Composite.allBodies(world)
      for (let i = 0; i < bodies.length; i++) {
        let body = bodies[i]
        if (body.hammer) {
          Composite.remove(world, body)
        }
      }
    }
    if (Math.abs(player.x - boss.body.position.x) > 480 && boss.cool < 1) {
      Composite.add(world, [
        hammer(player.x, player.y - 720, 0, 30)
      ])
      hammers++
    }
    if (throws > 8) {
      throws = 0
      const bodies = Composite.allBodies(world)
      for (let i = 0; i < bodies.length; i++) {
        let body = bodies[i]
        if (body.bozo && body.dynamic) {
          if (body.used) {
            Composite.remove(world, body)
          } else {
            body.used = true
            Body.setVelocity(body, vector((boss.body.position.x - body.position.x) / Math.abs(body.position.x - boss.body.position.x) * 15, (boss.body.position.y - body.position.y) / Math.abs(body.position.x - boss.body.position.x) * 30))
          }
        }
      }
    }
    if (d < 720 && boss.cool % 60 === 0) {
      Composite.add(world, [
        ...(new Bozo(boss.body.position.x, boss.body.position.y, ((player.x - boss.body.position.x) / d) * 15, ((player.y - boss.body.position.y) / d) * 15, true)).parts
      ])
      throws++
    }
    if (boss.cool < 1) boss.cool = 120
  }
}

const ratio = 1200

var count = 0
var hammers = 0
var throws = 0

function tick() {
  handle([65, 68, 87])
  Body.setAngle(player.sensor, 0)
  Body.setVelocity(player.sensor, vector())
  Body.setPosition(player.sensor, vector(player.body.position.x, player.body.position.y + player.body.circleRadius))

  hover()

  move()

  // console.log(vector(player.x, player.y))

  if (player.y > 90) {
    mortify()
  }

  if (player.x > 960 && !player.body.cps[0]) {
    player.body.cps.push(vector(960, -300))
    Composite.add(world, [
      ...(new Bozo(960 + 480, -300, -30, 0)).parts,
    ])
  }

  if (player.x > 1050 && !player.body.cps[1]) {
    player.body.cps.push(vector(1050, -300))
    Composite.add(world, [
      ...(new Bozo(960 + 480, -300, -30, 0)).parts,
    ])
  }

  if (player.x > 1260 && !player.body.cps[2]) {
    player.body.cps.push(vector(1260, -300))
    Composite.add(world, [
      ...(new Bozo(960 + 480, -300, -30, 0)).parts,
    ])
  }

  if (player.x > 1920 + 480 && !player.body.cps[3]) {
    player.body.cps.push(vector(1920 + 480, -1080))
    Composite.add(world, [
      ...(new Bozo(30 * 110, -1140, -60, 0)).parts,
    ])
  }

  if (player.x > 1920 + 480 + 120 && !player.body.cps[4]) {
    player.body.cps.push(vector(1920 + 480 + 120, -1080))
    Composite.add(world, [
      ...(new Bozo(30 * 110, -1140, -60, 0)).parts,
    ])
  }

  if (player.x > 1920 + 480 + 240 && !player.body.cps[5]) {
    player.body.cps.push(vector(1920 + 480 + 240, -1080))
    Composite.add(world, [
      ...(new Bozo(30 * 110, -1140, -60, 0)).parts,
    ])
  }

  Render.lookAt(render, player.body, vector(ratio - player.body.circleRadius));
  text('Use WASD to navigate!', color.cave, 0, -270, 30)
  text('Click and hold to use the FORCE!', color.cave, 0, -210, 21)
  text('Drag the box!', color.cave, 960, -480 - 15, 30)
  // text('The FORCE controls enemies!', color.cave, 960, -900, 30)
  count++
  window.requestAnimationFrame(tick)
}

tick()