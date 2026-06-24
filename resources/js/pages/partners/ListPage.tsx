import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    Search,
    Plus,
    Upload,
    ChevronUp,
    ChevronDown,
    Pencil,
    ReceiptText,
    Users,
    ShieldOff,
    ShieldCheck,
    CreditCard,
    Download,
    X,
    Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import * as XLSX from "xlsx";
import api from "@/lib/axios";
import { formatCPF, formatMoney, toTitleCase } from "@/lib/utils";
import CountUp from "@/components/CountUp";
import PaginationBar from "@/components/PaginationBar";
import FacetedFilter from "@/components/FacetedFilter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface Partner {
    id: number;
    nome: string;
    cpf: string;
    matricula: string;
    limcred: number;
    bloqueado: number;
    empresa?: { nome: string };
}
interface Meta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}
interface Summary {
    total: number;
    ativos: number;
    bloqueados: number;
    lim_medio: number;
    lim_total: number;
    facet_status?: { ativo: number; bloqueado: number };
    por_empresa?: { empresa_id: number; nome: string; total: number }[];
}
type SortField = "nome" | "matricula" | "cpf" | "limcred" | "bloqueado";
type StatusFilter = "ativo" | "bloqueado";

function listParams(
    search: string,
    sortBy: SortField,
    order: "asc" | "desc",
    page: number,
    status: StatusFilter[],
    empresaIds: string[],
    perPage = 10,
) {
    return {
        search: search || undefined,
        sort_by: sortBy,
        order,
        page,
        per_page: perPage,
        status: status.length ? status : undefined,
        empresa_id: empresaIds.length ? empresaIds : undefined,
    };
}

// Design tokens
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger = (d = 0): any => ({
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: d } },
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rise: any = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function ListPage() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter[]>([]);
    const [empresaFilter, setEmpresaFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortField>("nome");
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(1);
    const [exporting, setExporting] = useState(false);

    const hasFilters = statusFilter.length > 0 || empresaFilter.length > 0;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const partnersQuery = useQuery({
        queryKey: [
            "partners",
            debouncedSearch,
            sortBy,
            order,
            page,
            statusFilter,
            empresaFilter,
        ],
        queryFn: async () => {
            const res = await api.get("/partners", {
                params: listParams(
                    debouncedSearch,
                    sortBy,
                    order,
                    page,
                    statusFilter,
                    empresaFilter,
                ),
            });
            return res.data as Meta & { data: Partner[] };
        },
        placeholderData: keepPreviousData,
    });

    const summaryQuery = useQuery({
        queryKey: [
            "partners-summary",
            debouncedSearch,
            statusFilter,
            empresaFilter,
        ],
        queryFn: async () => {
            const res = await api.get("/partners/summary", {
                params: listParams(
                    debouncedSearch,
                    sortBy,
                    order,
                    1,
                    statusFilter,
                    empresaFilter,
                ),
            });
            return res.data as Summary;
        },
        placeholderData: keepPreviousData,
    });

    const partners = partnersQuery.data?.data ?? [];
    const meta = partnersQuery.data ?? null;
    const summary = summaryQuery.data ?? {
        total: 0,
        ativos: 0,
        bloqueados: 0,
        lim_medio: 0,
        lim_total: 0,
    };
    const initialLoading = partnersQuery.isLoading && !partnersQuery.data;
    const fetching = partnersQuery.isFetching;

    async function exportarExcel() {
        setExporting(true);
        try {
            const res = await api.get("/partners", {
                params: listParams(
                    debouncedSearch,
                    sortBy,
                    order,
                    1,
                    statusFilter,
                    empresaFilter,
                    99999,
                ),
            });
            const rows: Partner[] = res.data.data;
            const dados = rows.map((p) => ({
                Matrícula: p.matricula || "",
                Nome: toTitleCase(p.nome),
                CPF: formatCPF(p.cpf),
                "Lim. Mensal (R$)": Number(p.limcred),
                Status: p.bloqueado ? "Bloqueado" : "Ativo",
            }));
            const ws = XLSX.utils.json_to_sheet(dados);
            ws["!cols"] = [
                { wch: 12 },
                { wch: 35 },
                { wch: 16 },
                { wch: 18 },
                { wch: 12 },
            ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Funcionários");
            XLSX.writeFile(wb, "funcionarios.xlsx");
        } finally {
            setExporting(false);
        }
    }

    function toggleSort(field: SortField) {
        if (sortBy === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
        else {
            setSortBy(field);
            setOrder("asc");
        }
        setPage(1);
    }

    function applyStatusFilter(values: StatusFilter[]) {
        setStatusFilter(values);
        setPage(1);
    }

    function applyEmpresaFilter(values: string[]) {
        setEmpresaFilter(values);
        setPage(1);
    }

    function clearFilters() {
        setStatusFilter([]);
        setEmpresaFilter([]);
        setPage(1);
    }

    const statusOptions = [
        { value: "ativo",     label: "Ativo",     count: summary.facet_status?.ativo     ?? summary.ativos },
        { value: "bloqueado", label: "Bloqueado", count: summary.facet_status?.bloqueado ?? summary.bloqueados },
    ];

    const empresaOptions = (summary.por_empresa ?? []).map((e) => ({
        value: String(e.empresa_id),
        label: toTitleCase(e.nome),
        count: e.total,
    }));

    const kpis = [
        {
            label: "Total Cadastrados",
            value: summary.total,
            icon: Users,
            color: T.cyan,
            money: false,
        },
        {
            label: "Ativos",
            value: summary.ativos,
            icon: ShieldCheck,
            color: T.green,
            money: false,
        },
        {
            label: "Bloqueados",
            value: summary.bloqueados,
            icon: ShieldOff,
            color: summary.bloqueados > 0 ? T.red : "#94a3b8",
            money: false,
        },
        {
            label: "Lim. Médio Mensal",
            value: summary.lim_medio,
            icon: CreditCard,
            color: T.purple,
            money: true,
        },
        {
            label: "Total em Crédito",
            value: summary.lim_total,
            icon: CreditCard,
            color: T.cyan,
            money: true,
        },
    ];

    return (
        <motion.div
            className="flex flex-col gap-5 -m-4 md:-m-6 p-4 md:p-6 min-h-screen"
            style={{ background: T.bg }}
            variants={stagger(0.04)}
            initial="hidden"
            animate="visible"
        >
            {/* ── Header ── */}
            <motion.div
                variants={rise}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
                <div>
                    <p className="text-[0.55rem] font-black uppercase tracking-[0.28em] text-muted-foreground mb-0.5">
                        Gestão
                    </p>
                    <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
                        Funcionários
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none gap-1.5 text-xs"
                        onClick={() => navigate("/importar/csv")}
                    >
                        <Upload size={11} /> Importar CSV
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-none gap-1.5 text-xs"
                        onClick={() => navigate("/funcionarios/cadastrar")}
                    >
                        <Plus size={11} /> Cadastrar
                    </Button>
                </div>
            </motion.div>

            {/* ── KPI Strip ── */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
                variants={stagger(0.08)}
            >
                {kpis.map(({ label, value, icon: Icon, color, money }, i) => (
                    <motion.div
                        key={label}
                        variants={rise}
                        className="bg-white p-3.5 cursor-default group relative overflow-hidden flex flex-col"
                        style={{
                            border: `1px solid ${T.border}`,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                        }}
                        whileHover={{
                            y: -3,
                            boxShadow: `0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px ${color}25`,
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 22,
                            },
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-6 h-6 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                                style={{
                                    background: `${color}10`,
                                    border: `1px solid ${color}18`,
                                }}
                            >
                                <Icon size={11} style={{ color }} />
                            </div>
                            <p className="text-[0.52rem] font-black uppercase tracking-[0.16em] text-muted-foreground leading-tight">
                                {label}
                            </p>
                        </div>
                        <p className="text-xl font-black tabular-nums text-foreground leading-none mb-2">
                            {money && (
                                <span className="text-[0.55em] font-bold opacity-25 mr-0.5">
                                    R$
                                </span>
                            )}
                            <CountUp
                                value={value}
                                decimals={money ? 2 : 0}
                                duration={0.8}
                                delay={80 + i * 40}
                            />
                        </p>
                        <div
                            className="mt-auto h-[2px] w-full overflow-hidden"
                            style={{ background: `${color}10` }}
                        >
                            <motion.div
                                className="h-full"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{
                                    delay: 0.5 + i * 0.08,
                                    duration: 0.8,
                                    ease: "easeOut",
                                }}
                                style={{
                                    background: `linear-gradient(to right, ${color}40, ${color})`,
                                }}
                            />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── Tabela ── */}
            <motion.div variants={rise} className="bg-white" style={cardStyle}>
                {/* Barra de ferramentas */}
                <div
                    className="flex flex-wrap items-center gap-2 px-4 py-3.5"
                    style={{ borderBottom: `1px solid ${T.border}` }}
                >
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search
                            size={11}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nome, CPF ou matrícula…"
                            className="w-full pl-7 pr-3 py-1.5 text-xs outline-none transition-colors"
                            style={{
                                border: `1px solid ${T.border}`,
                                color: "var(--foreground)",
                            }}
                            onFocus={(e) =>
                                (e.currentTarget.style.borderColor = T.cyan)
                            }
                            onBlur={(e) =>
                                (e.currentTarget.style.borderColor = T.border)
                            }
                        />
                    </div>
                    <FacetedFilter
                        title="Situação"
                        options={statusOptions}
                        selected={statusFilter}
                        onChange={(v) => applyStatusFilter(v as StatusFilter[])}
                    />
                    {isAdmin && empresaOptions.length > 0 && (
                        <FacetedFilter
                            title="Empresa"
                            options={empresaOptions}
                            selected={empresaFilter}
                            onChange={applyEmpresaFilter}
                        />
                    )}
                    {fetching && (
                        <Loader2
                            size={14}
                            className="animate-spin text-muted-foreground shrink-0"
                            aria-label="Atualizando lista"
                        />
                    )}
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 rounded-none px-2 text-xs gap-1"
                        >
                            Limpar
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    <button
                        onClick={exportarExcel}
                        disabled={exporting}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-wider transition-all disabled:opacity-40"
                        style={{
                            background: `${T.cyan}10`,
                            border: `1px solid ${T.cyan}28`,
                            color: T.cyan,
                        }}
                        onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                                `${T.cyan}18`)
                        }
                        onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                                `${T.cyan}10`)
                        }
                    >
                        <Download size={10} />
                        {exporting ? "Exportando…" : "Exportar Excel"}
                    </button>
                </div>

                {/* Table */}
                <div className="relative overflow-x-auto">
                    {fetching && !initialLoading && (
                        <div
                            className="absolute inset-0 z-10 pointer-events-none transition-opacity"
                            style={{ background: "rgba(255,255,255,0.55)" }}
                            aria-hidden
                        />
                    )}
                    <table
                        className={`w-full min-w-max border-collapse transition-opacity duration-200 ${fetching && !initialLoading ? "opacity-50" : "opacity-100"}`}
                    >
                        <thead>
                            <tr
                                style={{
                                    background: "#f9fafb",
                                    borderBottom: `1px solid ${T.border}`,
                                }}
                            >
                                {(
                                    [
                                        ["matricula", "Matrícula"],
                                        ["nome", "Nome"],
                                        ["cpf", "CPF"],
                                        ["limcred", "Lim. Mensal"],
                                        ["bloqueado", "Status"],
                                    ] as [SortField, string][]
                                ).map(([field, label]) => (
                                    <th
                                        key={field}
                                        onClick={() => toggleSort(field)}
                                        className="px-4 py-3 text-left cursor-pointer select-none whitespace-nowrap group transition-colors"
                                    >
                                        <span
                                            className={`flex items-center gap-1 text-[0.62rem] font-black uppercase tracking-widest`}
                                            style={{
                                                color:
                                                    sortBy === field
                                                        ? T.cyan
                                                        : "var(--muted-foreground)",
                                            }}
                                        >
                                            {label}
                                            {sortBy === field ? (
                                                order === "asc" ? (
                                                    <ChevronUp size={9} />
                                                ) : (
                                                    <ChevronDown size={9} />
                                                )
                                            ) : (
                                                <ChevronUp
                                                    size={9}
                                                    className="opacity-0 group-hover:opacity-30"
                                                />
                                            )}
                                        </span>
                                    </th>
                                ))}
                                {isAdmin && (
                                    <th className="px-4 py-3 text-left text-[0.62rem] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                        Empresa
                                    </th>
                                )}
                                <th className="px-4 py-3 text-right text-[0.62rem] font-black uppercase tracking-widest text-muted-foreground">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialLoading ? (
                                <tr>
                                    <td
                                        colSpan={isAdmin ? 7 : 6}
                                        className="text-center py-14 text-sm text-muted-foreground"
                                    >
                                        Carregando…
                                    </td>
                                </tr>
                            ) : partners.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={isAdmin ? 7 : 6}
                                        className="text-center py-14 text-sm text-muted-foreground"
                                    >
                                        {debouncedSearch || hasFilters
                                            ? "Nenhum resultado para os filtros aplicados."
                                            : "Nenhum funcionário cadastrado."}
                                    </td>
                                </tr>
                            ) : (
                                partners.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="group transition-colors hover:bg-[#fafafa]"
                                        style={{
                                            borderBottom: `1px solid ${T.border}`,
                                        }}
                                    >
                                        <td className="px-4 py-2 relative">
                                            <div
                                                className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] transition-opacity ${p.bloqueado ? "opacity-70" : "opacity-0 group-hover:opacity-30"}`}
                                                style={{
                                                    background: p.bloqueado
                                                        ? T.red
                                                        : T.cyan,
                                                }}
                                            />
                                            <span className="text-sm font-mono text-muted-foreground tabular-nums">
                                                {p.matricula || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors"
                                                style={{
                                                    ["--tw-text-opacity" as string]:
                                                        "1",
                                                }}
                                            >
                                                {toTitleCase(p.nome)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="text-sm font-mono text-muted-foreground tracking-wider">
                                                {formatCPF(p.cpf)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className="text-sm font-black tabular-nums"
                                                style={{ color: T.cyan }}
                                            >
                                                <span className="text-[0.6em] opacity-40 mr-0.5">
                                                    R$
                                                </span>
                                                <CountUp
                                                    value={p.limcred}
                                                    decimals={2}
                                                    duration={0.5}
                                                    delay={80}
                                                />
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {p.bloqueado ? (
                                                <span
                                                    className="inline-flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-wider"
                                                    style={{ color: T.red }}
                                                >
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                                                    </span>
                                                    Bloqueado
                                                </span>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-wider"
                                                    style={{ color: T.green }}
                                                >
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                                                    </span>
                                                    Ativo
                                                </span>
                                            )}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-4 py-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {p.empresa?.nome ?? "—"}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-4 py-2 text-right">
                                            <div className="inline-flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/funcionarios/${p.id}`,
                                                        )
                                                    }
                                                    title="Ver detalhes"
                                                    className="w-7 h-7 flex items-center justify-center transition-colors"
                                                    style={{
                                                        border: `1px solid ${T.border}`,
                                                        color: "var(--muted-foreground)",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.borderColor =
                                                            T.cyan;
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.color = T.cyan;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.borderColor =
                                                            T.border;
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.color =
                                                            "var(--muted-foreground)";
                                                    }}
                                                >
                                                    <ReceiptText size={11} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/funcionarios/${p.id}/editar`,
                                                        )
                                                    }
                                                    title="Editar"
                                                    className="w-7 h-7 flex items-center justify-center transition-colors"
                                                    style={{
                                                        border: `1px solid ${T.border}`,
                                                        color: "var(--muted-foreground)",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.borderColor =
                                                            T.cyan;
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.color = T.cyan;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.borderColor =
                                                            T.border;
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.color =
                                                            "var(--muted-foreground)";
                                                    }}
                                                >
                                                    <Pencil size={11} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {meta && (
                    <PaginationBar
                        meta={meta}
                        page={page}
                        onPageChange={setPage}
                    />
                )}
            </motion.div>
        </motion.div>
    );
}
