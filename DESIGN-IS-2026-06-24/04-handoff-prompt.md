# Handoff — /make-plan

```
/make-plan Redesenhar o componente de paginação. Design atual reprovado na auditoria com 11/30, com falhas críticas em #2 (útil=0), #6 (honesto=0) e #8 (detalhado=0).

Verdict (auditoria 2026-06-24):
> REDESIGN — o componente promete navegação completa (range counter mostra "1–10 de 847") mas .slice(0,7) bloqueia acesso a páginas 8+; a tarefa primária não pode ser concluída e a interface é funcionalmente desonesta.

Por que REDESIGN e não REFINE:
Dois princípios load-bearing zeraram (#2 e #6). Patch no slice não resolve a ausência de prev/next, estados, acessibilidade e duplicação estrutural. O redesign consolida os dois arquivos em um único componente correto.

Preservar do design atual:
- Range counter "X–Y de Z" em texto xs à esquerda — posição e formato corretos (ListPage.tsx:272–275)
- Posicionamento como footer do card, com borderTop e background claro
- Tokens V2: bg:#f4f5f8, border:#e8eaef, cyan:#0099cc (CLAUDE.md)

Descartar:
- .slice(0,7) em ListPage.tsx:275 e ErrorsPage.tsx:352 — causa a falha #2+#6
- T.purple no gradiente ativo — não pertence aos tokens V2 (ListPage.tsx:24)
- As duas implementações divergentes — serão substituídas pelo componente único

Top 5 moves (da auditoria):

1. #2 Useful + #6 Honest: Sliding window centrado na página atual.
   Lógica: sempre exibe [1, …, cur-2, cur-1, cur, cur+1, cur+2, …, last], colapsando com "…" quando o gap > 1. Máximo ~7 itens visíveis independente do total de páginas.
   Fontes: ListPage.tsx:275, ErrorsPage.tsx:352.

2. #8 Thorough: Botões "‹ Anterior" e "Próxima ›" com estado desabilitado (opacity-50, not-allowed) em primeira/última página. Focus ring visível (outline T.cyan). aria-label="Página N" em cada botão. aria-current="page" na página ativa.

3. #3 Aesthetic: Botão ativo com background sólido T.cyan (#0099cc) e texto branco — remover gradiente purple. Background da barra: #f4f5f8 (V2). Border-radius consistente (rounded-sm) em todos os botões.

4. #10 As little design as possible: Extrair para resources/js/components/PaginationBar.tsx com interface:
   interface Props { meta: Meta; page: number; onPageChange: (p: number) => void; }
   Substituir os dois blocos em ListPage.tsx:268–286 e ErrorsPage.tsx:340–386 por <PaginationBar>.

5. #4 Understandable: Ellipsis "…" renderizado como span não-clicável com aria-hidden="true" para indicar visualmente páginas ocultas.

Critérios de conclusão:
- Navegar para qualquer página funciona quando last_page > 7
- Componente extraído, ambos os arquivos usando <PaginationBar>
- Nenhum T.purple no componente de paginação
- Background #f4f5f8 na barra
- Prev/next presentes e desabilitados corretamente nas extremidades
```
