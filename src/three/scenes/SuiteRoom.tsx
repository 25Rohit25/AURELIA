import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

import { palette } from '@/lib/palette'
import { ROOM } from '@/three/config'

/**
 * Procedural luxury suite — "Cliffside Villa".
 *
 * Real geometry, not a photograph on a plane: board-formed concrete
 * shell, a west-facing window aperture, a leather platform bed and
 * warm practicals. Modelled in metres at true scale so a real GLB
 * dropped in later shares the same coordinate space and the camera rig
 * keeps working unchanged.
 */

const W = ROOM.width
const H = ROOM.height
const D = ROOM.depth
const T = ROOM.wallThickness
const WIN = ROOM.window

export function SuiteRoom() {
  // Materials are created once and shared across meshes.
  const mat = useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({ color: '#9c8d78', roughness: 0.72, metalness: 0.02 }),
      wall: new THREE.MeshStandardMaterial({ color: '#c4b8a6', roughness: 0.94 }),
      ceiling: new THREE.MeshStandardMaterial({ color: '#cfc5b6', roughness: 0.96 }),
      leather: new THREE.MeshStandardMaterial({ color: '#6d4a30', roughness: 0.52, metalness: 0.06 }),
      linen: new THREE.MeshStandardMaterial({ color: '#ece5d8', roughness: 0.92 }),
      pillow: new THREE.MeshStandardMaterial({ color: '#f5f0e6', roughness: 0.88 }),
      throw: new THREE.MeshStandardMaterial({ color: '#8a7440', roughness: 0.8 }),
      walnut: new THREE.MeshStandardMaterial({ color: '#3e2c1e', roughness: 0.45, metalness: 0.1 }),
      rug: new THREE.MeshStandardMaterial({ color: '#b3a58e', roughness: 0.98 }),
      bronze: new THREE.MeshStandardMaterial({ color: palette.gold, roughness: 0.28, metalness: 0.85 }),
      shade: new THREE.MeshStandardMaterial({
        color: '#f0e2c0',
        emissive: palette.goldBright,
        emissiveIntensity: 1.6,
        roughness: 0.7,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transmission: 0.92,
        thickness: 0.04,
        roughness: 0.06,
        metalness: 0,
        transparent: true,
        opacity: 0.35,
      }),
    }),
    [],
  )

  // Back wall is built as four segments framing the window aperture,
  // which is cheaper and cleaner than CSG subtraction.
  const jambWidth = (W - WIN.width) / 2
  const jambX = WIN.width / 2 + jambWidth / 2

  return (
    <group>
      {/* ── Shell ───────────────────────────────────────────── */}
      <mesh receiveShadow position={[0, -T / 2, 0]} material={mat.floor}>
        <boxGeometry args={[W, T, D]} />
      </mesh>

      <mesh position={[0, H + T / 2, 0]} material={mat.ceiling}>
        <boxGeometry args={[W, T, D]} />
      </mesh>

      {/* Back wall — left jamb, right jamb, sill, lintel */}
      <mesh receiveShadow position={[-jambX, H / 2, -D / 2]} material={mat.wall}>
        <boxGeometry args={[jambWidth, H, T]} />
      </mesh>
      <mesh receiveShadow position={[jambX, H / 2, -D / 2]} material={mat.wall}>
        <boxGeometry args={[jambWidth, H, T]} />
      </mesh>
      <mesh receiveShadow position={[0, WIN.sill / 2, -D / 2]} material={mat.wall}>
        <boxGeometry args={[WIN.width, WIN.sill, T]} />
      </mesh>
      <mesh receiveShadow position={[0, (WIN.head + H) / 2, -D / 2]} material={mat.wall}>
        <boxGeometry args={[WIN.width, H - WIN.head, T]} />
      </mesh>

      {/* Glazing sitting in the aperture */}
      <mesh position={[0, (WIN.sill + WIN.head) / 2, -D / 2]} material={mat.glass}>
        <boxGeometry args={[WIN.width, WIN.head - WIN.sill, 0.02]} />
      </mesh>

      {/* Side walls */}
      <mesh receiveShadow position={[-W / 2, H / 2, 0]} material={mat.wall}>
        <boxGeometry args={[T, H, D]} />
      </mesh>
      <mesh receiveShadow position={[W / 2, H / 2, 0]} material={mat.wall}>
        <boxGeometry args={[T, H, D]} />
      </mesh>

      {/* ── Rug ─────────────────────────────────────────────── */}
      <mesh receiveShadow position={[0, 0.006, -0.2]} rotation={[-Math.PI / 2, 0, 0]} material={mat.rug}>
        <planeGeometry args={[5, 4]} />
      </mesh>

      {/* ── Platform bed ────────────────────────────────────── */}
      <group position={[0, 0, -0.6]}>
        {/* Leather plinth, wider than the mattress in the platform style */}
        <mesh castShadow receiveShadow position={[0, 0.17, 0]} material={mat.leather}>
          <boxGeometry args={[2.9, 0.34, 2.4]} />
        </mesh>

        <RoundedBox
          args={[2.1, 0.32, 2.0]}
          radius={0.05}
          smoothness={3}
          position={[0, 0.5, 0.05]}
          castShadow
          material={mat.linen}
        />

        {/* Folded throw across the foot */}
        <mesh castShadow position={[0, 0.67, 0.72]} material={mat.throw}>
          <boxGeometry args={[2.12, 0.05, 0.55]} />
        </mesh>

        {/* Pillows */}
        {[-0.48, 0.48].map((x) => (
          <RoundedBox
            key={x}
            args={[0.86, 0.16, 0.46]}
            radius={0.07}
            smoothness={3}
            position={[x, 0.74, -0.72]}
            rotation={[-0.22, 0, 0]}
            castShadow
            material={mat.pillow}
          />
        ))}

        {/* Walnut headboard */}
        <mesh castShadow position={[0, 0.85, -1.22]} material={mat.walnut}>
          <boxGeometry args={[2.9, 1.1, 0.09]} />
        </mesh>
      </group>

      {/* ── Bedside tables + lamps ──────────────────────────── */}
      {[-1.85, 1.85].map((x) => (
        <group key={x} position={[x, 0, -1.5]}>
          <mesh castShadow receiveShadow position={[0, 0.26, 0]} material={mat.walnut}>
            <boxGeometry args={[0.55, 0.52, 0.45]} />
          </mesh>
          <mesh castShadow position={[0, 0.62, 0]} material={mat.bronze}>
            <cylinderGeometry args={[0.03, 0.03, 0.2, 12]} />
          </mesh>
          <mesh position={[0, 0.78, 0]} material={mat.shade}>
            <cylinderGeometry args={[0.13, 0.16, 0.18, 16]} />
          </mesh>
          {/* Practical light so the lamp actually reads as a light source */}
          <pointLight position={[0, 0.78, 0]} intensity={2.2} distance={3.2} color="#ffd9a0" />
        </group>
      ))}

      {/* ── Bench at the foot ───────────────────────────────── */}
      <mesh castShadow receiveShadow position={[0, 0.22, 1.15]} material={mat.leather}>
        <boxGeometry args={[1.7, 0.44, 0.42]} />
      </mesh>
    </group>
  )
}
