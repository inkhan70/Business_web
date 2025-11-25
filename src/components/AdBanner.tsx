
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Award, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SESSION_STORAGE_KEY_PREFIX = 'adBannerDismissed_';

// --- Placeholder Data ---
// In a real app, this would come from a database or a CMS.
const allAds = [
    {
        id: 'soup_ad_1',
        title: "New! Hearty Chicken Noodle Soup",
        description: "Perfect for the winter season. Stock your shelves now!",
        icon: ShoppingBag,
        targetAudience: ['shopkeeper', 'guest'], // Can be seen by shopkeepers and guests
    },
    {
        id: 'logistics_ad_2',
        title: "Streamline Your Deliveries",
        description: "Optimize your routes with our new logistics partnership.",
        icon: Award,
        targetAudience: ['distributor', 'wholesaler'], // Only for distributors and wholesalers
    },
    {
        id: 'default_ad_3',
        title: "A Special Offer for Our Valued Members!",
        description: "Get 20% off on your next purchase. Use code: MEMBER20",
        icon: Award,
        targetAudience: ['guest'], // Default ad for guests if no other ad matches
    }
];
// --- End Placeholder Data ---


export function AdBanner() {
  const [ad, setAd] = useState<(typeof allAds)[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { userProfile } = useAuth();
  
  const currentUserRole = userProfile?.role || 'guest';

  useEffect(() => {
    // 1. Find a suitable ad for the current user
    const suitableAds = allAds.filter(ad => ad.targetAudience.includes(currentUserRole));
    const selectedAd = suitableAds.length > 0 ? suitableAds[0] : null;
    
    if (selectedAd) {
        setAd(selectedAd);
        // 2. Check if this specific ad has been dismissed this session.
        const dismissed = sessionStorage.getItem(SESSION_STORAGE_KEY_PREFIX + selectedAd.id);
        if (dismissed !== 'true') {
          setIsVisible(true);
        }
    }

  }, [currentUserRole]);

  const handleDismiss = () => {
    if (ad) {
      sessionStorage.setItem(SESSION_STORAGE_KEY_PREFIX + ad.id, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible || !ad) {
    return null;
  }
  
  const AdIcon = ad.icon;

  return (
    <div className="container mx-auto px-4 pt-6">
        <Card className="bg-primary/10 border-primary/20 relative">
        <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="bg-primary/20 p-2 rounded-full">
                    <AdIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-primary">{ad.title}</h3>
                    <p className="text-sm text-primary/80">
                        {ad.description}
                    </p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="absolute top-2 right-2 h-7 w-7 text-primary/70 hover:text-primary hover:bg-primary/10"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </Button>
        </CardContent>
        </Card>
    </div>
  );
}
