import Link from "next/link";

export default function Header() {
    return (
        <header className="border-b border-slate-200 bg-white">
            <nav
            aria-label="Navegação principal"
            className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3"
            >
                <Link href="/" className="text-lg font-bold text-slate-900">
                    Câmbio
                </Link>
                <ul className="flex flex-wrap gap-4">
                    <li>
                        <Link href="/" className="text-blue-700 underline-offset-4 hover:underline" >
                            Conversor
                        </Link>
                    </li>
                    <li>
                        <Link
                        href="/watched-pairs"
                        className="text-blue-700 underline-offset-4 hover:underline"
                        >
                            Pares monitorados
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}