"use client";

import { useQuery } from "@tanstack/react-query";
import {
  WALLETS_API_URL,
  QUERY_STALE_TIME,
  QUERY_CACHE_TIME,
} from "@/lib/constants";
import type { WalletsApiResponse } from "@/lib/types";
import { Address } from "viem";

const fetchWallets = async (): Promise<Address[]> => {
  const response = await fetch(WALLETS_API_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch wallets: ${response.statusText}`);
  }

  const data: WalletsApiResponse = await response.json();
  console.log(data);

  // Convert to lowercase addresses for consistent comparison
  return data.response.map((addr) => addr.toLowerCase() as Address);
};

export const useWallets = () => {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: fetchWallets,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_CACHE_TIME,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
