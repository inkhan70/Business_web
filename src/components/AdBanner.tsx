"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Award } from 'lucide-react';

const SESSION_STORAGE_KEY = 'adBannerDismissed';

export function AdBanner() {
  const [isVisible, setIsVisible] = useState(false);
  
  // This is a placeholder. In a real app, this would be determined by user authentication and roles.
  const isAppreciatedMember = true; 

  useEffect(() => {
    // Check if the user is a member and if they haven't already dismissed the banner this session.
    const dismissed = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (isAppreciatedMember && dismissed !== 'true') {
      setIsVisible(true);
    }
  }, [isAppreciatedMember]);

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 pt-6">
        <Card className="bg-primary/10 border-primary/20 relative">
        <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="bg-primary/20 p-2 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-primary">A Special Offer for Our Valued Members!</h3>
                    <p className="text-sm text-primary/80">
                        Get 20% off on your next purchase. Use code: <span className="font-mono bg-background/50 px-1 py-0.5 rounded">MEMBER20</span>
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
