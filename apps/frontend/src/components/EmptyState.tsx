import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ 
  icon = "📭", 
  title, 
  description,
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-6xl mb-4">
        {typeof icon === "string" ? <span>{icon}</span> : icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-600 mb-6 max-w-md">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

