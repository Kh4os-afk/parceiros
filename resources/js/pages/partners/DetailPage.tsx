import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Pencil,
    ShoppingBag,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Ban,
    ExternalLink,
    Store,
} from "lucide-react";
import api from "@/lib/axios";
import { formatCPF, formatMoney, toTitleCase } from "@/lib/utils";
import CountUp from "@/components/CountUp";

interface Partner {
    id: number;
    nome: string;
    cpf: string;
    matricula: string | null;
    limcred: number;
    bloqueado: number;
    empresa?: { nome: string };
}

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

const MESES = [
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

function formatDate(iso: string) {
    const [, m, d] = iso.split("-");
    return `${d}/${m}`;
}

function formatDateFull(iso: string) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function compactMoney(v: number) {
    if (v === 0) return "—";
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(1).replace(".", ",")}k`;
    return `R$ ${Math.round(v)}`;
}

export default function PartnerDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [partner, setPartner] = useState<Partner | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [salesPage, setSalesPage] = useState(1);

    const PER_PAGE = 10;

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(`/partners/${id}`),
            api.get(`/partners/${id}/sales`),
        ])
            .then(([p, s]) => {
                setPartner(p.data);
                setSales(s.data);
                setSalesPage(1);
            })
            .finally(() => setLoading(false));
    }, [id]);

    // ── Derived metrics ──────────────────────────────────────────────────────
    const activeSales = useMemo(
        () => sales.filter((s) => !s.dtcancel),
        [sales],
    );
    const canceledSales = useMemo(
        () => sales.filter((s) => !!s.dtcancel),
        [sales],
    );

    // Últimos 12 meses
    const months = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
            return {
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                label: MESES[d.getMonth()],
                year: d.getFullYear(),
            };
        });
    }, []);

    const monthlyData = useMemo(() => {
        const map: Record<string, { total: number; count: number }> = {};
        activeSales.forEach((s) => {
            const key = s.dtsaida.slice(0, 7);
            if (!map[key]) map[key] = { total: 0, count: 0 };
            map[key].total += Number(s.vltotal);
            map[key].count++;
        });
        return map;
    }, [activeSales]);

    const maxMonthTotal = useMemo(
        () => Math.max(...months.map((m) => monthlyData[m.key]?.total ?? 0), 1),
        [months, monthlyData],
    );

    // Top filiais
    const topFiliais = useMemo(() => {
        const map: Record<
            string,
            { nome: string; total: number; count: number }
        > = {};
        activeSales.forEach((s) => {
            const key = String(s.codfilial);
            if (!map[key])
                map[key] = {
                    nome: s.filial?.filial ?? `Filial ${s.codfilial}`,
                    total: 0,
                    count: 0,
                };
            map[key].total += Number(s.vltotal);
            map[key].count++;
        });
        return Object.values(map)
            .sort((a, b) => b.total - a.total)
            .slice(0, 4);
    }, [activeSales]);

    const maxFilialTotal = topFiliais[0]?.total ?? 1;
    const ultimaCompra = sales[0]?.dtsaida ?? null;

    // Stats do gráfico mensal
    const total12m = useMemo(
        () => months.reduce((s, m) => s + (monthlyData[m.key]?.total ?? 0), 0),
        [months, monthlyData],
    );
    const mediaMensal = useMemo(() => {
        const mesesComDados = months.filter(
            (m) => (monthlyData[m.key]?.total ?? 0) > 0,
        ).length;
        return mesesComDados > 0 ? total12m / mesesComDados : 0;
    }, [total12m, months, monthlyData]);
    const melhorMes = useMemo(() => {
        return months.reduce<{ label: string; total: number } | null>(
            (best, m) => {
                const t = monthlyData[m.key]?.total ?? 0;
                return !best || t > best.total
                    ? { label: m.label, total: t }
                    : best;
            },
            null,
        );
    }, [months, monthlyData]);

    // Tendência: mês atual vs mês anterior
    const currentMonthTotal = monthlyData[months[11]?.key]?.total ?? 0;
    const prevMonthTotal = monthlyData[months[10]?.key]?.total ?? 0;
    const pct =
        partner && partner.limcred > 0
            ? Math.min((currentMonthTotal / partner.limcred) * 100, 100)
            : 0;
    const disponivelMes = partner
        ? Math.max(partner.limcred - currentMonthTotal, 0)
        : 0;
    const trend =
        prevMonthTotal > 0
            ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
            : null;

    // Mini sparkline — últimos 6 meses
    const spark6 = months.slice(6).map((m) => monthlyData[m.key]?.total ?? 0);
    const sparkMax = Math.max(...spark6, 1);

    // Dias desde a última compra
    const daysSinceLast = ultimaCompra
        ? Math.floor(
              (Date.now() - new Date(ultimaCompra).getTime()) / 86_400_000,
          )
        : null;

    const totalSalesPages = Math.max(1, Math.ceil(sales.length / PER_PAGE));
    const pagedSales = useMemo(
        () => sales.slice((salesPage - 1) * PER_PAGE, salesPage * PER_PAGE),
        [sales, salesPage, PER_PAGE],
    );
    const nowKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    const initials = partner
        ? toTitleCase(partner.nome)
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
        : "…";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-(--muted-foreground) animate-[fade-in_0.2s_ease-out]">
                Carregando…
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 animate-[fade-in_0.2s_ease-out]">
                <p className="text-sm text-(--muted-foreground)">
                    Funcionário não encontrado.
                </p>
                <button
                    onClick={() => navigate("/funcionarios")}
                    className="text-[0.72rem] text-(--primary) underline"
                >
                    Voltar para lista
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">

                {/* Dot grid decorativo */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, color-mix(in oklch, currentColor 7%, transparent) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                    }}
                />

                {/* Cantos decorativos */}
                {[
                    "top-0 left-0 border-t-2 border-l-2",
                    "top-0 right-0 border-t-2 border-r-2",
                    "bottom-0 left-0 border-b-2 border-l-2",
                    "bottom-0 right-0 border-b-2 border-r-2",
                ].map((cls, i) => (
                    <div
                        key={i}
                        className={`absolute w-5 h-5 border-(--primary)/35 ${cls}`}
                    />
                ))}

                {/* ── Identidade ── */}
                <div className="relative flex items-start gap-6 px-8 pt-7 pb-6">
                    {/* Avatar */}
                    <div className="shrink-0 relative mt-1">
                        <div
                            className="w-16 h-16 bg-(--primary)/8 border border-(--primary)/25 flex items-center justify-center"
                            style={{
                                boxShadow:
                                    "inset 0 0 20px color-mix(in oklch, var(--primary) 8%, transparent)",
                            }}
                        >
                            <span className="text-xl font-black text-(--primary) tracking-[0.2em]">
                                {initials}
                            </span>
                        </div>
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                        {/* Linha de classificação */}
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[0.44rem] uppercase tracking-[0.4em] text-(--muted-foreground)">
                                Funcionário // Registro
                            </span>
                            {partner.bloqueado ? (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[0.44rem] font-black uppercase tracking-[0.2em]">
                                    <Ban size={7} /> Bloqueado
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-(--primary)/8 border border-(--primary)/20 text-(--primary) text-[0.44rem] font-black uppercase tracking-[0.2em]">
                                    <span className="w-1 h-1 bg-(--primary) animate-pulse" />{" "}
                                    Ativo
                                </span>
                            )}
                        </div>

                        {/* Nome — destaque máximo */}
                        <h1 className="text-(--foreground) font-black uppercase text-[1.55rem] leading-none tracking-[0.06em] mb-3">
                            {toTitleCase(partner.nome)}
                        </h1>

                        {/* Metadados em linha com separador · */}
                        <div className="flex flex-wrap items-center gap-x-0 text-[0.58rem] text-(--muted-foreground) tracking-wider">
                            <span className="font-mono">
                                {formatCPF(partner.cpf)}
                            </span>
                            {partner.matricula && (
                                <>
                                    <span className="mx-2 opacity-25">·</span>
                                    <span>Mat. {partner.matricula}</span>
                                </>
                            )}
                            {partner.empresa && (
                                <>
                                    <span className="mx-2 opacity-25">·</span>
                                    <span>{partner.empresa.nome}</span>
                                </>
                            )}
                            {daysSinceLast !== null && (
                                <>
                                    <span className="mx-2 opacity-25">·</span>
                                    <span>
                                        Última compra há{" "}
                                        <strong className="text-(--foreground) font-black">
                                            {daysSinceLast}d
                                        </strong>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sparkline + tendência */}
                    <div className="shrink-0 flex flex-col items-end gap-2 pt-1">
                        <span className="text-[0.42rem] uppercase tracking-[0.3em] text-(--muted-foreground)">
                            Tendência · 6m
                        </span>
                        <div
                            className="flex items-end gap-1"
                            style={{ height: 36 }}
                        >
                            {spark6.map((v, i) => (
                                <div
                                    key={i}
                                    className="w-2 transition-all duration-700 ease-out"
                                    style={{
                                        height:
                                            v > 0
                                                ? `${Math.max((v / sparkMax) * 100, 10)}%`
                                                : "5%",
                                        background:
                                            i === 5
                                                ? "var(--primary)"
                                                : v > 0
                                                  ? `color-mix(in oklch, var(--primary) ${35 + i * 10}%, transparent)`
                                                  : "var(--border)",
                                    }}
                                    title={compactMoney(v)}
                                />
                            ))}
                        </div>
                        {trend !== null && (
                            <div
                                className={`flex items-center gap-1 text-[0.55rem] font-black tracking-wide ${trend >= 0 ? "text-(--primary)" : "text-red-500"}`}
                            >
                                {trend >= 0 ? (
                                    <TrendingUp size={11} />
                                ) : (
                                    <TrendingDown size={11} />
                                )}
                                {trend >= 0 ? "+" : ""}
                                {trend.toFixed(1)}%
                            </div>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="shrink-0 flex flex-col gap-1.5 self-start pt-1">
                        <button
                            onClick={() =>
                                navigate(`/funcionarios/${id}/editar`)
                            }
                            className="flex items-center gap-1.5 border border-(--border) px-3 py-2 text-[0.56rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                        >
                            <Pencil size={10} /> Editar
                        </button>
                        <button
                            onClick={() => navigate("/funcionarios")}
                            className="flex items-center gap-1.5 border border-(--border) px-3 py-2 text-[0.56rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                        >
                            <ArrowLeft size={10} /> Voltar
                        </button>
                    </div>
                </div>

                {/* ── KPIs ── */}
                <div className="relative grid grid-cols-5 border-t border-(--border)">
                    {[
                        {
                            label: "Compras Ativas",
                            sub: `${activeSales.length + canceledSales.length} total`,
                            number: activeSales.length,
                            icon: ShoppingBag,
                            decimals: 0,
                            highlight: false,
                        },
                        {
                            label: "Gasto Mês Atual",
                            sub: `${Math.round(pct)}% do limite mensal`,
                            number: currentMonthTotal,
                            icon: TrendingUp,
                            decimals: 2,
                            highlight: true,
                        },
                        {
                            label: "Disponível",
                            sub: "restante no mês",
                            number: disponivelMes,
                            icon: CreditCard,
                            decimals: 2,
                            highlight: false,
                        },
                        {
                            label: "Lim. Mensal",
                            sub: "renova todo mês",
                            number: partner.limcred,
                            icon: CreditCard,
                            decimals: 2,
                            highlight: false,
                        },
                        {
                            label: "Cancelamentos",
                            sub: `de ${sales.length} registros`,
                            number: canceledSales.length,
                            icon: Ban,
                            decimals: 0,
                            highlight: false,
                        },
                    ].map(
                        ({
                            label,
                            sub,
                            number,
                            icon: Icon,
                            decimals,
                            highlight,
                        }) => (
                            <div
                                key={label}
                                className={`group relative px-6 py-4 border-r border-(--border) last:border-r-0 overflow-hidden cursor-default transition-all duration-200 ${highlight ? "bg-(--primary)/5 hover:bg-(--primary)/10" : "bg-muted hover:bg-card"}`}
                            >
                                {/* Linha de acento — sempre presente no destaque, aparece no hover dos demais */}
                                <div
                                    className={`absolute top-0 left-0 right-0 h-0.5 bg-(--primary) transition-opacity duration-200 ${highlight ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                                />
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Icon
                                        size={8}
                                        className={`transition-colors duration-200 ${highlight ? "text-(--primary)" : "text-(--muted-foreground) opacity-50 group-hover:opacity-100 group-hover:text-(--primary)"}`}
                                    />
                                    <p className="text-[0.44rem] uppercase tracking-[0.22em] text-(--muted-foreground)">
                                        {label}
                                    </p>
                                </div>
                                <p
                                    className={`font-black tabular-nums leading-none transition-colors duration-200 ${highlight ? "text-2xl text-(--primary)" : "text-xl text-(--foreground) group-hover:text-(--primary)"}`}
                                >
                                    {decimals > 0 && (
                                        <span className="text-[0.45em] font-bold opacity-50 mr-0.5 tracking-normal">
                                            R$
                                        </span>
                                    )}
                                    <CountUp
                                        value={number}
                                        decimals={decimals}
                                        duration={1.4}
                                        delay={80}
                                    />
                                </p>
                                <p className="text-[0.43rem] text-(--muted-foreground) mt-1.5 uppercase tracking-[0.15em]">
                                    {sub}
                                </p>
                            </div>
                        ),
                    )}
                </div>

                {/* ── Barra de utilização ── */}
                {partner.limcred > 0 && (
                    <div className="relative px-8 py-3 border-t border-(--border)">
                        <div className="flex justify-between mb-1.5">
                            <span className="text-(--muted-foreground) text-[0.44rem] uppercase tracking-[0.25em]">
                                Utilização do limite de crédito
                            </span>
                            <span
                                className={`text-[0.44rem] font-black tracking-wider ${pct > 85 ? "text-red-500" : pct > 60 ? "text-amber-500" : "text-(--primary)"}`}
                            >
                                {Math.round(pct)}%
                            </span>
                        </div>
                        <div className="h-0.5 bg-(--border) w-full">
                            <div
                                className="h-full transition-all duration-700"
                                style={{
                                    width: `${pct}%`,
                                    background:
                                        pct > 85
                                            ? "var(--destructive)"
                                            : pct > 60
                                              ? "#f59e0b"
                                              : "var(--primary)",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Grid: gráfico + filiais ────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
                {/* Gráfico mensal — 2/3 */}
                <div className="col-span-2 bg-card border border-(--border) flex flex-col">
                    <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center justify-between gap-6">
                        <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground) shrink-0">
                            Gastos por Mês — últimos 12 meses
                        </span>
                        {total12m > 0 && (
                            <div className="flex items-center gap-5">
                                {[
                                    {
                                        label: "Total 12m",
                                        value: compactMoney(total12m),
                                    },
                                    {
                                        label: "Média/mês",
                                        value: compactMoney(mediaMensal),
                                    },
                                    ...(melhorMes && melhorMes.total > 0
                                        ? [
                                              {
                                                  label: "Melhor mês",
                                                  value: `${melhorMes.label} · ${compactMoney(melhorMes.total)}`,
                                                  highlight: true,
                                              },
                                          ]
                                        : []),
                                ].map(({ label, value, highlight }) => (
                                    <div key={label} className="text-right">
                                        <p className="text-[0.42rem] uppercase tracking-[0.18em] text-(--muted-foreground)">
                                            {label}
                                        </p>
                                        <p
                                            className={`text-[0.72rem] font-black tabular-nums ${highlight ? "text-(--primary)" : "text-(--foreground)"}`}
                                        >
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div
                        className="flex-1 flex items-end gap-0 px-5 pt-6 pb-4"
                        style={{ minHeight: 180 }}
                    >
                        {months.map((m) => {
                            const data = monthlyData[m.key];
                            const total = data?.total ?? 0;
                            const count = data?.count ?? 0;
                            const height =
                                maxMonthTotal > 0
                                    ? Math.max(
                                          (total / maxMonthTotal) * 100,
                                          total > 0 ? 4 : 0,
                                      )
                                    : 0;
                            const isCurrent = m.key === nowKey;

                            return (
                                <div
                                    key={m.key}
                                    className="flex-1 flex flex-col items-center gap-1 group"
                                >
                                    <span className="text-[0.47rem] font-black text-(--primary) opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-0.5">
                                        {total > 0 ? compactMoney(total) : ""}
                                    </span>
                                    <div
                                        className="w-full flex items-end justify-center"
                                        style={{ height: 120 }}
                                    >
                                        <div
                                            className="w-[70%] transition-all duration-300 cursor-default group-hover:opacity-100"
                                            style={{
                                                height: `${height}%`,
                                                minHeight: total > 0 ? 3 : 0,
                                                background:
                                                    total > 0
                                                        ? "var(--primary)"
                                                        : "var(--border)",
                                                opacity: isCurrent
                                                    ? 1
                                                    : total > 0
                                                      ? 0.5
                                                      : 0.3,
                                            }}
                                            title={`${m.label}/${m.year}: ${total > 0 ? `${formatMoney(total)} · ${count} compra${count !== 1 ? "s" : ""}` : "sem compras"}`}
                                        />
                                    </div>
                                    <span
                                        className={`text-[0.48rem] uppercase tracking-wider mt-1 font-black ${isCurrent ? "text-(--primary)" : "text-(--muted-foreground)"}`}
                                    >
                                        {m.label}
                                    </span>
                                    {count > 0 && (
                                        <span className="text-[0.42rem] text-(--muted-foreground) opacity-50">
                                            {count}x
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top filiais — 1/3 */}
                <div className="bg-card border border-(--border) flex flex-col">
                    <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center justify-between">
                        <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                            Lojas Frequentadas
                        </span>
                        {topFiliais.length > 0 && (
                            <span className="text-[0.44rem] uppercase tracking-[0.15em] text-(--muted-foreground)">
                                {topFiliais.length} lojas
                            </span>
                        )}
                    </div>
                    <div className="flex-1 p-5 flex flex-col gap-4">
                        {topFiliais.length === 0 ? (
                            <p className="text-[0.75rem] text-(--muted-foreground) m-auto">
                                Sem dados
                            </p>
                        ) : (
                            topFiliais.map((f, i) => (
                                <div
                                    key={i}
                                    className="group flex flex-col gap-1.5 cursor-default"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-[0.44rem] font-black text-(--primary) opacity-40 shrink-0 tabular-nums">
                                                #{i + 1}
                                            </span>
                                            <span className="text-[0.72rem] font-semibold text-(--foreground) truncate group-hover:text-(--primary) transition-colors">
                                                {f.nome}
                                            </span>
                                        </div>
                                        <span className="text-[0.65rem] font-black text-(--primary) shrink-0 tabular-nums">
                                            {compactMoney(f.total)}
                                        </span>
                                    </div>
                                    <div className="h-0.5 bg-(--border) w-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-700 ease-out group-hover:opacity-100"
                                            style={{
                                                width: `${(f.total / maxFilialTotal) * 100}%`,
                                                background: `hsl(${170 + i * 15}, 55%, ${i === 0 ? 45 : 52}%)`,
                                                opacity: i === 0 ? 1 : 0.6,
                                            }}
                                        />
                                    </div>
                                    <span className="text-[0.44rem] uppercase tracking-[0.12em] text-(--muted-foreground)">
                                        {f.count} compra
                                        {f.count !== 1 ? "s" : ""} ·{" "}
                                        {compactMoney(f.total / f.count)} médio
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Tabela de compras ─────────────────────────────────────────── */}
            <div className="bg-card border border-(--border)">
                <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center justify-between">
                    <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                        Histórico Completo
                    </span>
                    <span className="text-[0.52rem] uppercase tracking-[0.15em] text-(--muted-foreground)">
                        {sales.length} registro{sales.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-(--border)">
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
                                        className="px-5 py-3 text-left text-[0.52rem] font-black uppercase tracking-[0.18em] text-(--muted-foreground) whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sales.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-10 text-sm text-(--muted-foreground)"
                                    >
                                        Nenhuma compra registrada.
                                    </td>
                                </tr>
                            ) : (
                                pagedSales.map((sale) => (
                                    <tr
                                        key={sale.id}
                                        className={`group border-b border-(--border) last:border-0 hover:bg-muted transition-colors ${sale.dtcancel ? "opacity-40" : ""}`}
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-0.5 h-5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                                                    style={{
                                                        background: `hsl(${(sale.codfilial * 47) % 360}, 55%, 50%)`,
                                                    }}
                                                />
                                                <span className="text-[0.7rem] text-(--muted-foreground) tabular-nums">
                                                    {formatDateFull(
                                                        sale.dtsaida,
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-[0.75rem] font-semibold text-(--foreground)">
                                            {sale.filial?.filial ??
                                                `Filial ${sale.codfilial}`}
                                        </td>
                                        <td className="px-5 py-3 text-[0.68rem] text-(--muted-foreground) tabular-nums font-mono">
                                            {sale.numnota}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={`text-[0.82rem] font-black tabular-nums ${sale.dtcancel ? "text-(--muted-foreground) line-through" : "text-(--primary)"}`}
                                            >
                                                {formatMoney(sale.vltotal)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {sale.qrcodenfce &&
                                            !sale.dtcancel ? (
                                                <a
                                                    href={sale.qrcodenfce}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[0.6rem] font-semibold text-(--muted-foreground) hover:text-(--primary) transition-colors uppercase tracking-wider"
                                                >
                                                    <ExternalLink size={10} />{" "}
                                                    Ver nota
                                                </a>
                                            ) : (
                                                <span className="text-(--muted-foreground) opacity-25 text-[0.62rem]">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            {sale.dtcancel ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.15em] bg-red-500/10 text-red-500 border border-red-500/20">
                                                    <Ban size={7} /> Cancelado{" "}
                                                    {formatDate(sale.dtcancel)}
                                                </span>
                                            ) : sale.dtdevol ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.15em] bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    Devolvido{" "}
                                                    {formatDate(sale.dtdevol)}
                                                </span>
                                            ) : (
                                                <span className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-green-600">
                                                    OK
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalSalesPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-(--border) bg-muted">
                        <span className="text-[0.5rem] uppercase tracking-[0.18em] text-(--muted-foreground)">
                            {(salesPage - 1) * PER_PAGE + 1}–
                            {Math.min(salesPage * PER_PAGE, sales.length)} de{" "}
                            {sales.length} registros
                        </span>
                        <div className="flex gap-1">
                            {Array.from(
                                { length: totalSalesPages },
                                (_, i) => i + 1,
                            ).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setSalesPage(p)}
                                    className={`w-7 h-7 text-[0.6rem] font-black border transition-all ${
                                        p === salesPage
                                            ? "bg-(--primary) border-(--primary) text-white"
                                            : "border-(--border) text-(--muted-foreground) hover:border-(--primary) hover:text-(--primary)"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
