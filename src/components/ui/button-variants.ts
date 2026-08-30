import { cva } from 'class-variance-authority'

/**
 * Kept in its own module so `button.tsx` exports only a component —
 * mixing component and non-component exports in one file breaks React
 * Fast Refresh during development.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans uppercase transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-gold text-ink hover:bg-gold-bright',
        outline: 'border border-bone/25 text-bone hover:border-gold hover:text-gold',
        ghost: 'text-bone-muted hover:text-bone',
        solid: 'bg-bone text-ink hover:bg-bone-dim',
      },
      size: {
        sm: 'h-9 px-4 text-[10px] tracking-[0.18em]',
        md: 'h-11 px-7 text-[11px] tracking-[0.2em]',
        lg: 'h-14 px-10 text-xs tracking-[0.22em]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)
