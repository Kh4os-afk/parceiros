# Evidências — Paginação

## Estrutural

| Achado | Fonte |
|---|---|
| `pages = Array.from({length: meta.last_page}, (_, i) => i+1)` gera TODAS as páginas | `ListPage.tsx:78` |
| `.slice(0, 7)` descarta páginas 8+ silenciosamente | `ListPage.tsx:275`, `ErrorsPage.tsx:352` |
| Nenhum botão prev/next presente em nenhuma das duas implementações | ambos os blocos |
| Nenhum ellipsis (`…`) para indicar gap | ambos os blocos |
| Duas implementações do mesmo componente com diferenças injustificadas: `font-black` vs `font-bold`, sem `rounded` vs com `rounded`, sem hover vs com hover | `ListPage.tsx:278` vs `ErrorsPage.tsx:355–371` |

## Visual

| Achado | Fonte |
|---|---|
| Gradiente ativo: `linear-gradient(135deg, #0099cc, #7c3aed)` — `T.purple` não está nos tokens V2 documentados | `ListPage.tsx:24`, CLAUDE.md |
| Background da barra: `#f9fafb` — diverge do V2 `#f4f5f8` | `ListPage.tsx:270` |
| Sem `border-radius` nos botões do ListPage | `ListPage.tsx:278` |
| Sem estado de hover nos botões do ListPage | ausência no bloco `268–286` |
| ErrorsPage tem hover inline (onMouseEnter/Leave) — ListPage não | `ErrorsPage.tsx:360–371` |
| Sem focus ring em nenhuma das implementações | ausência total |

## Copy & Honesty

| Achado | Fonte |
|---|---|
| Range counter `1–10 de 847` exibido mesmo quando páginas 8+ são inacessíveis | `ListPage.tsx:272–275` |
| Texto pt-BR correto ("de") | ambos |

## Weight & Friction

| Achado | Fonte |
|---|---|
| Markup mínimo, zero imports adicionais | ambos |
| Nenhuma animação idle | ambos |

## Acessibilidade

| Achado |
|---|
| Sem `aria-label` nos botões de página |
| Sem `aria-current="page"` na página ativa |
| Sem focus ring visível |
| Sem navegação por teclado prev/next |
