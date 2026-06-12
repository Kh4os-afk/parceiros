import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Gift, Search, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { formatMoney, toTitleCase } from "@/lib/utils";
import CountUp from "@/components/CountUp";

const T = {
    bg: "#f4f5f8",
    border: "#e8eaef",
    cyan: "#0099cc",
    green: "#059669",
    amber: "#d97706",
    red: "#dc2626",
};

const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: `1px solid ${T.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const rise: any = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

interface GiftCard {
    id: number;
    codcli: number;
    cliente: string;
    numgiftcard: string;
    dtvalidade: string | null;
    valor: number;
    saldo: number;
    utilizado: number;
}

function formatDateFull(iso: string) {
    const [y, m, d] = iso.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
}

function isExpired(iso: string | null) {
    if (!iso) return false;
    return iso.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

export default function GiftCardsPage() {
    const [cards, setCards] = useState<GiftCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/gift-cards")
            .then((res) => setCards(res.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return cards;
        return cards.filter(
            (c) =>
                c.cliente.toLowerCase().includes(term) ||
                c.numgiftcard.toLowerCase().includes(term) ||
                String(c.codcli).includes(term),
        );
    }, [cards, search]);

    const totalValor = useMemo(
        () => filtered.reduce((s, c) => s + Number(c.valor), 0),
        [filtered],
    );
    const totalUtilizado = useMemo(
        () => filtered.reduce((s, c) => s + Number(c.utilizado), 0),
        [filtered],
    );
    const totalSaldo = useMemo(
        () => filtered.reduce((s, c) => s + Number(c.saldo), 0),
        [filtered],
    );

    const kpis = [
        { label: "Gift Cards", value: filtered.length, money: false, color: "#111827" },
        { label: "Valor Total", value: totalValor, money: true, color: T.cyan },
        { label: "Utilizado", value: totalUtilizado, money: true, color: T.amber },
        { label: "Saldo Disponível", value: totalSaldo, money: true, color: T.green },
    ];

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            style={{ background: T.bg }}
            className="-m-4 md:-m-6 p-4 md:p-6 min-h-screen flex flex-col gap-4"
        >
            {/* ── Header card ── */}
            <motion.div variants={rise} style={cardStyle} className="rounded-lg overflow-hidden">
                <div className="px-5 md:px-7 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1
                            className="text-lg font-bold tracking-tight mb-0.5"
                            style={{ color: "#111827" }}
                        >
                            Gift Cards
                        </h1>
                        <p className="text-sm" style={{ color: "#6b7280" }}>
                            Consulte os gift cards emitidos, valores utilizados e saldos disponíveis.
                        </p>
                    </div>
                    <div className="relative sm:w-64 shrink-0">
                        <Search
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: "#9ca3af" }}
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cliente, número ou código…"
                            className="w-full pl-8 pr-3 py-2 text-sm rounded-md outline-none transition-colors"
                            style={{
                                border: `1px solid ${T.border}`,
                                background: "#fafbfc",
                                color: "#111827",
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = T.cyan)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
                        />
                    </div>
                </div>
            </motion.div>

            {/* ── KPIs ── */}
            <motion.div
                variants={rise}
                style={cardStyle}
                className="rounded-lg overflow-hidden grid grid-cols-2 lg:grid-cols-4"
            >
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="px-5 py-4 border-r border-b lg:border-b-0"
                        style={{ borderColor: T.border }}
                    >
                        <p
                            className="text-[0.58rem] font-bold uppercase tracking-[0.18em] mb-1.5"
                            style={{ color: "#9ca3af" }}
                        >
                            {kpi.label}
                        </p>
                        <p
                            className="text-xl font-bold tabular-nums leading-none"
                            style={{ color: kpi.color }}
                        >
                            {kpi.money ? (
                                <>
                                    <span className="text-[0.5em] opacity-50 mr-0.5">R$</span>
                                    <CountUp value={kpi.value} decimals={2} duration={1.5} />
                                </>
                            ) : (
                                <CountUp value={kpi.value} duration={1.5} />
                            )}
                        </p>
                    </div>
                ))}
            </motion.div>

            {/* ── Tabela ── */}
            <motion.div variants={rise} style={cardStyle} className="rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 size={22} className="animate-spin" style={{ color: "#9ca3af" }} />
                        <p className="text-sm" style={{ color: "#6b7280" }}>
                            Carregando gift cards…
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Gift size={28} style={{ color: T.red, opacity: 0.4 }} />
                        <p className="text-sm" style={{ color: "#6b7280" }}>
                            Não foi possível carregar os gift cards.
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Gift size={28} style={{ color: "#9ca3af", opacity: 0.3 }} />
                        <p className="text-sm" style={{ color: "#6b7280" }}>
                            {search
                                ? "Nenhum gift card encontrado para a busca."
                                : "Nenhum gift card cadastrado."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-collapse">
                            <thead>
                                <tr style={{ background: "#fafbfc", borderBottom: `1px solid ${T.border}` }}>
                                    {["Cliente", "Nº Gift Card", "Validade", "Valor", "Utilizado", "Saldo"].map(
                                        (h, i) => (
                                            <th
                                                key={h}
                                                className={`px-5 py-3 text-[0.6rem] font-bold uppercase tracking-[0.16em] ${i >= 3 ? "text-right" : "text-left"}`}
                                                style={{ color: "#9ca3af" }}
                                            >
                                                {h}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((card) => {
                                    const expired = isExpired(card.dtvalidade);
                                    return (
                                        <tr
                                            key={card.id}
                                            className="transition-colors hover:bg-[#fafbfc]"
                                            style={{
                                                borderBottom: `1px solid ${T.border}`,
                                                opacity: expired ? 0.55 : 1,
                                            }}
                                        >
                                            <td className="px-5 py-3.5">
                                                <p
                                                    className="text-sm font-semibold leading-tight"
                                                    style={{ color: "#111827" }}
                                                >
                                                    {toTitleCase(card.cliente)}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className="text-xs font-mono tracking-wider"
                                                    style={{ color: "#374151" }}
                                                >
                                                    {card.numgiftcard}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {card.dtvalidade ? (
                                                    expired ? (
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-widest"
                                                            style={{
                                                                background: "rgba(220,38,38,0.08)",
                                                                border: `1px solid rgba(220,38,38,0.2)`,
                                                                color: T.red,
                                                            }}
                                                        >
                                                            Vencido · {formatDateFull(card.dtvalidade)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs" style={{ color: "#6b7280" }}>
                                                            {formatDateFull(card.dtvalidade)}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-xs" style={{ color: "#d1d5db" }}>
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className="px-5 py-3.5 text-right text-sm font-semibold tabular-nums"
                                                style={{ color: T.cyan }}
                                            >
                                                {formatMoney(card.valor)}
                                            </td>
                                            <td
                                                className="px-5 py-3.5 text-right text-sm font-semibold tabular-nums"
                                                style={{
                                                    color:
                                                        Number(card.utilizado) > 0
                                                            ? T.amber
                                                            : "#9ca3af",
                                                }}
                                            >
                                                {formatMoney(card.utilizado)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span
                                                    className="text-sm font-bold tabular-nums"
                                                    style={{ color: T.green }}
                                                >
                                                    {formatMoney(card.saldo)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#fafbfc" }}>
                                    <td colSpan={3} className="px-5 py-3.5">
                                        <span
                                            className="text-[0.6rem] font-bold uppercase tracking-[0.16em]"
                                            style={{ color: "#9ca3af" }}
                                        >
                                            {filtered.length} gift card{filtered.length !== 1 ? "s" : ""}
                                        </span>
                                    </td>
                                    <td
                                        className="px-5 py-3.5 text-right text-sm font-bold tabular-nums"
                                        style={{ color: T.cyan }}
                                    >
                                        {formatMoney(totalValor)}
                                    </td>
                                    <td
                                        className="px-5 py-3.5 text-right text-sm font-bold tabular-nums"
                                        style={{ color: T.amber }}
                                    >
                                        {formatMoney(totalUtilizado)}
                                    </td>
                                    <td
                                        className="px-5 py-3.5 text-right text-sm font-bold tabular-nums"
                                        style={{ color: T.green }}
                                    >
                                        {formatMoney(totalSaldo)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
