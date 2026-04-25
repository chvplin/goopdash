"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useLocalGame } from "./localGame";

function PlayerPawn() {
  const ref = useRef<THREE.Mesh>(null);
  const { player, loot, tick } = useLocalGame();
  const keys = useRef({ w: false, a: false, s: false, d: false, e: false, shift: false });

  useFrame((_, delta) => {
    const move = {
      x: (keys.current.d ? 1 : 0) - (keys.current.a ? 1 : 0),
      y: (keys.current.s ? 1 : 0) - (keys.current.w ? 1 : 0)
    };
    tick(delta * 1000, move, keys.current.shift, keys.current.e);
    keys.current.e = false;
    if (ref.current) {
      ref.current.position.set(player.position.x, 0.8, player.position.y);
    }
  });

  return (
    <KeyboardControls
      map={[
        { name: "w", keys: ["KeyW"] },
        { name: "a", keys: ["KeyA"] },
        { name: "s", keys: ["KeyS"] },
        { name: "d", keys: ["KeyD"] },
        { name: "e", keys: ["KeyE"] },
        { name: "shift", keys: ["ShiftLeft"] }
      ]}
      onChange={(name, pressed) => {
        if (name in keys.current) {
          (keys.current as Record<string, boolean>)[name] = pressed;
        }
      }}
    >
      <mesh ref={ref} castShadow>
        <capsuleGeometry args={[0.55, 1, 4, 8]} />
        <meshStandardMaterial color="#4a7dff" />
      </mesh>
      {loot
        .filter((item) => !item.deposited)
        .map((item) => (
          <mesh key={item.id} position={[item.position.x, 0.35, item.position.y]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={item.carriedByPlayerId ? "#f1b400" : "#3cdf8d"} />
          </mesh>
        ))}
    </KeyboardControls>
  );
}

function ArenaGeometry() {
  const obstacles = useMemo(
    () => [
      { x: -8, z: -6, w: 2, h: 1, d: 4 },
      { x: 6, z: 7, w: 3, h: 1, d: 2 },
      { x: 0, z: -8, w: 8, h: 1, d: 1 }
    ],
    []
  );

  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 45]} />
        <meshStandardMaterial color="#dceaff" />
      </mesh>
      {obstacles.map((obs) => (
        <mesh key={`${obs.x}-${obs.z}`} position={[obs.x, obs.h / 2, obs.z]} castShadow receiveShadow>
          <boxGeometry args={[obs.w, obs.h, obs.d]} />
          <meshStandardMaterial color="#c6d1e8" />
        </mesh>
      ))}
    </>
  );
}

export function ArenaScene() {
  return (
    <Canvas shadows camera={{ position: [-18, 22, 18], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight castShadow position={[6, 15, 6]} intensity={0.9} />
      <ArenaGeometry />
      <PlayerPawn />
      <OrbitControls enablePan={false} enableRotate={false} minDistance={25} maxDistance={40} />
    </Canvas>
  );
}
