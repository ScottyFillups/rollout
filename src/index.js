import * as THREE from 'three'
import { Vec3, World, NaiveBroadphase, Body, Sphere } from 'cannon'
import { GyroNorm } from '../vendor/gyronorm.complete.min'

const timestep = 1/60
const world = new World()
world.gravity.set(0,0,0)
world.broadphase = new NaiveBroadphase()
world.solver.iterations = 10

const shape = new Sphere(2)
const body = new Body({
  mass: 1
})
body.addShape(shape)

world.addBody(body)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xffffff)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const geometry = new THREE.SphereGeometry(2, 6, 6)
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true
})
const sphere = new THREE.Mesh(geometry, material)

scene.add(sphere)
camera.position.z = 15

function render () {
  requestAnimationFrame(render)
  updatePhysics()
  renderer.render(scene, camera)
}

render()

function updatePhysics () {
  world.step(timestep)
  sphere.position.copy(body.position)
  sphere.quaternion.copy(body.quaternion)
}

function Interval (min, max) {
  return num => Math.min(max, Math.max(num, min))
}

const gn = new GyroNorm()

gn.init().then(function () {
  gn.start(function (data) {
    const clamp = Interval(-1, 1)
    const beta = clamp(data.do.beta / 90)
    const gamma = clamp(data.do.gamma / 90)

    body.applyLocalForce(new Vec3(gamma,beta,0), new Vec3(0,0,1)) 
  })
})
