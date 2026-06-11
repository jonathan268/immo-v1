interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  success: 'bg-emerald-400/20 text-emerald-800 border border-emerald-400/30',
  warning: 'bg-amber-400/20 text-amber-800 border border-amber-400/30',
  danger: 'bg-red-400/20 text-red-800 border border-red-400/30',
  info: 'bg-blue-400/20 text-blue-800 border border-blue-400/30',
  default: 'bg-[var(--glass-bg)] text-primary-700 border border-[var(--glass-border)]',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    APPROVED: 'success',
    CONFIRMED: 'success',
    PENDING: 'warning',
    REJECTED: 'danger',
    FAILED: 'danger',
    SUSPENDED: 'danger',
    FEATURED: 'info',
  };

  return map[status] ?? 'default';
}
