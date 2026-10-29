/**
 * three-bg.js — Persistent Three.js Background Canvas
 * Floating wireframe geometry, interactive particle field, dynamic lighting.
 * Fully optimized for mobile: battery-safe DPR, touch deflection, and tab sleep.
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
    setTimeout(function () { clearInterval(t); }, 5000);
  }

  waitForThree(function () { init3D(); });

  function init3D() {
    var canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // --- Detect mobile / touch environment ---
    var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;
    var isMobile = isTouch || window.innerWidth < 768;

    // --- Renderer: 1.0 DPR on mobile saves enormous GPU fillrate & battery ---
    var dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

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

    var COLORS_LIGHT = {
      skyBlue:  0x0284C7,
      blue:     0x1D4ED8,
      purple:   0x6D28D9,
      cyan:     0x0EA5E9
    };

    function getColors() {
      return isDark() ? COLORS : COLORS_LIGHT;
    }

    // --- Floating Geometry (tuned down on mobile) ---
    var geometries = [];
    var geoGroup = new THREE.Group();
    scene.add(geoGroup);

    var geoCount = isMobile ? 6 : 22;
    var geoTypes = ['icosa', 'octa', 'torus', 'dodeca'];
    var colorKeys = Object.keys(COLORS);

    for (var i = 0; i < geoCount; i++) {
      var type = geoTypes[i % geoTypes.length];
      var geo;
      var scale = isMobile ? (0.4 + Math.random() * 1.0) : (0.5 + Math.random() * 1.5);

      switch (type) {
        case 'icosa':
          geo = new THREE.IcosahedronGeometry(scale, 0);
          break;
        case 'octa':
          geo = new THREE.OctahedronGeometry(scale, 0);
          break;
        case 'torus':
          geo = new THREE.TorusKnotGeometry(scale * 0.6, scale * 0.15, isMobile ? 16 : 32, 4);
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
        opacity: isDark() ? (isMobile ? 0.08 : 0.10) : 0.03
      });

      var mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        (Math.random() - 0.5) * (isMobile ? 35 : 60),
        (Math.random() - 0.5) * (isMobile ? 30 : 40),
        (Math.random() - 0.5) * 25 - 8
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      mesh.userData = {
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.003,
          y: (Math.random() - 0.5) * 0.003,
          z: (Math.random() - 0.5) * 0.002
        },
        drift: {
          x: (Math.random() - 0.5) * 0.004,
          y: (Math.random() - 0.5) * 0.003
        },
        colorKey: colorKey,
        originalPos: mesh.position.clone()
      };

      geoGroup.add(mesh);
      geometries.push(mesh);
    }

    // --- Particle Field (60 on mobile vs 400 on desktop) ---
    var particleCount = isMobile ? 60 : 400;
    var particleGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    var velocities = [];

    for (var i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * (isMobile ? 40 : 80);
      positions[i * 3 + 1] = (Math.random() - 0.5) * (isMobile ? 40 : 60);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      velocities.push({
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.005
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var particleMat = new THREE.PointsMaterial({
      color: isDark() ? COLORS.cyan : COLORS_LIGHT.skyBlue,
      size: isMobile ? 0.09 : 0.07,
      transparent: true,
      opacity: isDark() ? (isMobile ? 0.35 : 0.4) : 0.16,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Dynamic Orbiting Lights ---
    var light1 = new THREE.PointLight(COLORS.skyBlue, isDark() ? 0.8 : 0.2, 50);
    light1.position.set(10, 10, 10);
    scene.add(light1);

    var light2 = new THREE.PointLight(COLORS.purple, isDark() ? 0.5 : 0.1, 50);
    light2.position.set(-10, -10, 5);
    scene.add(light2);

    // --- Pointer & Touch Tracking ---
    var pointer = { x: 0, y: 0, active: false };
    var pointerNDC = { x: 0, y: 0 };

    function updatePointer(clientX, clientY) {
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.active = true;
      pointerNDC.x = (clientX / window.innerWidth) * 2 - 1;
      pointerNDC.y = -(clientY / window.innerHeight) * 2 + 1;
    }

    window.addEventListener('mousemove', function (e) {
      updatePointer(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      pointer.active = false;
    });

    // Touch support: swipe gently deflects 3D particles on mobile
    window.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', function () {
      pointer.active = false;
    }, { passive: true });

    // --- Resize handling (debounced) ---
    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 100);
    }
    window.addEventListener('resize', onResize);

    // --- Theme observer ---
    var themeObserver = new MutationObserver(function () {
      var dark = isDark();
      var cols = getColors();
      geometries.forEach(function (m) {
        m.material.opacity = dark ? (isMobile ? 0.08 : 0.10) : 0.03;
        m.material.color.setHex(cols[m.userData.colorKey]);
      });
      particleMat.opacity = dark ? (isMobile ? 0.35 : 0.4) : 0.16;
      particleMat.color.setHex(dark ? COLORS.cyan : COLORS_LIGHT.skyBlue);
      light1.intensity = dark ? 0.8 : 0.2;
      light2.intensity = dark ? 0.5 : 0.1;
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // --- Visibility / Sleep handling (Save mobile battery when tab is backgrounded) ---
    var clock = new THREE.Clock();
    var animId = null;

    function startLoop() {
      if (!animId) {
        clock.start();
        animate();
      }
    }

    function stopLoop() {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    });

    // --- Animation Loop ---
    function animate() {
      animId = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      // Rotate and drift geometry
      for (var i = 0; i < geometries.length; i++) {
        var m = geometries[i];
        m.rotation.x += m.userData.rotSpeed.x;
        m.rotation.y += m.userData.rotSpeed.y;
        m.rotation.z += m.userData.rotSpeed.z;

        m.position.x = m.userData.originalPos.x + Math.sin(t * 0.25 + i) * (isMobile ? 0.8 : 1.5);
        m.position.y = m.userData.originalPos.y + Math.cos(t * 0.2 + i * 0.7) * (isMobile ? 0.6 : 1.2);

        if (pointer.active) {
          m.rotation.y += pointerNDC.x * 0.001;
          m.rotation.x += pointerNDC.y * 0.0006;
        }
      }

      // Animate particles
      var posArr = particleGeo.attributes.position.array;
      var boundX = isMobile ? 25 : 40;
      var boundY = isMobile ? 25 : 30;

      for (var i = 0; i < particleCount; i++) {
        var idx = i * 3;
        posArr[idx]     += velocities[i].x;
        posArr[idx + 1] += velocities[i].y;
        posArr[idx + 2] += velocities[i].z;

        if (posArr[idx] > boundX) posArr[idx] = -boundX;
        if (posArr[idx] < -boundX) posArr[idx] = boundX;
        if (posArr[idx + 1] > boundY) posArr[idx + 1] = -boundY;
        if (posArr[idx + 1] < -boundY) posArr[idx + 1] = boundY;
        if (posArr[idx + 2] > 20) posArr[idx + 2] = -20;
        if (posArr[idx + 2] < -20) posArr[idx + 2] = 20;

        if (pointer.active) {
          var worldX = pointerNDC.x * (isMobile ? 18 : 25);
          var worldY = pointerNDC.y * (isMobile ? 14 : 18);
          var dx = posArr[idx] - worldX;
          var dy = posArr[idx + 1] - worldY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 6) {
            var force = (6 - dist) / 6 * 0.05;
            posArr[idx] += (dx / dist) * force;
            posArr[idx + 1] += (dy / dist) * force;
          }
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Orbit lights gently
      light1.position.x = Math.cos(t * 0.2) * 15;
      light1.position.y = Math.sin(t * 0.3) * 10;

      light2.position.x = Math.sin(t * 0.18) * 12;
      light2.position.y = Math.cos(t * 0.25) * 8;

      if (pointer.active && !isMobile) {
        camera.position.x += (pointerNDC.x * 1.5 - camera.position.x) * 0.015;
        camera.position.y += (pointerNDC.y * 1 - camera.position.y) * 0.015;
      }
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    startLoop();

    // --- Cleanup ---
    window.addEventListener('beforeunload', function () {
      stopLoop();
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
