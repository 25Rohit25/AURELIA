import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import type { MotionValue } from 'motion/react'
import * as THREE from 'three'

interface PanoSphereProps {
  url: string
  /** This station's position in the tour. */
  index: number
  total: number
  /** 0 → 1 across the whole tour. */
  progress: MotionValue<number>
}

/**
 * One 360° photograph, mapped to the inside of a sphere.
 *
 * This is genuine 3D — the camera sits at the centre of a real
 * photographic capture and looks around it — not a flat image being
 * panned. The mesh is mirrored on X because a `BackSide` sphere would
 * otherwise show the panorama reversed.
 *
 * The material is `basic`, not `standard`: a panorama already contains
 * its own baked lighting, and lighting it a second time would wash it
 * out. `toneMapped={false}` keeps the tonemapped JPEG exactly as shot.
 *
 * Each sphere computes its own cross-fade from the shared scroll
 * MotionValue inside `useFrame`. Driving opacity through React props
 * would re-render the tree on every scroll tick; this way the handoff
 * between rooms costs nothing.
 */
export function PanoSphere({ url, index, total, progress }: PanoSphereProps) {
  // Configured through useTexture's callback rather than in an effect:
  // the texture is set up where it is constructed, and a JPEG panorama
  // must be tagged sRGB or it renders visibly washed out.
  const texture = useTexture(url, (t) => {
    const tex = Array.isArray(t) ? t[0] : t
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
  })
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const mat = matRef.current
    const mesh = meshRef.current
    if (!mat || !mesh) return

    // Position within this station: 0 on arrival, 1 on departure.
    const local = progress.get() * total - index

    // The first station never fades in; the last never fades out.
    const fadeIn = index === 0 ? 1 : smoothstep(-0.22, 0.0, local)
    const fadeOut = index === total - 1 ? 1 : 1 - smoothstep(0.78, 1.0, local)
    mat.opacity = Math.max(0, Math.min(1, fadeIn * fadeOut))

    // The room being left grows slightly, as if the camera passes
    // through its shell on the way to the next one.
    const s = 1 + Math.max(0, local) * 0.07
    mesh.scale.set(-s, s, s)
  })

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]} renderOrder={index}>
      <sphereGeometry args={[10, 64, 40]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        side={THREE.BackSide}
        transparent
        opacity={index === 0 ? 1 : 0}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  )
}

/** Hermite smoothstep — eases the ends of a fade so it has no hard edge. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
