
"use client"

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2, Package } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import images from '@/app/lib/placeholder-images.json';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { ProductSearch } from "@/components/ProductSearch";

interface Variety {
    id: string;
    name: string;
    price: number;
    image?: string;
    dataAiHint?: string;
}

interface Product {
    id: string;
    name: string;
    varieties: Variety[];
}

interface BusinessProfile {
    uid: string;
    businessName: string;
    address: string;
}

export default function DistributorInventoryPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const firestore = useFirestore();
  const businessId = params.id;

  const businessDocRef = useMemoFirebase(() => doc(firestore, "users", businessId), [firestore, businessId]);
  const { data: business, isLoading: businessLoading } = useDoc<BusinessProfile>(businessDocRef);

  const productsQuery = useMemoFirebase(() => query(collection(firestore, "products"), where("userId", "==", businessId)), [firestore, businessId]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const isLoading = businessLoading || productsLoading;

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-12 flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  if (!business) {
    return <div className="container mx-auto px-4 py-12 text-center">Business not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          {business.businessName}
        </h1>
        <p className="flex items-center text-lg text-muted-foreground mt-2">
            <MapPin className="h-5 w-5 mr-2" />
            {business.address}
        </p>
      </div>

      <div className="mb-8">
        <ProductSearch placeholder={t('distributor_inventory.search_placeholder')} />
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden">
              <CardHeader className="p-0">
                <Image 
                  src={product.varieties?.[0]?.image || images.products.generic} 
                  alt={product.name} 
                  width={300} 
                  height={300} 
                  className="object-cover w-full h-48" 
                  data-ai-hint={product.varieties?.[0]?.dataAiHint || "product image"} 
                />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                  <h3 className="font-bold font-headline">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{product.varieties?.length || 0} varieties available</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full" variant="outline">
                      <Link href={`/products/item/${product.id}`}>
                          {t('distributor_inventory.view_details')}
                      </Link>
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/50 rounded-lg">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold mt-4">No Products Found</h3>
            <p className="text-muted-foreground mt-2">This business has not listed any products yet.</p>
        </div>
      )}
    </div>
  );
}
