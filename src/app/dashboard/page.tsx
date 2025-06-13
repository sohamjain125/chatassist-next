'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Loader2 } from 'lucide-react';
import { UserInfo } from "@/interface/dashboard.interface";
import { HistoryItem } from "@/interface/dashboard.interface";
import { encodeIds } from '@/lib/hash';


export default function Dashboard() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<HistoryItem[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({ firstname: '', lastname: '' });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllSearches, setShowAllSearches] = useState(false);
  useEffect(() => {
    // Check for token on client side
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];

    if (!token) {
      router.push('/login');
    } else {
      // Fetch user information and recent searches in parallel
      Promise.all([
        fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/search/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])
        .then(async ([userRes, historyRes]) => {
          const [userData, historyData] = await Promise.all([
            userRes.json(),
            historyRes.json()
          ]);

          if (userData.success) {
            setUserInfo({
              firstname: userData.user.firstname,
              lastname: userData.user.lastname
            });
          }

          if (historyData.success) {
            // Sort searches by timestamp in descending order (latest first)
            const sortedSearches = historyData.searches.sort((a: HistoryItem, b: HistoryItem) => 
              new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
            );
            setRecentSearches(sortedSearches);
          }
        })
        .catch(err => {
          console.error('Error fetching dashboard data:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [router]);

  // Format date and time function
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Parse address components
  const parseAddress = (address: string) => {
    if (!address) {
      return {
        street: '',
        suburb: '',
        state: '',
        postcode: ''
      };
    }

    try {
      const parts = address.split(',').map(part => part.trim());
      
      if (parts.length >= 3) {
        const [street, suburb, statePostcode] = parts;
        const statePostcodeParts = statePostcode.split(' ').filter(Boolean);
        
        if (statePostcodeParts.length >= 2) {
          const state = statePostcodeParts[0];
          const postcode = statePostcodeParts[1];
          return {
            street,
            suburb,
            state,
            postcode
          };
        }
      }
      
      // Fallback for addresses that don't match the expected format
      return {
        street: address,
        suburb: '',
        state: '',
        postcode: ''
      };
    } catch (error) {
      console.error('Error parsing address:', error);
      return {
        street: address,
        suburb: '',
        state: '',
        postcode: ''
      };
    }
  };

  const handleSearchClick = () => {
    setIsSearchLoading(true);
    router.push("/search");
  };

  const handleHistoryClick = () => {
    
    router.push("/historical-data");
  };

  const searchesToShow = showAllSearches ? recentSearches : recentSearches.slice(0, 3);

  return (
    <div className="space-y-6 mt-6 relative">
      {(isSearchLoading || isHistoryLoading || isLoading) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading dashboard..." : isSearchLoading ? "Loading search..." : "Loading history..."}
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userInfo.firstname} {userInfo.lastname}!
        </h1>
        <p className="text-muted-foreground">
          How would you like to me to help you today?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Search new address</CardTitle>
            <CardDescription>Find detailed information about any property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-36 flex items-center justify-center bg-muted/50 rounded-md mb-4">
              <FontAwesomeIcon
                icon={faLocationDot}
                beat
                style={{ color: '#4c95bb', fontSize: '64px' }}
              />
            </div>
            <Button className="w-full" onClick={handleSearchClick} disabled={isSearchLoading}>
              {isSearchLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Search properties"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Historical requests</CardTitle>
            <CardDescription>View historical data and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-36 flex items-center justify-center bg-muted/50 rounded-md mb-4">
              <FontAwesomeIcon
                icon={faHouse}
                beat
                style={{ color: "#4c95bb", fontSize: "64px" }}
              />
            </div>
            <Button className="w-full" onClick={handleHistoryClick} disabled={isHistoryLoading}>
              {isHistoryLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "View property history"
              )}
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
            <div className="space-y-4">
              {searchesToShow.map((search, index) => {
                const addressParts = parseAddress(search.Address);
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faLocationDot}
                          className="h-5 w-5 text-primary"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-base">{addressParts.street}</div>
                        <div className="text-sm text-muted-foreground">
                          {addressParts.suburb && `${addressParts.suburb}, `}
                          {addressParts.state && `${addressParts.state} `}
                          {addressParts.postcode && addressParts.postcode}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Searched on {formatDateTime(search.CreatedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Encode the IDs
                          const encodedIds = encodeIds(search.SearchId, search.PropertyDetailId);
                          
                          // Create URL with only hashed IDs and property number
                          const url = `/search-history?p=${search.PropertyNo}&h=${encodedIds}`;
                          router.push(url);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
              {recentSearches.length > 3 && !showAllSearches && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllSearches(true)}
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
