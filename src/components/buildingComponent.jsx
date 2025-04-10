// BuildingComponent.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const BuildingComponent = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd3d3d3); // Light grey background
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    } else {
      console.warn('mountRef.current is null, skipping renderer append');
      return;
    }

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 20, 50);
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2; // Prevent going below ground
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
    const windows = [];

    // Create ground plane
    const planeSize = 100;
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    scene.add(plane);

    // Add gridlines
    const grid = new THREE.GridHelper(planeSize, 50, 0xffffff, 0xffffff);
    grid.position.y = -0.49;
    scene.add(grid);

    // Create floors and windows
    for (let i = 0; i < 10; i++) {
      // Floor base
      const floorGeometry = new THREE.BoxGeometry(buildingWidth, floorHeight, buildingDepth);
      const floorMaterial = new THREE.MeshPhongMaterial({
        color: beigeColor,
        transparent: true,
        opacity: 0.8,
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.position.y = i * floorHeight;
      floor.userData = { type: 'floor', floorIndex: i };
      buildingGroup.add(floor);

      // Floor separation line (non-interactive)
      const edges = new THREE.EdgesGeometry(floorGeometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x808080 }));
      line.position.y = i * floorHeight;
      line.userData = { type: 'line' }; // Mark as non-floor
      buildingGroup.add(line);

      // Windows (front, back, left, right)
      const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x4682b4, transparent: true, opacity: 0.6 });
      const windowGeometry = new THREE.PlaneGeometry(2, 1.5);

      // Front and back windows
      for (let x = -6; x <= 6; x += 4) {
        const windowFront = new THREE.Mesh(windowGeometry, windowMaterial);
        windowFront.position.set(x, i * floorHeight, buildingDepth / 2 + 0.01);
        windowFront.userData = { type: 'window' };
        buildingGroup.add(windowFront);
        windows.push(windowFront);

        const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
        windowBack.position.set(x, i * floorHeight, -buildingDepth / 2 - 0.01);
        windowBack.rotation.y = Math.PI;
        windowBack.userData = { type: 'window' };
        buildingGroup.add(windowBack);
        windows.push(windowBack);
      }

      // Side windows
      for (let z = -3; z <= 3; z += 3) {
        const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
        windowLeft.position.set(-buildingWidth / 2 - 0.01, i * floorHeight, z);
        windowLeft.rotation.y = Math.PI / 2;
        windowLeft.userData = { type: 'window' };
        buildingGroup.add(windowLeft);
        windows.push(windowLeft);

        const windowRight = new THREE.Mesh(windowGeometry, windowMaterial);
        windowRight.position.set(buildingWidth / 2 + 0.01, i * floorHeight, z);
        windowRight.rotation.y = -Math.PI / 2;
        windowRight.userData = { type: 'window' };
        buildingGroup.add(windowRight);
        windows.push(windowRight);
      }

      // Floor plans for west and east apartments
      const westPlan = createFloorPlan(-buildingWidth / 4, i * floorHeight, 'west', i);
      const eastPlan = createFloorPlan(buildingWidth / 4, i * floorHeight, 'east', i);
      floorPlans.push({ west: westPlan, east: eastPlan, floor: i });
    }

    scene.add(buildingGroup);

    // Function to create detailed 3D floor plans
    function createFloorPlan(xOffset, yPos, side, floorNum) {
      const planGroup = new THREE.Group();
      const planWidth = buildingWidth / 2 - 0.5;
      const planDepth = buildingDepth - 0.5;
      const wallHeight = 2.5;

      // Floor
      const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const floorGeo = new THREE.PlaneGeometry(planWidth, planDepth);
      const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
      floorMesh.rotation.x = -Math.PI / 2;
      planGroup.add(floorMesh);

      // Walls
      const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xd3d3d3, wireframe: true });
      const wallThickness = 0.2;

      const walls = [
        new THREE.BoxGeometry(planWidth, wallHeight, wallThickness),
        new THREE.BoxGeometry(planWidth, wallHeight, wallThickness),
        new THREE.BoxGeometry(wallThickness, wallHeight, planDepth),
        new THREE.BoxGeometry(wallThickness, wallHeight, planDepth),
      ];

      const wallPositions = [
        [0, wallHeight / 2, planDepth / 2],
        [0, wallHeight / 2, -planDepth / 2],
        [-planWidth / 2, wallHeight / 2, 0],
        [planWidth / 2, wallHeight / 2, 0],
      ];

      walls.forEach((geo, idx) => {
        const wall = new THREE.Mesh(geo, wallMaterial);
        wall.position.set(...wallPositions[idx]);
        planGroup.add(wall);
      });

      // Internal rooms
      const roomMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true });
      if (floorNum % 2 === 0) {
        const livingRoom = new THREE.Mesh(
          new THREE.BoxGeometry(planWidth * 0.6, wallHeight, planDepth * 0.5),
          roomMaterial
        );
        livingRoom.position.set(-planWidth * 0.2, wallHeight / 2, planDepth * 0.25);
        planGroup.add(livingRoom);

        const bedroom = new THREE.Mesh(
          new THREE.BoxGeometry(planWidth * 0.4, wallHeight, planDepth * 0.3),
          roomMaterial
        );
        bedroom.position.set(planWidth * 0.2, wallHeight / 2, -planDepth * 0.1);
        planGroup.add(bedroom);

        const bathroom = new THREE.Mesh(
          new THREE.BoxGeometry(planWidth * 0.2, wallHeight, planDepth * 0.2),
          roomMaterial
        );
        bathroom.position.set(planWidth * 0.2, wallHeight / 2, -planDepth * 0.3);
        planGroup.add(bathroom);
      } else {
        const livingRoom = new THREE.Mesh(
          new THREE.BoxGeometry(planWidth * 0.5, wallHeight, planDepth * 0.6),
          roomMaterial
        );
        livingRoom.position.set(0, wallHeight / 2, planDepth * 0.2);
        planGroup.add(livingRoom);

        const bedroom1 = new THREE.Mesh(
          new THREE.BoxGeometry(planWidth * 0.3, wallHeight, planDepth * 0.3),
          roomMaterial
        );
        bedroom1.position.set(-planWidth * 0.2, wallHeight / 2, -planDepth * 0.2);
        planGroup.add(bedroom1);

        const bedroom2 = new THREE.Mesh(
          new THREE.BoxGeometry(planWidth * 0.3, wallHeight, planDepth * 0.3),
          roomMaterial
        );
        bedroom2.position.set(planWidth * 0.2, wallHeight / 2, -planDepth * 0.2);
        planGroup.add(bedroom2);
      }

      const adjustedXOffset = side === 'west' ? -buildingWidth / 4 - 0.25 : buildingWidth / 4 + 0.25;
      planGroup.position.set(adjustedXOffset, yPos + 0.1, 0);
      planGroup.visible = false;
      scene.add(planGroup);
      return planGroup;
    }

    // Raycaster for clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentPlan = null;
    let initialCameraPos = camera.position.clone();
    let initialCameraTarget = controls.target.clone();

    function onMouseClick(event) {
      if (!isMounted) return;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingGroup.children, true);

      // Find the first floor intersection
      const floorIntersect = intersects.find((intersect) => intersect.object.userData.type === 'floor');

      if (!floorIntersect) {
        console.warn('No floor intersected. Intersected objects:', intersects.map((i) => i.object.userData));
        return;
      }

      const floorIndex = floorIntersect.object.userData.floorIndex;
      if (typeof floorIndex !== 'number' || !floorPlans[floorIndex]) {
        console.error('Invalid floorIndex or floorPlans entry:', floorIndex, floorPlans);
        return;
      }

      const clickX = floorIntersect.point.x;
      const side = clickX < 0 ? 'west' : 'east';

      if (currentPlan) {
        currentPlan.visible = false;
      }

      currentPlan = floorPlans[floorIndex][side];
      if (!currentPlan) {
        console.error(`No floor plan found for floor ${floorIndex}, side ${side}`);
        return;
      }

      currentPlan.visible = true;
      buildingGroup.visible = false;

      const targetPos = new THREE.Vector3(
        currentPlan.position.x,
        currentPlan.position.y + 5,
        currentPlan.position.z + 10
      );
      animateCamera(camera.position, targetPos, 1000);

      controls.target.set(currentPlan.position.x, currentPlan.position.y, currentPlan.position.z);
      controls.update();

      showBackButton();
    }

    function animateCamera(startPos, endPos, duration) {
      const startTime = performance.now();
      function update() {
        if (!isMounted) return;
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        camera.position.lerpVectors(startPos, endPos, t);
        if (t < 1) {
          requestAnimationFrame(update);
        }
      }
      requestAnimationFrame(update);
    }

    let backButton = null;

function handleBack() {
  if (currentPlan) {
    currentPlan.visible = false;
    currentPlan = null;
  }
  buildingGroup.visible = true;
  animateCamera(camera.position, initialCameraPos, 1000);
  controls.target.copy(initialCameraTarget);
  controls.update();
  if (backButton) backButton.remove();
}

function showBackButton() {
  if (backButton) backButton.remove();

  backButton = document.createElement('button');
  backButton.innerHTML = '<';
  backButton.style.position = 'absolute';
  backButton.style.top = '10px';
  backButton.style.left = '10px';
  backButton.style.fontSize = '24px';
  backButton.style.background = 'none';
  backButton.style.border = 'none';
  backButton.style.cursor = 'pointer';
  backButton.style.color = '#000';

  backButton.onclick = handleBack;

  document.body.appendChild(backButton);
}

// ESC key listener
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    handleBack();
  }
});

window.addEventListener('click', onMouseClick);

    const onWindowResize = () => {
      if (!isMounted) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    function animate() {
      if (!isMounted) return;
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      isMounted = false;
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('click', onMouseClick);
      if (backButton) backButton.remove();
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (error) {
          console.warn('Failed to remove renderer.domElement:', error);
        }
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }} />;
};

// Error Boundary
class BuildingErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in BuildingComponent:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong with the 3D visualization. Please refresh the page.</h1>;
    }
    return this.props.children;
  }
}

export default function WrappedBuildingComponent() {
  return (
    <BuildingErrorBoundary>
      <BuildingComponent />
    </BuildingErrorBoundary>
  );
}