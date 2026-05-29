# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral do Projeto

**Parceiros** é uma aplicação web Laravel 10 + React (Vite + TypeScript + Tailwind v4 + shadcn/ui) para gerenciar funcionários/parceiros e registros de compras do sistema "Baratão da Carne Convênio". O Laravel serve como API REST (Sanctum SPA) e o React é o frontend completo.

A interface é inteiramente em **Português (Brasil)**. Toda string visível ao usuário deve estar em pt-BR.

## Comandos Comuns

```bash
# Instalar dependências PHP
composer install

# Instalar dependências JS e compilar assets
npm install
npm run dev       # Servidor Vite com hot reload
npm run build     # Build para produção

# Laravel Artisan
php artisan migrate
php artisan db:seed
php artisan tinker

# Executar testes (os testes em tests/Feature/Livewire/ são do frontend Livewire anterior — desatualizados)
php artisan test
./vendor/bin/pest
./vendor/bin/pest --filter=NomeDoTeste

# Estilo de código (Laravel Pint)
./vendor/bin/pint
```

A aplicação roda via XAMPP em `http://localhost/parceiros/public/`. Banco de dados MySQL, nome `convenio`.

Para resetar e recriar dados de demonstração:
```bash
php artisan db:seed --class=DemoSeeder
```
Cria 3 empresas (Baratão da Carne, Frigorífico Norte, Mercado Central), 1 usuário gestor por empresa (senha `gerente123`) e funcionários com `limcred` em **reais** (máx R$ 500).

## Commits

**OBRIGATÓRIO: todas as mensagens de commit devem ser em Português (pt-BR)**, seguindo o formato definido em `.gitmessage`:

```
<tipo>: <descrição curta em português — máximo 72 caracteres>

- <arquivo1>: <o que foi alterado e por quê>
- <arquivo2>: <o que foi alterado e por quê>
```

**Tipos válidos:** `feat`, `fix`, `refactor`, `docs`, `style`, `chore`, `test`

**Exemplos corretos:**
```
feat: adiciona sidebar shadcn com breadcrumb dinâmico
fix: corrige sintaxe de CSS variables no Tailwind v4
chore: remove Livewire e dependências legadas
```

**Nunca em inglês.** Verbos no infinitivo (adiciona, corrige, remove, implementa).

## Arquitetura

### Backend — Laravel 10 API REST

Controllers em `app/Http/Controllers/Api/`:

| Controller | Responsabilidade |
|---|---|
| `AuthController` | Login, logout, usuário autenticado (Sanctum SPA) |
| `PartnerController` | CRUD de funcionários + importação CSV |
| `PartnerErrorController` | Erros de importação (listar, aprovar, deletar) |
| `SaleController` | Compras por funcionário/CPF e por período |
| `FilialController` | Listagem de filiais |
| `EmpresaController` | CRUD de empresas (somente admin) |
| `UserController` | CRUD de usuários com role e empresa_id (somente admin) |

Form Requests em `app/Http/Requests/` para validação (CPF via `laravellegends/pt-br-validator`).

Rotas em `routes/api.php` — todas protegidas por `auth:sanctum` exceto `/login` e `GET /api/saldo` (endpoint público para consulta de saldo por CPF via `?cpf=`). As rotas de empresas e usuários também exigem o middleware `AdminOnly` (retorna 403 para não-admins).

`routes/web.php` → catch-all SPA: `Route::get('/{any}', fn() => view('app'))`.

### Multi-tenancy — Empresas

Todas as tabelas principais (`partners`, `sales`, `filiais`, `partner_errors`, `change_logs`) têm a coluna `empresa_id` (FK para `empresas`). O `EmpresaScope` (global scope nos models) filtra automaticamente os dados pela empresa do usuário autenticado. Admins ignoram o scope e veem todos os registros.

- **User** tem campo `role` (enum: `admin` | `user`) e `empresa_id`
- `isAdmin()` no model User verifica a role
- Middleware `AdminOnly` (`app/Http/Middleware/AdminOnly.php`) protege as rotas de gestão

### Modelo de Dados

- **Empresa** — empresa/tenant: `nome`, `slug` (único), `ativo`
- **Partner** — funcionário: `cpf` (11 dígitos, único), `matricula` (nullable), `limcred`, `bloqueado`, `alterado`, `empresa_id`
- **Sale** — compra vinculada ao Partner via `cpf` (string, não FK inteira); campos: `codfilial`, `caixa`, `numnota`, `dtsaida`, `vltotal`, `qrcodenfce`, `dtcancel`, `dtdevol`, `empresa_id`
- **Filial** — filiais/lojas, `empresa_id`
- **PartnerError** — registros de CSV que falharam para correção manual, `empresa_id`
- **ChangeLog** — auditoria; toda escrita bem-sucedida insere registro com `usuario`, `operacao`, `descricao`, `empresa_id`
- **User** — autenticação Laravel/Sanctum; campos extras: `role`, `empresa_id`

A relação Partner ↔ Sale é via campo string `cpf`, não por chave estrangeira inteira.

### Padrões do Backend

- Toda mutação usa `DB::beginTransaction()` / `commit()` / `rollback()`
- Toda escrita bem-sucedida registra em `change_logs`
- Nomes salvos em `mb_strtoupper()`, exibidos em `toTitleCase()` no frontend
- Importação CSV usa `League\Csv\Reader`
- `limcred` é armazenado em **reais** (decimal), não centavos — ex: `350.00` = R$ 350. A validação do CSV impõe `max:999`.
- `PartnerController@index` faz eager load de `with('empresa')` para exibir a empresa na listagem (admin vê coluna Empresa).

### Frontend — React + Vite + TypeScript

```
resources/js/
├── app.tsx                          # Entry point: QueryClient (retry:1, staleTime:30s) + AuthProvider + RouterProvider
├── router.tsx                       # createBrowserRouter com ProtectedRoute e AdminRoute
├── lib/
│   ├── axios.ts                     # Instância axios (withCredentials, XSRF)
│   └── utils.ts                     # cn(), formatCPF(), stripCPF(), formatMoney(), toTitleCase()
├── hooks/
│   ├── use-mobile.tsx               # Detecção de viewport mobile
│   └── use-is-in-view.tsx           # Intersection Observer para animações
├── contexts/AuthContext.tsx         # Login, logout, usuário autenticado
├── components/
│   ├── layouts/
│   │   ├── AppLayout.tsx            # SidebarProvider + SidebarInset + Breadcrumb
│   │   ├── AppSidebar.tsx           # Sidebar shadcn com nav e footer de usuário
│   │   ├── AuthLayout.tsx           # Layout centralizado para login
│   │   ├── SaldoLayout.tsx          # Layout para página pública de saldo (sem auth)
│   │   ├── ProtectedRoute.tsx       # Redireciona para /login se não autenticado
│   │   └── AdminRoute.tsx           # Redireciona se não for admin
│   ├── ui/                          # Componentes shadcn/ui
│   ├── animate-ui/                  # Componentes do registro @animate-ui (ex: CountingNumber)
│   └── PartnerDrawer.tsx            # Drawer reutilizável para ações de funcionário
└── pages/
    ├── admin/EmpresasPage.tsx, UsuariosPage.tsx
    ├── auth/LoginPage.tsx
    ├── dashboard/DashboardPage.tsx
    ├── partners/ListPage.tsx, CreatePage.tsx, EditPage.tsx, DetailPage.tsx
    ├── import/ImportPage.tsx, ErrorsPage.tsx
    ├── errors/EditErrorPage.tsx
    ├── reports/SalesByPartnerPage.tsx, SalesByPeriodPage.tsx
    ├── consulta/ConsultaPage.tsx    # Consulta interna de compras
    └── saldo/SaldoPage.tsx          # Página pública de saldo (usa SaldoLayout, sem auth)
```

Estado servidor gerenciado com `@tanstack/react-query` v5. Notificações toast via `sonner`.

#### Padrões de responsividade

Todas as páginas são responsivas (mobile + desktop). Padrões estabelecidos:

- **Grids de KPI**: `grid-cols-2 md:grid-cols-N lg:grid-cols-N`
- **Layouts 2/3 + 1/3**: `grid-cols-1 lg:grid-cols-3` com `lg:col-span-2`
- **Headers com ações**: `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
- **Formulários multi-coluna**: `grid-cols-1 md:grid-cols-3` com `md:col-span-2`
- **Tabelas**: `<table className="w-full min-w-max border-collapse">` dentro de `<div className="overflow-x-auto">` — o `min-w-max` garante scroll horizontal no mobile
- **KPI items em grid**: `border-r border-b border-(--border)` em cada item — o `overflow-hidden` do container corta os excessos nas bordas externas
- **Modais**: adicionar `mx-4` para não encostar nas bordas no mobile
- **PartnerDrawer**: `w-full sm:max-w-120`
- **Padding de headers**: `px-4 md:px-7 pt-5 md:pt-6`

#### Breadcrumb

`AppLayout.tsx` mapeia cada rota para uma trilha de navegação começando em Dashboard:
- `/funcionarios` → Dashboard > Funcionários
- `/importar/csv` → Dashboard > Funcionários > Importar CSV
- `/compras/periodo` → Dashboard > Relatórios > Extrato por Período

#### CountUp com valores monetários

Sempre passar o valor **numérico** ao `CountUp`, nunca a string do `formatMoney()`:
```tsx
// ✅ Correto
<span className="text-[0.5em] opacity-50 mr-0.5">R$</span>
<CountUp value={grandTotal} decimals={2} duration={1.5} />

// ❌ Errado — NaN
<CountUp value={formatMoney(grandTotal)} decimals={2} duration={1.5} />
```

#### Barra de utilização de crédito

Componente visual com gradiente + glow + shimmer animado. Keyframe `bar-shimmer` definido em `resources/css/app.css`. Usado em: `DetailPage`, `ConsultaPage`, `PartnerDrawer`.

#### Sidebar mobile

`AppSidebar` usa `useSidebar().setOpenMobile(false)` no `onClick` de cada `NavItem` para fechar automaticamente ao navegar.

### Frontend — Tailwind v4 + shadcn/ui

**ATENÇÃO:** Este projeto usa **Tailwind v4**. CSS variables em classes arbitrárias usam parênteses, não colchetes:
- ✅ `w-(--sidebar-width)` → `width: var(--sidebar-width)`
- ❌ `w-[--sidebar-width]` → `width: --sidebar-width` (inválido, ignorado pelo browser)

Ao instalar novos componentes shadcn, verificar e corrigir todas as ocorrências de `[--` para `(--`:
```bash
grep -rn "\[--" resources/js/components/ui/
```

CSS variables do tema em `resources/css/app.css`. Fonte: Oxanium (todas as variantes). Tema: Lyra Cyan Light.

### Autenticação

Sanctum SPA mode com cookies httpOnly. O frontend chama `GET /sanctum/csrf-cookie` antes do login para inicializar o XSRF token. Veja `resources/js/lib/axios.ts`.

A `LoginPage` tem botão "Consultar Limite" que navega para a rota pública `/saldo` sem autenticação.
