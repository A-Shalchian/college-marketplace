import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export function useStoreUser() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    storeUser({}).catch(console.error);
  }, [isAuthenticated, user?.id, storeUser]);
}
