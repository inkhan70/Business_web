
"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Variety {
    id: string;
    name: string;
    price: number;
    image?: string;
    dataAiHint?: string;
}

interface Product {
    id: string;
    name: string; // This is now the Brand/Product Line name
    status: "Active" | "Archived" | "Low Stock" | "Out of Stock";
    inventory: number;
    category?: string;
    userId?: string;
    varieties: Variety[];
}

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            setLoading(true);
            try {
                const storedProductsRaw = localStorage.getItem('products');
                const allProducts: Product[] = storedProductsRaw ? JSON.parse(storedProductsRaw) : [];
                
                const lowercasedQuery = query.toLowerCase();
                const filteredResults = allProducts.filter(product => {
                    const inProductName = product.name.toLowerCase().includes(lowercasedQuery);
                    const inVarietyName = product.varieties && product.varieties.some(variety => variety.name.toLowerCase().includes(lowercasedQuery));
                    return inProductName || inVarietyName;
                });

                setResults(filteredResults);
            } catch (error) {
                console.error("Error searching products from localStorage:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [query]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-4">Searching for products...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-left mb-8">
                <p className="text-lg text-muted-foreground">Search results for</p>
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
                  "{query}"
                </h1>
            </div>
            
            {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map(product => (
                        <Card key={product.id} className="flex flex-col">
                           <CardHeader>
                                <Image
                                    alt={product.name}
                                    className="aspect-video w-full rounded-md object-cover"
                                    height="180"
                                    src={product.varieties?.[0]?.image || "https://placehold.co/320x180.png"}
                                    width="320"
                                    data-ai-hint={product.varieties?.[0]?.dataAiHint || "product image"}
                                />
                                <CardTitle className="font-headline text-xl pt-2">{product.name}</CardTitle>
                                <CardDescription>{product.category}</CardDescription>
                           </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    {product.varieties && product.varieties.map(v => <li key={v.id}>- {v.name}</li>)}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/products/${product.id}`}>
                                        View Product Details
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-muted/50 rounded-lg">
                    <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mt-4">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Your search for "{query}" did not match any products.</p>
                     <Button asChild variant="secondary" className="mt-6">
                        <Link href="/">
                            Back to Home
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<div className="text-center py-10">Loading search results...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
