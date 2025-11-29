
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const addresses = [
  { country: "Afghanistan - Kabul", lines: ["Coantum HiTech", "Street 14, Wazir Akbar Khan", "Kabul 1001", "Afghanistan"] },
  { country: "Argentina - Buenos Aires", lines: ["Coantum HiTech", "Av. Leandro N. Alem 550", "C1001 Buenos Aires", "Argentina"] },
  { country: "Australia - Canberra", lines: ["Coantum HiTech", "1 Constitution Avenue", "Canberra ACT 2601", "Australia"] },
  { country: "Bangladesh - Dhaka", lines: ["Coantum HiTech", "Plot 76, Sector 7", "Dhaka 1207", "Bangladesh"] },
  { country: "Brazil - Brasília", lines: ["Coantum HiTech", "SHS Quadra 3, Bloco A", "Brasília - DF, 70333-900", "Brazil"] },
  { country: "Canada - Ottawa", lines: ["Coantum HiTech", "99 Bank Street, Suite 500", "Ottawa, ON K1P 1A1", "Canada"] },
  { country: "China - Beijing", lines: ["Coantum HiTech", "1 Guanghua Road, Chaoyang District", "Beijing 100020", "China"] },
  { country: "Egypt - Cairo", lines: ["Coantum HiTech", "35 Ramses Street", "Cairo 11511", "Egypt"] },
  { country: "Ethiopia - Addis Ababa", lines: ["Coantum HiTech", "Africa Avenue, Bole Sub-City", "Addis Ababa 1230", "Ethiopia"] },
  { country: "France - Paris", lines: ["Coantum HiTech", "41 Avenue de l'Opéra", "75002 Paris", "France"] },
  { country: "Germany - Berlin", lines: ["Coantum HiTech", "Unter den Linden 17", "10117 Berlin", "Germany"] },
  { country: "Ghana - Accra", lines: ["Coantum HiTech", "Liberation Link, Airport City", "Accra GA-075-8413", "Ghana"] },
  { country: "India - New Delhi", lines: ["Coantum HiTech", "Barakhamba Road, Connaught Place", "New Delhi 110001", "India"] },
  { country: "Indonesia - Jakarta", lines: ["Coantum HiTech", "Jl. Jend. Sudirman Kav. 52-53", "Jakarta 12190", "Indonesia"] },
  { country: "Iran - Tehran", lines: ["Coantum HiTech", "Valiasr Street, No. 250", "Tehran 19686", "Iran"] },
  { country: "Italy - Rome", lines: ["Coantum HiTech", "Via del Corso 156", "00186 Roma RM", "Italy"] },
  { country: "Japan - Tokyo", lines: ["Coantum HiTech", "2-11-3 Nagatacho, Chiyoda-ku", "Tokyo 100-0014", "Japan"] },
  { country: "Kenya - Nairobi", lines: ["Coantum HiTech", "Upper Hill Road, 7th Floor", "Nairobi 00100", "Kenya"] },
  { country: "Malaysia - Kuala Lumpur", lines: ["Coantum HiTech", "Level 10, Kuala Lumpur Tower", "Kuala Lumpur 50250", "Malaysia"] },
  { country: "Mexico - Mexico City", lines: ["Coantum HiTech", "Paseo de la Reforma 265", "Ciudad de México 06500", "Mexico"] },
  { country: "Morocco - Rabat", lines: ["Coantum HiTech", "Avenue Mohammed V, Quartier des Ministères", "Rabat 10000", "Morocco"] },
  { country: "Netherlands - Amsterdam", lines: ["Coantum HiTech", "De Ruijterkade 128", "1011 AC Amsterdam", "Netherlands"] },
  { country: "Nigeria - Abuja", lines: ["Coantum HiTech", "7 Port Harcourt Crescent, Off Gimbiya Street", "Abuja 900211", "Nigeria"] },
  { country: "Pakistan - Islamabad", lines: ["Coantum HiTech", "Sector F-7, Blue Area", "Islamabad 44000", "Pakistan"] },
  { country: "Philippines - Manila", lines: ["Coantum HiTech", "Makati Avenue, 32nd Floor", "Manila 1200", "Philippines"] },
  { country: "Poland - Warsaw", lines: ["Coantum HiTech", "ul. Emilii Plater 28", "00-688 Warszawa", "Poland"] },
  { country: "Russia - Moscow", lines: ["Coantum HiTech", "Krasnopresnenskaya Naberezhnaya, 12", "Moscow 123100", "Russia"] },
  { country: "Saudi Arabia - Riyadh", lines: ["Coantum HiTech", "King Fahd Road, Al Olaya District", "Riyadh 12213", "Saudi Arabia"] },
  { country: "Singapore - Singapore", lines: ["Coantum HiTech", "1 Raffles Place, #50-01", "Singapore 048616", "Singapore"] },
  { country: "South Africa - Pretoria", lines: ["Coantum HiTech", "Church Square, Central Business District", "Pretoria 0002", "South Africa"] },
  { country: "South Korea - Seoul", lines: ["Coantum HiTech", "132 Teheran-ro, Gangnam-gu", "Seoul 06132", "South Korea"] },
  { country: "Spain - Madrid", lines: ["Coantum HiTech", "Paseo de la Castellana 140", "28046 Madrid", "Spain"] },
  { country: "Sweden - Stockholm", lines: ["Coantum HiTech", "Master Samuelsgatan 70", "111 21 Stockholm", "Sweden"] },
  { country: "Thailand - Bangkok", lines: ["Coantum HiTech", "1 Siam Square Soi 3, Pathum Wan", "Bangkok 10330", "Thailand"] },
  { country: "Turkey - Ankara", lines: ["Coantum HiTech", "İskitler Cad. No:19", "Ankara 06070", "Turkey"] },
  { country: "Ukraine - Kyiv", lines: ["Coantum HiTech", "Khreshchatyk Street 15", "Kyiv 01001", "Ukraine"] },
  { country: "United Arab Emirates - Abu Dhabi", lines: ["Coantum HiTech", "Al Maryah Island, Sowwah Square", "Abu Dhabi", "United Arab Emirates"] },
  { country: "United Kingdom - London", lines: ["Coantum HiTech", "41 Business Street", "London SW1A 1AA", "United Kingdom"] },
  { country: "United States - Washington, D.C.", lines: ["Coantum HiTech", "1600 Pennsylvania Avenue NW", "Washington, D.C. 20001", "United States"] },
  { country: "Vietnam - Hanoi", lines: ["Coantum HiTech", "1 Lieu Giai Street, Ba Dinh District", "Hanoi 100000", "Vietnam"] },
];


export default function ContactPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          {t('contact.title')}
        </h1>
        <p className="max-w-xl mx-auto text-lg text-muted-foreground mt-4">
          {t('contact.description')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail /> {t('contact.email_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('contact.email_description')}</p>
            <a href="mailto:hello@yourcompany.com" className="text-primary font-bold mt-2 block">hello@yourcompany.com</a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Phone /> {t('contact.phone_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('contact.phone_description')}</p>
            <p className="font-bold mt-2">+1 (555) 123-4567</p>
            <p className="text-xs text-muted-foreground mt-1">{t('contact.phone_hours')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('contact.social_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('contact.social_description')}</p>
            <div className="flex gap-4 mt-2">
              <Link href="#" aria-label="Facebook"><Facebook className="h-6 w-6 text-primary hover:text-accent"/></Link>
              <Link href="#" aria-label="Twitter"><Twitter className="h-6 w-6 text-primary hover:text-accent"/></Link>
              <Link href="#" aria-label="Instagram"><Instagram className="h-6 w-6 text-primary hover:text-accent"/></Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="max-w-6xl mx-auto mt-8">
        <Card className="bg-secondary/30">
          <CardHeader>
              <CardTitle>{t('contact.faq_title')}</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">
                  {t('contact.faq_description_1')} <Link href="/faq" className="text-primary font-bold underline">{t('contact.faq_link')}</Link> – {t('contact.faq_description_2')}
              </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-12" />

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold font-headline">{t('contact.offices_title')}</h2>
        <p className="text-muted-foreground mt-2">{t('contact.offices_description')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {addresses.map((office, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary"/>{office.country}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex-grow">
              {office.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

    
