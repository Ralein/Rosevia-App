"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ThreeSkinSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;

    // Detect mobile for performance tuning
    const isMobile = window.innerWidth < 768;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // Check active theme
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("rosevia_theme") : null;
    const isPink = savedTheme === "Rose Quartz Luxury";

    // Dynamic colors based on theme
    const ambientColorValue = isPink ? 0x251117 : 0x111c18;
    const keyLightColorValue = isPink ? 0xe8c1c8 : 0xd4af37;
    const accentLightColorValue = isPink ? 0xe07a9a : 0x688a7d;
    const sphereColorValue = isPink ? 0x251117 : 0x111c18;
    const sheenColorValue = isPink ? 0xe8c1c8 : 0xd4af37;
    const particleColor1Value = isPink ? 0xe8c1c8 : 0xd4af37;
    const particleColor2Value = isPink ? 0xe07a9a : 0x688a7d;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Position camera differently depending on screen width
    camera.position.z = isMobile ? 8.5 : 6.5;
    camera.position.y = 0;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(ambientColorValue, 1.2); // Theme-based ambient
    scene.add(ambientLight);

    // Warm Gold/Rose Gold Key Light
    const dirLight1 = new THREE.DirectionalLight(keyLightColorValue, 2.5);
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    // Soft Sage/Rose Quartz Accent Light
    const dirLight2 = new THREE.DirectionalLight(accentLightColorValue, 1.5);
    dirLight2.position.set(-5, -3, 2);
    scene.add(dirLight2);

    // Interactive Point Light (Glows and tracks mouse)
    const interactiveLight = new THREE.PointLight(keyLightColorValue, 0, 15);
    interactiveLight.position.set(0, 0, 2);
    scene.add(interactiveLight);

    // 5. Central Bio-Cell (Organic Morphing Sphere)
    const sphereDetail = isMobile ? 3 : 5; // Lower detail on mobile
    const sphereGeometry = new THREE.IcosahedronGeometry(1.6, sphereDetail);

    // Store original positions for deformation calculations
    const originalPositions = sphereGeometry.attributes.position.clone();

    // Luxury semi-translucent skin cell texture simulation using MeshPhysicalMaterial
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: sphereColorValue,          // Theme-based obsidian base
      roughness: 0.18,
      metalness: 0.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transmission: 0.65,       // Glassmorphism transmission
      thickness: 1.2,           // Refraction thickness
      ior: 1.35,                // Index of refraction
      flatShading: false,
      sheen: 1.0,
      sheenColor: new THREE.Color(sheenColorValue), // Theme velvet highlight
    });

    const bioSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(bioSphere);

    // 6. Floating Molecular Active Particles
    const particleCount = isMobile ? 60 : 160;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);

    // Color palettes for particles (Gold/Rose Gold and Sage Green/Rose Quartz)
    const color1 = new THREE.Color(particleColor1Value);
    const color2 = new THREE.Color(particleColor2Value);

    for (let i = 0; i < particleCount; i++) {
      // Scatter particles in a shell surrounding the central sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const distance = 2.4 + Math.random() * 3.5;
      
      particlePositions[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = distance * Math.cos(phi);

      particleSizes[i] = 0.03 + Math.random() * 0.08;

      // Mix colors randomly between theme colors
      const mixRatio = Math.random();
      const mixedColor = new THREE.Color().lerpColors(color1, color2, mixRatio);
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    // Custom Canvas Texture for perfectly round circular glowing particles
    const createCircleTexture = () => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw round glowing dot
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: createCircleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Hide loader once setup is complete
    setLoading(false);

    // 7. Interactive Mouse Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // 8. Scroll Interactivity
    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // 10. Animation Loop
    const timer = new THREE.Timer();
    let requestID: number;

    const animate = (timestamp?: number) => {
      requestID = requestAnimationFrame(animate);

      timer.update(timestamp);
      const time = timer.getElapsed();

      // Slow orbital rotations
      bioSphere.rotation.y = time * 0.06;
      bioSphere.rotation.z = time * 0.04;
      
      particles.rotation.y = -time * 0.025;
      particles.rotation.x = time * 0.01;

      // Organic cell morphing algorithm (displacing vertices along normals based on time)
      const positionAttribute = sphereGeometry.attributes.position;
      const vertex = new THREE.Vector3();
      const normal = new THREE.Vector3();

      for (let i = 0; i < positionAttribute.count; i++) {
        // Read original vertex position
        vertex.fromBufferAttribute(originalPositions, i);
        
        // Save direction normal (pointing outwards from center)
        normal.copy(vertex).normalize();

        // High fidelity combined sine waves to simulate biological fluid tension
        const wave = 
          Math.sin(vertex.x * 2.2 + time * 1.2) * 
          Math.cos(vertex.y * 1.8 + time * 0.9) * 
          Math.sin(vertex.z * 2.0 + time * 1.5) * 0.12 + 
          Math.sin(vertex.y * 5.0 + time * 2.5) * 0.03; // Micro-surface ripples

        // Displace vertex outward
        vertex.addScaledVector(normal, wave);
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      positionAttribute.needsUpdate = true;
      sphereGeometry.computeVertexNormals();

      // Smooth mouse easing (Lerp) for responsiveness
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Mouse interactive tilt/parallax
      bioSphere.position.x = mouse.x * 0.4;
      bioSphere.position.y = mouse.y * 0.4;
      particles.position.x = mouse.x * 0.25;
      particles.position.y = mouse.y * 0.25;

      // Project interactive point light using coordinates and animate brightness
      if (!isMobile) {
        interactiveLight.intensity = 3.5 + Math.sin(time * 3) * 0.5; // Pulsing intensity
        interactiveLight.position.x = mouse.x * 4.5;
        interactiveLight.position.y = mouse.y * 4.5;
      }

      // Scroll response: translate sphere backwards and down, fading opacity out
      const scrollFactor = Math.min(scrollY / 600, 1.2);
      bioSphere.position.z = -scrollFactor * 2.5;
      bioSphere.position.y = mouse.y * 0.4 - (scrollFactor * 1.2);
      particles.position.z = -scrollFactor * 1.8;

      // Fade out translucent materials when scrolling past hero section
      sphereMaterial.opacity = 1.0 - Math.min(scrollY / 450, 0.95);
      particleMaterial.opacity = 0.75 - Math.min(scrollY / 500, 0.7);

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup logic on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(requestID);
      
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#060D0B]/80 z-20 transition-opacity duration-500">
          <div className="w-10 h-10 border-2 border-rosevia-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-70 transition-opacity duration-1000"
      />
    </div>
  );
}
