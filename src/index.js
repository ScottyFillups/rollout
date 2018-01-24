import * as THREE from 'three'
import { ContactMaterial, Material, Vec3, World, NaiveBroadphase, Plane, Body, Sphere } from 'cannon'
import { GyroNorm } from '../vendor/gyronorm.complete.min'

const $ = document.querySelector.bind(document)
const timestep = 1/60
const world = new World()
world.gravity.set(0,0,-9.82)
world.broadphase = new NaiveBroadphase()
world.solver.iterations = 10


const groundMaterial = new Material('groundMaterial')
const ground_ground_cm = new ContactMaterial(groundMaterial, groundMaterial, {
  friction: 0.3,
  restitution: 0.3,
  contactEquationStiffness: 1e8,
  contactEquationRelaxation: 3,
  frictionEquationStiffness: 1e8,
  frictionEquationRegularizationTime: 3,
});

world.addContactMaterial(ground_ground_cm)

const groundShape = new Plane()
const groundBody = new Body({ mass: 0, material: groundMaterial })
groundBody.addShape(groundShape)
world.add(groundBody)

const shape = new Sphere(2)
const body = new Body({
  mass: 1,
  material: groundMaterial
})
body.position.set(0,0,2)
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

function degreesToRadians(angle){
	return angle * (Math.PI / 180)
}

function radiansToDegrees(angle){
	return angle * (180 / Math.PI)
}

const gn = new GyroNorm()

gn.init().then(function () {
  gn.start(function (data) {
  	$('#field1').value = data.do.alpha;
  	$('#field2').value = data.do.beta;
  	$('#field3').value = data.do.gamma;
	
	const alpha = degreesToRadians(data.do.alpha)  
	const beta = degreesToRadians(data.do.beta)  
	const gamma = degreesToRadians(data.do.gamma)  
	
	const betaAbs = Math.abs(beta)
	const gammaAbs = Math.abs(gamma)

	/*		b
	 *   ---- beta
	 * a |\d/
	 *	 | / c
	 *  gamma 
	 */

	const a = 1/Math.tan(gammaAbs)
	const b = 1/Math.tan(betaAbs)
	if (a == Infinity || b == Infinity){
		  return
 	}
	const c = Math.sqrt(a*a + b*b)
	const d = (a * b) / c
	const theta = Math.atan(1/d)
	const phi = Math.acos(d/a)
	
	var offset = gamma > 0 ? -Math.PI/2 : Math.PI/2;
	var direction = (beta > 0 && gamma < 0) || (beta < 0 && gamma > 0) ? 1 : -1;

	const rotation = offset + (direction * phi)
	const actualAngle = rotation + Math.PI/2
	// Limit the value of theta
	  //
  	$('#field4').value = radiansToDegrees(phi)
  	$('#field5').value = radiansToDegrees(theta)
	$('#field6').value = radiansToDegrees(rotation)
	$('#field7').value = radiansToDegrees(actualAngle)
	const magnitude = 2;
	body.applyImpulse(new Vec3(magnitude * Math.cos(actualAngle), magnitude * Math.sin(actualAngle), 0), body.position)
  	//body.velocity.set(magnitude * Math.cos(actualAngle), magnitude * Math.sin(actualAngle), 0)
  })
})
