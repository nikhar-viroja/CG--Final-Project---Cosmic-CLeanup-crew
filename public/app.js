import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function createChessboardTexture() {
    const canvas = document.createElement('canvas');
    const size = 64; // Texture size
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');

    // Reduce the number of squares for larger size
    const squaresPerSide = 4;  // Fewer squares per side
    const squareSize = size / squaresPerSide; // Each square size is larger

    for (let x = 0; x < squaresPerSide; x++) {
        for (let y = 0; y < squaresPerSide; y++) {
            context.fillStyle = (x + y) % 2 === 0 ? 'white' : '#A6A453'; // Alternate colors
            context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100 / squaresPerSide, 100 / squaresPerSide); // Adjust texture repeats based on plane size
    return texture;
}


const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ map: createChessboardTexture(), side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

function createStripedTexture() {
    const canvas = document.createElement('canvas');
    const size = 128; // Texture size
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');

    context.fillStyle = 'white';
    context.fillRect(0, 0, size, size);
    context.fillStyle = 'red';
    const stripeWidth = 10;
    for (let i = 0; i < size; i += 2 * stripeWidth) {
        context.fillRect(i, 0, stripeWidth, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
    return texture;
}

const sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ map: createStripedTexture() });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.y = 1.5;
scene.add(sphere);

const sphereRadius = 3;
const circumference = 2 * Math.PI * sphereRadius;

document.addEventListener('keydown', onDocumentKeyDown);

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    let delta = 1;  // Movement distance per key press
    let rotationAngle = (delta / circumference) * 2 * Math.PI;  // Rotation per move

    switch (keyCode) {
        case 37: // left
            sphere.position.x -= delta;
            sphere.rotation.z -= rotationAngle; // Rotate to match left movement
            break;
        case 38: // up
            sphere.position.z -= delta;
            sphere.rotation.x -= rotationAngle; // Rotation for forward movement
            break;
        case 39: // right
            sphere.position.x += delta;
            sphere.rotation.z += rotationAngle; // Rotate to match right movement
            break;
        case 40: // down
            sphere.position.z += delta;
            sphere.rotation.x += rotationAngle; // Rotation for backward movement
            break;
    }
}

const objects = [];
function createObjects() {
    const numObjects = 10; // Adjust as needed
    for (let i = 0; i < numObjects; i++) {
        const objectGeometry = new THREE.SphereGeometry(2, 16, 16);
        const objectMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const object = new THREE.Mesh(objectGeometry, objectMaterial);
        object.position.set(Math.random() * 80 - 40, 2, Math.random() * 80 - 40);
        scene.add(object);
        objects.push(object);
    }
}
createObjects();

function checkCollisions() {
    const ballRadius = sphere.scale.x * sphere.geometry.parameters.radius; // Correct radius calculation considering scale
    const ballBoundingSphere = new THREE.Sphere(sphere.position, ballRadius);
    
    for (let i = objects.length - 1; i >= 0; i--) {
        const object = objects[i];
        const objectRadius = object.geometry.parameters.radius; // Assuming uniform size objects
        const objectBoundingSphere = new THREE.Sphere(object.position, objectRadius);

        if (ballBoundingSphere.intersectsSphere(objectBoundingSphere)) {
            scene.remove(object);
            objects.splice(i, 1);
            // Apply a smaller scaling factor or ensure it scales only if a collision is confirmed
            sphere.scale.multiplyScalar(1.05); // Scale up by 5%
        }
    }
}


function checkGameOver() {
    if (Math.abs(sphere.position.x) > 50 || Math.abs(sphere.position.z) > 50) {
        gameOver('You went out of bounds!');
    } else if (objects.length === 0) {
        gameOver('Congratulations, you\'ve collected all objects!');
    }
}

function gameOver(message) {
    cancelAnimationFrame(animationId);
    const modal = document.getElementById('gameOverModal');
    const messageElement = document.getElementById('gameOverMessage');
    messageElement.textContent = message;
    modal.style.display = 'flex'; // Show the modal
}

function restartGame() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'none'; // Hide the modal

    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    scene.add(plane);
    sphere.geometry = new THREE.SphereGeometry(3, 32, 32); // Reset geometry
    sphere.scale.set(1, 1, 1); // Reset scale
    sphere.position.set(0, 1.5, 0);
    scene.add(sphere);
    createObjects();
    animate();
}

window.restartGame = restartGame;

let animationId;

let lastRender = 0;
function animate(timestamp) {
    animationId = requestAnimationFrame(animate);
    const deltaTime = (timestamp - lastRender) / 1000;
    lastRender = timestamp;

    if (deltaTime < 0.2) { // Ensuring that the game logic doesn't update too erratically
        checkCollisions();
        checkGameOver();
    }

    camera.position.x = sphere.position.x;
    camera.position.z = sphere.position.z + 15;
    camera.position.y = sphere.position.y + 15;
    camera.lookAt(sphere.position);
    renderer.render(scene, camera);
}

animate();