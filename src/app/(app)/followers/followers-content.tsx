"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Users, UserPlus } from "lucide-react";
import { getFollowers, getFollowing, searchUsers } from "@/lib/api/social";
import { getMe } from "@/lib/api/auth";
import UserCard from "@/components/social/user-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Tab = "following" | "followers" | "search";

export default function FollowersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "following";

  type Follow = { id: string; user: { id: string; name: string; username: string | null; profileImageUrl: string | null; bio: string | null } };
  type SearchUser = { id: string; name: string; username: string | null; profileImageUrl: string | null; bio: string | null; followersCount: number; followingCount: number; isFollowing: boolean };

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [myId, setMyId] = useState<string | null>(null);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchMe() {
      try {
        const user = await getMe() as { id: string };
        setMyId(user.id);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    fetchMe();
  }, []);

  useEffect(() => {
    if (!myId) return;

    async function loadData() {
      setIsLoading(true);
      try {
        if (activeTab === "following") {
          const data = await getFollowing(myId as string);
          setFollowing(data.following);
        } else if (activeTab === "followers") {
          const data = await getFollowers(myId as string);
          setFollowers(data.followers);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [myId, activeTab]);

  function changeTab(tab: Tab) {
    setActiveTab(tab);
    router.push(`/followers?tab=${tab}`, { scroll: false });
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const data = await searchUsers(searchQuery);
      setSearchResults(data.users);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFollowToggle(userId: string, isFollowing: boolean) {
    setSearchResults((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFollowing } : user
      )
    );

    if (!isFollowing) {
      setFollowing((prev) => prev.filter((f) => f.user.id !== userId));
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Seguidores</h1>

        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => changeTab("following")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === "following"
                  ? "text-purple-700 border-b-2 border-purple-700"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus size={16} />
              <span>Seguindo</span>
            </button>
            <button
              onClick={() => changeTab("followers")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === "followers"
                  ? "text-purple-700 border-b-2 border-purple-700"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users size={16} />
              <span>Seguidores</span>
            </button>
            <button
              onClick={() => changeTab("search")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === "search"
                  ? "text-purple-700 border-b-2 border-purple-700"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search size={16} />
              <span>Buscar</span>
            </button>
          </div>

          <div className="p-4">
            {activeTab === "search" && (
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Buscar pessoas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
                    <Search size={16} />
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-lg bg-secondary animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activeTab === "following" && (
                  <>
                    {following.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <UserPlus size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Você ainda não segue ninguém</p>
                        <Button
                          variant="link"
                          onClick={() => changeTab("search")}
                          className="mt-2"
                        >
                          Buscar pessoas para seguir
                        </Button>
                      </div>
                    ) : (
                      following.map((f) => (
                        <UserCard
                          key={f.id}
                          user={{ ...f.user, isFollowing: true }}
                          onFollowToggle={handleFollowToggle}
                        />
                      ))
                    )}
                  </>
                )}

                {activeTab === "followers" && (
                  <>
                    {followers.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Você ainda não tem seguidores</p>
                      </div>
                    ) : (
                      followers.map((f) => (
                        <UserCard
                          key={f.id}
                          user={f.user}
                          showFollowButton={false}
                        />
                      ))
                    )}
                  </>
                )}

                {activeTab === "search" && (
                  <>
                    {searchResults.length === 0 && searchQuery.trim() !== "" && !isLoading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhum usuário encontrado</p>
                      </div>
                    ) : (
                      searchResults.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onFollowToggle={handleFollowToggle}
                        />
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
