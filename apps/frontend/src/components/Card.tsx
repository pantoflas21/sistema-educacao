import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function Card({ children, className = "", hover = false, gradient = false }: CardProps) {
  const baseClasses = "bg-white rounded-xl shadow-lg p-6 transition-all duration-200";
  const hoverClasses = hover ? "hover:shadow-xl hover:-translate-y-1" : "";
  const gradientClasses = gradient ? "bg-gradient-to-br from-white to-slate-50" : "";
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}>
      {children}
    </div>
  );
}

