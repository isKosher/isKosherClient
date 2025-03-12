"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { MapPin, Share2, Star, Phone, ChevronRight, Calendar, Heart, Award, Clock, Navigation } from "lucide-react";
import { BusinessDetailsResponse } from "@/types";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SquareGallery from "@/components/squareGallery";

// Food Item Card Component
const FoodItemCard = ({ name }: { name: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
  >
    <div className="h-32 relative bg-gradient-to-tr from-blue-50 to-sky-100 flex items-center justify-center p-4">
      <span className="text-lg font-bold text-[#1A365D] text-center">{name}</span>
    </div>
  </motion.div>
);

// Rating Component
const Rating = ({ rating }: { rating: number | null }) => {
  // Default to 0 if rating is null
  const displayRating = rating || 0;

  return (
    <div className="flex flex-row-reverse items-center gap-1 rtl">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={18} className={i < displayRating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
      ))}
    </div>
  );
};

// Kosher Certificate Card
const KosherCertCard = ({
  type,
  supervisor,
  certificate,
}: {
  type: { name: string; kosher_icon_url: string | null };
  supervisor: { name: string; authority: string; contact_info: string };
  certificate: { expiration_date: string; certificate?: string | null };
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl overflow-hidden shadow-xl border border-blue-50 mb-6"
  >
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {type.kosher_icon_url && (
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-blue-50 p-1">
              <Image src={type.kosher_icon_url} alt="תעודת כשרות" width={64} height={64} className="object-contain" />
            </div>
          )}
          {!type.kosher_icon_url && (
            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Award size={32} className="text-[#1A365D]" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-[#1A365D]">{type.name}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
              <Calendar size={14} /> תוקף: {certificate.expiration_date}
            </p>
          </div>
        </div>
        <Badge className="bg-green-50 text-green-600 border border-green-100 hover:bg-green-100">בתוקף</Badge>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-500 mb-2">פרטי המשגיח</h4>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-blue-100 text-[#1A365D]">
            <AvatarFallback>{supervisor.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{supervisor.name}</p>
            <p className="text-sm text-gray-500">{supervisor.authority}</p>
          </div>
          <Button variant="ghost" size="icon" className="mr-auto text-[#1A365D]">
            <Phone size={18} />
          </Button>
        </div>
      </div>

      {/* Certificate Viewer Button */}
      {certificate.certificate && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-[#1A365D] hover:bg-[#0F2542] flex items-center justify-center gap-2">
                <span>צפה בתעודת הכשרות</span>
                <ChevronRight size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="relative w-full h-auto overflow-hidden rounded-lg">
                <Image
                  src={certificate.certificate}
                  alt="תעודת כשרות"
                  width={800}
                  height={1000}
                  className="object-contain w-full"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  </motion.div>
);

export function BusinessDetails({
  restaurant,
  coordinates,
}: {
  restaurant: BusinessDetailsResponse;
  coordinates: LatLngExpression;
}) {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map"), {
        loading: () => (
          <div className="h-[300px] bg-blue-50 animate-pulse rounded-2xl flex items-center justify-center">
            <p className="text-[#1A365D]">...טוען מפה</p>
          </div>
        ),
        ssr: false,
      }),
    []
  );

  // Format gallery images
  const galleryImages =
    restaurant.business_photos.length > 0 && restaurant.business_photos[0].url
      ? restaurant.business_photos.map((photo) => ({ src: photo.url || "", alt: photo.photo_info || "תמונת מסעדה" }))
      : [
          {
            src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2274&auto=format&fit=crop",
            alt: "תמונת מסעדה",
          },
          {
            src: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2274&auto=format&fit=crop",
            alt: "תמונת מסעדה",
          },
          {
            src: "https://images.unsplash.com/photo-1567966563694-e8b474ccf7ac?q=80&w=2274&auto=format&fit=crop",
            alt: "תמונת מסעדה",
          },
          {
            src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop",
            alt: "תמונת מסעדה",
          },
        ];

  const shareOnWhatsApp = () => {
    const text = `בדקו את ${restaurant.business_name} - ${restaurant.business_details}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const openNavigation = (app: "waze" | "google") => {
    const address = `${restaurant.location.address} ${restaurant.location.street_number}, ${restaurant.location.city}`;
    const encodedAddress = encodeURIComponent(address);

    // Get coordinates
    const lat = Array.isArray(coordinates) ? coordinates[0] : coordinates.lat;
    const lng = Array.isArray(coordinates) ? coordinates[1] : coordinates.lng;

    let url = "";
    if (app === "waze") {
      url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&destination_place_id=${
        restaurant.business_id || ""
      }`;
    }

    window.open(url, "_blank");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-heebo">
      {/* Sticky Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#1A365D]">{restaurant.business_name}</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-[#1A365D] hover:bg-blue-50">
              <Heart size={20} />
            </Button>
            <Button onClick={shareOnWhatsApp} className="bg-[#25D366] hover:bg-[#20BD5C] text-white">
              <span className="hidden md:inline">שתף ב-</span>WhatsApp
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Kosher Info */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-24">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-bold text-[#1A365D] mb-4">תעודות כשרות</h2>

                {restaurant.kosher_types.map((type, idx) => (
                  <KosherCertCard
                    key={idx}
                    type={type}
                    supervisor={
                      restaurant.kosher_supervisors[idx % restaurant.kosher_supervisors.length] || {
                        name: "לא צוין",
                        authority: "לא צוין",
                        contact_info: "לא צוין",
                      }
                    }
                    certificate={{
                      expiration_date:
                        restaurant.kosher_certificates[idx % restaurant.kosher_certificates.length]?.expiration_date ||
                        "לא צוין",
                      certificate:
                        restaurant.kosher_certificates[idx % restaurant.kosher_certificates.length]?.certificate ||
                        null,
                    }}
                  />
                ))}

                <Card className="rounded-2xl shadow-md overflow-hidden mt-6">
                  <CardContent className="p-0">
                    <div className="h-[300px] relative">
                      <Map position={coordinates} zoom={15} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-[#1A365D] mb-2">כתובת</h3>
                      <p className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin size={16} />
                        {restaurant.location.address} {restaurant.location.street_number}, {restaurant.location.city}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => openNavigation("waze")}
                          className="flex-1 bg-[#33CCFF] hover:bg-[#2CB8E6] text-white"
                        >
                          <Navigation size={16} className="mr-1" />
                          Waze
                        </Button>
                        <Button
                          onClick={() => openNavigation("google")}
                          className="flex-1 bg-[#4285F4] hover:bg-[#3B77DB] text-white"
                        >
                          <MapPin size={16} className="mr-1" />
                          Google Maps
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Header Info */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-[#1A365D] text-white">{restaurant.business_type}</Badge>
                      {restaurant.food_types.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="border-[#1A365D] text-[#1A365D]">
                          {type}
                        </Badge>
                      ))}
                    </div>

                    <h1 className="text-3xl font-bold text-[#1A365D] mb-2">{restaurant.business_name}</h1>

                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      {restaurant.business_rating && (
                        <div className="flex items-center gap-1">
                          <Rating rating={restaurant.business_rating} />
                          <span className="text-sm font-medium">{restaurant.business_rating}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Award size={16} />
                        <span className="text-sm">כשר למהדרין</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span className="text-sm">פתוח עכשיו</span>
                      </div>
                    </div>

                    <p className="text-gray-600">{restaurant.business_details}</p>
                  </div>
                </div>
              </div>

              {/* Gallery Section - Using SquareGallery Component */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-[#1A365D] mb-4">תמונות מהמסעדה</h3>
                <SquareGallery images={galleryImages} />
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="menu" className="bg-white rounded-2xl shadow-md overflow-hidden">
                <TabsList className="w-full border-b border-gray-100 p-0 h-auto rounded-none bg-transparent">
                  <TabsTrigger
                    value="menu"
                    className="flex-1 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1A365D] data-[state=active]:shadow-none"
                  >
                    מה יש לאכול
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="flex-1 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1A365D] data-[state=active]:shadow-none"
                  >
                    ביקורות
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="menu" className="pt-6 px-6 pb-8 focus-visible:outline-none">
                  <h3 className="text-xl font-bold text-[#1A365D] mb-6">מה יש לאכול</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {restaurant.food_item_types.map((item, idx) => (
                      <FoodItemCard key={idx} name={item} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-6 focus-visible:outline-none">
                  <h3 className="text-xl font-bold text-[#1A365D] mb-6">ביקורות</h3>
                  <div className="space-y-6">
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <p className="text-[#1A365D]">היה לכם ניסיון במסעדה? שתפו את הביקורת שלכם</p>
                      <Button className="mt-2 bg-[#1A365D] hover:bg-[#0F2542]">כתבו ביקורת</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Recommendations Section */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#1A365D]">מסעדות כשרות נוספות באזור</h3>
                  <Button variant="ghost" className="text-[#1A365D]">
                    הצג הכל <ChevronRight size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((_, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -5 }}
                      className="bg-blue-50 rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer"
                    >
                      <div className="h-16 w-16 relative rounded-lg overflow-hidden">
                        <Image
                          src={`https://images.unsplash.com/photo-15548523${
                            7000 + idx
                          }0-a8ab842aef2?q=80&w=1770&auto=format&fit=crop`}
                          alt="מסעדה מומלצת"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1A365D]">מסעדה כשרה {idx + 1}</h4>
                        <p className="text-sm text-gray-600">500 מ׳ ממיקומך</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
