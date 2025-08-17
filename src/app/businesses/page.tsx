
"use client"

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MapPin, ArrowRight, Search, Loader2 } from "lucide-react";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// --- Helper Functions ---
// Haversine formula to calculate distance between two lat/lon points
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d; // Distance in km
};


// Placeholder data - added lat/lon and category for distance/category calculation
const businessData = {
    producers: [...Array(2)].map((_, i) => ({ id: `prod${i+1}`, name: `Organic Farm ${i+1}`, category: 'Food', address: `${10+i} Green Valley, Metropolis`, lat: 34.1 + i * 0.05, lon: -118.3 - i*0.05, image: 'https://placehold.co/350x200.png', dataAiHint: 'farm field' })),
    wholesalers: [...Array(2)].map((_, i) => ({ id: `whole${i+1}`, name: `Bulk Goods Co ${i+1}`, category: 'Food', address: `${20+i} Warehouse Rd, Metropolis`, lat: 34.05 + i * 0.02, lon: -118.25 - i*0.02, image: 'https://placehold.co/350x200.png', dataAiHint: 'warehouse interior' })),
    distributors: [
      { id: 'dist1', name: 'Metro Food Distributors', category: 'Food', address: '123 Market St, Metropolis', lat: 34.0522, lon: -118.2437, image: 'https://placehold.co/350x200.png', dataAiHint: 'warehouse interior' },
      { id: 'dist2', name: 'Gourmet Provisions Inc.', category: 'Food', address: '456 Grand Ave, Metropolis', lat: 34.0407, lon: -118.2448, image: 'https://placehold.co/350x200.png', dataAiHint: 'food packaging' },
      { id: 'dist3', name: 'Citywide Beverage Supply', category: 'Drinks', address: '101 Industrial Park, Metropolis', lat: 33.9922, lon: -118.2137, image: 'https://placehold.co/350x200.png', dataAiHint: 'beverage bottles' },
    ],
    shopkeepers: [
      { id: 'shop1', name: 'The Corner Store', category: 'Food', address: '1 Main St, Metropolis', lat: 34.0549, lon: -118.2426, image: 'https://placehold.co/350x200.png', dataAiHint: 'corner store' },
      { id: 'shop2', name: 'Green Grocer', category: 'Food', address: '22 Park Ave, Metropolis', lat: 34.0600, lon: -118.2500, image: 'https://placehold.co/350x200.png', dataAiHint: 'vegetable stand' },
      { id: 'shop3', name: 'City Electronics', category: 'Electronics', address: '404 Tech Square, Metropolis', lat: 34.07, lon: -118.23, image: 'https://placehold.co/350x200.png', dataAiHint: 'electronics store' },
      { id: 'shop4', name: 'The Shoe Box', category: 'Shoes', address: '55 Fashion St, Metropolis', lat: 34.045, lon: -118.255, image: 'https://placehold.co/350x200.png', dataAiHint: 'shoe store' },
      { id: 'shop5', name: 'Quick-E Mart', category: 'Food', address: '711 Store Ave, Metropolis', lat: 34.03, lon: -118.26, image: 'https://placehold.co/350x200.png', dataAiHint: 'supermarket aisle' },
    ]
};

type BusinessRole = keyof typeof businessData;
type Business = (typeof businessData)[BusinessRole][0] & { distance?: number };


function BusinessesContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const category = searchParams.get('category') || 'all';
  const role = (searchParams.get('role') || 'shopkeepers') as BusinessRole;
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // 1. Get all businesses for the selected ROLE
      const businessesForRole = businessData[role] || [];
      
      // 2. Filter those businesses by the selected CATEGORY
      let businessesForCategory = businessesForRole;
      if (category !== 'all') {
          businessesForCategory = businessesForRole.filter(biz => biz.category.toLowerCase() === category.toLowerCase());
      }
      
      // 3. Attempt to get location and re-sort by distance
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const businessesWithDistance = businessesForCategory.map(biz => ({
              ...biz,
              distance: getDistance(latitude, longitude, biz.lat, biz.lon),
            }));
            const sortedByDistance = businessesWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
            setBusinesses(sortedByDistance);
          },
          (error) => {
            console.warn("Geolocation denied, showing default list.", error);
            setBusinesses(businessesForCategory); // Fallback to category-filtered list
          }
        );
      } else {
          console.warn("Geolocation not supported, showing default list.");
          setBusinesses(businessesForCategory); // Fallback to category-filtered list
      }
    } catch(e) {
        console.error("Storage not found or error loading data", e);
        setBusinesses([]);
    } finally {
        setLoading(false);
    }
  }, [role, category]);

  useEffect(() => {
    const results = businesses.filter(biz =>
      (biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.address.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (biz.distance === undefined || biz.distance <= 100) // Also filter by distance <= 100km
    );
    setFilteredBusinesses(results);
  }, [searchTerm, businesses]);

  const roleTitle = t(`roles.${role}`);
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  if(loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-left mb-8">
        <p className="text-lg text-muted-foreground">{t('businesses.showing_role_for')} {roleTitle} for</p>
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          {categoryTitle} {t('businesses.in_city')}
        </h1>
         <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('businesses.search_placeholder')}
              className="pl-9 w-full md:w-1/2 lg:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
       {filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBusinesses.map((biz) => (
              <Card key={biz.id} className="flex flex-col">
                <CardHeader className="p-0">
                  <Image src={biz.image} alt={biz.name} width={350} height={200} className="rounded-t-lg object-cover w-full h-40" data-ai-hint={biz.dataAiHint} />
                </CardHeader>
                 <CardContent className="p-4 flex-grow">
                    <CardTitle className="font-headline text-xl">{biz.name}</CardTitle>
                    <CardDescription className="flex items-center pt-1">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {biz.address}
                    </CardDescription>
                    {biz.distance !== undefined && (
                        <p className="text-sm font-semibold text-primary mt-2">
                            {biz.distance.toFixed(1)} km {t('businesses.distance_away')}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/products/distributor/${biz.id}`}>
                      {t('businesses.view_products')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
       ) : (
        <div className="text-center py-16">
          <p className="text-xl font-semibold">No businesses found</p>
          <p className="text-muted-foreground mt-2">
             {businesses.length === 0 ? "Storage not found or no businesses available for this category." : `Your search for "${searchTerm}" did not match any businesses.`}
          </p>
        </div>
       )}
      <Pagination className="mt-12">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#">{t('businesses.pagination_previous')}</PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#">{t('businesses.pagination_next')}</PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default function BusinessesPage() {
    return (
        <Suspense fallback={<div>Loading businesses...</div>}>
            <BusinessesContent />
        </Suspense>
    )
}

    