/* 404 page interactive cube physics demo (three.js + cannon.js). */
(function () {
  'use strict';

  function init() {
    if (typeof THREE === 'undefined' || typeof CANNON === 'undefined') {
      console.warn('[404-cube] THREE or CANNON not available; skipping animation.');
      return;
    }

    const container = document.getElementById('animation-container');
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();

    const viewSize = 12;
    let aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2,
      (viewSize * aspect) / 2,
      viewSize / 2,
      -viewSize / 2,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const purpleLight = new THREE.PointLight(0x9370db, 1, 15);
    purpleLight.position.set(-3, 5, -3);
    scene.add(purpleLight);

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x6495ed,
      metalness: 0.3,
      roughness: 0.5,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    scene.add(floor);

    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    // Use finite box walls (not infinite planes) so the cube cannot tunnel out.
    function createWallBody(x, z, isXWall) {
      const wallThickness = 0.5;
      const wallHeight = 50;

      const xSize = isXWall ? wallThickness : 10;
      const zSize = isXWall ? 10 : wallThickness;

      const wallShape = new CANNON.Box(
        new CANNON.Vec3(xSize / 2, wallHeight / 2, zSize / 2)
      );
      const wallBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x, wallHeight / 2 - 2, z),
      });
      wallBody.addShape(wallShape);
      world.addBody(wallBody);
    }

    // North/South/East/West walls (offset by half thickness from floor edges).
    createWallBody(0, 5 + 0.25, false);
    createWallBody(0, -5 - 0.25, false);
    createWallBody(5 + 0.25, 0, true);
    createWallBody(-5 - 0.25, 0, true);

    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const cubeBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 5, 0),
      shape: cubeShape,
    });
    cubeBody.linearDamping = 0.3;
    cubeBody.angularDamping = 0.3;
    world.addBody(cubeBody);

    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, -2, 0),
    });
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floorBody);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let mouseJointBody;
    let constraint;

    container.addEventListener('mousedown', function (event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);

      if (intersects.length > 0) {
        isDragging = true;

        mouseJointBody = new CANNON.Body({ mass: 0 });
        world.addBody(mouseJointBody);

        const hitPoint = intersects[0].point;
        const localPoint = new CANNON.Vec3().copy(hitPoint).vsub(cubeBody.position);

        constraint = new CANNON.PointToPointConstraint(
          cubeBody,
          localPoint,
          mouseJointBody,
          new CANNON.Vec3(0, 0, 0)
        );

        world.addConstraint(constraint);
      }
    });

    container.addEventListener('mousemove', function (event) {
      if (!isDragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const worldPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, worldPoint);

      // Keep the cube center inside wall boundaries (cube half-size = 0.5).
      const wallOffset = 5.25;
      const cubeRadius = 0.5;
      const maxPos = wallOffset - cubeRadius;

      worldPoint.x = Math.max(Math.min(worldPoint.x, maxPos), -maxPos);
      worldPoint.y = Math.max(worldPoint.y, -1.5);
      worldPoint.z = Math.max(Math.min(worldPoint.z, maxPos), -maxPos);

      mouseJointBody.position.copy(worldPoint);
    });

    container.addEventListener('mouseup', function () {
      if (isDragging) {
        world.removeConstraint(constraint);
        world.removeBody(mouseJointBody);
        isDragging = false;
      }
    });

    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);

    const timeStep = 1 / 60;
    function animate() {
      requestAnimationFrame(animate);

      world.step(timeStep);

      cube.position.copy(cubeBody.position);
      cube.quaternion.copy(cubeBody.quaternion);

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', function () {
      aspect = container.clientWidth / container.clientHeight;
      camera.left = (-viewSize * aspect) / 2;
      camera.right = (viewSize * aspect) / 2;
      camera.top = viewSize / 2;
      camera.bottom = -viewSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
