'use client';
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';

export default function HistoricalDataPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Simulate fetching property and historical data
    setTimeout(() => {
      setProperty({
        address: '123 Example St, Exampleville',
        propertyNo: 'PROP123',
        owner: 'John Doe',
      });
      setHistory([
        { year: 2020, event: 'Sold to John Doe', price: '$500,000' },
        { year: 2015, event: 'Renovated', price: '$50,000' },
        { year: 2010, event: 'Sold to Jane Smith', price: '$400,000' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading historical data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Historical Data for Property</CardTitle>
          <div className="text-muted-foreground text-sm mt-2">
            {property.address} (Property No: {property.propertyNo})<br />
            Owner: {property.owner}
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-4">History</h3>
          <ul className="space-y-2">
            {history.map((item, idx) => (
              <li key={idx} className="border-b pb-2">
                <div className="font-medium">{item.year}: {item.event}</div>
                {item.price && <div className="text-sm text-muted-foreground">{item.price}</div>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
