import link from "next/link";

export default function Header() {
    return (
        <header className="border-b border-slate-200 bg-white">
            <nav
            aria-label="Navegação principal"
            className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3"
            >
                <link href="/" className="text-lg font-bold text-slate-900">
                    Câmbio
                </link>
                <ul className="flex felx-wrap gap-4">
                    <li>
                        <link href="/" className="text-blue-700 underline-offset-4 hover:underline" >
                            conversor
                        </link>
                    </li>
                    <li>
                        <link
                        href="/watched-pairs"
                        className="text-blue-700 underline-offset-4 hover:underline"
                        >
                            Pares Observados
                        </link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}