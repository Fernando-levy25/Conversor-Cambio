const rateFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 });
const percentFormat = new Intl.NumberFormat( "pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
});

export function formatRate(rate: number): string {
    return rateFormat.format(rate);
}

export function formatPercent(percent: number): string {
    return `${percentFormat.format(percent)}%`;
}

export function formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency,
        maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
}

export function formatDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
}