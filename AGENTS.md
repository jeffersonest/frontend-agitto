UI and layout conventions for this repo

Scope: entire repository

Summary
- Primary color is teal `#24BFBF`. Keep it as the brand color.
- Secondary accent is lavender `#A78BFA`; use it sparingly for secondary CTAs.
- Neutral palette uses comfortable grays; placeholders/secondary text use `#6B7280`.
- Border radius is compact (`--radius: 0.75rem`); buttons/inputs use `rounded-lg`.
- Cards use subtle glass/blur with larger shadow; keep content centered on auth screens.

Core components
- Inputs
  - Use `FloatingTextField` for text/email/password fields with left icons and password visibility toggle.
  - For Brazilian phones, use `FloatingPhoneInputBR` (built-in `+55` mask, teal phone icon, label).
  - Do not hand-roll masked inputs.
- Buttons (`@/components/ui/button`)
  - Default variant = teal primary.
  - `variant="accent"` (lavender) for secondary CTAs like “Registrar”, “Confirmar OTP” if you want emphasis without competing with primary.
  - Include left icons where helpful (Lucide).
- Header
  - Authenticated routes live under `src/app/(app)` and are wrapped by `src/app/(app)/layout.tsx` which renders `AppHeader` with `UserMenu` (name/email/avatar, dropdown and Logout).

Auth flow rules
- Login supports exactly two modes: email+senha or celular(+55)+senha (no OTP login).
- `/login` shows tabs E‑mail/Celular with icons. Primary action is “Entrar”. Below, show a secondary CTA “Registrar” (`accent`).
- `/register` uses floating inputs; primary CTA is “Cadastrar” (`accent`) and include a secondary “Voltar ao login”.
- `/add-phone` uses `FloatingPhoneInputBR` e envia OTP.
- `/verify-phone` exibe o número centralizado com fonte maior, OTP ampliado e CTA “Confirmar” (`accent`).
- `/verify-email` é informativo (email OTP indisponível) e oferece “Adicionar celular” se logado ou “Voltar ao login”.
- `/` redireciona para `/login`.

Design tokens (already in `globals.css`)
- Teal: `--primary`, `--primary-600`, `--primary-700`, `--primary-tint-1/2`.
- Neutros: `--neutral-900..100`; placeholders: `--muted-foreground` (#6B7280).
- Accent: `--lavender`, `--lavender-600/700`, `--lavender-50/100`.
- Background gradient mixes teal + subtle lavender; keep it calm/subtle.

Implementation tips
- Use Lucide icons. Inputs color icons in teal automatically; keep sizes 16–18px.
- Keep forms `max-w-md`, spacing `space-y-4` e textos de suporte com `text-foreground/70`.
- Prefer `Card` for auth boxes; do not change its base styles without discussion.

