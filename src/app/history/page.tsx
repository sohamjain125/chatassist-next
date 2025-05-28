'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Search {
  SearchId: number;
  Address: string;
  CreatedAt: string;
  PropertyNo: number;
}

export default function HistoryPage() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    try {
      const response = await fetch('/api/search/history');
      const data = await response.json();
      
      if (data.success) {
        setSearches(data.searches);
      } else {
        toast({
          title: "Error",
          description: "Failed to load search history",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching searches:', error);
      toast({
        title: "Error",
        description: "Failed to load search history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = (search: Search) => {
    const searchParams = new URLSearchParams({
      data: JSON.stringify({
        PropertyNo: search.PropertyNo.toString(),
        SearchId: search.SearchId.toString()
      })
    });
    router.push(`/property?${searchParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Search History</h1>
      {searches.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No search history found
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date and Time</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searches.map((search) => (
              <TableRow key={search.SearchId}>
                <TableCell>
                  {new Date(search.CreatedAt).toLocaleString()}
                </TableCell>
                <TableCell>{search.Address}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearchClick(search)}
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
