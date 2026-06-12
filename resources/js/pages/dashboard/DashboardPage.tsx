import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, AlertCircle, Store, TrendingUp, ShoppingBag,
    ArrowRight, ReceiptText, Plus, Upload,
} from "lucide-react";
import { motion } from "motion/react";
import api from "@/lib/axios";
import { formatMoney, toTitleCase } from "@/lib/utils";
import CountUp from "@/components/CountUp";

interface SaleGroup   { cpf: string; nome: string; total: number; quantidade: number; }
interface FilialSales { codfilial: number; filial: string; total: number; quantidade: number; }

function todayBR()      { const d = new Date(); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; }
function firstOfMonthBR() { const d = new Date(); return `01/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; }
function mesAtualLabel()  { const m = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]; const d = new Date(); return `${m[d.getMonth()]} ${d.getFullYear()}`; }

// Design tokens (mesmo sistema do V2)
const T = { bg:"#f4f5f8", border:"#e8eaef", cyan:"#0099cc", purple:"#7c3aed", green:"#059669", amber:"#d97706", red:"#dc2626" };
const card  = { background:"#ffffff", border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger = (d=0): any => ({ hidden:{}, visible:{ transition:{ staggerChildren:0.07, delayChildren:d } } });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rise: any = { hidden:{ opacity:0, y:20, filter:"blur(8px)" }, visible:{ opacity:1, y:0, filter:"blur(0px)", transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };

export default function DashboardPage() {
    const navigate = useNavigate();
    const [partners,    setPartners]    = useState(0);
    const [errors,      setErrors]      = useState(0);
    const [filiais,     setFiliais]     = useState<FilialSales[]>([]);
    const [mes,         setMes]         = useState<SaleGroup[]>([]);
    const [loadingMes,  setLoadingMes]  = useState(true);
    const [loading,     setLoading]     = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/partners?page=1"),
            api.get("/partner-errors?page=1"),
            api.get("/sales/period/filiais", { params: { start_date: firstOfMonthBR(), end_date: todayBR() } }),
        ]).then(([p, e, f]) => {
            setPartners(p.data.total ?? 0);
            setErrors(e.data.total ?? 0);
            setFiliais(f.data ?? []);
        }).finally(() => setLoading(false));

        api.get("/sales/period", { params: { start_date: firstOfMonthBR(), end_date: todayBR() } })
            .then(r => setMes(r.data ?? []))
            .catch(() => {})
            .finally(() => setLoadingMes(false));
    }, []);

    const totalMes   = mes.reduce((s, r) => s + Number(r.total), 0);
    const qtdCompras = mes.reduce((s, r) => s + r.quantidade, 0);
    const maxMes     = mes[0]?.total ?? 1;
    const top5       = mes.slice(0, 5);

    const kpis = [
        { label:"Funcionários",    sub:"cadastrados",           value:partners,   dec:0, icon:Users,       color:T.cyan,  to:"/funcionarios"    },
        { label:"Gasto no Mês",    sub:mesAtualLabel(),         value:totalMes,   dec:2, icon:TrendingUp,  color:T.cyan,  to:"/compras/periodo", money:true },
        { label:"Compras no Mês",  sub:`${mes.length} funcion.`, value:qtdCompras, dec:0, icon:ShoppingBag, color:T.purple, to:"/compras/periodo" },
        { label:"Erros Pendentes", sub:"aguardam revisão",      value:errors,     dec:0, icon:AlertCircle, color:errors>0?T.amber:T.green, to:"/importar/erros" },
    ];

    const atalhos = [
        { label:"Cadastrar Funcionário", to:"/funcionarios/cadastrar", icon:Users },
        { label:"Importar CSV",          to:"/importar/csv",           icon:Upload },
        { label:"Extrato por Período",   to:"/compras/periodo",        icon:TrendingUp },
    ];

    return (
        <motion.div
            className="flex flex-col gap-5 -m-4 md:-m-6 p-4 md:p-6 min-h-screen"
            style={{ background: T.bg }}
            variants={stagger(0.04)} initial="hidden" animate="visible"
        >
            {/* ── Cabeçalho da página ── */}
            <motion.div variants={rise} className="flex items-center justify-between">
                <div>
                    <p className="text-[0.55rem] font-black uppercase tracking-[0.28em] text-muted-foreground mb-0.5">Sistema de Convênio</p>
                    <h1 className="text-xl font-black uppercase tracking-tight text-foreground">Dashboard</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate("/importar/csv")}
                            className="flex items-center gap-1.5 px-3 py-2 text-[0.58rem] font-black uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                            style={{ background:"#fff", border:`1px solid ${T.border}` }}>
                        <Upload size={10}/> Importar
                    </button>
                    <button onClick={() => navigate("/funcionarios/cadastrar")}
                            className="flex items-center gap-1.5 px-3 py-2 text-[0.58rem] font-black uppercase tracking-wider text-white hover:opacity-90 transition-opacity"
                            style={{ background: T.cyan }}>
                        <Plus size={10}/> Cadastrar
                    </button>
                </div>
            </motion.div>

            {/* ── KPIs ── */}
            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3" variants={stagger(0.08)}>
                {kpis.map(({ label, sub, value, dec, icon: Icon, color, to, money }, i) => (
                    <motion.button
                        key={label}
                        variants={rise}
                        onClick={() => navigate(to)}
                        className="text-left p-4 bg-white cursor-pointer group relative overflow-hidden flex flex-col"
                        style={{ height:"130px", border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}
                        whileHover={{ y:-3, boxShadow:`0 10px 28px rgba(0,0,0,0.09), 0 0 0 1px ${color}30`, transition:{ type:"spring", stiffness:300, damping:22 } }}
                    >
                        {/* Ícone + label */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                                 style={{ background:`${color}10`, border:`1px solid ${color}20` }}>
                                <Icon size={13} style={{ color }}/>
                            </div>
                            <p className="text-[0.55rem] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                        </div>

                        {/* Valor */}
                        <p className="text-2xl font-black tabular-nums text-foreground leading-none">
                            {money && <span className="text-[0.55em] font-bold opacity-25 mr-0.5">R$</span>}
                            {loading || (label !== "Funcionários" && label !== "Erros Pendentes" && loadingMes)
                                ? <span className="opacity-30 text-lg">—</span>
                                : <CountUp value={value} decimals={dec} duration={0.8} delay={80+i*50}/>
                            }
                        </p>

                        <p className="text-[0.58rem] text-muted-foreground mt-1 mb-3">{sub}</p>

                        {/* Barra de acento + seta */}
                        <div className="mt-auto flex items-center justify-between">
                            <div className="h-[2px] flex-1 overflow-hidden" style={{ background:`${color}12` }}>
                                <motion.div className="h-full" initial={{ width:0 }} animate={{ width:"100%" }}
                                    transition={{ delay:0.6+i*0.1, duration:0.8, ease:"easeOut" }}
                                    style={{ background:`linear-gradient(to right, ${color}50, ${color})` }}/>
                            </div>
                            <ArrowRight size={9} className="ml-2 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" style={{ color }}/>
                        </div>
                    </motion.button>
                ))}
            </motion.div>

            {/* ── Grid: ranking + sidebar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start">

                {/* Maiores Compradores — 2/3 */}
                <motion.div variants={rise} className="lg:col-span-2 bg-white flex flex-col" style={card}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
                        <div className="flex items-center gap-2.5">
                            <TrendingUp size={13} style={{ color:T.cyan }}/>
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Maiores Compradores — {mesAtualLabel()}
                            </span>
                        </div>
                        <button onClick={() => navigate("/compras/periodo")}
                                className="flex items-center gap-1 text-[0.6rem] font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                            Ver tudo <ArrowRight size={9}/>
                        </button>
                    </div>

                    <div className="p-5 flex flex-col gap-4">
                        {loadingMes ? (
                            <div className="py-10 flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">Carregando…</span>
                            </div>
                        ) : top5.length === 0 ? (
                            <div className="py-10 flex flex-col items-center gap-2">
                                <ShoppingBag size={24} className="text-muted-foreground opacity-20"/>
                                <p className="text-xs text-muted-foreground">Sem compras registradas neste mês.</p>
                            </div>
                        ) : top5.map((r, i) => {
                            const barW = maxMes > 0 ? (Number(r.total)/maxMes)*100 : 0;
                            return (
                                <div key={r.cpf} className="group flex flex-col gap-1.5 cursor-default">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black tabular-nums w-5 shrink-0"
                                              style={{ color: i < 3 ? T.cyan : "#94a3b8" }}>
                                            {String(i+1).padStart(2,"0")}
                                        </span>
                                        <span className="flex-1 text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors"
                                              style={{ ["--tw-text-opacity" as string]:"1" }}>
                                            {toTitleCase(r.nome)}
                                        </span>
                                        <span className="text-sm font-black tabular-nums shrink-0" style={{ color:T.cyan }}>
                                            <span className="text-[0.6em] opacity-40 mr-0.5">R$</span>
                                            <CountUp value={Number(r.total)} decimals={2} duration={0.7} delay={80}/>
                                        </span>
                                        <span className="text-[0.6rem] text-muted-foreground shrink-0 w-8 text-right tabular-nums">{r.quantidade}x</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-5 shrink-0"/>
                                        <div className="flex-1 h-1 overflow-hidden" style={{ background:`${T.border}` }}>
                                            <motion.div className="h-full group-hover:opacity-100 transition-opacity"
                                                initial={{ width:0 }} animate={{ width:`${barW}%` }}
                                                transition={{ delay:0.3+i*0.06, duration:0.8, ease:"easeOut" }}
                                                style={{ background:`linear-gradient(to right, ${T.cyan}60, ${T.cyan})`, opacity:0.6 }}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Sidebar — 1/3 */}
                <div className="flex flex-col gap-4">

                    {/* Top Lojas */}
                    <motion.div variants={rise} className="bg-white flex flex-col" style={card}>
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
                            <div className="flex items-center gap-2.5">
                                <Store size={13} style={{ color:T.purple }}/>
                                <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground">Lojas — {mesAtualLabel()}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{filiais.length} lojas</span>
                        </div>

                        <div className="flex flex-col divide-y max-h-82 overflow-y-auto" style={{ borderColor:T.border }}>
                            {loading ? (
                                <p className="text-xs text-muted-foreground p-5">Carregando…</p>
                            ) : filiais.length === 0 ? (
                                <p className="text-xs text-muted-foreground p-5 text-center">Sem compras no mês.</p>
                            ) : filiais.map((f, i) => {
                                const maxF = filiais[0]?.total ?? 1;
                                const barW = (Number(f.total)/maxF)*100;
                                const rankColors = [T.cyan, T.purple, "#2563eb", "#059669", "#94a3b8"];
                                const c = rankColors[i] ?? rankColors[4];
                                return (
                                    <div key={f.codfilial} className="px-5 py-3 group cursor-default hover:bg-[#f9fafb] transition-colors">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xs font-black w-4 tabular-nums shrink-0" style={{ color:c }}>{i+1}</span>
                                                <span className="text-xs font-medium text-foreground truncate">{f.filial}</span>
                                            </div>
                                            <span className="text-xs font-black tabular-nums shrink-0" style={{ color:c }}>
                                                <span className="text-[0.6em] opacity-40 mr-0.5">R$</span>
                                                <CountUp value={Number(f.total)} decimals={2} duration={0.7} delay={80}/>
                                            </span>
                                        </div>
                                        <div className="h-1 w-full overflow-hidden" style={{ background:`${c}12` }}>
                                            <motion.div className="h-full" initial={{ width:0 }} animate={{ width:`${barW}%` }}
                                                transition={{ delay:0.35+i*0.08, duration:0.7, ease:"easeOut" }}
                                                style={{ background:`linear-gradient(to right, ${c}70, ${c})` }}/>
                                        </div>
                                        <p className="text-[0.55rem] text-muted-foreground mt-1">{f.quantidade} compra{f.quantidade!==1?"s":""}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Acesso Rápido */}
                    <motion.div variants={rise} className="bg-white" style={card}>
                        <div className="px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground">Acesso Rápido</span>
                        </div>
                        <div className="flex flex-col divide-y" style={{ borderColor:T.border }}>
                            {atalhos.map(({ label, to, icon: Icon }) => (
                                <button key={to} onClick={() => navigate(to)}
                                        className="group flex items-center justify-between px-5 py-3.5 hover:bg-[#f9fafb] transition-colors text-left">
                                    <div className="flex items-center gap-2.5">
                                        <Icon size={12} className="text-muted-foreground group-hover:text-primary transition-colors"/>
                                        <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{label}</span>
                                    </div>
                                    <ArrowRight size={10} className="text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity"/>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
