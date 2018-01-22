import * as THREE from 'three'
import { ContactMaterial, Material, Vec3, World, NaiveBroadphase, Plane, Body, Sphere } from 'cannon'
import { GyroNorm } from '../vendor/gyronorm.complete.min'

const timestep = 1/60
const world = new World()
world.gravity.set(0,0,-9.82)
world.broadphase = new NaiveBroadphase()
world.solver.iterations = 10

const groundMaterial = new Material('groundMaterial')
const ground_ground_cm = new ContactMaterial(groundMaterial, groundMaterial, {
  friction: 0.8,
  restitution: 0.3,
  contactEquationStiffness: 1e8,
  contactEquationRelaxation: 3,
  frictionEquationStiffness: 1e8,
  frictionEquationRegularizationTime: 3,
});

const groundShape = new Plane()
const groundBody = new Body({ mass: 0, material: groundMaterial })
groundBody.addShape(groundShape)
world.add(groundBody)


const shape = new Sphere(2)
const body = new Body({
  mass: 1,
  material: groundMaterial
})
body.position.set(0,0,100)
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
camera.position.z = 100

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
    const beta = 100 * -clamp(data.do.beta / 90)
    const gamma = 100 * clamp(data.do.gamma / 90)

    body.applyLocalForce(new Vec3(gamma,beta,0), new Vec3(0,0,1)) 
  })
})
