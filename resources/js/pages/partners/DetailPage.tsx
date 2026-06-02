import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Pencil, ShoppingBag, TrendingUp, TrendingDown,
    CreditCard, Ban, ExternalLink, ChevronUp, ChevronDown,
    Store, Activity, AlertTriangle, CheckCircle2, Download, Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";
import api from "@/lib/axios";
import { formatCPF, formatMoney, toTitleCase } from "@/lib/utils";
import CountUp from "@/components/CountUp";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Partner {
    id: number; nome: string; cpf: string; matricula: string | null;
    limcred: number; bloqueado: number; empresa?: { nome: string };
}
interface Sale {
    id: number; numnota: string; dtsaida: string; vltotal: number;
    codfilial: number; qrcodenfce: string | null;
    dtcancel: string | null; dtdevol: string | null;
    filial?: { filial: string };
}

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function formatDate(iso: string)     { const [, m, d] = iso.split("-"); return `${d}/${m}`; }
function formatDateFull(iso: string) { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; }
function compactMoney(v: number) {
    if (v === 0) return "—";
    if (v >= 1000) return `R$${(v / 1000).toFixed(1).replace(".", ",")}k`;
    return `R$${Math.round(v)}`;
}

const T = {
    bg:"#f4f5f8", card:"#ffffff", border:"#e8eaef",
    cyan:"#0099cc", purple:"#7c3aed",
    green:"#059669", amber:"#d97706", red:"#dc2626",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger = (delay = 0): any => ({ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: delay } } });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rise: any = {
    hidden:  { opacity: 0, y: 28, scale: 0.97, filter: "blur(12px)" },
    visible: { opacity: 1, y: 0,  scale: 1,    filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const riseLeft: any = {
    hidden:  { opacity: 0, x: -24, scale: 0.97, filter: "blur(8px)" },
    visible: { opacity: 1, x: 0,   scale: 1,    filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function PageSkeleton() {
    return (
        <div className="min-h-screen -m-4 md:-m-6 p-6 md:p-8 space-y-5" style={{ background: T.bg }}>
            <Skeleton className="h-8 w-40 rounded-none" />
            <Skeleton className="h-56 w-full rounded-none" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-32 rounded-none" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Skeleton className="h-72 rounded-none lg:col-span-2" />
                <Skeleton className="h-72 rounded-none" />
            </div>
            <Skeleton className="h-56 w-full rounded-none" />
        </div>
    );
}

export default function PartnerDetailPage() {
    const { id }   = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [partner,     setPartner]     = useState<Partner | null>(null);
    const [sales,       setSales]       = useState<Sale[]>([]);
    const [loading,     setLoading]     = useState(true);
    const [salesPage,   setSalesPage]   = useState(1);
    const [filterMonth, setFilterMonth] = useState<string | null>(null);
    const [sortField,   setSortField]   = useState<"dtsaida"|"filial"|"numnota"|"vltotal"|"status">("dtsaida");
    const [sortOrder,   setSortOrder]   = useState<"asc"|"desc">("desc");
    const [hoveredBar,  setHoveredBar]  = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const PER_PAGE = 10;

    useEffect(() => {
        setLoading(true);
        Promise.all([api.get(`/partners/${id}`), api.get(`/partners/${id}/sales`)])
            .then(([p, s]) => { setPartner(p.data); setSales(s.data); setSalesPage(1); })
            .finally(() => setLoading(false));
    }, [id]);

    const activeSales   = useMemo(() => sales.filter(s => !s.dtcancel), [sales]);
    const canceledSales = useMemo(() => sales.filter(s => !!s.dtcancel), [sales]);
    const months = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
            return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: MESES[d.getMonth()], year: d.getFullYear() };
        });
    }, []);
    const monthlyData = useMemo(() => {
        const map: Record<string, { total: number; count: number }> = {};
        activeSales.forEach(s => {
            const key = s.dtsaida.slice(0, 7);
            if (!map[key]) map[key] = { total: 0, count: 0 };
            map[key].total += Number(s.vltotal); map[key].count++;
        });
        return map;
    }, [activeSales]);
    const maxMonthTotal = useMemo(() => Math.max(...months.map(m => monthlyData[m.key]?.total ?? 0), 1), [months, monthlyData]);
    const topFiliais = useMemo(() => {
        const map: Record<string, { nome: string; total: number; count: number }> = {};
        activeSales.forEach(s => {
            const k = String(s.codfilial);
            if (!map[k]) map[k] = { nome: s.filial?.filial ?? `Filial ${s.codfilial}`, total: 0, count: 0 };
            map[k].total += Number(s.vltotal); map[k].count++;
        });
        return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 4);
    }, [activeSales]);
    const maxFilialTotal    = topFiliais[0]?.total ?? 1;
    const total12m          = useMemo(() => months.reduce((s, m) => s + (monthlyData[m.key]?.total ?? 0), 0), [months, monthlyData]);
    const mediaMensal       = useMemo(() => { const ct = months.filter(m => (monthlyData[m.key]?.total ?? 0) > 0).length; return ct > 0 ? total12m / ct : 0; }, [total12m, months, monthlyData]);
    const melhorMes         = useMemo(() => months.reduce<{label:string;total:number}|null>((b,m) => { const t = monthlyData[m.key]?.total ?? 0; return !b || t > b.total ? {label:m.label,total:t} : b; }, null), [months, monthlyData]);
    const currentMonthTotal = monthlyData[months[11]?.key]?.total ?? 0;
    const prevMonthTotal    = monthlyData[months[10]?.key]?.total ?? 0;
    const pct               = partner && partner.limcred > 0 ? Math.min((currentMonthTotal / partner.limcred) * 100, 100) : 0;
    const disponivelMes     = partner ? Math.max(partner.limcred - currentMonthTotal, 0) : 0;
    const trend             = prevMonthTotal > 0 ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : null;
    const spark6            = months.slice(6).map(m => monthlyData[m.key]?.total ?? 0);
    const sparkMax          = Math.max(...spark6, 1);
    const ultimaCompra      = sales[0]?.dtsaida ?? null;
    const daysSinceLast     = ultimaCompra ? Math.floor((Date.now() - new Date(ultimaCompra).getTime()) / 86_400_000) : null;
    const availableMonths   = useMemo(() => { const s = new Set<string>(); sales.forEach(x => s.add(x.dtsaida.slice(0, 7))); return Array.from(s).sort(); }, [sales]);
    const filteredSales     = useMemo(() => filterMonth ? sales.filter(s => s.dtsaida.slice(0, 7) === filterMonth) : sales, [sales, filterMonth]);
    const sortedSales       = useMemo(() => {
        return [...filteredSales].sort((a, b) => {
            let va: string|number, vb: string|number;
            if      (sortField==="dtsaida")  { va=a.dtsaida;            vb=b.dtsaida; }
            else if (sortField==="filial")   { va=a.filial?.filial??""; vb=b.filial?.filial??""; }
            else if (sortField==="numnota")  { va=Number(a.numnota);    vb=Number(b.numnota); }
            else if (sortField==="vltotal")  { va=Number(a.vltotal);    vb=Number(b.vltotal); }
            else { va=a.dtcancel?2:a.dtdevol?1:0; vb=b.dtcancel?2:b.dtdevol?1:0; }
            if (va<vb) return sortOrder==="asc"?-1:1;
            if (va>vb) return sortOrder==="asc"?1:-1;
            return 0;
        });
    }, [filteredSales, sortField, sortOrder]);
    const searchedSales   = useMemo(() => {
        if (!searchQuery.trim()) return sortedSales;
        const q = searchQuery.toLowerCase();
        return sortedSales.filter(s =>
            (s.filial?.filial ?? `Filial ${s.codfilial}`).toLowerCase().includes(q) ||
            s.numnota.toLowerCase().includes(q)
        );
    }, [sortedSales, searchQuery]);
    const totalSalesPages = Math.max(1, Math.ceil(searchedSales.length / PER_PAGE));
    const totalSorted     = useMemo(() => searchedSales.filter(s=>!s.dtcancel).reduce((s,x)=>s+Number(x.vltotal),0), [searchedSales]);
    const pagedSales      = useMemo(() => searchedSales.slice((salesPage-1)*PER_PAGE, salesPage*PER_PAGE), [searchedSales, salesPage]);
    const nowKey          = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
    const initials        = partner ? toTitleCase(partner.nome).split(" ").map(n=>n[0]).slice(0,2).join("") : "…";

    useEffect(() => { setSalesPage(1); }, [filterMonth, sortField, sortOrder, searchQuery]);
    function toggleSort(field: typeof sortField) {
        if (sortField===field) setSortOrder(o=>o==="asc"?"desc":"asc");
        else { setSortField(field); setSortOrder("asc"); }
    }

    const barColor = pct > 85 ? T.red : pct > 60 ? T.amber : T.cyan;

    function exportToExcel() {
        const data = searchedSales.map(s => ({
            "Data":       formatDateFull(s.dtsaida),
            "Loja":       s.filial?.filial ?? `Filial ${s.codfilial}`,
            "Nº Nota":    s.numnota,
            "Valor (R$)": Number(s.vltotal),
            "Status":     s.dtcancel ? "Cancelado" : s.dtdevol ? "Devolvido" : "OK",
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Compras");
        XLSX.writeFile(wb, `compras_${partner!.nome.split(" ").slice(0,2).join("_").toLowerCase()}.xlsx`);
    }

    if (loading) return <PageSkeleton />;
    if (!partner) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-sm text-muted-foreground">Funcionário não encontrado.</p>
            <Button variant="ghost" size="sm" className="rounded-none" onClick={() => navigate("/funcionarios")}>
                <ArrowLeft size={12}/> Voltar
            </Button>
        </div>
    );

    return (
        <motion.div className="relative -m-4 md:-m-6 p-4 md:p-8 min-h-screen" style={{ background: T.bg }}
            variants={stagger(0.04)} initial="hidden" animate="visible">

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-48 -right-48 w-[700px] h-[600px] opacity-[0.10]"
                     style={{ background: `radial-gradient(ellipse, ${T.cyan} 0%, transparent 65%)` }} />
            </div>

            <div className="relative max-w-[1400px] mx-auto flex flex-col gap-5 pb-12">

                {/* Nav */}
                <motion.div variants={rise}>
                    <Button variant="ghost" size="sm" className="rounded-none -ml-2 group text-muted-foreground"
                            onClick={() => navigate("/funcionarios")}>
                        <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" /> Funcionários
                    </Button>
                </motion.div>

                {/* Hero Card */}
                <motion.div variants={rise}>
                    <div className="overflow-hidden bg-white"
                         style={{ border:`1px solid ${T.border}`, boxShadow:`0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)` }}>
                        <div className="h-[3px] w-full"
                             style={{ background:`linear-gradient(90deg, ${T.cyan} 0%, ${T.cyan}40 100%)` }} />
                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#e8eaef]">

                            {/* Esquerda */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 shrink-0 flex items-center justify-center mt-0.5"
                                         style={{ background:`${T.cyan}08`, border:`2px solid ${T.cyan}20` }}>
                                        <span className="text-sm font-black tracking-wider" style={{ color:T.cyan }}>{initials}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h1 className="text-xl md:text-2xl font-black uppercase leading-none tracking-tight text-foreground">
                                                {toTitleCase(partner.nome)}
                                            </h1>
                                            {partner.bloqueado ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-wider"
                                                      style={{ background:`${T.red}10`, border:`1px solid ${T.red}25`, color:T.red }}>
                                                    <Ban size={7}/> Bloqueado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-wider"
                                                      style={{ background:`${T.green}10`, border:`1px solid ${T.green}25`, color:T.green }}>
                                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:T.green }}/> Ativo
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-x-0">
                                            <span className="font-mono">{formatCPF(partner.cpf)}</span>
                                            {partner.matricula && <><span className="mx-2 opacity-30">·</span><span>Mat. {partner.matricula}</span></>}
                                            {partner.empresa   && <><span className="mx-2 opacity-30">·</span><span>{partner.empresa.nome}</span></>}
                                            {daysSinceLast !== null && <><span className="mx-2 opacity-30">·</span><span>Última compra há <strong className="font-semibold text-foreground/70">{daysSinceLast}d</strong></span></>}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="rounded-none shrink-0 text-xs"
                                            onClick={() => navigate(`/funcionarios/${id}/editar`)}>
                                        <Pencil size={11}/> Editar
                                    </Button>
                                </div>

                                <div>
                                    <p className="text-[0.58rem] font-black uppercase tracking-[0.25em] text-muted-foreground mb-2">
                                        {partner.bloqueado ? "Conta suspensa" : "Disponível para compra"}
                                    </p>
                                    {partner.bloqueado ? (
                                        <p className="text-4xl font-black uppercase" style={{ color:T.red }}>Suspenso</p>
                                    ) : (
                                        <p className="text-6xl md:text-7xl font-black tabular-nums leading-none"
                                           style={{ background:`linear-gradient(135deg, ${T.cyan} 0%, ${T.purple} 100%)`,
                                                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                                            <span style={{ fontSize:"0.28em", WebkitTextFillColor:T.cyan, opacity:0.4, marginRight:"3px" }}>R$</span>
                                            <CountUp value={disponivelMes} decimals={2} duration={1.4} delay={200}/>
                                        </p>
                                    )}
                                </div>

                                {partner.limcred > 0 && (
                                    <div className="mt-auto">
                                        <div className="flex justify-between text-[0.6rem] mb-2">
                                            <span className="font-black uppercase tracking-wider text-muted-foreground">Utilização do limite</span>
                                            <span className="font-black" style={{ color:barColor }}>
                                                <CountUp value={pct} decimals={0} duration={1.4} delay={200}/>%
                                            </span>
                                        </div>
                                        <div className="relative h-2 w-full overflow-hidden" style={{ background:`${T.cyan}10` }}>
                                            <motion.div className="absolute top-0 left-0 h-full"
                                                        initial={{ width:0 }} animate={{ width:`${pct}%` }}
                                                        transition={{ type:"spring", stiffness:45, damping:14, delay:0.6 }}
                                                        style={{ background:`linear-gradient(to right, ${T.cyan}, ${barColor})` }}>
                                                <div className="absolute inset-0 w-1/2"
                                                     style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)", animation:"bar-shimmer 2.8s ease-in-out infinite" }}/>
                                            </motion.div>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                                            <span>{formatMoney(currentMonthTotal)} gasto</span>
                                            <span>Limite {formatMoney(partner.limcred)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Direita */}
                            <div className="lg:w-64 xl:w-72 flex flex-col divide-y divide-[#e8eaef]">
                                <div className="px-5 py-5">
                                    <p className="text-[0.55rem] font-black uppercase tracking-[0.22em] text-muted-foreground mb-1.5">Gasto no Mês</p>
                                    <p className="text-2xl font-black tabular-nums text-foreground leading-none">
                                        <span className="text-sm font-bold opacity-25 mr-0.5">R$</span>
                                        <CountUp value={currentMonthTotal} decimals={2} duration={1} delay={280}/>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">{Math.round(pct)}% do limite mensal</p>
                                    {trend !== null && (
                                        <div className="flex items-center gap-1.5 mt-3">
                                            <span className="flex items-center gap-1 text-xs font-black"
                                                  style={{ color:trend>=0?T.amber:T.green }}>
                                                {trend>=0?<TrendingUp size={12}/>:<TrendingDown size={12}/>}
                                                {trend>=0?"+":""}{trend.toFixed(1)}%
                                            </span>
                                            <span className="text-[0.65rem] text-muted-foreground">vs mês anterior</span>
                                        </div>
                                    )}
                                </div>
                                <div className="px-5 py-4 flex flex-col gap-2.5">
                                    {[
                                        { label:"Total 12 meses", val:total12m,    hl:false },
                                        { label:"Média mensal",   val:mediaMensal, hl:false },
                                        ...(melhorMes&&melhorMes.total>0?[{label:`Melhor · ${melhorMes.label}`,val:melhorMes.total,hl:true}]:[]),
                                    ].map(({ label, val, hl }) => (
                                        <div key={label} className="flex items-center justify-between gap-2">
                                            <span className="text-[0.58rem] uppercase tracking-wider text-muted-foreground font-bold">{label}</span>
                                            <span className="text-xs font-black tabular-nums" style={{ color:hl?T.cyan:"var(--foreground)" }}>
                                                <span className="opacity-30 mr-0.5 text-[0.65em]">R$</span>
                                                <CountUp value={val} decimals={2} duration={1.2} delay={380}/>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-5 py-5 flex-1">
                                    <p className="text-[0.55rem] font-black uppercase tracking-[0.22em] text-muted-foreground mb-3">Tendência · 6 meses</p>
                                    <div className="flex items-end gap-1.5 w-full" style={{ height:56 }}>
                                        {spark6.map((v, i) => (
                                            <motion.div key={i} className="flex-1"
                                                style={{
                                                    background: i===5?`linear-gradient(to top, ${T.cyan}, ${T.purple}90)`:v>0?`linear-gradient(to top, ${T.cyan}${Math.round(22+i*11).toString(16).padStart(2,"0")}, ${T.cyan}${Math.round(10+i*6).toString(16).padStart(2,"0")})`:`${T.border}`,
                                                    transformOrigin:"bottom",
                                                    height: v>0?`${Math.max((v/sparkMax)*100,8)}%`:"4%",
                                                }}
                                                initial={{ scaleY:0 }} animate={{ scaleY:1 }}
                                                transition={{ type:"spring", stiffness:100, damping:14, delay:0.42+i*0.07 }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[0.5rem] text-muted-foreground">6m atrás</span>
                                        <span className="text-[0.5rem] font-bold" style={{ color:T.cyan }}>Hoje</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* KPI Grid */}
                <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3" variants={stagger(0.1)}>
                    {([
                        { label:"Compras Ativas", icon:ShoppingBag, value:activeSales.length, dec:0, prefix:"", sub:`${activeSales.length+canceledSales.length} registros no total`, color:T.cyan, iconBg:`${T.cyan}10`, iconBorder:`${T.cyan}22`, trend:null, progress:(activeSales.length/Math.max(sales.length,1))*100 },
                        { label:"Gasto no Mês",   icon:TrendingUp,  value:currentMonthTotal,  dec:2, prefix:"R$", sub:`${Math.round(pct)}% do limite mensal`, color:pct>85?T.red:pct>60?T.amber:T.cyan, iconBg:`${T.cyan}12`, iconBorder:`${T.cyan}25`, trend:trend, progress:pct },
                        { label:"Limite Mensal",  icon:CreditCard,  value:partner.limcred,    dec:2, prefix:"R$", sub:"renova todo mês", color:"#94a3b8", iconBg:"#94a3b810", iconBorder:"#94a3b822", trend:null, progress:100 },
                        { label:"Cancelamentos",  icon:canceledSales.length>0?AlertTriangle:CheckCircle2, value:canceledSales.length, dec:0, prefix:"", sub:canceledSales.length>0?"requer atenção":"sem ocorrências", color:canceledSales.length>0?T.red:T.green, iconBg:canceledSales.length>0?`${T.red}10`:`${T.green}10`, iconBorder:canceledSales.length>0?`${T.red}22`:`${T.green}22`, trend:null, progress:canceledSales.length>0?(canceledSales.length/Math.max(sales.length,1))*100:0 },
                    ] as const).map(({ label, icon:Icon, value, dec, prefix, sub, color, iconBg, iconBorder, trend:kpiTrend, progress }, i) => (
                        <motion.div key={label} variants={rise}
                            className="bg-white p-3.5 cursor-default overflow-hidden relative group flex flex-col"
                            style={{ height:"150px", border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}
                            whileHover={{ y:-4, boxShadow:`0 14px 36px rgba(0,0,0,0.10), 0 0 0 1px ${color}35`, transition:{ type:"spring", stiffness:300, damping:22 } }}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                                     style={{ background:iconBg, border:`1px solid ${iconBorder}` }}>
                                    <Icon size={13} style={{ color }}/>
                                </div>
                                <p className="text-[0.56rem] font-black uppercase tracking-[0.18em] text-muted-foreground leading-tight">{label}</p>
                            </div>
                            <p className="text-2xl font-black tabular-nums text-foreground leading-none mb-1">
                                {prefix && <span className="text-[0.6em] font-bold opacity-25 mr-0.5">{prefix}</span>}
                                <CountUp value={value} decimals={dec} duration={0.9} delay={80+i*60}/>
                            </p>
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[0.58rem] text-muted-foreground truncate">{sub}</p>
                                {kpiTrend !== null && (
                                    <span className="shrink-0 inline-flex items-center gap-0.5 text-[0.58rem] font-black"
                                          style={{ color:kpiTrend>=0?T.amber:T.green }}>
                                        {kpiTrend>=0?<TrendingUp size={8}/>:<TrendingDown size={8}/>}
                                        {Math.abs(kpiTrend).toFixed(0)}%
                                    </span>
                                )}
                            </div>
                            <div className="mt-auto pt-2">
                                <div className="h-[3px] w-full overflow-hidden" style={{ background:`${color}12` }}>
                                    <motion.div className="h-full" initial={{ width:0 }} animate={{ width:`${Math.min(progress,100)}%` }}
                                        transition={{ delay:0.5+i*0.1, duration:1.1, ease:"easeOut" }}
                                        style={{ background:`linear-gradient(to right, ${color}70, ${color})` }}/>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Gráfico + Filiais */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <motion.div variants={rise} className="lg:col-span-2 bg-white flex flex-col overflow-hidden"
                        style={{ border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", height:"380px" }}>
                        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
                            <div className="flex items-center gap-2.5">
                                <Activity size={13} style={{ color:T.cyan }}/>
                                <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground">Gasto Mensal · 12 meses</span>
                            </div>
                            {total12m > 0 && (
                                <div className="flex items-center gap-4 divide-x divide-[#e8eaef]">
                                    {[
                                        { label:"Total 12m", val:total12m,    hl:false },
                                        { label:"Média",     val:mediaMensal, hl:false },
                                        ...(melhorMes&&melhorMes.total>0?[{label:`↑ ${melhorMes.label}`,val:melhorMes.total,hl:true}]:[]),
                                    ].map(({ label, val, hl }) => (
                                        <div key={label} className="pl-4 first:pl-0 text-right">
                                            <p className="text-[0.52rem] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
                                            <p className="text-xs font-black tabular-nums" style={{ color:hl?T.cyan:"var(--foreground)" }}>
                                                <span className="opacity-30 mr-0.5 text-[0.65em]">R$</span>
                                                <CountUp value={val} decimals={2} duration={1} delay={80}/>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative flex-1 px-4 pt-5 pb-2">
                            <div className="absolute inset-x-4 top-5 bottom-8 flex flex-col justify-between pointer-events-none">
                                {[0,1,2,3].map(i => <div key={i} className="w-full" style={{ borderTop:`1px dashed ${T.border}` }}/>)}
                            </div>
                            {mediaMensal > 0 && (
                                <div className="absolute left-0 right-0 pointer-events-none z-10"
                                     style={{ bottom:`calc(28px + ${Math.min((mediaMensal/maxMonthTotal)*150,148)}px)` }}>
                                    <div className="relative">
                                        <div className="w-full" style={{ borderTop:`1.5px dashed ${T.cyan}45` }}/>
                                        <span className="absolute right-0 -top-4 text-[0.48rem] font-black uppercase tracking-wider px-1.5 py-0.5"
                                              style={{ color:T.cyan, background:T.card, border:`1px solid ${T.cyan}25` }}>
                                            Média {compactMoney(mediaMensal)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="relative flex items-end h-full pb-7 gap-px">
                                {months.map((m, i) => {
                                    const data=monthlyData[m.key]; const total=data?.total??0; const count=data?.count??0;
                                    const BAR_H=200; const h=total>0?Math.max((total/maxMonthTotal)*BAR_H,4):0;
                                    const isCurr=m.key===nowKey; const isHov=hoveredBar===m.key;
                                    const isBest=melhorMes?.label===m.label&&melhorMes?.total>0;
                                    return (
                                        <div key={m.key} className="flex-1 flex flex-col items-center relative cursor-default"
                                             onMouseEnter={() => setHoveredBar(m.key)} onMouseLeave={() => setHoveredBar(null)}>
                                            {isCurr&&total>0&&!isHov && (
                                                <motion.div className="absolute bottom-full mb-1 text-[0.5rem] font-black whitespace-nowrap pointer-events-none"
                                                    style={{ color:T.cyan }} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}>
                                                    {compactMoney(total)}
                                                </motion.div>
                                            )}
                                            <AnimatePresence>
                                                {isHov&&total>0 && (
                                                    <motion.div className="absolute bottom-full mb-2 z-20 px-2.5 py-1.5 text-[0.6rem] font-black whitespace-nowrap pointer-events-none"
                                                        style={{ background:T.card, border:`1px solid ${T.border}`, color:T.cyan, boxShadow:"0 4px 16px rgba(0,0,0,0.12)" }}
                                                        initial={{ opacity:0, y:5, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }}
                                                        exit={{ opacity:0, y:5, scale:0.9 }} transition={{ duration:0.12 }}>
                                                        {compactMoney(total)}
                                                        {count>0&&<span className="ml-1 text-muted-foreground font-medium">· {count}x</span>}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                                                             style={{ borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:`5px solid ${T.border}` }}/>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className="w-full flex justify-center" style={{ height:BAR_H }}>
                                                <div className="w-[62%] flex items-end">
                                                    <motion.div className="w-full transition-all duration-200"
                                                        style={{
                                                            height:h,
                                                            background: total>0?(isCurr||isBest)?`linear-gradient(to top, ${T.cyan}, ${T.purple}90)`:isHov?`linear-gradient(to top, ${T.cyan}80, ${T.purple}50)`:`linear-gradient(to top, ${T.cyan}40, ${T.purple}20)`:T.border,
                                                            boxShadow:(isCurr||isBest||isHov)&&total>0?`0 -2px 12px ${T.cyan}30`:"none",
                                                            transformOrigin:"bottom",
                                                        }}
                                                        initial={{ scaleY:0 }} animate={{ scaleY:1 }}
                                                        transition={{ type:"spring", stiffness:80, damping:15, delay:0.28+i*0.04 }}/>
                                                </div>
                                            </div>
                                            <span className="text-[0.45rem] font-black uppercase tracking-wider mt-1"
                                                  style={{ color:isCurr?T.cyan:"var(--muted-foreground)" }}>{m.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={riseLeft} className="bg-white flex flex-col overflow-hidden"
                        style={{ border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", height:"380px" }}>
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
                            <div className="flex items-center gap-2.5">
                                <Store size={13} style={{ color:T.purple }}/>
                                <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground">Top Filiais</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{topFiliais.length} lojas</span>
                        </div>
                        <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain" style={{ scrollbarWidth:"none" }}>
                            {topFiliais.length===0 ? (
                                <div className="flex-1 flex items-center justify-center py-10">
                                    <p className="text-sm text-muted-foreground">Sem dados</p>
                                </div>
                            ) : topFiliais.map((f, i) => {
                                const filialColors=[T.cyan,T.purple,"#2563eb","#059669"];
                                const color=filialColors[i]??filialColors[3];
                                const pctFilial=Math.round((f.total/maxFilialTotal)*100);
                                return (
                                    <motion.div key={i} className="px-5 py-4 group cursor-default hover:bg-[#f9fafb] transition-colors"
                                        style={{ borderBottom:i<topFiliais.length-1?`1px solid ${T.border}`:"none" }}
                                        initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }}
                                        transition={{ delay:0.38+i*0.09, duration:0.45 }}>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="text-sm font-black w-5 tabular-nums shrink-0" style={{ color }}>{i+1}</span>
                                                <span className="text-sm font-semibold text-foreground truncate">{f.nome}</span>
                                            </div>
                                            <div className="flex items-end flex-col shrink-0">
                                                <span className="text-sm font-black tabular-nums" style={{ color }}>
                                                    <span className="text-[0.6em] opacity-40 mr-0.5">R$</span>
                                                    <CountUp value={f.total} decimals={2} duration={1} delay={80}/>
                                                </span>
                                                <span className="text-[0.55rem] text-muted-foreground font-medium">{pctFilial}%</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden" style={{ background:`${color}12` }}>
                                            <motion.div className="h-full" initial={{ width:0 }} animate={{ width:`${pctFilial}%` }}
                                                transition={{ type:"spring", stiffness:60, damping:14, delay:0.4+i*0.09 }}
                                                style={{ background:`linear-gradient(to right, ${color}, ${color}70)` }}/>
                                        </div>
                                        <p className="text-[0.6rem] text-muted-foreground mt-1.5">
                                            {f.count} compra{f.count!==1?"s":""} · <CountUp value={f.total/f.count} decimals={2} duration={1} delay={80}/> ticket médio
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Tabela */}
                <motion.div variants={rise}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.22em] text-muted-foreground">Histórico de Compras</span>
                            <span className="text-[0.6rem] font-bold px-2 py-0.5 tabular-nums text-muted-foreground"
                                  style={{ background:T.border, border:`1px solid ${T.border}` }}>
                                {searchedSales.length}{sales.length!==searchedSales.length?` / ${sales.length}`:""}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                                <input type="text" placeholder="Buscar loja ou nota…" value={searchQuery}
                                       onChange={e => setSearchQuery(e.target.value)}
                                       className="pl-7 pr-3 py-1.5 text-[0.62rem] outline-none transition-colors"
                                       style={{ background:T.card, border:`1px solid ${T.border}`, color:"var(--foreground)", width:"170px" }}
                                       onFocus={e => (e.currentTarget.style.borderColor=T.cyan)}
                                       onBlur={e  => (e.currentTarget.style.borderColor=T.border)}/>
                            </div>
                            {availableMonths.length>1 && (
                                <select value={filterMonth??""} onChange={e => setFilterMonth(e.target.value||null)}
                                        className="text-[0.6rem] font-black uppercase tracking-wider px-3 py-1.5 outline-none transition-colors"
                                        style={{ background:T.card, border:`1px solid ${T.border}`, color:"var(--muted-foreground)" }}>
                                    <option value="">Todos os meses</option>
                                    {availableMonths.map(m => { const [y,mo]=m.split("-"); return <option key={m} value={m}>{MESES[parseInt(mo)-1]} {y}</option>; })}
                                </select>
                            )}
                            {searchedSales.length > 0 && (
                                <button onClick={exportToExcel}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-wider transition-all"
                                        style={{ background:`${T.cyan}10`, border:`1px solid ${T.cyan}30`, color:T.cyan }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background=`${T.cyan}18`; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background=`${T.cyan}10`; }}>
                                    <Download size={10}/> Excel
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden" style={{ border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max border-collapse">
                                <thead>
                                    <tr style={{ background:T.bg, borderBottom:`1px solid ${T.border}` }}>
                                        {([["dtsaida","Data"],["filial","Loja"],["numnota","Nº Nota"],["vltotal","Valor"]] as [typeof sortField,string][]).map(([field,label]) => (
                                            <th key={field} onClick={() => toggleSort(field)}
                                                className="px-4 py-3 text-left cursor-pointer select-none whitespace-nowrap group transition-colors"
                                                style={{ color:sortField===field?T.cyan:"var(--muted-foreground)" }}>
                                                <span className="inline-flex items-center gap-1 text-[0.6rem] font-black uppercase tracking-widest">
                                                    {label}
                                                    {sortField===field?(sortOrder==="asc"?<ChevronUp size={9}/>:<ChevronDown size={9}/>):<ChevronUp size={9} className="opacity-0 group-hover:opacity-30"/>}
                                                </span>
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-left text-[0.6rem] font-black uppercase tracking-widest whitespace-nowrap text-muted-foreground">NFC-e</th>
                                        <th onClick={() => toggleSort("status")}
                                            className="px-4 py-3 text-left cursor-pointer select-none whitespace-nowrap group"
                                            style={{ color:sortField==="status"?T.cyan:"var(--muted-foreground)" }}>
                                            <span className="inline-flex items-center gap-1 text-[0.6rem] font-black uppercase tracking-widest">
                                                Status
                                                {sortField==="status"?(sortOrder==="asc"?<ChevronUp size={9}/>:<ChevronDown size={9}/>):<ChevronUp size={9} className="opacity-0 group-hover:opacity-30"/>}
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSales.length===0 ? (
                                        <tr><td colSpan={6} className="text-center py-14 text-sm text-muted-foreground">
                                            {sales.length===0?"Nenhuma compra registrada.":"Nenhuma compra neste mês."}
                                        </td></tr>
                                    ) : pagedSales.map((sale, i) => (
                                        <motion.tr key={sale.id} className="group transition-colors"
                                            style={{ borderBottom:`1px solid ${T.border}`, opacity:sale.dtcancel?0.45:1 }}
                                            initial={{ opacity:0 }} animate={{ opacity:sale.dtcancel?0.45:1 }}
                                            transition={{ delay:0.18+i*0.03 }}
                                            whileHover={{ backgroundColor:`${T.cyan}04` } as any}>
                                            <td className="px-4 py-1">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-[3px] h-4 shrink-0 opacity-70"
                                                         style={{ background:`hsl(${(sale.codfilial*47)%360},60%,52%)` }}/>
                                                    <span className="text-sm tabular-nums text-muted-foreground">{formatDateFull(sale.dtsaida)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-1 text-sm font-semibold text-foreground">{sale.filial?.filial??`Filial ${sale.codfilial}`}</td>
                                            <td className="px-4 py-1 text-sm tabular-nums font-mono text-muted-foreground">{sale.numnota}</td>
                                            <td className="px-4 py-1">
                                                <span className="text-sm font-black tabular-nums"
                                                      style={{ color:sale.dtcancel?"var(--muted-foreground)":T.cyan, textDecoration:sale.dtcancel?"line-through":"none" }}>
                                                    <span className="text-[0.6em] opacity-40 mr-0.5">R$</span>
                                                    <CountUp value={sale.vltotal} decimals={2} duration={0.5} delay={80}/>
                                                </span>
                                            </td>
                                            <td className="px-4 py-1">
                                                {sale.qrcodenfce&&!sale.dtcancel?<a href={sale.qrcodenfce} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[0.62rem] font-medium text-muted-foreground hover:text-primary transition-colors">
                                                    <ExternalLink size={10}/> NFC-e</a>
                                                : <span className="text-muted-foreground opacity-30 text-xs">—</span>}
                                            </td>
                                            <td className="px-4 py-1">
                                                {sale.dtcancel?<span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-wider" style={{ background:`${T.red}08`, border:`1px solid ${T.red}25`, color:T.red }}><Ban size={7}/> Cancelado {formatDate(sale.dtcancel)}</span>
                                                :sale.dtdevol?<span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-wider" style={{ background:`${T.amber}08`, border:`1px solid ${T.amber}25`, color:T.amber }}>Devolvido {formatDate(sale.dtdevol)}</span>
                                                :<span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-wider" style={{ background:`${T.green}08`, border:`1px solid ${T.green}25`, color:T.green }}><CheckCircle2 size={8}/> Confirmado</span>}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                                {sortedSales.length>0 && (
                                    <tfoot>
                                        <tr style={{ borderTop:`2px solid ${T.border}`, background:T.bg }}>
                                            <td colSpan={3} className="px-4 py-3">
                                                <span className="text-[0.6rem] font-black uppercase tracking-wider text-muted-foreground">
                                                    {filterMonth?"Total do mês":"Total geral"}
                                                    {sortedSales.some(s=>s.dtcancel)&&<span className="ml-1 font-normal opacity-50">(excl. cancelados)</span>}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-black tabular-nums" style={{ color:T.cyan }}>
                                                    <span className="text-[0.6em] opacity-40 mr-0.5">R$</span>
                                                    <CountUp value={totalSorted} decimals={2} duration={0.8} delay={0}/>
                                                </span>
                                            </td>
                                            <td colSpan={2}/>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                        {totalSalesPages>1 && (
                            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop:`1px solid ${T.border}`, background:T.bg }}>
                                <span className="text-xs text-muted-foreground">
                                    {(salesPage-1)*PER_PAGE+1}–{Math.min(salesPage*PER_PAGE,sortedSales.length)} de {sortedSales.length}
                                </span>
                                <div className="flex gap-1">
                                    {Array.from({ length:totalSalesPages },(_,i)=>i+1).map(p => (
                                        <button key={p} onClick={() => setSalesPage(p)}
                                                className="w-7 h-7 text-[0.62rem] font-black transition-all"
                                                style={p===salesPage?{ background:`linear-gradient(135deg, ${T.cyan}, ${T.purple})`, color:"#fff", boxShadow:`0 2px 8px ${T.cyan}50` }:{ border:`1px solid ${T.border}`, color:"var(--muted-foreground)", background:T.card }}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
