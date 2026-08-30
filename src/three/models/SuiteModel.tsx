import { useLayoutEffect, useMemo } from 'react'
import { Center, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import { DRACO_DECODER_PATH } from '@/three/config'

interface SuiteModelProps {
  url: string
  /** Longest-axis size in metres the model is normalised to. */
  fit?: number
}

/**
 * GLB/GLTF slot.
 *
 * Renders a real model in place of the procedural room. Handles the four
 * things that are easy to forget and awkward to retrofit: Draco decoding,
 * shadow flags on every mesh, colour-space correctness, and centring the
 * model on the origin so the existing camera rig still frames it.
 */
export function SuiteModel({ url, fit = 6 }: SuiteModelProps) {
  const { scene } = useGLTF(url, DRACO_DECODER_PATH)

  // Clone so the same GLB can appear in more than one scene without
  // two mounts fighting over one set of transforms.
  const model = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true

      const material = child.material as THREE.Material | THREE.Material[]
      const materials = Array.isArray(material) ? material : [material]
      for (const m of materials) {
        if (m instanceof THREE.MeshStandardMaterial && m.map) {
          m.map.colorSpace = THREE.SRGBColorSpace
          m.map.anisotropy = 8
        }
      }
    })
  }, [model])

  return (
    <Center>
      <primitive object={model} scale={normaliseScale(model, fit)} />
    </Center>
  )
}

/** Uniform scale that fits the model's longest axis into `fit` metres. */
function normaliseScale(object: THREE.Object3D, fit: number): number {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const longest = Math.max(size.x, size.y, size.z)
  return longest > 0 ? fit / longest : 1
}
