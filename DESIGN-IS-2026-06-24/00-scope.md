# Scope — Audit da Paginação

## O que está sendo auditado

**Componente:** Bloco de paginação customizado — duas implementações divergentes:
- `resources/js/pages/partners/ListPage.tsx` linhas 268–286
- `resources/js/pages/import/ErrorsPage.tsx` linhas 340–386

**Usuário primário:** Gestor navegando listas de funcionários ou erros de importação.

**Tarefa primária:** Navegar para uma página específica de uma lista paginada.

## Restrições

- Stack: React + TypeScript + Tailwind v4 + motion/react
- Design token V2: `bg:#f4f5f8`, `border:#e8eaef`, `cyan:#0099cc`, `green:#059669`, `amber:#d97706`, `red:#dc2626` (conforme CLAUDE.md)
- Nenhum componente `Pagination` do shadcn/ui está instalado
- Interface 100% em pt-BR

## Problemas relatados pelo usuário

1. `.slice(0, 7)` — sempre mostra as 7 primeiras páginas, sem sliding window
2. Visual inconsistente com o padrão V2 do sistema
