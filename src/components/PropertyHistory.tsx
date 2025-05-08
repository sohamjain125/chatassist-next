'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from './ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HistoryItem } from '@/interface/property.interface';

const HISTORY_KEY = 'property_search_history';



export default function PropertyHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const loadHistory = () => {
      const historyString = localStorage.getItem(HISTORY_KEY);
      if (!historyString) {
        // Provide two dummy items if no history exists
        return [
          {
            address: '123 Main St, Melbourne VIC 3000, Australia',
            suburb: 'Melbourne',
            state: 'VIC',
            postcode: '3000',
            propertyId: 'DUMMY001',
            timestamp: new Date().toISOString(),
            buildingOutline: {
              coordinates: [
                { lat: -37.8136, lng: 144.9631 },
                { lat: -37.8137, lng: 144.9632 },
                { lat: -37.8138, lng: 144.9631 },
                { lat: -37.8137, lng: 144.9630 }
              ],
              measurements: [
                {
                  start: { lat: -37.8136, lng: 144.9631 },
                  end: { lat: -37.8137, lng: 144.9632 },
                  length: '50m'
                },
                {
                  start: { lat: -37.8137, lng: 144.9632 },
                  end: { lat: -37.8138, lng: 144.9631 },
                  length: '50m'
                },
                {
                  start: { lat: -37.8138, lng: 144.9631 },
                  end: { lat: -37.8137, lng: 144.9630 },
                  length: '50m'
                },
                {
                  start: { lat: -37.8137, lng: 144.9630 },
                  end: { lat: -37.8136, lng: 144.9631 },
                  length: '50m'
                }
              ],
              area: '2500m²'
            },
            location: { lat: -37.8137, lng: 144.9631 }
          },
          {
            address: '456 Queen St, Sydney NSW 2000, Australia',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            propertyId: 'DUMMY002',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            buildingOutline: {
              coordinates: [
                { lat: -33.8688, lng: 151.2093 },
                { lat: -33.8689, lng: 151.2094 },
                { lat: -33.8690, lng: 151.2093 },
                { lat: -33.8689, lng: 151.2092 }
              ],
              measurements: [
                {
                  start: { lat: -33.8688, lng: 151.2093 },
                  end: { lat: -33.8689, lng: 151.2094 },
                  length: '60m'
                },
                {
                  start: { lat: -33.8689, lng: 151.2094 },
                  end: { lat: -33.8690, lng: 151.2093 },
                  length: '60m'
                },
                {
                  start: { lat: -33.8690, lng: 151.2093 },
                  end: { lat: -33.8689, lng: 151.2092 },
                  length: '60m'
                },
                {
                  start: { lat: -33.8689, lng: 151.2092 },
                  end: { lat: -33.8688, lng: 151.2093 },
                  length: '60m'
                }
              ],
              area: '3600m²'
            },
            location: { lat: -33.8689, lng: 151.2093 }
          },
        ];
      }
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
    <div className="container mx-auto py-8 px-4">
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              <th className="py-3 px-4 border-b">Date & Time</th>
              <th className="py-3 px-4 border-b">Property Details</th>
              <th className="py-3 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 align-top whitespace-nowrap text-sm text-gray-700">{formatDate(item.timestamp)}</td>
                <td className="py-3 px-4 align-top text-sm">
                  <div className="font-medium text-gray-900">{item.address}</div>
                  <div className="text-gray-500">{item.suburb}, {item.state} {item.postcode}</div>
                  <div className="text-xs text-gray-400 mt-1">ID: {item.propertyId}</div>
                </td>
                <td className="py-3 px-4 align-top">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          className="w-full bg-[#4c95bb] hover:bg-[#4c95bb]/90 text-white" 
                          onClick={() => handlePropertyClick(item)}
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        View property details and information
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
