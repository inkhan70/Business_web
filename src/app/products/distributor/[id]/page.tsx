
"use client"

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2, Package, MessageSquare, Heart } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import images from '@/app/lib/placeholder-images.json';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import { ProductSearch } from "@/components/ProductSearch";
import { Wallpaper } from "@/components/Wallpaper";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFavorites, FavoriteBusiness } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

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
    storefrontWallpaper?: string;
    fullName?: string;
    role?: string;
}

export default function DistributorInventoryPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const businessId = params.id;

  const businessDocRef = useMemoFirebase(() => doc(firestore, "users", businessId), [firestore, businessId]);
  const { data: business, isLoading: businessLoading } = useDoc<BusinessProfile>(businessDocRef);

  const productsQuery = useMemoFirebase(() => query(collection(firestore, "products"), where("userId", "==", businessId)), [firestore, businessId]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const isLoading = businessLoading || productsLoading;
  const favorite = business ? isFavorite(business.uid) : false;

  const handleStartChat = async () => {
    if (!user || !userProfile || !business) {
      toast({ title: "Please sign in", description: "You need to be logged in to start a chat.", variant: "destructive"});
      return;
    }
    if (user.uid === business.uid) {
      toast({ title: "Cannot chat with yourself", description: "You cannot start a chat with your own business.", variant: "destructive"});
      return;
    }

    try {
      const chatsRef = collection(firestore, "chats");
      const q = query(chatsRef, where('participants', 'array-contains', user.uid));
      const querySnapshot = await getDocs(q);
      
      let existingChat = null;
      querySnapshot.forEach(doc => {
        const chat = doc.data();
        if (chat.participants.includes(business.uid)) {
          existingChat = { id: doc.id, ...chat };
        }
      });
      
      if (existingChat) {
        router.push(`/dashboard/chat?chatId=${existingChat.id}`);
      } else {
        const newChatRef = await addDoc(chatsRef, {
          participants: [user.uid, business.uid],
          participantProfiles: {
            [user.uid]: { name: userProfile.fullName || userProfile.businessName, role: userProfile.role },
            [business.uid]: { name: business.fullName || business.businessName, role: business.role },
          },
          lastMessage: "Chat started...",
          lastMessageTimestamp: serverTimestamp(),
        });
        router.push(`/dashboard/chat?chatId=${newChatRef.id}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({ title: "Error", description: "Could not start chat.", variant: "destructive" });
    }
  }
  
  const handleToggleFavorite = () => {
    if (!business) return;
    const favData: FavoriteBusiness = {
        id: business.uid,
        name: business.businessName,
        address: business.address,
        image: business.storefrontWallpaper || images.businesses.corner_store,
        dataAiHint: 'storefront'
    };
    favorite ? removeFavorite(business.uid) : addFavorite(favData);
  }


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
    <>
      {business.storefrontWallpaper && (
         <div
            className="fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-500"
            style={{ backgroundImage: `url(${business.storefrontWallpaper})` }}
        />
      )}
      <div className="container mx-auto px-4 py-12">
        <div className={`mb-8 p-6 rounded-lg ${business.storefrontWallpaper ? 'bg-background/80 backdrop-blur-sm' : ''}`}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start">
              <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
                    {business.businessName}
                  </h1>
                  <p className="flex items-center text-lg text-muted-foreground mt-2">
                      <MapPin className="h-5 w-5 mr-2" />
                      {business.address}
                  </p>
              </div>
               <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Button variant="outline" onClick={handleToggleFavorite}>
                        <Heart className={cn("mr-2 h-5 w-5", favorite ? "fill-red-500 text-red-500" : "")} /> 
                        {favorite ? "Favorited" : "Favorite"}
                    </Button>
                    {user && user.uid !== business.uid && (
                        <Button variant="outline" onClick={handleStartChat}>
                            <MessageSquare className="mr-2 h-5 w-5" /> Chat
                        </Button>
                    )}
               </div>
          </div>
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
    </>
  );
}
