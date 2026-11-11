import type { ReactNode } from "react";

interface ErrorMessageProps {
 title: string;
 children?: ReactNode;
}

export default function EmptyState({ title, children }: ErrorMessageProps) {
    return (
        <div role="status" className="rounded-mb border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="font-medium text-slate-800">{title}</p>
            {children && <div className="mt-2 text-slate-600">{children}</div>}
        </div>
    );
}