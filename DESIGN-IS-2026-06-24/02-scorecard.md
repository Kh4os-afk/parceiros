# Scorecard — Paginação

| # | Princípio | Score |
|---|---|---|
| 1 | Innovative | 1/3 |
| 2 | Useful | 0/3 |
| 3 | Aesthetic | 1/3 |
| 4 | Understandable | 1/3 |
| 5 | Unobtrusive | 2/3 |
| 6 | Honest | 0/3 |
| 7 | Long-lasting | 2/3 |
| 8 | Thorough | 0/3 |
| 9 | Environmentally friendly | 3/3 |
| 10 | As little design as possible | 1/3 |
| **Total** | | **11/30** |

---

## Detalhamento

**1. Good design is innovative — Score: 1/3**
Evidência: botões numerados simples sem variação de padrão estabelecido.
Justificativa: imita o padrão de mercado sem contribuição própria, mas não copia nenhum produto específico integralmente.

**2. Good design makes a product useful — Score: 0/3**
Evidência: `ListPage.tsx:275` — `.slice(0, 7)` bloqueia acesso às páginas 8+; a tarefa primária (navegar para uma página além da 7ª) é impossível de completar.
Justificativa: a ação primária suportada pela tela não pode ser concluída quando `last_page > 7` — falha de nível zero.

**3. Good design is aesthetic — Score: 1/3**
Evidência: `T.purple = "#7c3aed"` no gradiente ativo não pertence aos tokens V2 (`ListPage.tsx:24`); background `#f9fafb` ≠ V2 `#f4f5f8`; `border-radius` ausente em ListPage, presente em ErrorsPage.
Justificativa: três inconsistências visuais contra o sistema estabelecido configuram uma violação visível.

**4. Good design makes a product understandable — Score: 1/3**
Evidência: ausência de prev/next e ellipsis; nenhum sinal visual de que existem mais páginas além das 7 exibidas.
Justificativa: o usuário não consegue inferir que há páginas inacessíveis — a interface finge que a lista termina na página 7.

**5. Good design is unobtrusive — Score: 2/3**
Evidência: posição de footer, padding contido, não compete com o conteúdo principal.
Justificativa: chrome recua, mas é visível — adequado para navegação.

**6. Good design is honest — Score: 0/3**
Evidência: range counter `ListPage.tsx:272–275` exibe "1–10 de 847" sugerindo que os 847 registros são navegáveis, enquanto `.slice(0, 7)` impossibilita acesso às páginas 8+.
Justificativa: falsa promessa funcional — o componente promete acesso total e entrega acesso parcial.

**7. Good design is long-lasting — Score: 2/3**
Evidência: botões numerados simples sem marcadores de tendência.
Justificativa: a forma básica de botão numerado envelhecerá bem; o gradiente com purple tem risco leve de datação.

**8. Good design is thorough down to the last detail — Score: 0/3**
Evidência: sem prev/next, sem ellipsis, sem focus ring, sem hover no ListPage, sem `aria-current`, sem estado desabilitado em primeira/última página.
Justificativa: 4+ estados ausentes ou tratados pelo browser default.

**9. Good design is environmentally friendly — Score: 3/3**
Evidência: markup mínimo, zero imports adicionais, sem animações idle.
Justificativa: o componente contribui praticamente zero para peso de atenção ou bundle.

**10. Good design is as little design as possible — Score: 1/3**
Evidência: duas implementações divergentes do mesmo elemento (`ListPage.tsx:268–286` vs `ErrorsPage.tsx:340–386`); gradiente purple não requerido pela função.
Justificativa: 3–5 elementos removíveis — duplicação estrutural e cor extra sem propósito funcional.
