
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export interface AddressSearchProps {
  onAddressSubmit?: (address: string) => void;
}

export default function AddressSearch({ onAddressSubmit }: AddressSearchProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);

    if (onAddressSubmit) {
      onAddressSubmit(address);
      setLoading(false);
    } else {
      setTimeout(() => {
        setLoading(false);
        navigate(`/property?address=${encodeURIComponent(address)}`);
      }, 1000);
    }
  };

  return (
    <Card className="border-none shadow-xl bg-white/30 backdrop-blur-md glass-morphism transition-all duration-150">
      <CardContent className="p-7">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-3 items-stretch"
        >
          <div className="relative flex-grow animate-fade-in">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/70" />
            <Input
              className="pl-14 h-14 text-lg placeholder:text-muted-foreground/80 font-semibold transition-all border-none bg-white/60 glass-morphism shadow-sm focus:ring-2 focus:ring-primary"
              placeholder="Enter an address, city, or ZIP code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="h-14 px-8 rounded-xl shadow-xl bg-gradient-to-br from-primary to-accent text-lg font-bold transition-transform hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></span>
                Searching...
              </span>
            ) : (
              <>
                <Search className="h-5 w-5 mr-1" />
                Search
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
