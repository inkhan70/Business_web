
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/contexts/LanguageContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export function ProductSearch() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date>();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('product_search.placeholder')}
            className="pl-10 text-base py-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
            {t('product_search.search_button')}
          </Button>
        </div>
      </form>
      
      <Accordion type="single" collapsible>
        <AccordionItem value="advanced-search" className="border-b-0">
          <AccordionTrigger>
            <div className='flex items-center gap-2'>
              <SlidersHorizontal className="h-4 w-4" />
              {t('product_search.advanced_search')}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/50">
              {/* Price Range */}
              <div className="space-y-2">
                <Label htmlFor="min-price">{t('product_search.price_range')}</Label>
                <div className="flex items-center gap-2">
                  <Input id="min-price" type="number" placeholder={t('product_search.min')} />
                  <span>-</span>
                  <Input id="max-price" type="number" placeholder={t('product_search.max')} />
                </div>
              </div>
              
              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">{t('product_search.weight')}</Label>
                <Input id="weight" placeholder={t('product_search.weight_placeholder')} />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">{t('product_search.color')}</Label>
                <Input id="color" placeholder={t('product_search.color_placeholder')} />
              </div>

              {/* Release Date */}
              <div className="space-y-2">
                <Label>{t('product_search.release_date')}</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>{t('product_search.date_placeholder')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">{t('product_search.type')}</Label>
                <Input id="type" placeholder={t('product_search.type_placeholder')} />
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label htmlFor="size">{t('product_search.size')}</Label>
                <Input id="size" placeholder={t('product_search.size_placeholder')} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
