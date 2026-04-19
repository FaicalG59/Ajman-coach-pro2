import { cn } from '@/lib/utils';

type Variant = 'fit' | 'injured' | 'recovering' | 'inactive' | 'neutral' | 'success' | 'warning' | 'danger' | 'brand';

const variants: Record<Variant, string> = {
  fit: 'bg-green-100 text-green-800 border-green-200',
  injured: 'bg-red-100 text-red-800 border-red-200',
  recovering: 'bg-amber-100 text-amber-800 border-amber-200',
  inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  brand: 'bg-brand-100 text-brand-800 border-brand-200',
};

export default function Badge({ variant = 'neutral', children }: { variant?: Variant; children: React.ReactNode }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
      variants[variant]
    )}>
      {children}
    </span>
  );
}
