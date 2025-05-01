
import StickyHeader from '@/components/layout/StickyHeader';
import PropertyHistory from '@/components/PropertyHistory';

export default function HistoryPage() {
  return (
    <div className="min-h-screen">
      <StickyHeader title="Search History" />
      <PropertyHistory />
    </div>
  );
}
