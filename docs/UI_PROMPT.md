Prompt de layout/UX para o frontend Agitto

Contexto rápido
- Marca: teal `#24BFBF` como primária; acento lavanda `#A78BFA` para CTAs secundários.
- Neutros confortáveis (texto secundário/placeholder `#6B7280`).
- Raio compacto (0.75rem), inputs e botões `rounded-lg`.
- Cards com leve blur e sombra, auth centralizado.

Padrões obrigatórios
1) Inputs
   - Use `FloatingTextField` para texto/email/senha, sempre com ícone à esquerda.
   - Campo de senha sempre com toggle de visibilidade.
   - Telefone BR: `FloatingPhoneInputBR` (ícone teal, prefixo +55, máscara e label flutuante).

2) Botões
   - Primário (teal) para ações principais.
   - `variant="accent"` (lavanda) para CTAs secundárias de destaque (ex.: Registrar, Confirmar OTP).
   - Ícones à esquerda (Lucide) nos botões principais.

3) Cabeçalho
   - Em rotas autenticadas (`src/app/(app)`), usar `AppHeader` com `UserMenu` (nome/email/avatar, dropdown, Logout).

4) Fluxos de autenticação
   - Login: abas com E‑mail+senha e Celular+senha (sem OTP de login). Abaixo, CTA “Registrar” (`accent`).
   - Registro: botões “Cadastrar” (`accent`) e “Voltar ao login” (secondary).
   - Add Phone: `FloatingPhoneInputBR` + enviar OTP.
   - Verify Phone: número centralizado, OTP maior, CTA `Confirmar` (`accent`).
   - Verify Email: informativo; se logado, sugere “Adicionar celular”; senão, “Voltar ao login”.
   - Home `/` redireciona para `/login`.

Tokens (em `globals.css`)
- Teal: `--primary`, `--primary-600`, `--primary-700`, `--primary-tint-1/2`.
- Neutros: `--neutral-900..100`, `--muted-foreground` (#6B7280).
- Accent: `--lavender`, `--lavender-600/700`, `--lavender-50/100`.

Diretrizes visuais
- Tipos fortes em `#303030` (ou `--foreground`), secundários `text-foreground/70`.
- Inputs 44px de altura (`h-11`), ícones 16–18px.
- Cards `max-w-md`, espaçamento `space-y-4`.

Como solicitar novas telas
- Descreva o objetivo, campos (tipos) e quais CTAs são primárias/ secundárias.
- Indique se é rota autenticada (usa header) e se há redirecionamentos pós-ação.

