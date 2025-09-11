
"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "./ui/badge";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { ItemDelivery } from "./ItemDelivery";
import type { Address } from "./ItemDelivery";
import images from '@/app/lib/placeholder-images.json';

export function Cart() {
  const { cart, cartCount, updateQuantity, removeFromCart, subtotal } = useCart();
  const { t } = useLanguage();
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    address: "",
    city: "",
    state: "",
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-1"
            >
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout.
          </SheetDescription>
        </SheetHeader>
        
        {cartCount > 0 ? (
          <ScrollArea className="flex-1">
            <div className="px-6 py-4">
              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <div key={item.varietyId} className="flex items-start gap-4">
                    <Image
                      src={item.image || images.varieties.variety_thumb}
                      alt={item.varietyName}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.varietyName}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.varietyId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.varietyId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.varietyId)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                  <div className="flex justify-between font-semibold text-lg">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <ItemDelivery
                    address={deliveryAddress}
                    onAddressChange={setDeliveryAddress}
                  />

                  <p className="text-sm text-muted-foreground">Transportation Cost: <span className="font-bold text-foreground">$5.00</span></p>
                  
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                      {t('item_detail.confirm_order')}
                  </Button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
