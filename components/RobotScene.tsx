'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import type { MissionSnapshot } from '@/lib/types';

function TB3({ snapshot }: {snapshot: MissionSnapshot}) {
  const group=useRef<THREE.Group>(null);
  useFrame((_,delta)=>{
    if (!group.current) return;
    const k=1-Math.exp(-7*delta);
    group.current.position.x=THREE.MathUtils.lerp(group.current.position.x,snapshot.tb3.x,k);
    group.current.position.z=THREE.MathUtils.lerp(group.current.position.z,snapshot.tb3.z,k);
    group.current.rotation.y=THREE.MathUtils.lerp(group.current.rotation.y,-snapshot.tb3.yaw,k);
  });
  return <group ref={group} position={[-3,0.02,0]}>
    <mesh position={[0,.25,0]} castShadow><boxGeometry args={[.68,.20,.65]}/><meshStandardMaterial color="#192b39" metalness={.4} roughness={.35}/></mesh>
    <mesh position={[0,.39,0]} castShadow><boxGeometry args={[.49,.07,.46]}/><meshStandardMaterial color="#3b7799"/></mesh>
    {[-.38,.38].map((z)=><mesh key={z} position={[0,.18,z]} rotation={[Math.PI/2,0,0]} castShadow>
      <cylinderGeometry args={[.18,.18,.11,24]}/><meshStandardMaterial color="#0c141b" roughness={.85}/>
    </mesh>)}
    <mesh position={[0,.51,-.05]} castShadow><cylinderGeometry args={[.13,.13,.10,24]}/><meshStandardMaterial color="#77e4e6" emissive="#077b84" emissiveIntensity={.4}/></mesh>
    <mesh position={[0,.53,.18]}><boxGeometry args={[.32,.07,.19]}/><meshStandardMaterial color="#e8b84a" /></mesh>
    <mesh position={[0,.23,.34]}><boxGeometry args={[.35,.09,.04]}/><meshStandardMaterial color="#e6d382"/></mesh>
  </group>;
}
function Arm({snapshot}:{snapshot:MissionSnapshot}) {
  const shoulder=useRef<THREE.Group>(null);
  const elbow=useRef<THREE.Group>(null);
  const wrist=useRef<THREE.Group>(null);
  const left=useRef<THREE.Mesh>(null);
  const right=useRef<THREE.Mesh>(null);
  useFrame((_, delta)=>{
    const k=1-Math.exp(-6*delta);
    if(shoulder.current) shoulder.current.rotation.z=THREE.MathUtils.lerp(shoulder.current.rotation.z,snapshot.arm.shoulder,k);
    if(elbow.current) elbow.current.rotation.z=THREE.MathUtils.lerp(elbow.current.rotation.z,snapshot.arm.elbow,k);
    if(wrist.current) wrist.current.rotation.z=THREE.MathUtils.lerp(wrist.current.rotation.z,snapshot.arm.wrist,k);
    if(left.current) left.current.position.z=THREE.MathUtils.lerp(left.current.position.z,-snapshot.arm.grip,k);
    if(right.current) right.current.position.z=THREE.MathUtils.lerp(right.current.position.z,snapshot.arm.grip,k);
  });
  return <group position={[-1.1,0,1.55]} rotation={[0,-.5,0]}>
    <mesh position={[0,.38,0]} castShadow><cylinderGeometry args={[.24,.29,.19,24]}/><meshStandardMaterial color="#315c87" metalness={.5}/></mesh>
    <mesh position={[0,.50,0]} castShadow><cylinderGeometry args={[.17,.17,.14,24]}/><meshStandardMaterial color="#ffc876"/></mesh>
    <group position={[0,.56,0]} ref={shoulder}>
      <mesh position={[0,.36,0]} castShadow><boxGeometry args={[.16,.72,.18]}/><meshStandardMaterial color="#dce6f2" metalness={.15}/></mesh>
      <mesh><sphereGeometry args={[.15,16,16]}/><meshStandardMaterial color="#4179b1"/></mesh>
      <group position={[0,.72,0]} ref={elbow}>
        <mesh position={[0,.28,0]} castShadow><boxGeometry args={[.13,.56,.16]}/><meshStandardMaterial color="#e6eef6"/></mesh>
        <mesh><sphereGeometry args={[.12,16,16]}/><meshStandardMaterial color="#4179b1"/></mesh>
        <group position={[0,.56,0]} ref={wrist}>
          <mesh position={[0,.12,0]} castShadow><boxGeometry args={[.20,.25,.22]}/><meshStandardMaterial color="#8cc8de"/></mesh>
          <mesh ref={left} position={[0,.32,-.30]} castShadow><boxGeometry args={[.10,.28,.07]}/><meshStandardMaterial color="#f5d18b"/></mesh>
          <mesh ref={right} position={[0,.32,.30]} castShadow><boxGeometry args={[.10,.28,.07]}/><meshStandardMaterial color="#f5d18b"/></mesh>
        </group>
      </group>
    </group>
  </group>;
}
function SceneContent({snapshot}:{snapshot:MissionSnapshot}) {
  const cargoOnTB3=snapshot.progress>=56;
  return <>
    <color attach="background" args={["#07121f"]}/>
    <ambientLight intensity={1.45}/>
    <directionalLight position={[4,10,6]} intensity={2.2} castShadow shadow-mapSize={[1024,1024]}/>
    <pointLight position={[-2,4,-2]} color="#41bfe9" intensity={16} distance={14}/>
    <gridHelper args={[12,24,"#28465b","#193347"]} position={[0,.002,0]}/>
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[14,10]}/><meshStandardMaterial color="#0c1e2c" roughness={1}/></mesh>
    <mesh position={[-1.1,.26,1.55]} receiveShadow castShadow><boxGeometry args={[1.35,.43,1.1]}/><meshStandardMaterial color="#34475b" metalness={.3}/></mesh>
    <mesh position={[-1.1,.52,.88]}><boxGeometry args={[1.18,.06,.08]}/><meshStandardMaterial color="#e7ad50"/></mesh>
    <mesh position={[2.5,.035,0]}><cylinderGeometry args={[.54,.54,.06,48]}/><meshStandardMaterial color="#2cb5b7" emissive="#087875" emissiveIntensity={.4}/></mesh>
    <mesh position={[-1.1,.025,0]}><cylinderGeometry args={[.51,.51,.05,48]}/><meshStandardMaterial color="#eab459" emissive="#906020" emissiveIntensity={.3}/></mesh>
    <mesh position={[.6,.015,0]} rotation={[0,Math.PI/2,0]}><boxGeometry args={[.04,.025,6.5]}/><meshBasicMaterial color="#287486" /></mesh>
    <TB3 snapshot={snapshot}/>
    <Arm snapshot={snapshot}/>
    {!cargoOnTB3 && <mesh position={[-1.1,.80,1.05]} castShadow>
      <boxGeometry args={[.20,.20,.20]}/><meshStandardMaterial color="#ffc962" emissive="#745520" emissiveIntensity={.15}/>
    </mesh>}
    {cargoOnTB3 && <mesh position={[snapshot.tb3.x,.68,snapshot.tb3.z+.18]} castShadow>
      <boxGeometry args={[.18,.18,.18]}/><meshStandardMaterial color="#ffc962"/></mesh>}
    <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={15} maxPolarAngle={Math.PI/2.1} target={[0,.45,.2]}/>
  </>;
}
export default function RobotScene({snapshot}:{snapshot:MissionSnapshot}) {
  return <Canvas shadows camera={{position:[4.5,4.0,6.5],fov:44,near:.1,far:100}} dpr={[1,1.8]}>
    <SceneContent snapshot={snapshot}/>
  </Canvas>;
}
