import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Wallpaper } from '@/components/Wallpaper';

export default function Home() {
  // In a real app, this would be determined by user authentication
  const isAdmin = true; 

  return (
    <>
      <Wallpaper />
      <div className="flex flex-col">
        <section className="relative container mx-auto px-4 py-20 md:py-32">
          {isAdmin && (
              <div className="absolute top-4 right-4">
                  <Button asChild variant="outline">
                      <Link href="/admin/appearance">
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Add/Remove Wallpaper
                      </Link>
                  </Button>
              </div>
          )}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold font-headline leading-tight tracking-tighter mb-6 text-primary">
                Connect Your Business to Your City.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground mb-8">
                If you are a producer, wholesaler, distributor or shopkeeper, put your business online within minutes with us. Sell your products to local and domestic customers for free. Grow your business 24/7 without the need for an expensive storefront.
              </p>
              <p className="max-w-xl text-lg text-muted-foreground mb-8">
                Online your business with us. <Link href="/signup" className="text-primary underline hover:opacity-80">Sign up</Link> now, or <Link href="/signin" className="text-primary underline hover:opacity-80">sign in</Link> if you are already registered.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/categories">
                    Explore Categories <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                 <Button size="lg" variant="outline" asChild>
                  <Link href="/signup">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <Image 
                src="https://placehold.co/600x400.png"
                alt="City illustration with shops and people"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
                data-ai-hint="city shops"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
