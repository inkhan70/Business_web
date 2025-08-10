
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, LocateFixed } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";

export interface Address {
    address: string;
    city: string;
    state: string;
}

interface ItemDeliveryProps {
    address: Address;
    onAddressChange: (address: Address) => void;
}


export function ItemDelivery({ address, onAddressChange }: ItemDeliveryProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    onAddressChange({
      ...address,
      [id.replace('-manual', '')]: value,
    });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you would use a reverse geocoding API
          // to turn these coordinates into an address and fill the fields.
          // For now, we'll just pre-fill with a placeholder and coordinates.
          onAddressChange({
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            city: "Geolocated City",
            state: "Geolocated State",
          });
          toast({
            title: "Location Fetched",
            description: `Address fields have been pre-filled. Please verify them.`,
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: `Could not fetch location: ${error.message}`,
            variant: "destructive",
          });
        }
      );
    } else {
       toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">{t('item_detail.delivery_info')}</h3>
        </div>
        
        <div className="space-y-2">
            <Label>Manual Entry</Label>
            <p className="text-sm text-muted-foreground">If you prefer, enter your business address details below.</p>
             <div>
                <Label htmlFor="address-manual" className="text-xs">{t('signup.address')}</Label>
                <Input id="address-manual" name="address" placeholder={t('signup.address_placeholder')} value={address.address} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="city-manual" className="text-xs">{t('signup.city')}</Label>
                    <Input id="city-manual" name="city" placeholder={t('signup.city_placeholder')} value={address.city} onChange={handleInputChange} />
                </div>
                 <div>
                    <Label htmlFor="state-manual" className="text-xs">State / Province</Label>
                    <Input id="state-manual" name="state" placeholder="e.g., California" value={address.state} onChange={handleInputChange} />
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
        </div>
        
        <div>
             <Button type="button" variant="outline" className="w-full" onClick={handleGetCurrentLocation}>
                <LocateFixed className="mr-2 h-4 w-4" />
                Use My Current Location (GPS)
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
                Let your browser find your location automatically.
            </p>
        </div>
    </div>
  );
}
