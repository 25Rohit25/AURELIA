import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

import type { WebGLTier } from '@/hooks/useWebGL'

/**
 * Colour grade for the panorama tour.
 *
 * The five captures were shot in different buildings under different
 * light — one is heavily yellow, another almost teal. Ungraded, cutting
 * between them looks like five stock photos rather than one hotel. So
 * saturation comes down, contrast comes up slightly, and the whole
 * sequence is pulled toward the brass in the brand palette. It is the
 * same grade the DOM photography gets via the `.graded` utility, so the
 * page and the 3D match.
 *
 * Deliberately no depth-of-field: a photograph already carries its own
 * depth cues, and blurring it only smears real detail.
 *
 * Skipped entirely on weak GPUs and under reduced motion.
 */
export function PanoPostFX({
  tier,
  reducedMotion,
}: {
  tier: WebGLTier
  reducedMotion: boolean
}) {
  if (tier !== 'high' || reducedMotion) return null

  return (
    <EffectComposer>
      {/* Pull the disparate white balances toward one look. */}
      <HueSaturation hue={0.02} saturation={-0.14} />
      <BrightnessContrast brightness={-0.02} contrast={0.09} />
      <Bloom intensity={0.3} luminanceThreshold={0.8} luminanceSmoothing={0.3} mipmapBlur />
      <Vignette offset={0.22} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}
