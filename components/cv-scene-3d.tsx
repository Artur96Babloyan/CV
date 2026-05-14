"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  MeshTransmissionMaterial,
  Sparkles,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const SECTION_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
] as const;

function toColor(hex: string) {
  return new THREE.Color(hex);
}

function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.35, 6.1));
  useFrame(() => {
    const p = scrollProgress;
    target.current.set(
      Math.sin(p * Math.PI * 1.75) * 0.95,
      0.25 + p * 0.85,
      5.4 + Math.cos(p * Math.PI) * 0.55,
    );
    camera.position.lerp(target.current, 0.065);
    camera.lookAt(0, 0.05, 0);
  });
  return null;
}

function StageLights({
  sectionIndex,
  scrollProgress,
}: {
  sectionIndex: number;
  scrollProgress: number;
}) {
  const key = sectionIndex % SECTION_COLORS.length;
  const next = (sectionIndex + 1) % SECTION_COLORS.length;
  const accent = useMemo(() => toColor(SECTION_COLORS[key]), [key]);
  const accent2 = useMemo(() => toColor(SECTION_COLORS[next]), [next]);

  const pulse = 45 + scrollProgress * 85 + sectionIndex * 8;

  return (
    <>
      <color attach="background" args={["#05080d"]} />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#b8c5ff", "#0a1628", 0.35]} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.15}
        color="#e8f0ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
      />
      <directionalLight
        position={[-8, 4, -2]}
        intensity={0.35}
        color={accent2}
      />
      <pointLight
        position={[-4.5, 1.2, 3.5]}
        intensity={pulse}
        color={accent}
        decay={2}
        distance={28}
      />
      <pointLight
        position={[4.2, -1.5, 3]}
        intensity={38 + sectionIndex * 6}
        color="#60a5fa"
        decay={2}
        distance={22}
      />
      <spotLight
        position={[0, 8.5, 1.2]}
        angle={0.52}
        penumbra={0.92}
        intensity={120 + scrollProgress * 90}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        position={[0, -2.5, 5]}
        intensity={25}
        color="#1e3a5f"
        decay={2}
        distance={18}
      />
    </>
  );
}

function HeroForm({
  sectionIndex,
  scrollProgress,
}: {
  sectionIndex: number;
  scrollProgress: number;
}) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const hue = (sectionIndex / SECTION_COLORS.length) * 0.12;

  const outerColor = useMemo(() => {
    const c = toColor(SECTION_COLORS[sectionIndex % SECTION_COLORS.length]);
    c.offsetHSL(0, 0, -0.08);
    return c;
  }, [sectionIndex]);

  const emissiveColor = useMemo(
    () => toColor(SECTION_COLORS[(sectionIndex + 2) % SECTION_COLORS.length]),
    [sectionIndex],
  );

  const innerColor = useMemo(
    () => new THREE.Color().setHSL(0.58 + hue, 0.45, 0.72),
    [hue],
  );

  useFrame((_, delta) => {
    if (!group.current || !inner.current) return;
    group.current.rotation.y += delta * (0.28 + scrollProgress * 0.12);
    inner.current.rotation.x += delta * 0.18;
    inner.current.rotation.z += delta * 0.11;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.55}>
      <group ref={group}>
        <mesh castShadow receiveShadow>
          <torusKnotGeometry args={[1.05, 0.3, 280, 40]} />
          <meshPhysicalMaterial
            color={outerColor}
            emissive={emissiveColor}
            emissiveIntensity={0.45 + scrollProgress * 0.5}
            metalness={0.88}
            roughness={0.14}
            clearcoat={1}
            clearcoatRoughness={0.12}
            iridescence={0.35}
            iridescenceIOR={1.2}
            iridescenceThicknessRange={[80, 220]}
          />
        </mesh>
        <mesh ref={inner} scale={0.42} position={[0.15, 0.2, 0.35]} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            resolution={256}
            transmission={0.92}
            roughness={0.18}
            thickness={0.85}
            ior={1.55}
            chromaticAberration={0.12}
            anisotropy={0.22}
            color={innerColor}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({
  sectionIndex,
  scrollProgress,
}: {
  sectionIndex: number;
  scrollProgress: number;
}) {
  const sparkleColor = SECTION_COLORS[sectionIndex % SECTION_COLORS.length];
  const count = 96 + sectionIndex * 10;

  return (
    <>
      <CameraRig scrollProgress={scrollProgress} />
      <StageLights
        sectionIndex={sectionIndex}
        scrollProgress={scrollProgress}
      />
      <HeroForm sectionIndex={sectionIndex} scrollProgress={scrollProgress} />
      <Sparkles
        count={count}
        scale={[9, 6, 5]}
        size={2.2}
        speed={0.35}
        opacity={0.42}
        color={sparkleColor}
      />
      <ContactShadows
        position={[0, -1.48, 0]}
        opacity={0.55}
        scale={14}
        blur={2.4}
        far={5}
        color="#020617"
      />
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
    </>
  );
}

export function CvScene3d({
  sectionIndex,
  scrollProgress,
  disabled,
}: {
  sectionIndex: number;
  scrollProgress: number;
  disabled: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (disabled || !mounted) {
    return (
      <div
        className="play-3d-fallback"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${SECTION_COLORS[sectionIndex % SECTION_COLORS.length]}33, transparent 65%), #05080d`,
        }}
      />
    );
  }

  return (
    <div className="play-3d-canvas-wrap" aria-hidden>
      <Canvas
        shadows
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0.35, 6.1], fov: 40, near: 0.1, far: 80 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene sectionIndex={sectionIndex} scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
