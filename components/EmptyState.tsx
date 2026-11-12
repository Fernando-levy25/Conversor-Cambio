import type { ReactNode } from "react";

interface EmptyStateProps {
 title: string;
 children?: ReactNode;
}

export default function EmptyState({ title, children }: EmptyStateProps) {
    return (
        <div role="status" className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="font-medium text-slate-800">{title}</p>
            {children && <div className="mt-2 text-slate-600">{children}</div>}
        </div>
    );
}