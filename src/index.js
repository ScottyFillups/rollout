import * as THREE from 'three'
import * as CANNON from 'cannon'

const timestep = 1/60
const world = new CANNON.World()
world.gravity.set(0,0,0)
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 10

const shape = new CANNON.Sphere(2)
const body = new CANNON.Body({
  mass: 1
})
body.addShape(shape)
body.angularVelocity.set(1,5,2)
body.angularDamping = 0.2

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
camera.position.z = 5

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
