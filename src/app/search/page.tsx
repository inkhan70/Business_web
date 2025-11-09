
"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import images from '@/app/lib/placeholder-images.json';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, or, and } from 'firebase/firestore';

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
    status: "Active" | "Archived" | "Low Stock" | "Out of Stock";
    inventory: number;
    category?: string;
    userId?: string;
    varieties: Variety[];
}

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const queryTerm = searchParams.get('q') || '';
    const firestore = useFirestore();

    // NOTE: Firestore does not support full-text search on its own.
    // This implementation can only perform basic prefix matching on a single field.
    // For a real-world app, a third-party search service like Algolia or Typesense would be necessary.
    const productsQuery = useMemoFirebase(() => {
        if (!queryTerm) return null;
        const productsCollection = collection(firestore, 'products');
        // Simple query to find products where the name starts with the query term.
        // This is case-sensitive. For case-insensitive, you'd need to store a lowercase version of the name.
        return query(productsCollection, 
            where('name', '>=', queryTerm),
            where('name', '<=', queryTerm + '\uf8ff')
        );
    }, [firestore, queryTerm]);

    const { data: results, isLoading: loading, error } = useCollection<Product>(productsQuery);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-4">Searching for products...</p>
            </div>
        );
    }
     if (error) {
        return <div className="text-center text-destructive py-10">Error loading search results: {error.message}</div>
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-left mb-8">
                <p className="text-lg text-muted-foreground">Search results for</p>
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
                  "{queryTerm}"
                </h1>
            </div>
            
            {results && results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map(product => (
                        <Card key={product.id} className="flex flex-col">
                           <CardHeader>
                                <Image
                                    alt={product.name}
                                    className="aspect-video w-full rounded-md object-cover"
                                    height="180"
                                    src={product.varieties?.[0]?.image || images.search.result}
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
                    <p className="text-muted-foreground mt-2">Your search for "{queryTerm}" did not match any products.</p>
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

    