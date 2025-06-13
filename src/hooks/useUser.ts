import { useQuery } from '@tanstack/react-query';


export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/user');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // <-- use gcTime instead of cacheTime
    retry: 1,
  });
}