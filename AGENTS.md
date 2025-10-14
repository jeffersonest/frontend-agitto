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

State and interactions
- Use Zustand store `useEventInteractions` (`src/lib/stores/eventInteractionsStore.ts`) as the single source of truth for per‑event user state: `isLiked`, `isInterested`, `isGoing`, `isOwner`.
- Seed the store after fetching events by calling `setInteractions(events)`; all cards read from the store instead of props.
- Mutations (like/interest/going) must optimistically update the store and then call the API (`toggleLike`, `setRsvp`, `deleteRsvp`). On failure, revert and toast an error.
- Do NOT wrap entire cards in `<a>`; use a clickable container (role="link") to allow internal buttons/links to work and stop propagation.

Live map performance
- Leaflet is lazy‑loaded with CDN fallback and preconnects. See `src/components/events/live-map-interactive.tsx`.
- Use `preferCanvas`, invalidate size after first paint, and add an IntersectionObserver to initialize only when visible.
- Use `circleMarker` for ≤150 points and cluster otherwise. Filter out invalid markers (no lat/lng).
- Colors: future (purple `#9333EA`), ongoing (teal `#24BFBF`).

Cards and badges
- Category badge in cards must use Tailwind classes from `categoryColor` (e.g. `bg-…`), not inline hex.
- `UsernameChip` is the standard chip for @user (link or button mode) with hover/ring.

Notifications
- New event notification types: `EVENT_TODAY`, `EVENT_TOMORROW`, `EVENT_INTEREST_TOMORROW`, `EVENT_CANCELLED`, `EVENT_DATE_CHANGED`, `EVENT_LOCATION_CHANGED` (see `src/lib/api/notifications.ts`).
- UserMenu supports a discreet event‑only filter (funnel icon) and a 60s refetch with a lightweight toast for newest event notification.

Calendar
- "Meus eventos" tem abas Grade/Calendário. O calendário mensal usa `useMyCalendar` (cores já fornecidas pelo backend) em `src/components/events/my-events-calendar.tsx`.

Logos
- Use `<Logo size="sm|md|lg|xl|xxl" />` (component) em vez de números soltos; o componente troca automatico black/white no dark mode.

Lint and SSR
- Sem `any`; tipar utilitários (ex.: stubs do Leaflet em `src/types/leaflet.d.ts`).
- Respeite `react-hooks/exhaustive-deps`; derive valores com `useMemo`/`useCallback`.
- Evite hidratação divergente: não ler `localStorage` em initializers do `useState`; inicialize no `useEffect` pós‑mount.
