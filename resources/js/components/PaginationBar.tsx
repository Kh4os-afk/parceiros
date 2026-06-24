interface Meta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Props {
    meta: Meta;
    page: number;
    onPageChange: (p: number) => void;
}

const C = { border: "#e8eaef", cyan: "#0099cc", bg: "#f4f5f8" };

function getWindow(current: number, last: number): (number | "…")[] {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
    const items: (number | "…")[] = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(last - 1, current + 1);
    if (left > 2) items.push("…");
    for (let p = left; p <= right; p++) items.push(p);
    if (right < last - 1) items.push("…");
    items.push(last);
    return items;
}

export default function PaginationBar({ meta, page, onPageChange }: Props) {
    if (meta.last_page <= 1) return null;

    const from = (meta.current_page - 1) * meta.per_page + 1;
    const to = Math.min(meta.current_page * meta.per_page, meta.total);
    const items = getWindow(page, meta.last_page);

    const base = "w-7 h-7 rounded-sm text-[0.6rem] font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1";
    const activeStyle = { background: C.cyan, color: "#fff", border: "none", boxShadow: `0 2px 8px ${C.cyan}40` };
    const idleStyle = { border: `1px solid ${C.border}`, color: "#6b7280", background: "#fff" };
    const navStyle = { border: `1px solid ${C.border}`, color: "#6b7280", background: "#fff" };

    function NavBtn({ dir, disabled }: { dir: "prev" | "next"; disabled: boolean }) {
        return (
            <button
                onClick={() => onPageChange(dir === "prev" ? page - 1 : page + 1)}
                disabled={disabled}
                className={`${base} disabled:opacity-40 disabled:cursor-not-allowed`}
                style={navStyle}
                aria-label={dir === "prev" ? "Página anterior" : "Próxima página"}
                onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = C.cyan; }}
                onMouseLeave={e => { if (!disabled) e.currentTarget.style.borderColor = C.border; }}
            >
                {dir === "prev" ? "‹" : "›"}
            </button>
        );
    }

    return (
        <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}
        >
            <span className="text-xs text-muted-foreground">
                {from}–{to} de {meta.total}
            </span>
            <div className="flex items-center gap-1">
                <NavBtn dir="prev" disabled={page <= 1} />
                {items.map((item, i) =>
                    item === "…" ? (
                        <span
                            key={`e${i}`}
                            className="w-7 h-7 flex items-center justify-center text-[0.6rem] text-gray-400"
                            aria-hidden="true"
                        >…</span>
                    ) : (
                        <button
                            key={item}
                            onClick={() => onPageChange(item)}
                            className={base}
                            style={item === page ? activeStyle : idleStyle}
                            aria-label={`Página ${item}`}
                            aria-current={item === page ? "page" : undefined}
                            onMouseEnter={e => { if (item !== page) { e.currentTarget.style.borderColor = C.cyan; e.currentTarget.style.color = C.cyan; } }}
                            onMouseLeave={e => { if (item !== page) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = "#6b7280"; } }}
                        >
                            {item}
                        </button>
                    )
                )}
                <NavBtn dir="next" disabled={page >= meta.last_page} />
            </div>
        </div>
    );
}
