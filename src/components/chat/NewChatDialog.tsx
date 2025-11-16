"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAvailableContacts, useFindOrCreateChat } from "@/lib/queries/chat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Loader2, MessageSquarePlus, Search } from "lucide-react";
import { Input } from "../ui/input";

interface NewChatDialogProps {
  children?: React.ReactNode;
}

export function NewChatDialog({ children }: NewChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { data: contacts, isLoading } = useAvailableContacts();
  const findOrCreate = useFindOrCreateChat();

  const filteredContacts = contacts?.filter((contact) => {
    const searchLower = search.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.username?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectContact = async (userId: string) => {
    try {
      const chat = await findOrCreate.mutateAsync(userId);
      setOpen(false);
      router.push(`/messages/${chat.id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="gap-2">
            <MessageSquarePlus className="w-4 h-4" />
            Nova conversa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contatos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && filteredContacts?.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {search ? "Nenhum contato encontrado" : "Você ainda não segue ninguém"}
              </div>
            )}

            {filteredContacts?.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact.id)}
                disabled={findOrCreate.isPending}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={contact.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {contact.name?.[0] || contact.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">
                    {contact.name || contact.username}
                  </p>
                  {contact.username && (
                    <p className="text-xs text-muted-foreground">
                      @{contact.username}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
