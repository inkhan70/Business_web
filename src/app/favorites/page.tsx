
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, HeartCrack } from "lucide-react";
import Image from "next/image";
import { useFavorites, FavoriteBusiness } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FavoritesPage() {
    const { favorites, removeFavorite } = useFavorites();
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-left mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
                My Favorite Businesses
                </h1>
                <p className="text-lg text-muted-foreground mt-2">Your hand-picked list of businesses for easy access.</p>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.map((biz) => (
                  <Card key={biz.id} className="flex flex-col">
                    <CardHeader className="p-0">
                      <Image 
                        src={biz.image || "https://picsum.photos/seed/placeholder/350/200"} 
                        alt={biz.name} 
                        width={350} 
                        height={200} 
                        className="rounded-t-lg object-cover w-full h-40" 
                        data-ai-hint={biz.dataAiHint || 'business exterior'} 
                      />
                    </CardHeader>
                     <CardContent className="p-4 flex-grow">
                        <CardTitle className="font-headline text-xl">{biz.name}</CardTitle>
                        <CardDescription className="flex items-center pt-1">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            {biz.address}
                        </CardDescription>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <Button asChild className="w-full">
                        <Link href={`/products/distributor/${biz.id}`}>
                          {t('businesses.view_products')} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="destructive" onClick={() => removeFavorite(biz.id)}>
                        Remove
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
                <div className="text-center py-16 bg-muted/50 rounded-lg">
                    <HeartCrack className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mt-4">No Favorites Yet</h3>
                    <p className="text-muted-foreground mt-2">Browse businesses and click the heart icon to save them here.</p>
                    <Button asChild className="mt-6">
                        <Link href="/categories">Explore Businesses</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
