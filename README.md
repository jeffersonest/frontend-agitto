This is a [Next.js](https://nextjs.org) project for Agitto Frontend.

## Getting Started

### Configure API base URL

Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` (rebuild required after change):

```bash
cp .env.local.example .env.local
```

- Local backend (Nest): `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`
- Fly.io backend: `NEXT_PUBLIC_API_BASE_URL=https://agitto-api.fly.dev`

Note: the backend must have CORS enabled for your frontend origin.

### Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses `next/font` and Tailwind.

## Features

- Auth: login (e‑mail/celular), registro, adicionar celular, verificações (informativas) com UI consistente.
- Feed com cards interativos: curtir, interesse, eu vou (ícones próprios) e edição quando for dono.
- Populares em carrossel (Embla) com as mesmas interações dos cards.
- Mapa ao vivo com Leaflet otimizado (lazy load, fallback de CDNs, canvas markers, cluster quando necessário, cores por estado: roxo futuro, teal acontecendo).
- Calendário em "Meus eventos" com agregações por dia (GOING/INTERESTED) via `GET /events/my-calendar`.
- Notificações: suporte a novos tipos de eventos (hoje/amanhã/interesse amanhã/cancelado/data/local alterados), filtro "somente eventos" e toast discreto em background.

## State & interactions

- A UI usa Zustand para o estado de interação do usuário por evento: `src/lib/stores/eventInteractionsStore.ts`.
- Páginas seedam a store após carregar eventos (`setInteractions(events)`), e os cards leem do store (`useEventInteractions`).
- Ações de like/RSVP fazem update otimista no store e chamam as APIs (`toggleLike`, `setRsvp`, `deleteRsvp`); em falha, revertem e avisam com toast.

## Maps

- Live map em `src/components/events/live-map-interactive.tsx` com:
  - Preconnect + fallback (unpkg→jsDelivr) e fallback de tiles (Carto→OSM).
  - IntersectionObserver para inicializar apenas quando visível; `preferCanvas`; `invalidateSize` após paint e em `resize`.
  - `circleMarker` até 150 pontos e cluster acima disso.

## UI/UX guidelines

- Botões/links dentro de cards devem parar propagação; não envolver o card inteiro com `<a>`. Use container com `role="link"` e handlers de teclado.
- `UsernameChip` para @usuario; `Logo` como componente com `size` semântico.
- Category badge no feed usa `categoryColor` (Tailwind class); no carrossel usa `categoryColorHex`.

## Lint & SSR guidance

- Sem `any`; tipar utilitários e stubs (ex.: `src/types/leaflet.d.ts`).
- `react-hooks/exhaustive-deps`: derive com `useMemo` e sincronize estados derivados via `useEffect` quando necessário.
- Evite hidratação divergente: não ler `localStorage` no initializer do `useState`; inicialize no `useEffect` após mount.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
