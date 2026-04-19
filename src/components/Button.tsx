'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-brand-400 to-brand-600 text-white hover:from-brand-500 hover:to-brand-700 shadow-glow-orange disabled:opacity-50',
  secondary:
    'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50',
  danger:
    'bg-gradient-to-br from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 disabled:opacity-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
};
const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

export default function Button({
  variant = 'primary', size = 'md', className, children, loading, disabled, ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition active:scale-[0.98]',
        variants[variant], sizes[size], className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
