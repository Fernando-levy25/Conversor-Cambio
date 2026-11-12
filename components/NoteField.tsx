import { NOTE_MAX_LENGTH } from "@/lib/form-validation";

interface NoteFieldProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
}

export default function NoteField({ id, value, onChange }: NoteFieldProps) {
    const remaining = NOTE_MAX_LENGTH - value.trim().length;

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="font-medium">
                Observação <span className="font-normal text-slate-700">(opcional)</span>
            </label>
            <textarea
            id={id}
            value={value}
            rows={2}
            onChange={(event) => onChange(event.target.value)}
            aria-describedby={`${id}-counter`}
            aria-invalid={remaining < 0}
            className="w-full rounded-md border border-slate-400 px-3 py-2"
            />
            <p id={`${id}-counter`} className={remaining < 0 ? "text-sm text-red-800" : "text-sm text-slate-700"}>
                {remaining >= 0
                    ? `${remaining} caracteres restantes`
                    : `${-remaining} caracteres acima do limite de ${NOTE_MAX_LENGTH}`}
            </p>
        </div>
    );
}