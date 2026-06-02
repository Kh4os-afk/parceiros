import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
    Search,
    ExternalLink,
    Ban,
    ShoppingBag,
    CalendarDays,
    CreditCard,
} from "lucide-react";
import api from "@/lib/axios";
import { formatCPF, stripCPF, toTitleCase } from "@/lib/utils";
import CountUp from "@/components/CountUp";

const T = {
    bg: "#f4f5f8",
    border: "#e8eaef",
    cyan: "#0099cc",
    purple: "#7c3aed",
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

interface Sale {
    id: number;
    numnota: string;
    dtsaida: string;
    vltotal: number;
    codfilial: number;
    qrcodenfce: string | null;
    dtcancel: string | null;
    dtdevol: string | null;
    filial?: { filial: string };
}

interface Partner {
    id: number;
    nome: string;
    cpf: string;
    matricula: string | null;
    limcred: number;
    bloqueado: number;
    compras: Sale[];
}

const MESES_LABEL = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
];
const MESES_FULL = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

function formatDateFull(iso: string) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function nowKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function last6Months() {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
            label: MESES_LABEL[d.getMonth()],
            full: `${MESES_FULL[d.getMonth()]} ${d.getFullYear()}`,
            year: d.getFullYear(),
        };
    });
}

export default function ConsultaPage() {
    const [cpfInput, setCpfInput] = useState("");
    const [partner, setPartner] = useState<Partner | null>(null);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(nowKey());

    const months = useMemo(() => last6Months(), []);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const cpf = stripCPF(cpfInput);
        if (cpf.length !== 11) return;
        setLoading(true);
        setNotFound(false);
        setPartner(null);
        setSelectedMonth(nowKey());
        try {
            const res = await api.get("/sales/by-cpf", { params: { cpf } });
            setPartner(res.data);
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    const salesMonth = useMemo(
        () =>
            (partner?.compras ?? []).filter(
                (s) => s.dtsaida.slice(0, 7) === selectedMonth,
            ),
        [partner, selectedMonth],
    );
    const activeSalesMonth = useMemo(
        () => salesMonth.filter((s) => !s.dtcancel),
        [salesMonth],
    );
    const gastoMes = useMemo(
        () => activeSalesMonth.reduce((s, c) => s + Number(c.vltotal), 0),
        [activeSalesMonth],
    );
    const disponivel = partner ? Math.max(partner.limcred - gastoMes, 0) : 0;
    const pct =
        partner && partner.limcred > 0
            ? Math.min((gastoMes / partner.limcred) * 100, 100)
            : 0;
    const isCurrentMonth = selectedMonth === nowKey();

    const monthTotals = useMemo(() => {
        const map: Record<string, number> = {};
        (partner?.compras ?? [])
            .filter((s) => !s.dtcancel)
            .forEach((s) => {
                const k = s.dtsaida.slice(0, 7);
                map[k] = (map[k] ?? 0) + Number(s.vltotal);
            });
        return map;
    }, [partner]);

    const selectedMonthLabel =
        months.find((m) => m.key === selectedMonth)?.full ??
        MESES_FULL[new Date().getMonth()] + " " + new Date().getFullYear();

    const barColor =
        pct > 85
            ? `linear-gradient(90deg, #b91c1c 0%, ${T.red} 100%)`
            : pct > 60
              ? `linear-gradient(90deg, #b45309 0%, ${T.amber} 100%)`
              : `linear-gradient(90deg, #0077aa 0%, ${T.cyan} 100%)`;

    const barShadow =
        pct > 85
            ? `0 0 8px rgba(220,38,38,0.5)`
            : pct > 60
              ? `0 0 8px rgba(217,119,6,0.5)`
              : `0 0 8px rgba(0,153,204,0.4)`;

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
                <div className="px-5 md:px-7 py-5">
                    <h1
                        className="text-lg font-bold tracking-tight mb-0.5"
                        style={{ color: "#111827" }}
                    >
                        Consulta de Saldo
                    </h1>
                    <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
                        Consulte o limite disponível e o histórico de compras pelo CPF do funcionário.
                    </p>

                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col sm:flex-row sm:items-end gap-3"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label
                                className="text-xs font-semibold uppercase tracking-widest"
                                style={{ color: "#6b7280" }}
                            >
                                CPF do Funcionário
                            </label>
                            <input
                                value={cpfInput}
                                onChange={(e) => {
                                    const d = e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 11);
                                    const v =
                                        d.length <= 3
                                            ? d
                                            : d.length <= 6
                                              ? `${d.slice(0, 3)}.${d.slice(3)}`
                                              : d.length <= 9
                                                ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
                                                : `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
                                    setCpfInput(v);
                                }}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className="w-full sm:w-52 py-1.5 px-3 text-sm font-mono tracking-widest rounded-md outline-none transition-colors"
                                style={{
                                    border: `1px solid ${T.border}`,
                                    background: "#fafbfc",
                                    color: "#111827",
                                }}
                                onFocus={(e) =>
                                    (e.currentTarget.style.borderColor = T.cyan)
                                }
                                onBlur={(e) =>
                                    (e.currentTarget.style.borderColor = T.border)
                                }
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || stripCPF(cpfInput).length !== 11}
                            className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-opacity disabled:opacity-40"
                            style={{ background: T.cyan, color: "#ffffff" }}
                        >
                            <Search size={12} />
                            {loading ? "Buscando…" : "Consultar"}
                        </button>
                    </form>

                    {notFound && (
                        <p
                            className="mt-3 text-xs font-semibold"
                            style={{ color: T.red }}
                        >
                            CPF não encontrado na base de funcionários.
                        </p>
                    )}
                </div>
            </motion.div>

            {partner && (
                <>
                    {/* ── Grid principal ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start">
                        {/* Card principal 2/3 */}
                        <motion.div
                            variants={rise}
                            style={{
                                ...cardStyle,
                                ...(partner.bloqueado
                                    ? {
                                          border: `1px solid rgba(220,38,38,0.3)`,
                                          background: "rgba(254,242,242,0.6)",
                                      }
                                    : disponivel === 0
                                      ? {
                                            border: `1px solid rgba(217,119,6,0.25)`,
                                            background: "rgba(255,251,235,0.6)",
                                        }
                                      : {}),
                            }}
                            className="lg:col-span-2 rounded-lg overflow-hidden p-5 md:p-8"
                        >
                            {/* Identidade */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <p
                                        className="text-xs uppercase tracking-widest mb-1"
                                        style={{ color: "#9ca3af" }}
                                    >
                                        Funcionário
                                    </p>
                                    <h2
                                        className="text-base font-bold tracking-wide leading-tight"
                                        style={{ color: "#111827" }}
                                    >
                                        {toTitleCase(partner.nome)}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span
                                            className="text-sm font-mono tracking-widest"
                                            style={{ color: "#6b7280" }}
                                        >
                                            {formatCPF(partner.cpf)}
                                        </span>
                                        {partner.matricula && (
                                            <span
                                                className="text-xs"
                                                style={{ color: "#9ca3af" }}
                                            >
                                                Mat. {partner.matricula}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {partner.bloqueado ? (
                                    <span
                                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase tracking-widest"
                                        style={{
                                            background: "rgba(220,38,38,0.1)",
                                            border: `1px solid rgba(220,38,38,0.25)`,
                                            color: T.red,
                                        }}
                                    >
                                        <Ban size={10} /> Bloqueado
                                    </span>
                                ) : (
                                    <span
                                        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold uppercase tracking-widest"
                                        style={{
                                            background: `rgba(0,153,204,0.08)`,
                                            border: `1px solid rgba(0,153,204,0.2)`,
                                            color: T.cyan,
                                        }}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: T.cyan }}
                                        />{" "}
                                        Ativo
                                    </span>
                                )}
                            </div>

                            {/* Disponível — destaque */}
                            <div className="mb-6">
                                <p
                                    className="text-xs uppercase tracking-widest mb-2"
                                    style={{ color: "#9ca3af" }}
                                >
                                    {partner.bloqueado
                                        ? "Conta Bloqueada"
                                        : isCurrentMonth
                                          ? "Disponível para Compra"
                                          : `Disponível em ${selectedMonthLabel}`}
                                </p>
                                {partner.bloqueado ? (
                                    <p
                                        className="text-2xl font-black uppercase tracking-wide"
                                        style={{ color: T.red }}
                                    >
                                        Acesso suspenso
                                    </p>
                                ) : (
                                    <p
                                        className="text-6xl font-black tabular-nums leading-none"
                                        style={{
                                            background:
                                                disponivel === 0
                                                    ? `linear-gradient(135deg, ${T.amber} 0%, #b45309 100%)`
                                                    : `linear-gradient(135deg, ${T.cyan} 0%, ${T.purple} 100%)`,
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.5em",
                                                opacity: 0.7,
                                                marginRight: "0.15em",
                                            }}
                                        >
                                            R$
                                        </span>
                                        <CountUp
                                            value={disponivel}
                                            decimals={2}
                                            duration={0.5}
                                            delay={80}
                                        />
                                    </p>
                                )}
                            </div>

                            {/* Barra de utilização */}
                            {!partner.bloqueado && (
                                <div>
                                    <div className="flex justify-between mb-1.5">
                                        <span
                                            className="text-xs tracking-wide"
                                            style={{ color: "#9ca3af" }}
                                        >
                                            R$
                                            <CountUp
                                                value={gastoMes}
                                                decimals={2}
                                                duration={0.5}
                                                delay={80}
                                            />{" "}
                                            usados de R$
                                            <CountUp
                                                value={partner.limcred}
                                                decimals={2}
                                                duration={0.5}
                                                delay={80}
                                            />
                                        </span>
                                        <span
                                            className="text-sm font-black"
                                            style={{
                                                color:
                                                    pct > 85
                                                        ? T.red
                                                        : pct > 60
                                                          ? T.amber
                                                          : T.cyan,
                                            }}
                                        >
                                            <CountUp
                                                value={pct}
                                                decimals={0}
                                                duration={0.5}
                                                delay={80}
                                            />
                                            %
                                        </span>
                                    </div>
                                    <div
                                        className="h-1.5 w-full overflow-hidden rounded-full"
                                        style={{ background: T.border }}
                                    >
                                        <div
                                            className="h-full relative overflow-hidden rounded-full transition-all duration-700"
                                            style={{
                                                width: `${pct}%`,
                                                background: barColor,
                                                boxShadow: barShadow,
                                            }}
                                        >
                                            <div
                                                className="absolute inset-0 w-1/3"
                                                style={{
                                                    background:
                                                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
                                                    animation:
                                                        "bar-shimmer 2.8s ease-in-out infinite",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Sidebar 1/3 */}
                        <div className="flex flex-col gap-3">
                            {[
                                {
                                    label: "Limite Mensal",
                                    value: (
                                        <CountUp
                                            value={partner.limcred}
                                            decimals={2}
                                            duration={0.5}
                                            delay={80}
                                        />
                                    ),
                                    icon: CreditCard,
                                    isMoney: true,
                                    accent: T.cyan,
                                },
                                {
                                    label: "Gasto no Mês",
                                    value: (
                                        <CountUp
                                            value={gastoMes}
                                            decimals={2}
                                            duration={0.5}
                                            delay={80}
                                        />
                                    ),
                                    icon: ShoppingBag,
                                    isMoney: true,
                                    accent:
                                        gastoMes > partner.limcred
                                            ? T.red
                                            : T.cyan,
                                },
                                {
                                    label: "Compras no Mês",
                                    value: (
                                        <CountUp
                                            value={activeSalesMonth.length}
                                            decimals={0}
                                            duration={0.5}
                                            delay={80}
                                        />
                                    ),
                                    icon: CalendarDays,
                                    isMoney: false,
                                    accent: T.purple,
                                },
                            ].map(({ label, value, icon: Icon, isMoney, accent }) => (
                                <motion.div
                                    key={label}
                                    variants={rise}
                                    style={cardStyle}
                                    className="rounded-lg px-5 py-4 flex items-center gap-3"
                                >
                                    <div
                                        className="w-9 h-9 flex items-center justify-center rounded-md shrink-0"
                                        style={{
                                            background: `${accent}15`,
                                            border: `1px solid ${accent}30`,
                                            color: accent,
                                        }}
                                    >
                                        <Icon size={15} />
                                    </div>
                                    <div>
                                        <p
                                            className="text-xs uppercase tracking-widest"
                                            style={{ color: "#9ca3af" }}
                                        >
                                            {label}
                                        </p>
                                        <p
                                            className="text-sm font-black tabular-nums"
                                            style={{ color: "#111827" }}
                                        >
                                            {isMoney ? (
                                                <>
                                                    <span
                                                        className="text-xs font-bold mr-0.5"
                                                        style={{ opacity: 0.5 }}
                                                    >
                                                        R$
                                                    </span>
                                                    {value}
                                                </>
                                            ) : (
                                                value
                                            )}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* ── Tabs de mês + tabela ── */}
                    <motion.div
                        variants={rise}
                        style={cardStyle}
                        className="rounded-lg overflow-hidden"
                    >
                        {/* Tabs */}
                        <div
                            className="flex border-b overflow-x-auto"
                            style={{ borderColor: T.border, background: "#fafbfc" }}
                        >
                            {months.map((m) => {
                                const total = monthTotals[m.key] ?? 0;
                                const isSel = m.key === selectedMonth;
                                const isCurr = m.key === nowKey();
                                return (
                                    <button
                                        key={m.key}
                                        onClick={() => setSelectedMonth(m.key)}
                                        className="flex flex-col items-center px-5 py-3 shrink-0 transition-all"
                                        style={{
                                            borderBottom: isSel
                                                ? `2px solid ${T.cyan}`
                                                : "2px solid transparent",
                                            background: isSel ? "#ffffff" : "transparent",
                                        }}
                                    >
                                        <span
                                            className="text-xs font-bold uppercase tracking-widest"
                                            style={{
                                                color: isSel
                                                    ? T.cyan
                                                    : isCurr
                                                      ? "#374151"
                                                      : "#9ca3af",
                                            }}
                                        >
                                            {m.label}
                                            {isCurr ? " ●" : ""}
                                        </span>
                                        {total > 0 ? (
                                            <span
                                                className="text-xs font-bold tabular-nums mt-0.5"
                                                style={{
                                                    color: isSel ? T.cyan : "#9ca3af",
                                                }}
                                            >
                                                <span
                                                    className="font-bold mr-0.5"
                                                    style={{ opacity: 0.5 }}
                                                >
                                                    R$
                                                </span>
                                                <CountUp
                                                    value={total}
                                                    decimals={2}
                                                    duration={0.5}
                                                    delay={80}
                                                />
                                            </span>
                                        ) : (
                                            <span
                                                className="text-xs mt-0.5"
                                                style={{ color: "#d1d5db" }}
                                            >
                                                sem compras
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Header da tabela */}
                        <div
                            className="px-6 py-3 border-b flex items-center justify-between"
                            style={{ borderColor: T.border }}
                        >
                            <span
                                className="text-xs font-bold uppercase tracking-widest"
                                style={{ color: "#6b7280" }}
                            >
                                Compras — {selectedMonthLabel}
                            </span>
                            <span
                                className="text-xs"
                                style={{ color: "#9ca3af" }}
                            >
                                {salesMonth.length} registro
                                {salesMonth.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {/* Tabela */}
                        {salesMonth.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 gap-2">
                                <ShoppingBag
                                    size={26}
                                    style={{ color: "#d1d5db" }}
                                />
                                <p className="text-sm" style={{ color: "#9ca3af" }}>
                                    Nenhuma compra em {selectedMonthLabel}.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-max border-collapse">
                                    <thead>
                                        <tr style={{ background: "#fafbfc", borderBottom: `1px solid ${T.border}` }}>
                                            {[
                                                "Data",
                                                "Loja",
                                                "Nº Nota",
                                                "Valor",
                                                "NFC-e",
                                                "Status",
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                                                    style={{ color: "#9ca3af" }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesMonth.map((sale) => (
                                            <tr
                                                key={sale.id}
                                                className="group transition-colors"
                                                style={{
                                                    borderBottom: `1px solid ${T.border}`,
                                                    opacity: sale.dtcancel ? 0.45 : 1,
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "#f9fafb")
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "transparent")
                                                }
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="w-0.5 h-5 shrink-0 rounded-full opacity-60"
                                                            style={{
                                                                background: `hsl(${(sale.codfilial * 47) % 360}, 55%, 50%)`,
                                                            }}
                                                        />
                                                        <span
                                                            className="text-xs font-bold tabular-nums"
                                                            style={{ color: "#6b7280" }}
                                                        >
                                                            {formatDateFull(sale.dtsaida)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span
                                                        className="text-xs font-semibold uppercase"
                                                        style={{ color: "#374151" }}
                                                    >
                                                        {sale.filial?.filial ??
                                                            `Filial ${sale.codfilial}`}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span
                                                        className="text-xs font-bold"
                                                        style={{ color: "#9ca3af" }}
                                                    >
                                                        {sale.numnota}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span
                                                        className="text-sm font-black tabular-nums"
                                                        style={{
                                                            color: sale.dtcancel
                                                                ? "#9ca3af"
                                                                : T.cyan,
                                                            textDecoration: sale.dtcancel
                                                                ? "line-through"
                                                                : "none",
                                                        }}
                                                    >
                                                        <span
                                                            className="text-xs font-bold mr-0.5"
                                                            style={{ opacity: 0.5 }}
                                                        >
                                                            R$
                                                        </span>
                                                        <CountUp
                                                            value={Number(sale.vltotal)}
                                                            decimals={2}
                                                            duration={0.5}
                                                            delay={80}
                                                        />
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {sale.qrcodenfce && !sale.dtcancel ? (
                                                        <a
                                                            href={sale.qrcodenfce}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition-colors"
                                                            style={{ color: "#9ca3af" }}
                                                            onMouseEnter={(e) =>
                                                                (e.currentTarget.style.color =
                                                                    T.cyan)
                                                            }
                                                            onMouseLeave={(e) =>
                                                                (e.currentTarget.style.color =
                                                                    "#9ca3af")
                                                            }
                                                        >
                                                            <ExternalLink size={10} /> Ver nota
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: "#d1d5db" }}>
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    {sale.dtcancel ? (
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded"
                                                            style={{
                                                                background:
                                                                    "rgba(220,38,38,0.1)",
                                                                border: `1px solid rgba(220,38,38,0.2)`,
                                                                color: T.red,
                                                            }}
                                                        >
                                                            <Ban size={8} /> Cancelado
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="text-xs font-bold uppercase tracking-wide"
                                                            style={{ color: T.green }}
                                                        >
                                                            OK
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {activeSalesMonth.length > 0 && (
                                        <tfoot>
                                            <tr
                                                style={{
                                                    borderTop: `2px solid ${T.border}`,
                                                    background: "#fafbfc",
                                                }}
                                            >
                                                <td colSpan={3} />
                                                <td className="px-5 py-3">
                                                    <span
                                                        className="text-sm font-black tabular-nums"
                                                        style={{ color: T.cyan }}
                                                    >
                                                        <span
                                                            className="text-xs font-bold mr-0.5"
                                                            style={{ opacity: 0.5 }}
                                                        >
                                                            R$
                                                        </span>
                                                        <CountUp
                                                            value={gastoMes}
                                                            decimals={2}
                                                            duration={0.5}
                                                            delay={80}
                                                        />
                                                    </span>
                                                </td>
                                                <td colSpan={2} />
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
