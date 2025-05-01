'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, MapPin, Calendar, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from './ui/alert';

const HISTORY_KEY = 'property_search_history';

type HistoryItem = {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  propertyId: string;
  timestamp: string;
  [key: string]: any;
};

export default function PropertyHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const loadHistory = () => {
      const historyString = localStorage.getItem(HISTORY_KEY);
      if (!historyString) return [];
      
      try {
        const parsedHistory = JSON.parse(historyString);
        return Array.isArray(parsedHistory) ? parsedHistory : [];
      } catch (e) {
        console.error('Error parsing history:', e);
        return [];
      }
    };
    
    setHistory(loadHistory());
  }, []);
  
  const handlePropertyClick = (propertyData: any) => {
    // Save to localStorage temporarily
    localStorage.setItem('current_property_data', JSON.stringify(propertyData));
    
    // Navigate to property page with address as URL parameter
    router.push(`/property?address=${encodeURIComponent(propertyData.address)}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  if (history.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            No search history available. Please search for a property first.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-8">
          <Button onClick={() => router.push('/search')}>
            Go to Search
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {history.map((item, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="text-lg font-medium">{item.address}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                {item.suburb}, {item.state} {item.postcode}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Searched on {formatDate(item.timestamp)}</span>
              </div>
              <Separator className="my-3" />
              <Button 
                className="w-full mt-2" 
                onClick={() => handlePropertyClick(item)}
                variant="secondary"
              >
                View Property Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
