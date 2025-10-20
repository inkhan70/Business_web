
"use client"

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Minus, Plus, ShoppingCart, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import images from '@/app/lib/placeholder-images.json';


const product = {
  id: 'item2',
  name: "Artisan Sourdough Bread",
  varieties: [
    { id: 'var1', name: 'Classic White Sourdough', price: 5.50, manufacturer: 'Golden Grains Bakery', image: images.varieties.white_bread, dataAiHint: 'white bread' },
    { id: 'var2', name: 'Whole Wheat Sourdough', price: 6.00, manufacturer: 'Hearty Harvest Breads', image: images.varieties.brown_bread, dataAiHint: 'brown bread' },
    { id: 'var3', name: 'Rosemary & Olive Oil Sourdough', price: 6.50, manufacturer: 'Golden Grains Bakery', image: images.varieties.herb_bread, dataAiHint: 'herb bread' },
  ]
};

export default function ItemDetailPage({ params }: { params: { itemId: string } }) {
  const [selectedVariety, setSelectedVariety] = useState(product.varieties[0]);
  const [quantity, setQuantity] = useState(1);
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
        productId: product.id,
        productName: product.name,
        varietyId: selectedVariety.id,
        varietyName: selectedVariety.name,
        price: selectedVariety.price,
        image: selectedVariety.image,
        quantity: quantity,
    });
    toast({
        title: "Item Added to Cart",
        description: `${quantity} x ${selectedVariety.name} has been added.`
    });
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link Copied!",
        description: "Product link has been copied to your clipboard.",
      });
    }, (err) => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Failed to Copy",
        description: "Could not copy the link. Please try again.",
        variant: "destructive",
      })
    });
  };


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Image src={selectedVariety.image} alt={selectedVariety.name} width={500} height={500} className="rounded-xl shadow-lg object-cover w-full" data-ai-hint={selectedVariety.dataAiHint} />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {product.varieties.map(v => (
                 <button key={v.id} onClick={() => setSelectedVariety(v)}>
                    <Image src={v.image} alt={v.name} width={100} height={100} className={`rounded-md object-cover border-2 ${selectedVariety.id === v.id ? 'border-primary' : 'border-transparent'}`} data-ai-hint={v.dataAiHint} />
                 </button>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">{selectedVariety.name}</CardTitle>
              <CardDescription>{t('item_detail.by_manufacturer')} {selectedVariety.manufacturer}</CardDescription>
              <p className="text-2xl font-bold text-primary pt-2">${selectedVariety.price.toFixed(2)}</p>
            </CardHeader>
            <CardContent>
              <Label>{t('item_detail.select_variety')}</Label>
              <RadioGroup value={selectedVariety.id} onValueChange={(id) => setSelectedVariety(product.varieties.find(v => v.id === id) || product.varieties[0])} className="mt-2">
                {product.varieties.map(v => (
                  <div key={v.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={v.id} id={v.id} />
                    <Label htmlFor={v.id} className="cursor-pointer">{v.name}</Label>
                  </div>
                ))}
              </RadioGroup>
              
              <Separator className="my-6" />

              <div className="flex items-center gap-8">
                  <div>
                    <Label>{t('item_detail.quantity')}</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                      <Input type="number" value={quantity} readOnly className="w-16 text-center" onChange={e => setQuantity(parseInt(e.target.value) || 1)}/>
                      <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
              </div>

              <Separator className="my-6" />
              
              <div className="flex items-center gap-2">
                <Button className="w-full" size="lg" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> {t('item_detail.add_to_cart')}
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                    <Share2 className="mr-2 h-5 w-5" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
