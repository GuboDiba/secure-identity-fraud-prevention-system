interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable Card Component
 */
export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="font-semibold text-lg mb-4 text-gray-900">{title}</h3>}
      {children}
    </div>
  );
}
