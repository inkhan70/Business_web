
"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { MapPin, LocateFixed } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

export function Location() {
  const { control, setValue } = useFormContext();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you would use a reverse geocoding API
          // to turn these coordinates into an address and fill the fields.
          // For now, we'll just pre-fill with a placeholder and coordinates.
          setValue("address", `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          setValue("city", "Geolocated City");
          setValue("state", "Geolocated State");
          // setValue("country", "Geolocated Country");
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
            <h3 className="font-semibold text-lg">Business Location</h3>
        </div>
        
        <div className="space-y-2">
            <Label>Manual Entry</Label>
            <p className="text-sm text-muted-foreground">If you prefer, enter your business address details below.</p>
             <FormField
                control={control}
                name="address"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('signup.address')}</FormLabel>
                    <FormControl>
                    <Input placeholder={t('signup.address_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('signup.city')}</FormLabel>
                    <FormControl>
                        <Input placeholder={t('signup.city_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={control}
                name="state"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., California" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
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
