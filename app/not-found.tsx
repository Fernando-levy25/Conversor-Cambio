import Link from "next/link";

export default function NotFound() {
    return (
        <div className="felx flex-col gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">Página não encontrada</h1>
            <p className="text-slate-700">O endereço acessado não existe.</p>
            <Link href="/" className="self-start font-medium text-blue-800 underline underline-offset-4">
                Voltar ao conversor
            </Link>
        </div>
    );
}