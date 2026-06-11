interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'glass-dark';
}

export default function Card({ title, children, className = '', variant = 'glass' }: CardProps) {
  const variantClasses = {
    glass: 'bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5',
    'glass-dark': 'bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg',
  };

  return (
    <div className={`rounded-2xl p-6 ${variantClasses[variant]} ${className}`}>
      {title && (
        <h3 className="text-lg font-heading font-semibold text-primary-800 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
