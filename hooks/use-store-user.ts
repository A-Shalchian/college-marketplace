import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";

export function useStoreUser() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const storeUser = useMutation(api.users.store);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      hasSynced.current = false;
      return;
    }
    if (hasSynced.current) return;
    hasSynced.current = true;
    storeUser({}).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);
}
