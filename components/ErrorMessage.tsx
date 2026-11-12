import type { ReactNode } from "react";

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
  children?: ReactNode;
}

export default function ErrorMessage({ message, onRetry, children }: ErrorMessageProps) {
    return (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-4 text-red-900">
            <p>{message}</p>
            {children}
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 rounded-md border border-red-700 px-3 py-1.5 font-medium text-red-800 hover:bg-red-100"
                >
                    Tentar novamente
                </button>
            )}
        </div>
    );
}