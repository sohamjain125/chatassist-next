'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cookies } from 'next/headers';

const HISTORY_KEY = 'property_search_history';

interface HistoryItem {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  timestamp: string;
  [key: string]: any;
}

export default function Dashboard() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<HistoryItem[]>([]);
  
  // Load search history on component mount
  useEffect(() => {
    const loadHistory = () => {
      const historyString = localStorage.getItem(HISTORY_KEY);
      if (!historyString) return [];
      
      try {
        const parsedHistory = JSON.parse(historyString);
        return Array.isArray(parsedHistory) ? parsedHistory.slice(0, 3) : [];
      } catch (e) {
        console.error('Error parsing history:', e);
        return [];
      }
    };
    
    setRecentSearches(loadHistory());
  }, []);

  useEffect(() => {
    // Check for token on client side
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
    
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your property searches
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Search New Address</CardTitle>
            <CardDescription>Find detailed information about any property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-36 flex items-center justify-center bg-muted/50 rounded-md mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <Button className="w-full" onClick={() => router.push("/search")}>
              Search Properties
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Property History</CardTitle>
            <CardDescription>View historical data and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-36 flex items-center justify-center bg-muted/50 rounded-md mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70">
                <path d="M3 21h18"></path>
                <path d="M19 21v-8.93a2 2 0 0 0-.9-1.67l-7-4.67a2 2 0 0 0-2.2 0l-7 4.67A2 2 0 0 0 1 12.07V21"></path>
                <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"></path>
              </svg>
            </div>
            <Button className="w-full" onClick={() => router.push("/history")}>
              View Property History
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Chatbot Assistant</CardTitle>
            <CardDescription>Get help with property questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-36 flex items-center justify-center bg-muted/50 rounded-md mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <Button className="w-full" onClick={() => router.push("/chat")}>
              Chat With Assistant
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Searches</CardTitle>
            <CardDescription>
              Your recently searched properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSearches.length > 0 ? (
                recentSearches.map((search, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-md hover:bg-muted/60 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <div>
                        <div className="font-medium">{search.address}</div>
                        <div className="text-sm text-muted-foreground">
                          {search.suburb && `${search.suburb}, `}
                          {search.state && `${search.state} `}
                          {search.postcode && search.postcode}
                          {search.timestamp && ` • Searched on ${formatDate(search.timestamp)}`}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/property?data=${encodeURIComponent(JSON.stringify(search))}`)}
                    >
                      View Details
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No recent searches found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={() => router.push('/search')}
                  >
                    Search Properties
                  </Button>
                </div>
              )}
              
              {recentSearches.length > 0 && (
                <div className="text-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/history')}
                  >
                    View All Searches
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
