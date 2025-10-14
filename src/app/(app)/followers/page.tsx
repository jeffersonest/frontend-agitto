import { Suspense } from "react";
import FollowersPageContent from "./followers-content";

export default function FollowersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-4"><div className="max-w-2xl mx-auto"><div className="h-8 w-48 bg-secondary animate-pulse rounded mb-6" /><div className="bg-white rounded-lg shadow-sm border h-96 animate-pulse" /></div></div>}>
      <FollowersPageContent />
    </Suspense>
  );
}
