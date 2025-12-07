import { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export default function ErrorState({ 
  title = "Ops! Algo deu errado",
  message,
  onRetry,
  action
}: ErrorStateProps) {
  return (
    <div className="card-modern p-8 bg-rose-50 border-rose-200">
      <div className="flex flex-col items-center text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-rose-900 mb-2">{title}</h3>
        <p className="text-rose-700 mb-6 max-w-md">{message}</p>
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-modern bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700"
            >
              Tentar Novamente
            </button>
          )}
          {action}
        </div>
      </div>
    </div>
  );
}

