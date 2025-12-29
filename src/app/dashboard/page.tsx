"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { BuyerDashboard } from './buyer-dashboard';
import { BusinessDashboard } from './business-dashboard';
import { HealthDashboard } from './health-dashboard';
import { AutomotiveDashboard } from './automotive-dashboard';

export default function DashboardPage() {
    const { userProfile, loading } = useAuth();

    if (loading) {
        return (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!userProfile) {
        // This should ideally not happen if the layout redirects, but as a fallback.
        return <div>User profile not found. Please try logging in again.</div>
    }

    // --- Dashboard Routing Logic ---
    switch (userProfile.role) {
        case 'buyer':
            return <BuyerDashboard />;
        
        // For all business roles, we now check their category.
        case 'company':
        case 'wholesaler':
        case 'distributor':
        case 'shopkeeper':
            switch (userProfile.category) {
                case 'Health':
                    return <HealthDashboard />;
                case 'Automotive':
                    return <AutomotiveDashboard />;
                // Default case for all other business categories
                default:
                    return <BusinessDashboard />;
            }

        default:
            // Fallback for any other roles or if role is not defined
            return <div>Invalid user role.</div>;
    }
}
