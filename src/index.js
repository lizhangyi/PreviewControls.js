import * as THREE from 'three';

import PreviewControls from "./PreviewControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

let camera, controls, scene, renderer;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 3, 5);

  // world
  const loader = new GLTFLoader()

  loader.load('../model/Duck.gltf', function (gltf) {
    const object = gltf.scene
    scene.add(object)

    // controls

    controls = new PreviewControls(object, camera, renderer.domElement);
    // controls.listenToKeyEvents(window); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.03;

    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

    scene.add(controls)

  }, null, function (error) {
    console.error(error)
  })

  // lights

  const dirLight1 = new THREE.DirectionalLight(0xffffff);
  dirLight1.position.set(1, 1, 1);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x002288);
  dirLight2.position.set(-1, -1, -1);
  scene.add(dirLight2);

  const ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);

  //

  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);

  controls && controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  render();

}

function render() {

  renderer.render(scene, camera);

}

