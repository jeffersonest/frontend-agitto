"use client";
import UserList from "@/components/users/user-list";

type Attendee = {
  id: string;
  user: { id: string; name: string; username: string | null; profileImageUrl: string | null };
  status: string;
};

export default function AttendeeList({ items = [], loading = false }: { items: Attendee[]; loading?: boolean }) {
  return (
    <UserList
      title={`Quem vai (${items.length})`}
      items={items.map((a) => ({ id: a.id, user: a.user, subtitle: a.status }))}
      loading={loading}
      emptyMessage="Ninguém confirmou ainda."
    />
  );
}

