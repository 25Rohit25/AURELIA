import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'

import type { WebGLTier } from '@/hooks/useWebGL'

/**
 * Adaptive postprocessing.
 *
 * Bloom on the warm practicals plus a shallow focal plane is most of what
 * makes the render read as "expensive". It is also the first thing to
 * stutter on integrated graphics, so the whole stack is skipped on the
 * low tier and under reduced motion rather than degraded piecemeal.
 */
export function PostFX({ tier, reducedMotion }: { tier: WebGLTier; reducedMotion: boolean }) {
  if (tier !== 'high' || reducedMotion) return null

  return (
    <EffectComposer multisampling={4}>
      <DepthOfField focusDistance={0.012} focalLength={0.045} bokehScale={4} height={480} />
      <Bloom
        intensity={0.62}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.28}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />
      <Vignette offset={0.28} darkness={0.62} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}
