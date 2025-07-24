import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-headline font-bold">CityFind</h3>
            <p className="text-sm text-muted-foreground">Your local business connection.</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground">About Us</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Contact</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CityFind. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
