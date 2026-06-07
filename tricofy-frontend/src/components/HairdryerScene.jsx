import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Center } from "@react-three/drei";

function HairdryerModel() {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/hairdryer.glb");
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (mouse.current.x * 0.5 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x +=
        (-mouse.current.y * 0.25 - groupRef.current.rotation.x) * 0.04;
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.6) * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={0.3} position={[0, -3, 0]}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export default function HairdryerScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 200], fov: 35 }}

      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} />
      <pointLight position={[0, 3, 3]} intensity={1} color="#ffd6e0" />
      <pointLight position={[-3, -3, 3]} intensity={0.6} color="#a855f7" />
      <Suspense fallback={null}>
        <HairdryerModel />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/models/hairdryer.glb");
