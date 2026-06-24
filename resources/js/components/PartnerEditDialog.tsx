import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "@/lib/axios";
import {
    formatCPF,
    formatMoneyInput,
    maskMoney,
    parseMoney,
    toTitleCase,
} from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface PartnerRow {
    id: number;
    nome: string;
    cpf: string;
    matricula: string;
    limcred: number;
    bloqueado: number;
    empresa?: { nome: string };
}

interface Errors {
    [key: string]: string[];
}

const T = {
    border: "#e8eaef",
    cyan: "#0099cc",
    amber: "#d97706",
    red: "#dc2626",
};

interface Props {
    partner: PartnerRow | null;
    open: boolean;
    onClose: () => void;
    onSaved: (updated: PartnerRow, previous: PartnerRow) => void;
}

export default function PartnerEditDialog({
    partner,
    open,
    onClose,
    onSaved,
}: Props) {
    const [form, setForm] = useState({
        nome: "",
        cpf: "",
        matricula: "",
        limcred: "",
        bloqueado: "0",
    });
    const [errors, setErrors] = useState<Errors>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open || !partner) return;
        setForm({
            nome: toTitleCase(partner.nome),
            cpf: formatCPF(partner.cpf),
            matricula: partner.matricula != null ? String(partner.matricula) : "",
            limcred: formatMoneyInput(partner.limcred),
            bloqueado: String(partner.bloqueado),
        });
        setErrors({});
    }, [open, partner]);

    function set(field: string, value: string) {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: [] }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!partner) return;
        setSaving(true);
        setErrors({});
        try {
            const res = await api.put(`/partners/${partner.id}`, {
                nome: form.nome,
                matricula: form.matricula || null,
                limcred: parseMoney(form.limcred),
                bloqueado: form.bloqueado,
            });
            const data = res.data;
            const updated: PartnerRow = {
                ...partner,
                nome: data.nome,
                matricula:
                    data.matricula != null ? String(data.matricula) : "",
                limcred: Number(data.limcred),
                bloqueado: Number(data.bloqueado),
            };
            onSaved(updated, partner);
            onClose();
        } catch (err: unknown) {
            const error = err as { response?: { status?: number; data?: { errors?: Errors } } };
            if (error.response?.status === 422) {
                setErrors(error.response.data?.errors ?? {});
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <AnimatePresence>
            {open && partner && (
                <motion.div
                    key="partner-edit-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.50)" }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        key="partner-edit-panel"
                        initial={{ opacity: 0, scale: 0.95, y: 12, filter: "blur(6px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.95, y: 8, filter: "blur(4px)" }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-lg overflow-hidden rounded-xl"
                        style={{
                            background: "#fff",
                            border: `1px solid ${T.border}`,
                            boxShadow: "0 20px 60px 0 rgba(0,0,0,0.18)",
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="partner-edit-title"
                    >
                        <div
                            style={{
                                height: 3,
                                background: `linear-gradient(90deg, ${T.cyan} 0%, #7c3aed 100%)`,
                            }}
                        />

                        <div
                            className="px-5 py-4"
                            style={{
                                borderBottom: `1px solid ${T.border}`,
                                background: "#fafbfc",
                            }}
                        >
                            <p
                                id="partner-edit-title"
                                className="text-[0.62rem] font-black uppercase tracking-[0.2em]"
                                style={{ color: "#1a1d23" }}
                            >
                                Editar Funcionário
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                                {toTitleCase(partner.nome)}
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 p-5"
                            autoComplete="off"
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <label
                                        className="text-[0.6rem] font-bold uppercase tracking-[0.12em]"
                                        style={{ color: "#64748b" }}
                                    >
                                        Nome Completo
                                    </label>
                                    <Input
                                        value={form.nome}
                                        onChange={(e) => set("nome", e.target.value)}
                                        className={errors.nome ? "border-[#dc2626]" : ""}
                                        style={errors.nome ? { borderColor: T.red } : {}}
                                    />
                                    {errors.nome?.[0] && (
                                        <p className="text-[0.68rem]" style={{ color: T.red }}>
                                            {errors.nome[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-[0.6rem] font-bold uppercase tracking-[0.12em]"
                                        style={{ color: "#64748b" }}
                                    >
                                        Matrícula{" "}
                                        <span className="font-normal normal-case tracking-normal">
                                            (opcional)
                                        </span>
                                    </label>
                                    <Input
                                        value={form.matricula}
                                        onChange={(e) => set("matricula", e.target.value)}
                                        className="tracking-wider"
                                        style={errors.matricula ? { borderColor: T.red } : {}}
                                    />
                                    {errors.matricula?.[0] && (
                                        <p className="text-[0.68rem]" style={{ color: T.red }}>
                                            {errors.matricula[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-[0.6rem] font-bold uppercase tracking-[0.12em]"
                                        style={{ color: "#64748b" }}
                                    >
                                        CPF
                                    </label>
                                    <Input
                                        value={form.cpf}
                                        disabled
                                        className="cursor-not-allowed tracking-widest opacity-50"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-[0.6rem] font-bold uppercase tracking-[0.12em]"
                                        style={{ color: "#64748b" }}
                                    >
                                        Limite de Crédito (R$)
                                    </label>
                                    <div className="relative">
                                        <span
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[0.72rem]"
                                            style={{ color: "#94a3b8" }}
                                        >
                                            R$
                                        </span>
                                        <Input
                                            value={form.limcred}
                                            onChange={(e) =>
                                                set("limcred", maskMoney(e.target.value))
                                            }
                                            placeholder="0,00"
                                            inputMode="decimal"
                                            className="pl-9"
                                            style={errors.limcred ? { borderColor: T.red } : {}}
                                        />
                                    </div>
                                    {errors.limcred?.[0] && (
                                        <p className="text-[0.68rem]" style={{ color: T.red }}>
                                            {errors.limcred[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-[0.6rem] font-bold uppercase tracking-[0.12em]"
                                        style={{ color: "#64748b" }}
                                    >
                                        Status
                                    </label>
                                    <select
                                        value={form.bloqueado}
                                        onChange={(e) => set("bloqueado", e.target.value)}
                                        className="h-9 cursor-pointer border px-3 py-2 text-sm outline-none"
                                        style={{
                                            borderColor:
                                                form.bloqueado === "1" ? T.red : T.border,
                                            background: "#f9fafb",
                                            color: form.bloqueado === "1" ? T.red : "#0f172a",
                                        }}
                                    >
                                        <option value="0">Ativo</option>
                                        <option value="1">Bloqueado</option>
                                    </select>
                                </div>
                            </div>

                            <div
                                className="mt-1 flex justify-end gap-2 border-t pt-2"
                                style={{ borderColor: T.border }}
                            >
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="border px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider transition-colors"
                                    style={{
                                        borderColor: T.border,
                                        color: "#64748b",
                                        background: "transparent",
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-60"
                                    style={{ background: T.amber, color: "#ffffff" }}
                                >
                                    {saving && (
                                        <Loader2 size={12} className="animate-spin" />
                                    )}
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
