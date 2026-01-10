"use client";

import { useQuery } from "@tanstack/react-query";
import {
  WALLETS_API_URL,
  PERSONAL_WALLETS_API_URL,
  QUERY_STALE_TIME,
  QUERY_CACHE_TIME,
} from "@/lib/constants";
import type { WalletsApiResponse } from "@/lib/types";
import { Address } from "viem";

const fetchWallets = async (): Promise<Address[]> => {
  // Fetch from both URLs in parallel
  const [response1, response2] = await Promise.all([
    fetch(WALLETS_API_URL),
    fetch(PERSONAL_WALLETS_API_URL),
  ]);

  if (!response1.ok) {
    throw new Error(`Failed to fetch wallets from main API: ${response1.statusText}`);
  }

  if (!response2.ok) {
    throw new Error(`Failed to fetch wallets from personal API: ${response2.statusText}`);
  }

  const data1: WalletsApiResponse = await response1.json();
  const data2: WalletsApiResponse = await response2.json();

  console.log('Main API wallets:', data1);
  console.log('Personal API wallets:', data2);

  // Merge wallet addresses from both sources
  const allWallets = [
    ...data1.response.map((addr) => addr.toLowerCase() as Address),
    ...data2.response.map((addr) => addr.toLowerCase() as Address),
  ];

  // Remove duplicates using Set
  const uniqueWallets = Array.from(new Set(allWallets));

  console.log(`Total wallets: ${allWallets.length}, Unique wallets: ${uniqueWallets.length}`);

  return uniqueWallets;
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
