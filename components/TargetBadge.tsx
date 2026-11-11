interface TargetBadgeProps {
    reached: boolean | null;
}

export default function TargetBadge({ reached }: TargetBadgeProps) {
    if (reached === null) {
        return <span className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-800">Cotação indisponivel</span>;
    }
    return reached ? (
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-900">
            <span aria-hidden="true">✓</span>Meta atingida
        </span>
    ) : (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
            <span aria-hidden="true">O</span>Meta não atingida
        </span>
    );
}
