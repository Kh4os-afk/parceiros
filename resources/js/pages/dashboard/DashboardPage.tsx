import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, AlertCircle, MapPin, Phone } from 'lucide-react'
import api from '@/lib/axios'

export default function DashboardPage() {
    const navigate = useNavigate()
    const [counts, setCounts] = useState({ partners: 0, errors: 0 })

    useEffect(() => {
        Promise.all([
            api.get('/partners?page=1'),
            api.get('/partner-errors'),
        ]).then(([p, e]) => {
            setCounts({
                partners: p.data.total ?? 0,
                errors: e.data.total ?? 0,
            })
        }).catch(() => {})
    }, [])

    return (
        <div className="flex flex-col gap-6 animate-[fade-in_0.2s_ease-out]">
            <div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Bem-vindo ao</p>
                <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">Dashboard</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('/funcionarios')}
                    className="bg-card border border-(--border) p-5 flex items-center gap-4 text-left hover:border-(--primary) hover:shadow-sm transition-all"
                >
                    <div className="w-11 h-11 bg-(--primary)/8 border border-(--primary)/20 flex items-center justify-center text-(--primary) shrink-0">
                        <Users size={18} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-(--foreground) leading-none">{counts.partners.toLocaleString('pt-BR')}</p>
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-(--muted-foreground) mt-1">
                            Funcionários Cadastrados
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/importar/erros')}
                    className="bg-card border border-(--border) p-5 flex items-center gap-4 text-left hover:border-amber-500/40 hover:shadow-sm transition-all"
                >
                    <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-amber-500 leading-none">{counts.errors}</p>
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-(--muted-foreground) mt-1">
                            Erros de Importação
                        </p>
                    </div>
                </button>
            </div>

            <div className="bg-card border border-(--border) p-6">
                <h2 className="text-[0.75rem] font-bold uppercase tracking-widest text-(--foreground) mb-4 pb-3 border-b border-(--border)">
                    Informações da Empresa
                </h2>
                <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <MapPin size={14} className="text-(--primary) mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[0.6rem] uppercase tracking-widest text-(--muted-foreground) font-semibold mb-0.5">Endereço</p>
                            <p className="text-sm text-(--foreground)">Av. Tancredo Neves, 1760 — Parque 10 de Novembro</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone size={14} className="text-(--primary) mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[0.6rem] uppercase tracking-widest text-(--muted-foreground) font-semibold mb-0.5">Telefone</p>
                            <p className="text-sm text-(--foreground)">(92) 3582-3294</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
