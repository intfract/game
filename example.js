Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies;
Body = Matter.Body;
Events = Matter.Events;

const color = {
  blue: '#357BF2',
  green: '#45b65c',
  cave: '#204473',
  red: '#ff8080',
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

  box(960 * 2, 30, 960, 600 + 600, [0, -1], true, {
    fillStyle: color.cave
  }), // right wall 
]

// Text Tutorial 

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const level = Composite.create()
Composite.add(level, map)

// add bodies
Composite.add(world, level)

const boxes = [
  // push box 
  box(-60, -120, 60, 60, false, false, false, 0.05, 10),
  box(480 + 240, -480, 60, 60, [1, -1], false, false, 0.05, 10),
  box(480 + 240, -540, 60, 60, [1, -1], false, false, 0.05, 10),
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
  var pairs = event.pairs;

  // change object colours to show those in an active collision (e.g. resting contact)
  for (let i = 0; i < pairs.length; i++) {
    let pair = pairs[i];
    if (pair.bodyA === player.body) {
      if (pair.bodyB.bozo) {
        mortify()
      }
    }

    if (pair.bodyB === player.body) {
      if (pair.bodyA.bozo) {
        mortify()
      }
    }
  }
})

Events.on(engine, 'collisionActive', function(event) {
  var pairs = event.pairs;

  // change object colours to show those in an active collision (e.g. resting contact)
  for (let i = 0; i < pairs.length; i++) {
    let pair = pairs[i];
    if (pair.bodyA === player.sensor || pair.bodyB === player.sensor) {
      if (round(player.body.velocity.y) === 0) {
        player.ground = true
      }
    }
  }
});

Events.on(engine, 'collisionEnd', function(event) {
  var pairs = event.pairs;

  // change object colours to show those ending a collision
  for (var i = 0; i < pairs.length; i++) {
    let pair = pairs[i];
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

Composite.add(world, [player.body, player.sensor])
Composite.add(world, bozos)

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
    }
  }
  player.body.cps = []
  Body.setVelocity(player.body, vector())
  Body.setPosition(player.body, vector())
  Composite.add(world, bozos)
  Composite.add(world, boxes)
  console.log(Composite.allBodies(world))
}

function text(message, color, x, y, size, baseline) {
  if (!baseline) {
    baseline = 'middle'
  }
  ctx.font = `${30 * canvas.width / ratio}px Lexend Deca`
  ctx.fillStyle = color
  ctx.textBaseline = baseline
  ctx.textAlign = 'center'
  const fx = Math.round((x - player.body.position.x) * canvas.width / (ratio * 2) + canvas.width / 2)
  const fy = Math.round((y - player.body.position.y) * canvas.width / (ratio * 2) + canvas.height / 2)
  ctx.fillText(message, fx, fy)
}

const ratio = 1200

var count = 0

function tick() {
  handle([65, 68, 87])
  Body.setAngle(player.sensor, 0)
  Body.setVelocity(player.sensor, vector())
  Body.setPosition(player.sensor, vector(player.body.position.x, player.body.position.y + player.body.circleRadius))
  move()
  if (player.y > 90) {
    mortify()
  }

  if (player.x > 960 && !player.body.cps[0]) {
    player.body.cps.push(vector(960, -300))
    Composite.add(world, [
      ...(new Bozo(960 + 480, -300, -30, 0, true)).parts,
    ])
  }

  if (player.x > 1050 && !player.body.cps[1]) {
    player.body.cps.push(vector(1050, -300))
    Composite.add(world, [
      ...(new Bozo(960 + 480, -300, -30, 0, true)).parts,
    ])
  }

  Render.lookAt(render, player.body, vector(ratio - player.body.circleRadius));
  text('Use WASD to navigate!', color.cave, 0, -240, 30)
  text('Move boxes with your mouse!', color.cave, 960, -960, 30)
  window.requestAnimationFrame(tick)
}

tick()