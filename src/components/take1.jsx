import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 20, 50);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Building parameters
const floorHeight = 3;
const buildingWidth = 20;
const buildingDepth = 10;
const beigeColor = 0xf5f5dc;

// Create building
const buildingGroup = new THREE.Group();
const floorPlans = [];

// Create floors
for (let i = 0; i < 10; i++) {
    // Floor base
    const floorGeometry = new THREE.BoxGeometry(buildingWidth, floorHeight, buildingDepth);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: beigeColor,
        transparent: true,
        opacity: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = i * floorHeight;
    buildingGroup.add(floor);

    // Floor separation line
    const edges = new THREE.EdgesGeometry(floorGeometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x808080 }));
    line.position.y = i * floorHeight;
    buildingGroup.add(line);

    // Floor plans for west and east apartments (simple rectangles for demonstration)
    const westPlan = createFloorPlan(-buildingWidth/4, i * floorHeight, 'west', i);
    const eastPlan = createFloorPlan(buildingWidth/4, i * floorHeight, 'east', i);
    floorPlans.push({ west: westPlan, east: eastPlan, floor: i });
}

scene.add(buildingGroup);

// Function to create simple floor plans
function createFloorPlan(xOffset, yPos, side, floorNum) {
    const planGroup = new THREE.Group();
    const planWidth = buildingWidth/2 - 1;
    const planDepth = buildingDepth - 1;

    // Basic room layout
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const floorGeo = new THREE.PlaneGeometry(planWidth, planDepth);
    const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
    floorMesh.rotation.x = Math.PI/2;
    
    // Walls
    const wallMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wallPoints = [
        new THREE.Vector3(-planWidth/2, 0, -planDepth/2),
        new THREE.Vector3(planWidth/2, 0, -planDepth/2),
        new THREE.Vector3(planWidth/2, 0, planDepth/2),
        new THREE.Vector3(-planWidth/2, 0, planDepth/2),
        new THREE.Vector3(-planWidth/2, 0, -planDepth/2)
    ];
    
    // Different layouts for odd/even floors
    if (floorNum % 2 === 0) {
        // Add simple partition for even floors
        wallPoints.push(
            new THREE.Vector3(0, 0, -planDepth/2),
            new THREE.Vector3(0, 0, planDepth/2)
        );
    } else {
        // Different partition for odd floors
        wallPoints.push(
            new THREE.Vector3(-planWidth/4, 0, 0),
            new THREE.Vector3(planWidth/4, 0, 0)
        );
    }

    const wallGeometry = new THREE.BufferGeometry().setFromPoints(wallPoints);
    const walls = new THREE.Line(wallGeometry, wallMaterial);

    planGroup.add(floorMesh, walls);
    planGroup.position.set(xOffset, yPos + 0.1, 0);
    planGroup.visible = false;
    scene.add(planGroup);
    return planGroup;
}

// Raycaster for clicking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentPlan = null;

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(buildingGroup.children, true);

    if (intersects.length > 0) {
        const intersected = intersects[0];
        const floorIndex = Math.floor(intersected.object.position.y / floorHeight);
        const clickX = intersected.point.x;

        // Hide current plan if showing
        if (currentPlan) {
            currentPlan.visible = false;
        }

        // Show appropriate floor plan
        if (clickX < 0) {
            currentPlan = floorPlans[floorIndex].west;
        } else {
            currentPlan = floorPlans[floorIndex].east;
        }
        currentPlan.visible = true;
    }
}

window.addEventListener('click', onMouseClick);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});