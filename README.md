Below is a detailed Markdown (MD) file that explains the `BuildingComponent.jsx` file line by line. Since your knowledge of React concepts like `useEffect` is limited, I’ll provide in-depth explanations of React hooks and other features wherever they’re used. I’ll also break down the Three.js features and functions in detail to help you understand how they work in this 3D visualization. This will serve as a comprehensive guide to the code.

---

# BuildingComponent.jsx - Line-by-Line Explanation

This Markdown file explains the `BuildingComponent.jsx` file, a React component that uses Three.js to render an interactive 3D building model. The component creates a multi-story building with floors, windows, and clickable floor plans, allowing users to explore the structure in a browser. I’ll walk through each line, focusing on React concepts (especially `useEffect` and `useRef`) and Three.js features, explaining their purpose and how they work together.

---

## Table of Contents

1. [Imports](#imports)
2. [Component Definition](#component-definition)
3. [useEffect Hook](#useeffect-hook)
4. [Scene Setup](#scene-setup)
5. [Orbit Controls](#orbit-controls)
6. [Lighting](#lighting)
7. [Building Creation](#building-creation)
8. [Ground Plane](#ground-plane)
9. [Floors and Windows](#floors-and-windows)
10. [Floor Plans](#floor-plans)
11. [Raycasting and Interaction](#raycasting-and-interaction)
12. [Camera Animation](#camera-animation)
13. [Back Button](#back-button)
14. [Event Listeners](#event-listeners)
15. [Animation Loop](#animation-loop)
16. [Cleanup](#cleanup)
17. [Error Boundary](#error-boundary)
18. [Export](#export)

---

## Imports

```jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
```

- **Line Breakdown**:
  - `import React, { useEffect, useRef } from 'react';`
    - **React**: The core library for building user interfaces in JavaScript.
    - **useEffect**: A React hook (function) that lets you perform side effects (like setting up Three.js or adding event listeners) in a functional component. Side effects are actions that happen outside the normal flow of rendering, such as manipulating the DOM or fetching data. Since your knowledge of `useEffect` is limited, here’s a detailed explanation:
      - It runs *after* the component renders to the screen.
      - You can control when it runs using a *dependency array* (explained later).
      - It can also return a cleanup function to undo its actions when the component unmounts (e.g., removing event listeners).
    - **useRef**: Another React hook that creates a mutable reference to something (like a DOM element) that persists across renders. It’s like a box you can put a value in and access later without causing the component to re-render.
  - `import * as THREE from 'three';`
    - **Three.js**: A JavaScript library for creating and rendering 3D graphics in the browser using WebGL. The `* as THREE` syntax imports all of Three.js’s features under the `THREE` namespace (e.g., `THREE.Scene`, `THREE.Camera`).
  - `import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';`
    - **OrbitControls**: A Three.js addon (not part of the core library) that lets users rotate, zoom, and pan the 3D scene with the mouse. It’s imported from Three.js’s examples module.

---

## Component Definition

```jsx
const BuildingComponent = () => {
  const mountRef = useRef(null);
```

- **Line Breakdown**:
  - `const BuildingComponent = () => {`
    - Defines a functional React component named `BuildingComponent`. Functional components are just JavaScript functions that return JSX (or nothing) to describe what should appear on the screen. Here, it will set up a 3D scene.
  - `const mountRef = useRef(null);`
    - **useRef**: Creates a reference (`mountRef`) initialized to `null`. This will later hold a reference to a DOM element (a `<div>`) where the Three.js canvas is attached.
    - **Why useRef?**: Unlike regular variables, `useRef` persists across renders without triggering a re-render when its value changes. It’s perfect for accessing DOM elements or storing values that don’t affect the UI directly.

---

## useEffect Hook

```jsx
  useEffect(() => {
    let isMounted = true;
```
	
- **Line Breakdown**:
  - `useEffect(() => {`
    - Starts the `useEffect` hook. This block runs after the component mounts (i.e., after it’s added to the DOM). Since you’re new to `useEffect`, here’s how it works:
      - It’s like saying, “After the component is ready, do this stuff.”
      - The empty array `[]` at the end (shown later) means it only runs *once* when the component mounts, not on every render.
    - All the Three.js setup (scene, camera, renderer, etc.) happens inside this block because it’s a side effect—something that interacts with the outside world (the browser’s DOM and WebGL).
  - `let isMounted = true;`
    - A flag to track whether the component is still mounted. This prevents errors if the component unmounts (is removed) before animations or event handlers finish.

---

## Scene Setup

```jsx
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
```

- **Line Breakdown**:
  - `const scene = new THREE.Scene();`
    - **THREE.Scene**: Creates a new 3D scene, a container for all objects (like the building, lights, and camera) in the 3D world.
  - `scene.background = new THREE.Color(0xd3d3d3);`
    - **THREE.Color**: A Three.js class to define colors. Here, `0xd3d3d3` is a hexadecimal code for light grey, setting the scene’s background color.
  - `const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);`
    - **THREE.PerspectiveCamera**: Creates a camera with perspective projection (objects farther away appear smaller, like in real life).
      - `75`: Field of view (FOV) in degrees—how wide the camera sees.
      - `window.innerWidth / window.innerHeight`: Aspect ratio, matching the window’s dimensions.
      - `0.1`: Near clipping plane—objects closer than this aren’t rendered.
      - `1000`: Far clipping plane—objects farther than this aren’t rendered.
  - `const renderer = new THREE.WebGLRenderer({ antialias: true });`
    - **THREE.WebGLRenderer**: Renders the 3D scene to a 2D canvas using WebGL (a browser technology for 3D graphics).
      - `{ antialias: true }`: Enables anti-aliasing to smooth out jagged edges.
  - `renderer.setSize(window.innerWidth, window.innerHeight);`
    - Sets the renderer’s canvas size to match the browser window.
  - `if (mountRef.current) {`
    - Checks if `mountRef.current` (the DOM element) exists.
  - `mountRef.current.appendChild(renderer.domElement);`
    - **renderer.domElement**: The HTML `<canvas>` element created by the renderer. This line appends it to the `<div>` referenced by `mountRef`.
  - `} else { console.warn('mountRef.current is null, skipping renderer append'); return; }`
    - If `mountRef.current` is `null`, logs a warning and exits the `useEffect` block to avoid errors.

---

## Orbit Controls

```jsx
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 20, 50);
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2; // Prevent going below ground
    controls.update();
```

- **Line Breakdown**:
  - `const controls = new OrbitControls(camera, renderer.domElement);`
    - **OrbitControls**: Initializes mouse controls for the camera, attached to the renderer’s canvas (`renderer.domElement`).
  - `camera.position.set(0, 20, 50);`
    - Sets the camera’s position to (x: 0, y: 20, z: 50) in 3D space, looking at the origin (0, 0, 0) by default.
  - `controls.minDistance = 10;`
    - Minimum zoom distance (prevents zooming too close).
  - `controls.maxDistance = 100;`
    - Maximum zoom distance (prevents zooming too far).
  - `controls.minPolarAngle = 0;`
    - Minimum vertical angle (0 radians = looking straight down).
  - `controls.maxPolarAngle = Math.PI / 2;`
    - Maximum vertical angle (π/2 radians = 90°, looking at the horizon), preventing the camera from going underground.
  - `controls.update();`
    - Updates the controls to apply the new settings.

---

## Lighting

```jsx
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
```

- **Line Breakdown**:
  - `const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);`
    - **THREE.AmbientLight**: Adds uniform lighting to all objects in the scene.
      - `0xffffff`: White color.
      - `0.6`: Intensity (0 to 1 scale).
  - `scene.add(ambientLight);`
    - Adds the light to the scene.
  - `const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);`
    - **THREE.DirectionalLight**: Simulates a distant light source (like the sun), casting light in one direction.
      - `0xffffff`: White color.
      - `0.6`: Intensity.
  - `directionalLight.position.set(10, 20, 10);`
    - Positions the light at (x: 10, y: 20, z: 10) to shine down and to the side.
  - `scene.add(directionalLight);`
    - Adds the directional light to the scene.

---

## Building Creation

```jsx
    const buildingGroup = new THREE.Group();
    const floorPlans = [];
    const windows = [];
```

- **Line Breakdown**:
  - `const buildingGroup = new THREE.Group();`
    - **THREE.Group**: A container to group multiple 3D objects (floors, windows, etc.) together. Moving or rotating the group affects all its children.
  - `const floorPlans = [];`
    - An array to store floor plan objects for each floor and side (west/east).
  - `const windows = [];`
    - An array to track window meshes (useful for future manipulation, though not used much here).

---

## Ground Plane

```jsx
    const planeSize = 100;
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    scene.add(plane);

    const grid = new THREE.GridHelper(planeSize, 50, 0xffffff, 0xffffff);
    grid.position.y = -0.49;
    scene.add(grid);
```

- **Line Breakdown**:
  - `const planeSize = 100;`
    - Defines the size of the ground plane (100x100 units).
  - `const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);`
    - **THREE.PlaneGeometry**: Creates a flat rectangular shape (width: 100, height: 100).
  - `const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });`
    - **THREE.MeshBasicMaterial**: A simple material that doesn’t require lighting.
      - `color: 0x808080`: Grey color.
  - `const plane = new THREE.Mesh(planeGeometry, planeMaterial);`
    - **THREE.Mesh**: Combines geometry (shape) and material (appearance) to create a visible object.
  - `plane.rotation.x = -Math.PI / 2;`
    - Rotates the plane 90° around the x-axis to lie flat (π/2 radians = 90°).
  - `plane.position.y = -0.5;`
    - Positions the plane slightly below the building (y = -0.5).
  - `scene.add(plane);`
    - Adds the plane to the scene.
  - `const grid = new THREE.GridHelper(planeSize, 50, 0xffffff, 0xffffff);`
    - **THREE.GridHelper**: Adds a grid overlay for visual reference.
      - `planeSize`: Grid size (100x100).
      - `50`: Number of grid divisions.
      - `0xffffff`: Color of grid lines (white).
  - `grid.position.y = -0.49;`
    - Positions the grid just above the plane to avoid overlapping issues.
  - `scene.add(grid);`
    - Adds the grid to the scene.

---

## Floors and Windows

```jsx
    const buildingWidth = 15;
    const buildingDepth = 10;
    const floorHeight = 3;
    const beigeColor = 0xd2b48c;

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

      // Floor separation line
      const edges = new THREE.EdgesGeometry(floorGeometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x808080 }));
      line.position.y = i * floorHeight;
      line.userData = { type: 'line' };
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
    }
```

- **Line Breakdown**:
  - `const buildingWidth = 15; const buildingDepth = 10; const floorHeight = 3; const beigeColor = 0xd2b48c;`
    - Defines constants for the building’s dimensions and color.
  - `for (let i = 0; i < 10; i++) {`
    - Loops 10 times to create 10 floors.
  - `const floorGeometry = new THREE.BoxGeometry(buildingWidth, floorHeight, buildingDepth);`
    - **THREE.BoxGeometry**: Creates a 3D rectangular box for each floor.
  - `const floorMaterial = new THREE.MeshPhongMaterial({ color: beigeColor, transparent: true, opacity: 0.8 });`
    - **THREE.MeshPhongMaterial**: A material that reflects light realistically.
      - `transparent: true, opacity: 0.8`: Makes floors slightly see-through.
  - `const floor = new THREE.Mesh(floorGeometry, floorMaterial);`
    - Creates the floor mesh.
  - `floor.position.y = i * floorHeight;`
    - Stacks floors vertically (e.g., 0, 3, 6, ...).
  - `floor.userData = { type: 'floor', floorIndex: i };`
    - Adds metadata to identify floors during raycasting.
  - `buildingGroup.add(floor);`
    - Adds the floor to the group.
  - `const edges = new THREE.EdgesGeometry(floorGeometry);`
    - **THREE.EdgesGeometry**: Extracts the edges of the floor’s shape.
  - `const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x808080 }));`
    - **THREE.LineSegments**: Renders the edges as grey lines.
  - `line.position.y = i * floorHeight; line.userData = { type: 'line' }; buildingGroup.add(line);`
    - Positions and adds the line to the group.
  - `const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x4682b4, transparent: true, opacity: 0.6 });`
    - Blue, semi-transparent material for windows.
  - `const windowGeometry = new THREE.PlaneGeometry(2, 1.5);`
    - Flat rectangles (2x1.5 units) for windows.
  - Front/back and side window loops create windows on all sides, positioned and rotated accordingly, then added to `buildingGroup` and `windows`.

---

## Floor Plans

```jsx
    for (let i = 0; i < 10; i++) {
      const westPlan = createFloorPlan(-buildingWidth / 4, i * floorHeight, 'west', i);
      const eastPlan = createFloorPlan(buildingWidth / 4, i * floorHeight, 'east', i);
      floorPlans.push({ west: westPlan, east: eastPlan, floor: i });
    }

    scene.add(buildingGroup);
```

- **Line Breakdown**:
  - Loops to create west and east floor plans for each of the 10 floors.
  - `const westPlan = createFloorPlan(-buildingWidth / 4, i * floorHeight, 'west', i);`
    - Calls `createFloorPlan` (defined later) to generate a floor plan group.
  - `floorPlans.push({ west: westPlan, east: eastPlan, floor: i });`
    - Stores each floor’s plans in the `floorPlans` array.
  - `scene.add(buildingGroup);`
    - Adds the entire building (floors, windows, etc.) to the scene.

---

### createFloorPlan Function

```jsx
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

      // Internal rooms (simplified for brevity)
      const roomMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true });
      if (floorNum % 2 === 0) {
        // Even floors: Living room, bedroom, bathroom (example layout)
      } else {
        // Odd floors: Living room, two bedrooms (example layout)
      }

      const adjustedXOffset = side === 'west' ? -buildingWidth / 4 - 0.25 : buildingWidth / 4 + 0.25;
      planGroup.position.set(adjustedXOffset, yPos + 0.1, 0);
      planGroup.visible = false;
      scene.add(planGroup);
      return planGroup;
    }
```

- **Line Breakdown**:
  - Defines a function to create a floor plan group with a floor, walls, and rooms.
  - `const planGroup = new THREE.Group();`
    - Groups all floor plan elements.
  - Creates a flat floor and wireframe walls/rooms, positioned based on `side` (west/east).
  - `planGroup.visible = false;`
    - Hides the floor plan until clicked.
  - Adds the group to the scene and returns it.

---

## Raycasting and Interaction

```jsx
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentPlan = null;
    let initialCameraPos = camera.position.clone();
    let initialCameraTarget = controls.target.clone();

    function onMouseClick(event) {
      if (!isMounted) return;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 - 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingGroup.children, true);

      const floorIntersect = intersects.find((intersect) => intersect.object.userData.type === 'floor');

      if (!floorIntersect) {
        console.warn('No floor intersected.');
        return;
      }

      const floorIndex = floorIntersect.object.userData.floorIndex;
      if (typeof floorIndex !== 'number' || !floorPlans[floorIndex]) {
        console.error('Invalid floorIndex or floorPlans entry:', floorIndex);
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
```

- **Line Breakdown**:
  - `const raycaster = new THREE.Raycaster();`
    - **THREE.Raycaster**: Detects where a ray (like a laser pointer) intersects objects, used for mouse clicks.
  - `const mouse = new THREE.Vector2();`
    - **THREE.Vector2**: A 2D vector for mouse coordinates.
  - `let currentPlan = null; let initialCameraPos = camera.position.clone(); let initialCameraTarget = controls.target.clone();`
    - Tracks the current floor plan and stores the initial camera state.
  - `function onMouseClick(event) {`
    - Handles mouse clicks.
  - Converts click coordinates to normalized values (-1 to 1).
  - `raycaster.setFromCamera(mouse, camera);`
    - Casts a ray from the camera through the mouse position.
  - `const intersects = raycaster.intersectObjects(buildingGroup.children, true);`
    - Finds all intersected objects in `buildingGroup`.
  - Filters for floors, determines the clicked floor and side, shows the floor plan, hides the building, and animates the camera.

---

## Camera Animation

```jsx
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
```

- **Line Breakdown**:
  - Smoothly moves the camera from `startPos` to `endPos` over `duration` milliseconds.
  - `camera.position.lerpVectors(startPos, endPos, t);`
    - **lerpVectors**: Interpolates between two positions.
  - `requestAnimationFrame(update);`
    - Loops the animation efficiently.

---

## Back Button

```jsx
    let backButton = null;
    function showBackButton() {
      if (backButton) backButton.remove();
      backButton = document.createElement('button');
      backButton.innerHTML = '<';
      // Styling omitted for brevity
      backButton.onclick = () => {
        if (currentPlan) {
          currentPlan.visible = false;
          currentPlan = null;
        }
        buildingGroup.visible = true;
        animateCamera(camera.position, initialCameraPos, 1000);
        controls.target.copy(initialCameraTarget);
        controls.update();
        if (backButton) backButton.remove();
      };
      document.body.appendChild(backButton);
    }
```

- **Line Breakdown**:
  - Creates and styles a back button that, when clicked, hides the floor plan, shows the building, and resets the camera.

---

## Event Listeners

```jsx
    window.addEventListener('click', onMouseClick);

    const onWindowResize = () => {
      if (!isMounted) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);
```

- **Line Breakdown**:
  - Adds listeners for clicks (raycasting) and window resizing (updates camera and renderer).

---

## Animation Loop

```jsx
    function animate() {
      if (!isMounted) return;
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
```

- **Line Breakdown**:
  - `requestAnimationFrame(animate);`
    - Runs the animation loop continuously.
  - `renderer.render(scene, camera);`
    - Renders the scene each frame.

---

## Cleanup

```jsx
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
```

- **Line Breakdown**:
  - `return () => {`
    - The cleanup function for `useEffect`, runs when the component unmounts.
  - Removes event listeners, the back button, and the renderer’s canvas, then frees WebGL resources with `renderer.dispose()`.
  - `}, []);`
    - Empty dependency array—`useEffect` runs only once on mount.

---

## Error Boundary

```jsx
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
```

- **Line Breakdown**:
  - A class component that catches errors in `BuildingComponent` and shows a fallback UI.

---

## Export

```jsx
export default function WrappedBuildingComponent() {
  return (
    <BuildingErrorBoundary>
      <div ref={mountRef} />
      <BuildingComponent />
    </BuildingErrorBoundary>
  );
}
```

- **Line Breakdown**:
  - Exports a wrapper component that includes the error boundary and a `<div>` for `mountRef`.

---

This file covers every line of `BuildingComponent.jsx`, explaining React hooks and Three.js features in detail. Let me know if you need more clarification!
