/**
 * three-bg.js — Persistent Three.js Background Canvas
 * Floating wireframe geometry, interactive particle field, dynamic lighting.
 * Reacts to mouse movement and adapts to dark/light theme.
 */
(function () {
  'use strict';

  // Bail on reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Wait for Three.js to load
  function waitForThree(cb) {
    if (typeof THREE !== 'undefined') return cb();
    var t = setInterval(function () {
      if (typeof THREE !== 'undefined') { clearInterval(t); cb(); }
    }, 50);
    setTimeout(function () { clearInterval(t); }, 5000); // give up after 5s
  }

  waitForThree(function () { init3D(); });

  function init3D() {
    var canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // --- Renderer ---
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // --- Detect mobile ---
    var isMobile = window.innerWidth < 768;

    // --- Theme detection ---
    function isDark() {
      return document.documentElement.getAttribute('data-theme') !== 'light';
    }

    // --- Colors ---
    var COLORS = {
      skyBlue:  0x0EA5E9,
      blue:     0x2563EB,
      purple:   0x818CF8,
      cyan:     0x3ED2FF
    };

    // Light mode colors — more subtle blues
    var COLORS_LIGHT = {
      skyBlue:  0x0284C7,
      blue:     0x1D4ED8,
      purple:   0x6D28D9,
      cyan:     0x0EA5E9
    };

    function getColors() {
      return isDark() ? COLORS : COLORS_LIGHT;
    }

    // --- Floating Geometry ---
    var geometries = [];
    var geoGroup = new THREE.Group();
    scene.add(geoGroup);

    var geoCount = isMobile ? 10 : 22;
    var geoTypes = ['icosa', 'octa', 'torus', 'dodeca'];
    var colorKeys = Object.keys(COLORS);

    for (var i = 0; i < geoCount; i++) {
      var type = geoTypes[i % geoTypes.length];
      var geo;
      var scale = 0.5 + Math.random() * 1.5;

      switch (type) {
        case 'icosa':
          geo = new THREE.IcosahedronGeometry(scale, 0);
          break;
        case 'octa':
          geo = new THREE.OctahedronGeometry(scale, 0);
          break;
        case 'torus':
          geo = new THREE.TorusKnotGeometry(scale * 0.6, scale * 0.15, 32, 6);
          break;
        case 'dodeca':
          geo = new THREE.DodecahedronGeometry(scale, 0);
          break;
      }

      var colorKey = colorKeys[i % colorKeys.length];
      var mat = new THREE.MeshBasicMaterial({
        color: getColors()[colorKey],
        wireframe: true,
        transparent: true,
        opacity: isDark() ? 0.10 : 0.04
      });

      var mesh = new THREE.Mesh(geo, mat);

      // Random position in a wide area
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30 - 10
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      mesh.userData = {
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.004,
          y: (Math.random() - 0.5) * 0.004,
          z: (Math.random() - 0.5) * 0.002
        },
        drift: {
          x: (Math.random() - 0.5) * 0.006,
          y: (Math.random() - 0.5) * 0.004
        },
        colorKey: colorKey,
        originalPos: mesh.position.clone()
      };

      geoGroup.add(mesh);
      geometries.push(mesh);
    }

    // --- Particle Field ---
    var particleCount = isMobile ? 150 : 400;
    var particleGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    var velocities = [];

    for (var i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
      velocities.push({
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.006
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var particleMat = new THREE.PointsMaterial({
      color: isDark() ? COLORS.cyan : COLORS_LIGHT.skyBlue,
      size: 0.07,
      transparent: true,
      opacity: isDark() ? 0.4 : 0.18,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Dynamic Lights (visual only for potential future MeshStandard use) ---
    var light1 = new THREE.PointLight(COLORS.skyBlue, isDark() ? 0.8 : 0.2, 50);
    light1.position.set(10, 10, 10);
    scene.add(light1);

    var light2 = new THREE.PointLight(COLORS.purple, isDark() ? 0.5 : 0.1, 50);
    light2.position.set(-10, -10, 5);
    scene.add(light2);

    // --- Mouse tracking ---
    var mouse = { x: 0, y: 0, active: false };
    var mouseNDC = { x: 0, y: 0 };

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    document.addEventListener('mouseleave', function () {
      mouse.active = false;
    });

    // --- Resize ---
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    onResize();
    window.addEventListener('resize', onResize);

    // --- Theme observer ---
    var themeObserver = new MutationObserver(function () {
      var dark = isDark();
      var cols = getColors();
      geometries.forEach(function (m) {
        m.material.opacity = dark ? 0.10 : 0.04;
        m.material.color.setHex(cols[m.userData.colorKey]);
      });
      particleMat.opacity = dark ? 0.4 : 0.18;
      particleMat.color.setHex(dark ? COLORS.cyan : COLORS_LIGHT.skyBlue);
      light1.intensity = dark ? 0.8 : 0.2;
      light2.intensity = dark ? 0.5 : 0.1;
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // --- Animation Loop ---
    var clock = new THREE.Clock();
    var animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      // Rotate and drift geometry
      for (var i = 0; i < geometries.length; i++) {
        var m = geometries[i];
        m.rotation.x += m.userData.rotSpeed.x;
        m.rotation.y += m.userData.rotSpeed.y;
        m.rotation.z += m.userData.rotSpeed.z;

        // Gentle floating drift
        m.position.x = m.userData.originalPos.x + Math.sin(t * 0.25 + i) * 1.5;
        m.position.y = m.userData.originalPos.y + Math.cos(t * 0.2 + i * 0.7) * 1.2;

        // Mouse influence on geometry rotation
        if (mouse.active) {
          m.rotation.y += mouseNDC.x * 0.0015;
          m.rotation.x += mouseNDC.y * 0.0008;
        }
      }

      // Animate particles
      var posArr = particleGeo.attributes.position.array;
      for (var i = 0; i < particleCount; i++) {
        var idx = i * 3;
        posArr[idx]     += velocities[i].x;
        posArr[idx + 1] += velocities[i].y;
        posArr[idx + 2] += velocities[i].z;

        // Wrap around bounds
        if (posArr[idx] > 40) posArr[idx] = -40;
        if (posArr[idx] < -40) posArr[idx] = 40;
        if (posArr[idx + 1] > 30) posArr[idx + 1] = -30;
        if (posArr[idx + 1] < -30) posArr[idx + 1] = 30;
        if (posArr[idx + 2] > 20) posArr[idx + 2] = -20;
        if (posArr[idx + 2] < -20) posArr[idx + 2] = 20;

        // Mouse repulsion on particles
        if (mouse.active) {
          var worldX = mouseNDC.x * 25;
          var worldY = mouseNDC.y * 18;
          var dx = posArr[idx] - worldX;
          var dy = posArr[idx + 1] - worldY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 6) {
            var force = (6 - dist) / 6 * 0.06;
            posArr[idx] += (dx / dist) * force;
            posArr[idx + 1] += (dy / dist) * force;
          }
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Orbit lights gently
      light1.position.x = Math.cos(t * 0.2) * 15;
      light1.position.y = Math.sin(t * 0.3) * 10;
      light1.position.z = Math.sin(t * 0.15) * 6 + 10;

      light2.position.x = Math.sin(t * 0.18) * 12;
      light2.position.y = Math.cos(t * 0.25) * 8;
      light2.position.z = Math.cos(t * 0.1) * 5 + 8;

      // Subtle camera sway from mouse
      if (mouse.active) {
        camera.position.x += (mouseNDC.x * 1.5 - camera.position.x) * 0.015;
        camera.position.y += (mouseNDC.y * 1 - camera.position.y) * 0.015;
      }
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    // --- Cleanup on page unload ---
    window.addEventListener('beforeunload', function () {
      cancelAnimationFrame(animId);
      themeObserver.disconnect();

      geometries.forEach(function (m) {
        m.geometry.dispose();
        m.material.dispose();
      });
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    });
  }
})();
