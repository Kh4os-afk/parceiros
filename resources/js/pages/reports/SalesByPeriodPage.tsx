import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
    Search,
    Download,
    Users,
    TrendingUp,
    Award,
    ReceiptText,
    Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "@/lib/axios";
import { formatCPF, formatMoney, toTitleCase } from "@/lib/utils";
import CountUp from "@/components/CountUp";
import { Button } from "@/components/ui/button";

const T = {
    bg: "#f4f5f8",
    border: "#e8eaef",
    cyan: "#0099cc",
    purple: "#7c3aed",
    green: "#059669",
    amber: "#d97706",
    red: "#dc2626",
};

const cardStyle = {
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

interface SaleGroup {
    cpf: string;
    nome: string;
    total: number;
    quantidade: number;
}

function formatDateBR(iso: string) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function formatDateLabel(iso: string) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    const meses = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ];
    return `${d} ${meses[parseInt(m) - 1]} ${y}`;
}

export default function SalesByPeriodPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [results, setResults] = useState<SaleGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [errors, setErrors] = useState<{
        start_date?: string[];
        end_date?: string[];
    }>({});

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        setSearched(true);
        try {
            const res = await api.get("/sales/period", {
                params: {
                    start_date: formatDateBR(startDate),
                    end_date: formatDateBR(endDate),
                },
            });
            setResults(res.data);
        } catch (err: any) {
            if (err.response?.status === 422)
                setErrors(err.response.data.errors ?? {});
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    function exportarExcel() {
        if (results.length === 0) return;
        const dados = results.map((r) => ({
            CPF: formatCPF(r.cpf),
            Nome: toTitleCase(r.nome),
            "Qtd Compras": r.quantidade,
            "Total (R$)": Number(r.total),
        }));
        const ws = XLSX.utils.json_to_sheet(dados);
        ws["!cols"] = [{ wch: 16 }, { wch: 35 }, { wch: 14 }, { wch: 14 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Extrato por Período");
        XLSX.writeFile(wb, `compras_${startDate}_${endDate}.xlsx`);
    }

    const grandTotal = useMemo(
        () => results.reduce((s, r) => s + Number(r.total), 0),
        [results],
    );
    const totalCompras = useMemo(
        () => results.reduce((s, r) => s + r.quantidade, 0),
        [results],
    );
    const mediaFunc = useMemo(
        () => (results.length > 0 ? grandTotal / results.length : 0),
        [grandTotal, results],
    );
    const maiorComp = useMemo(() => results[0] ?? null, [results]);
    const maxTotal = useMemo(() => results[0]?.total ?? 1, [results]);

    const kpiCards = [
        {
            label: "Total Período",
            value: grandTotal,
            decimals: 2,
            prefix: "R$",
            sub: `${formatDateLabel(startDate)} → ${formatDateLabel(endDate)}`,
            icon: TrendingUp,
            color: T.cyan,
        },
        {
            label: "Funcionários",
            value: results.length,
            decimals: 0,
            prefix: null,
            sub: "com compras no período",
            icon: Users,
            color: T.purple,
        },
        {
            label: "Total Compras",
            value: totalCompras,
            decimals: 0,
            prefix: null,
            sub: `média ${(results.length > 0 ? totalCompras / results.length : 0).toFixed(1)} por func.`,
            icon: ReceiptText,
            color: T.green,
        },
        {
            label: "Maior Comprador",
            value: maiorComp?.total ?? 0,
            decimals: 2,
            prefix: "R$",
            sub: maiorComp ? toTitleCase(maiorComp.nome) : "—",
            icon: Award,
            color: T.amber,
        },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            style={{ background: T.bg, margin: "-1rem -1rem", padding: "1.5rem 1rem", minHeight: "100vh" }}
            className="md:-m-6 md:p-6 flex flex-col gap-5"
        >
            {/* Header */}
            <motion.div variants={rise}>
                <p style={{ color: "#94a3b8", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                    Relatórios
                </p>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1e293b" }}>
                    Extrato por Período
                </h1>
            </motion.div>

            {/* Filtro */}
            <motion.div variants={rise} style={cardStyle} className="rounded-none overflow-hidden">
                <div style={{ padding: "1.25rem 1.5rem" }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "1rem" }}>
                        Selecionar Período
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
                        {[
                            { id: "start", label: "Data Inicial", value: startDate, set: setStartDate, err: errors.start_date },
                            { id: "end", label: "Data Final", value: endDate, set: setEndDate, err: errors.end_date },
                        ].map(({ id, label, value, set, err }) => (
                            <div key={id} className="flex flex-col gap-1.5">
                                <label style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#64748b" }}>
                                    {label}
                                </label>
                                <input
                                    type="date"
                                    value={value}
                                    onChange={(e) => set(e.target.value)}
                                    required
                                    style={{
                                        border: `1px solid ${err ? T.red : T.border}`,
                                        padding: "0.5rem 0.75rem",
                                        fontSize: "0.875rem",
                                        background: "#f8fafc",
                                        color: "#1e293b",
                                        outline: "none",
                                        width: "11rem",
                                        borderRadius: 0,
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = T.cyan; }}
                                    onBlur={(e) => { e.target.style.borderColor = err ? T.red : T.border; }}
                                />
                                {err?.[0] && (
                                    <p style={{ fontSize: "0.62rem", color: T.red }}>{err[0]}</p>
                                )}
                            </div>
                        ))}

                        <Button
                            type="submit"
                            disabled={loading}
                            rounded-none
                            style={{ background: T.cyan, color: "#fff", borderRadius: 0, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", padding: "0.55rem 1.5rem", display: "flex", alignItems: "center", gap: "0.4rem", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1 }}
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                            {loading ? "Buscando…" : "Executar"}
                        </Button>
                    </form>
                </div>
            </motion.div>

            {/* Loading */}
            {searched && loading && (
                <motion.div variants={rise} style={cardStyle} className="flex items-center justify-center py-16 gap-3">
                    <Loader2 size={18} style={{ color: T.cyan }} className="animate-spin" />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        Buscando dados…
                    </span>
                </motion.div>
            )}

            {/* Resultados */}
            {searched && !loading && (
                <>
                    {results.length > 0 && (
                        <motion.div variants={rise} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {kpiCards.map(({ label, value, decimals, prefix, sub, icon: Icon, color }) => (
                                <motion.div
                                    key={label}
                                    whileHover={{ y: -3, boxShadow: "0 6px 20px rgba(0,0,0,0.10)" }}
                                    style={{
                                        ...cardStyle,
                                        height: 120,
                                        padding: "1rem 1.25rem",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        cursor: "default",
                                        transition: "box-shadow 0.2s",
                                        borderTop: `3px solid ${color}`,
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                        <Icon size={12} style={{ color }} />
                                        <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#94a3b8" }}>
                                            {label}
                                        </p>
                                    </div>
                                    <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1e293b", lineHeight: 1 }}>
                                        {prefix && (
                                            <span style={{ fontSize: "0.5em", opacity: 0.5, marginRight: 2 }}>{prefix}</span>
                                        )}
                                        <CountUp value={value} decimals={decimals} duration={1.5} />
                                    </p>
                                    <p style={{ fontSize: "0.6rem", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {sub}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Card tabela */}
                    <motion.div variants={rise} style={cardStyle} className="overflow-hidden">
                        {/* Header da tabela */}
                        <div style={{ padding: "0.75rem 1.5rem", borderBottom: `1px solid ${T.border}`, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
                                {results.length > 0
                                    ? `${results.length} funcionário${results.length !== 1 ? "s" : ""} · ordenado por valor`
                                    : "Nenhum resultado"}
                            </span>
                            {results.length > 0 && (
                                <Button
                                    onClick={exportarExcel}
                                    style={{ background: "transparent", border: `1px solid ${T.cyan}`, color: T.cyan, borderRadius: 0, fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.35rem 0.9rem", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}
                                >
                                    <Download size={10} /> Exportar Excel
                                </Button>
                            )}
                        </div>

                        {results.length === 0 ? (
                            <div className="py-16 text-center">
                                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8" }}>
                                    Nenhuma compra no período selecionado.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-max border-collapse">
                                    <thead>
                                        <tr style={{ background: "#f8fafc", borderBottom: `1px solid ${T.border}` }}>
                                            {["#", "Funcionário", "CPF", "Compras", "Participação", "Total"].map((h, i) => (
                                                <th
                                                    key={h}
                                                    style={{ padding: "0.65rem 1.25rem", textAlign: i === 3 ? "center" : i === 5 ? "right" : "left", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((r, idx) => {
                                            const pct = grandTotal > 0 ? (Number(r.total) / grandTotal) * 100 : 0;
                                            const barW = maxTotal > 0 ? (Number(r.total) / maxTotal) * 100 : 0;
                                            return (
                                                <tr
                                                    key={r.cpf}
                                                    style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }}
                                                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#f1f5f9"; }}
                                                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ""; }}
                                                >
                                                    <td style={{ padding: "0.4rem 1.25rem" }}>
                                                        <span style={{ fontSize: "0.7rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: idx < 3 ? T.cyan : "#cbd5e1" }}>
                                                            {String(idx + 1).padStart(2, "0")}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "0.4rem 1.25rem" }}>
                                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e293b" }}>
                                                            {toTitleCase(r.nome)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "0.4rem 1.25rem" }}>
                                                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748b", letterSpacing: "0.05em" }}>
                                                            {formatCPF(r.cpf)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "0.4rem 1.25rem", textAlign: "center" }}>
                                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                                            <CountUp value={r.quantidade} decimals={0} duration={1.5} />
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "0.4rem 1.25rem", width: 160 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                            <div style={{ flex: 1, height: 4, background: T.border, overflow: "hidden", borderRadius: 2 }}>
                                                                <div
                                                                    style={{ height: "100%", width: `${barW}%`, background: T.cyan, borderRadius: 2, transition: "width 0.6s ease" }}
                                                                />
                                                            </div>
                                                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", fontVariantNumeric: "tabular-nums", minWidth: "2.5rem", textAlign: "right" }}>
                                                                <CountUp value={pct} decimals={0} duration={1.5} />%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "0.4rem 1.25rem", textAlign: "right" }}>
                                                        <span style={{ fontSize: "0.82rem", fontWeight: 900, color: T.cyan, fontVariantNumeric: "tabular-nums" }}>
                                                            <span style={{ fontSize: "0.5em", opacity: 0.6, marginRight: 2 }}>R$</span>
                                                            <CountUp value={Number(r.total)} decimals={2} duration={1.5} />
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ borderTop: `2px solid ${T.border}`, background: "#f8fafc" }}>
                                            <td colSpan={3} />
                                            <td style={{ padding: "0.65rem 1.25rem", textAlign: "center" }}>
                                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                                    <CountUp value={totalCompras} decimals={0} duration={1.5} />
                                                </span>
                                            </td>
                                            <td style={{ padding: "0.65rem 1.25rem" }}>
                                                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#94a3b8" }}>
                                                    100%
                                                </span>
                                            </td>
                                            <td style={{ padding: "0.65rem 1.25rem", textAlign: "right" }}>
                                                <span style={{ fontSize: "0.9rem", fontWeight: 900, color: T.cyan, fontVariantNumeric: "tabular-nums" }}>
                                                    <span style={{ fontSize: "0.5em", opacity: 0.6, marginRight: 2 }}>R$</span>
                                                    <CountUp value={grandTotal} decimals={2} duration={1.5} />
                                                </span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
