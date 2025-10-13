"use client";
import UserList from "@/components/users/user-list";

type FollowUser = { id: string; name: string; username: string | null; profileImageUrl: string | null; bio?: string | null };

export function FollowersList({ items = [], loading = false }: { items: FollowUser[]; loading?: boolean }) {
  return (
    <UserList
      title={`Seguidores (${items.length})`}
      items={items.map((u) => ({ id: u.id, user: { id: u.id, name: u.name, username: u.username, profileImageUrl: u.profileImageUrl }, subtitle: u.bio || null }))}
      loading={loading}
      emptyMessage="Sem seguidores ainda."
    />
  );
}

export function FollowingList({ items = [], loading = false }: { items: FollowUser[]; loading?: boolean }) {
  return (
    <UserList
      title={`Seguindo (${items.length})`}
      items={items.map((u) => ({ id: u.id, user: { id: u.id, name: u.name, username: u.username, profileImageUrl: u.profileImageUrl }, subtitle: u.bio || null }))}
      loading={loading}
      emptyMessage="Você ainda não segue ninguém."
    />
  );
}

