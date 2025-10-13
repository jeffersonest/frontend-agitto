"use client";
import UserList from "@/components/users/user-list";

type LikeItem = {
  id: string;
  user: { id: string; name: string; username: string | null; profileImageUrl: string | null };
};

export default function LikesList({ items = [], loading = false }: { items: LikeItem[]; loading?: boolean }) {
  return (
    <UserList
      title={`Curtidas (${items.length})`}
      items={items.map((l) => ({ id: l.id, user: l.user }))}
      loading={loading}
      emptyMessage="Seja o primeiro a curtir."
    />
  );
}

