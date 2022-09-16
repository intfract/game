const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const g = 1

class Block {
  constructor(x, y, w, h, type) {
    this.x = x * 64
    this.y = y * 64
    this.w = w * 64
    this.h = h * 64
    this.v = {
      x: 0,
      y: 0,
    }
    this.a = {
      x: 0,
      y: 0,
    }
    this.type = type
    this.state = ''
  }

  colliding(x, y, w, h) {
    return this.x + this.w > x && this.x < x + w && this.y + this.h > y && this.y < y + h
  }

  collidingWith(entity) {
    return this.colliding(entity.x, entity.y, entity.w, entity.h)
  }

  draw() {
    c.fillStyle = this.render()
    c.fillRect(this.x, this.y, this.w, this.h)
  }

  render() {
    if (this.type === 'grass') return '#2ECC71'
  }
}

class Player {
  constructor(x, y, w, h, type) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.v = {
      x: 0,
      y: 0,
    }
    this.a = {
      x: 0,
      y: 0,
    }
    this.type = type
    this.k = {
      right: false,
      left: false,
      down: false,
      up: false,
    }
    this.power = 4
    this.crouch = false
  }

  colliding(x, y, w, h, s) {
    if (s instanceof Block) return this.x + this.w > x && this.x < x + w && this.y + this.h > y && this.y < y + h
  }

  collidingWith(entity) {
    if (Array.isArray(entity)) {
      for (const item of entity) {
        if (this.collidingWith(item)) return true
      }
      return false
    }
    return this.colliding(entity.x, entity.y, entity.w, entity.h, entity)
  }

  draw() {
    c.fillStyle = this.type
    c.fillRect(this.x, this.y, this.w, this.h)
  }

  move(axis) {
    this.a.x = this.power * (this.k.right - this.k.left)
    if (axis === 'y') {
      this.y += 1
      for (const item of map) {
        if (this.collidingWith(item)) {
          this.v.y -= 28 * this.k.up
        }
      }
      this.y -= 1
    }
    this.v.x *= 0.75
    this.v.y += g
    this.v[axis] += this.a[axis]
    this[axis] += this.v[axis]
  }

  react() {
    if (this.k.down) {
      if (!this.crouch) {
        this.h = 64
        this.crouch = true
      }
    } else {
      this.y -= 1
      if (this.crouch && !this.collidingWith(map)) {
        this.y -= 32
        this.h = 96
        this.crouch = false
      }
      this.y += 1
    }
  }

  inside(x, y, w, h) {
    return this.x + this.w <= x + w && this.x >= x && this.y + this.h <= y + h && this.y >= y
  }
}

function preload(url) {
  const img = new Image()
  img.src = `./${url}.svg`
  return img
}

const player = new Player(64, 0, 64, 96, 'blue')

const map = [
  new Block(1, 4, 1, 1, 'grass')
]

function tick() {
  c.clearRect(0, 0, canvas.width, canvas.height)
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  player.react()

  player.move('x')

  for (const item of map) {
    if (player.collidingWith(item)) {
      if (player.v.x > 0) {
        player.x -= player.x + player.w - item.x
      } else {
        player.x += item.x + item.w - player.x
      }
      player.v.x = 0
    }
  }

  player.move('y')

  for (const item of map) {
    if (player.collidingWith(item)) {
      if (player.v.y > 0) {
        player.y -= player.y + player.h - item.y
      } else {
        player.y += item.y + item.h - player.y
      }
      player.v.y = 0
    }
  }

  player.draw()
  for (const item of map) {
    item.draw()
  }
  window.requestAnimationFrame(tick)
}

tick()

window.addEventListener('keydown', ({ keyCode }) => {
  switch (keyCode) {
    case 65:
      player.k.left = true
      break
    case 68:
      player.k.right = true
      break
    case 83:
      player.k.down = true
      break
    case 87:
      player.k.up = true
      break
  }
})

window.addEventListener('keyup', ({ keyCode }) => {
  switch (keyCode) {
    case 65:
      player.k.left = false
      break
    case 68:
      player.k.right = false
      break
    case 83:
      player.k.down = false
      break
    case 87:
      player.k.up = false
      break
  }
})