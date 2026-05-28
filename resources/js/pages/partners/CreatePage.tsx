import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api from '@/lib/axios'
import { stripCPF } from '@/lib/utils'

interface Errors { [key: string]: string[] }

export default function CreatePage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ nome: '', cpf: '', matricula: '', limcred: '', bloqueado: '0' })
    const [errors, setErrors] = useState<Errors>({})
    const [loading, setLoading] = useState(false)

    function set(field: string, value: string) {
        setForm(f => ({ ...f, [field]: value }))
        setErrors(e => ({ ...e, [field]: [] }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        try {
            await api.post('/partners', { ...form, cpf: stripCPF(form.cpf) })
            navigate('/funcionarios')
        } catch (err: any) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
        } finally {
            setLoading(false)
        }
    }

    function fieldError(field: string) {
        return errors[field]?.[0]
    }

    return (
        <div className="flex flex-col gap-4  animate-[fade-in_0.2s_ease-out]">
            <div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-0.5">Cadastros</p>
                <h1 className="text-xl font-black uppercase tracking-widest text-[var(--foreground)]">Cadastrar Funcionário</h1>
            </div>

            <div className="bg-white border border-[var(--border)]">
                <div className="px-5 py-3 border-b border-[var(--border)] bg-[oklch(0.97_0_0)] flex items-center gap-2">
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">Dados do Funcionário</span>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Nome Completo</label>
                            <input
                                value={form.nome}
                                onChange={e => set('nome', e.target.value)}
                                placeholder="Antonio da Silva"
                                className={`border px-3 py-2 text-sm bg-[oklch(0.97_0_0)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors ${fieldError('nome') ? 'border-[var(--destructive)]' : 'border-[var(--border)]'}`}
                            />
                            {fieldError('nome') && <p className="text-[0.68rem] text-[var(--destructive)]">{fieldError('nome')}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Matrícula</label>
                            <input
                                value={form.matricula}
                                onChange={e => set('matricula', e.target.value)}
                                placeholder="00142"
                                className={`border px-3 py-2 text-sm bg-[oklch(0.97_0_0)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] tracking-wider font-medium transition-colors ${fieldError('matricula') ? 'border-[var(--destructive)]' : 'border-[var(--border)]'}`}
                            />
                            {fieldError('matricula') && <p className="text-[0.68rem] text-[var(--destructive)]">{fieldError('matricula')}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">CPF</label>
                            <input
                                value={form.cpf}
                                onChange={e => set('cpf', e.target.value)}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className={`border px-3 py-2 text-sm bg-[oklch(0.97_0_0)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] tracking-widest font-medium transition-colors ${fieldError('cpf') ? 'border-[var(--destructive)]' : 'border-[var(--border)]'}`}
                            />
                            {fieldError('cpf') && <p className="text-[0.68rem] text-[var(--destructive)]">{fieldError('cpf')}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Limite de Crédito (R$)</label>
                            <input
                                value={form.limcred}
                                onChange={e => set('limcred', e.target.value)}
                                placeholder="350,00"
                                className={`border px-3 py-2 text-sm bg-[oklch(0.97_0_0)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors ${fieldError('limcred') ? 'border-[var(--destructive)]' : 'border-[var(--border)]'}`}
                            />
                            {fieldError('limcred') && <p className="text-[0.68rem] text-[var(--destructive)]">{fieldError('limcred')}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Status</label>
                            <select
                                value={form.bloqueado}
                                onChange={e => set('bloqueado', e.target.value)}
                                className="border border-[var(--border)] px-3 py-2 text-sm bg-[oklch(0.97_0_0)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] cursor-pointer"
                            >
                                <option value="0">Ativo</option>
                                <option value="1">Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)] mt-1">
                        <button
                            type="button"
                            onClick={() => navigate('/funcionarios')}
                            className="border border-[var(--border)] px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity"
                        >
                            {loading && <Loader2 size={12} className="animate-spin" />}
                            Cadastrar Funcionário
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
