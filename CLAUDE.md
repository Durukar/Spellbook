# Projeto SpellBook

Este arquivo serve como contexto global para os assistentes de IA (Claude Code e Gemini/Antigravity).

## Visao Geral
- **Nome do Projeto**: SpellBook
- **Tipo**: Sistema de controle de estoque, vendas e compra/venda de cartas TCG (Trading Card Game)
- **Escopo Atual (POC)**: Apenas Magic: The Gathering, integrado com a API publica do Scryfall
- **Arquitetura**: Monorepo com Workspaces (`apps/frontend` e `apps/backend`)
- **Hosting**: Cloudflare Pages (frontend) + Cloudflare Workers (backend)
- **Stack Frontend**: React, Vite, TypeScript, Tailwind CSS v4, Shadcn UI, Framer Motion, pnpm
- **Design System**: Dark mode como padrao, suporte a Light mode, visual premium e moderno
- **API Externa**: Scryfall API (https://api.scryfall.com)

## Estrutura do Monorepo
```
Spellbook/
  apps/
    frontend/    # React + Vite (Cloudflare Pages)
    backend/     # Cloudflare Workers (futuro)
```

## Trabalhando com Agentes de IA
- **Cooperacao**: Claude e Gemini atuam no mesmo repositorio.
- **Conflitos de Codigo**: Sempre verifique `git status` e `git diff` antes de edicoes importantes.
- **Skills**: O projeto possui `.agents/skills/superpowers/`. Siga as skills quando aplicavel.

## Comandos Principais
Execute na pasta `apps/frontend/`:

- **Instalar Dependencias**: `pnpm install`
- **Desenvolvimento Local**: `pnpm dev`
- **Build de Producao**: `pnpm build`
- **Lint**: `pnpm lint`
- **Type Check**: `npx tsc --noEmit`

## Padroes de Codigo
- **Tipagem**: TypeScript estrito. Evite `any`, prefira interfaces/types bem definidos.
- **Estilos**: Tailwind CSS v4 com `@theme inline`. Evite CSS manual.
- **Componentes UI**: Use Shadcn UI (instalados via `pnpm dlx shadcn@latest add <componente>`).
- **Animacoes**: `framer-motion` para entrada/saida, micro-interacoes (`whileHover`, `whileTap`).
- **Componentizacao**: Componentes modulares. `src/components/ui/` para primitivos Shadcn.
- **Icones**: `lucide-react`.

## Regras Adicionais
- **Test-Driven Development (TDD)**: Desenvolvimento baseado em TDD.
- **Criacao de Features**: Testes devem ser criados e falhar (Red) antes do codigo (Green/Refactor).
- **Imutabilidade de Testes**: Testes aprovados NAO devem ser modificados.
- **Uso de Emojis**: NUNCA use emojis em documentacoes ou comentarios de codigo.
- **Design Visual**: Priorize a "Arquitetura Visual" - software premium, moderno, minimalista.
- **Respostas Diretas**: Responda de forma direta e concisa com codigo completo.
- **Autoria de Commits**: Atue como a usuario "Ingrid" nos commits. Mantenha essa identidade.
- **Arquitetura de componentes**: Siga  sempre como MVVM

# Informaçoes extras

"então na verdade eu refiz o Escopo do projeto antes era so uma API, mas agora é um sistema de controle de estoque, vendas e compra e vendas de cartas TCG, por isso se chama SpellBook, por enquanto estamos trabalhando em uma POC e por conta disso sera inicialmente integrado com o scryfall e sera apenas Magic The gathering.

Sera hospedado na cloudflarepages e o backend no cloudflare workers, pore enquanto estamos trabalhando apenas no frontend, sera mono repo com apps/frontend e app/backend"