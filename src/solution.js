import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let renderer, scene, camera;
const bin_garbage = [
  new THREE.Vector3(10, 1, 5),
  new THREE.Vector3(-1, 1, 20),
  new THREE.Vector3(0, 1, -25),
  new THREE.Vector3(30, 1, 1),
  new THREE.Vector3(-20, 1, 10),
];

const blue_garbage_bag = [
  new THREE.Vector3(5, 0, -30),
  new THREE.Vector3(25, 0, -5),
  new THREE.Vector3(-10, 0, -1),
  new THREE.Vector3(20, 0, 25),
  new THREE.Vector3(-25, 0, -20),
];

const garbage_bag = [
  new THREE.Vector3(6, 2, 0),
  new THREE.Vector3(-5, 1, 30),
  new THREE.Vector3(35, 1, -10),
  new THREE.Vector3(-30, 1, 5),
  new THREE.Vector3(10, 1, -35),
];

const garbage_bin_1 = [
  new THREE.Vector3(40, 1, 0),
  new THREE.Vector3(-35, 1, 1),
  new THREE.Vector3(0, 1, 35),
  new THREE.Vector3(30, 1, -25),
  new THREE.Vector3(-40, 1, -5),
];

const garbagebin1 = 5;
const garbagebin2 = 5;
const garbagebin3 = 5;
const garbagebin4 = 5;
const planeSize = 95.5;
const planeSizeFront = 96.5;
let cameraDistance = 10;
const v0 = new THREE.Vector3();
const q = new THREE.Quaternion();
const angularVelocity = new THREE.Vector3();

let delta = 0;

window.init = async (canvas) => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(10, 20, 10);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = -100;
  light.shadow.camera.far = 100;
  light.shadow.camera.left = -100;
  light.shadow.camera.right = 100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;
  scene.add(light);

  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const texturePlane = new THREE.TextureLoader().load("assets/file.jpg");
  texturePlane.wrapS = THREE.MirroredRepeatWrapping;
  texturePlane.wrapT = THREE.MirroredRepeatWrapping;
  texturePlane.repeat.set(10, 10);
  const materialPlane = new THREE.MeshPhongMaterial({
    map: texturePlane,
  });

  const ground = new THREE.Mesh(groundGeometry, materialPlane);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const texture = new THREE.TextureLoader().load("assets/test.avif");
  const material = new THREE.MeshPhongMaterial({
    map: texture,
  });

  const sphere = new THREE.Mesh(geometry, material);
  sphere.name = "sphere";
  sphere.position.y = 1;
  sphere.castShadow = true;
  scene.add(sphere);

  const loader = new GLTFLoader().setPath("models/blue_garbage_bag/");

  for (let i = 0; i < garbagebin1; i++) {
    loader.load("scene.gltf", (gltf) => {
      gltf.scene.scale.set(0.03, 0.03, 0.03);
      gltf.scene.position.copy(bin_garbage[i]);
      scene.add(gltf.scene);
    });
  }

  const loader2 = new GLTFLoader().setPath("models/bin_garbage/");

  for (let i = 0; i < garbagebin2; i++) {
    loader2.load("scene.gltf", (gltf) => {
      gltf.scene.scale.set(2, 2, 2);
      gltf.scene.position.copy(blue_garbage_bag[i]);
      scene.add(gltf.scene);
    });
  }

  const loader3 = new GLTFLoader().setPath("models/garbage_bag/");

  for (let i = 0; i < garbagebin3; i++) {
    loader3.load("scene.gltf", (gltf) => {
      gltf.scene.scale.set(0.01, 0.01, 0.01);
      gltf.scene.position.copy(garbage_bag[i]);
      scene.add(gltf.scene);
    });
  }

  const loader4 = new GLTFLoader().setPath("models/garbage_bin/");

  for (let i = 0; i < garbagebin4; i++) {
    loader4.load("scene.gltf", (gltf) => {
      gltf.scene.scale.set(3, 3, 3);
      gltf.scene.position.copy(garbage_bin_1[i]);
      scene.add(gltf.scene);
    });
  }

  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  console.log("made a scene");
};

function showGameOver() {
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  if (gameOverOverlay) {
    gameOverOverlay.style.display = "block";
  }
}
let garbagebincollected = 0;
let gameRunning = true;

window.loop = (dt, canvas, input) => {
  delta = Math.min(dt, 0.03);

  if (!gameRunning) {
    return;
  }

  const sphere = scene.getObjectByName("sphere");

  const garbagebinobjects = scene.children.filter((obj) => obj.type === "Group");
  for (const garbagetin of garbagebinobjects) {
    if (
      sphere.position.distanceTo(garbagetin.position) < 2.5 &&
      !garbagetin.isAttached
    ) {
      const originalScale = garbagetin.scale.clone();
      const pickedPosition = sphere.worldToLocal(garbagetin.position.clone());
      garbagetin.position.copy(pickedPosition);
      sphere.add(garbagetin);
      garbagetin.isAttached = true;
      garbagetin.scale.copy(originalScale);
      garbagebincollected++;
      if (
        garbagebincollected >=
        garbagebin1 + garbagebin2 + garbagebin3 + garbagebin4
      ) {
        gameRunning = false;
        showGameOver();
        break;
      }
      const currentScale = sphere.scale.x;
      const scaleIncrement = 0.03;
      sphere.scale.set(
        currentScale + scaleIncrement,
        currentScale + scaleIncrement,
        currentScale + scaleIncrement
      );
    }
  }

  const maxX = planeSize / 2;
  const minX = -maxX;
  const maxZ = planeSizeFront / 2;
  const minZ = -maxZ;

  if (sphere.position.x <= minX || sphere.position.x >= maxX) {
    angularVelocity.z = 0;
  }
  if (sphere.position.z <= minZ || sphere.position.z >= maxZ) {
    angularVelocity.x = 0;
  }

  if (input.keys.has("ArrowUp") && sphere.position.z > minZ) {
    angularVelocity.x -= delta * 5;
  }
  if (input.keys.has("ArrowDown") && sphere.position.z < maxZ) {
    angularVelocity.x += delta * 5;
  }
  if (input.keys.has("ArrowLeft") && sphere.position.x > minX) {
    angularVelocity.z += delta * 5;
  }
  if (input.keys.has("ArrowRight") && sphere.position.x < maxX) {
    angularVelocity.z -= delta * 5;
  }

  q.setFromAxisAngle(angularVelocity, delta).normalize();
  sphere.applyQuaternion(q);

  angularVelocity.lerp(v0, 0.01);

  sphere.position.x -= angularVelocity.z * delta;
  sphere.position.z += angularVelocity.x * delta;

  camera.position.x = sphere.position.x;
  camera.position.z = sphere.position.z + cameraDistance;
  camera.lookAt(sphere.position);

  renderer.render(scene, camera);
};