function $(query) {
  return document.querySelector(query)
}

function round(n, to) {
  return Math.round(n/to)*to
}

const canvas = $('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// module aliases
var Engine = Matter.Engine, Render = Matter.Render, Runner = Matter.Runner, Bodies = Matter.Bodies, Composite = Matter.Composite, Body = Matter.Body

// create an engine
var engine = Engine.create()

// var render = Render.create({
//   element: document.body,
//   engine: engine
// })

class Player {
  constructor() {
    this.body = Bodies.circle(128, 0, 32)
    this.axis = {
      x: 0,
      y: 0,
    }
  }
}

// create two boxes and a ground
var boxA = Bodies.rectangle(128, 128, 64, 64)
var boxB = Bodies.rectangle(128, 256, 32, 32)
var ground = Bodies.rectangle(0, 512, 1024, 64, { isStatic: true })

const player = new Player()

// add all of the bodies to the world
Composite.add(engine.world, [player.body, boxA, boxB, ground])

// Render.run(render)

// create runner
var runner = Runner.create()

// run the engine
Runner.run(runner, engine)

const keys = {}

window.addEventListener('keydown', ({ keyCode }) => {
  keys[keyCode] = true
})

window.addEventListener('keyup', ({ keyCode }) => {
  keys[keyCode] = false
})

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

function handle(codes) {
  for (const code of codes) {
    if (!keys[code]) keys[code] = false
  }
}

function distance(x1, y1, x2, y2) {
  var x = Math.abs(x1-x2)
  var y = Math.abs(y1-y2)
  return Math.sqrt((x*x)+(y*y))
}

function circ(x, y, radius, fill, stroke, strokeWidth) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

function rect(x, y, w, h, a) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(a*Math.PI/180)
  ctx.fillRect(-w/2, -h/2, w, h)
  ctx.restore()
}

function rectangular(body, options) {
  let w = distance(body.vertices[0].x, body.vertices[0].y, body.vertices[1].x, body.vertices[1].y)
  let h = distance(body.vertices[0].x, body.vertices[0].y, body.vertices[3].x, body.vertices[3].y)
  rect(body.position.x, body.position.y, w, h, round(body.angle, 1))
}

function circular(body) {
  circ(body.position.x, body.position.y, body.circleRadius, 'red')
}

function draw() {
  ctx.fillStyle = 'black'
  rectangular(boxA)
  rectangular(boxB)
  rectangular(ground)
  circular(player.body)
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  handle([65, 68])
  player.axis = keys[68] - keys[65]
  Body.applyForce(player.body, player.body.position, {
    x: player.axis * 0.02,
    y: 0,
  })
  
  draw()

  window.requestAnimationFrame(tick)
}

tick()