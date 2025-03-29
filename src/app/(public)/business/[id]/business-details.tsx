"use client";

import React, { useMemo } from "react";
import { SiGooglemaps, SiWaze, SiWhatsapp } from "react-icons/si";
import { MapPin, Star, Info, ChevronLeft } from "lucide-react";
import { BusinessDetailsResponse, GalleryImage } from "@/types";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SquareGallery from "@/components/squareGallery";
import KosherSupervisorsCard from "@/components/kosher-supervisor-card";
import KosherCertificatesCard from "@/components/kosher-certifcate-card";
import NearbyBusinesses from "@/components/get-nearby-businesses";

type BusinessDetailsProps = {
  business: BusinessDetailsResponse;
  coordinates: LatLngExpression;
};
const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business, coordinates }) => {
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

  const galleryImages: GalleryImage[] =
    business.business_photos.length > 0 && business.business_photos[0].url
      ? business.business_photos.map((photo) => ({ src: photo.url || "", alt: photo.photo_info || "תמונת מסעדה" }))
      : [
          {
            src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2274&auto=format&fit=crop",
            alt: "תמונת מסעדה",
          },
          {
            src: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2274&auto=format&fit=crop",
            alt: "תמונת מסעדה",
          },
        ];

  const shareOnWhatsApp = () => {
    const text = window.location.href;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const openNavigation = (app: "waze" | "google") => {
    // Get coordinates
    const lat = Array.isArray(coordinates) ? coordinates[0] : coordinates.lat;
    const lng = Array.isArray(coordinates) ? coordinates[1] : coordinates.lng;

    let url = "";
    if (app === "waze") {
      url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    window.open(url, "_blank");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-heebo mt-12">
      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Kosher Info */}
          <div className="order-2 lg:order-2">
            <div className="sticky top-24">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-normal text-red-500 text-center flex-1">
                    (יש לבדוק כי תעודת הכשרות בעסק מתאימה לזו שנמצאת באתר)
                  </p>
                </div>

                <KosherCertificatesCard
                  certificates={business.kosher_certificates}
                  kosher_types={business.kosher_types}
                />
                <KosherSupervisorsCard supervisors={business.kosher_supervisors} />

                <Card className="rounded-2xl shadow-md overflow-hidden mt-6">
                  <CardContent className="p-0">
                    <div className="h-full w-full">
                      <Map position={coordinates} zoom={14} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-[#1A365D] mb-2">כתובת</h3>
                      <p className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin size={16} />
                        {business.location.address} {business.location.street_number}, {business.location.city}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => openNavigation("waze")}
                          className="flex-1 bg-[#33CCFF] hover:bg-[#2CB8E6] text-white"
                        >
                          <SiWaze size={16} className="mr-1" />
                          Waze
                        </Button>
                        <Button
                          onClick={() => openNavigation("google")}
                          className="flex-1 bg-[#4285F4] hover:bg-[#3B77DB] text-white"
                        >
                          <SiGooglemaps size={16} className="mr-1" />
                          Google Maps
                        </Button>
                        <Button
                          onClick={() => shareOnWhatsApp()}
                          className="flex-1 bg-[#25D366] hover:bg-[#1DA955] text-white"
                        >
                          <SiWhatsapp size={16} className="mr-1" />
                          שתף
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="order-1 lg:order-1 lg:col-span-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Header Info */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-[#1A365D]">{business.business_name}</h1>

                    <div className="flex items-center gap-4 text-gray-600 my-4">
                      {business.business_rating && (
                        <div className="flex items-center gap-1">
                          <Rating rating={business.business_rating} />
                          <span className="text-sm font-medium">{business.business_rating}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Badge className="bg-[#1A365D] text-white px-4">{business.business_type}</Badge>
                        {business.food_types.map((type, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className={`hebrew-side mr-2 ${
                              type === "חלבי"
                                ? "border-blue-500 bg-blue-50"
                                : type === "בשרי"
                                ? "border-red-500 bg-red-50"
                                : "border-green-500 bg-green-50"
                            }`}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {business.business_details && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Info size={16} className="text-[#1A365D]" />
                        <p>{business.business_details}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs dir="rtl" defaultValue="menu" className="bg-white rounded-2xl shadow-md overflow-hidden">
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
                    {business.food_item_types.map((item, idx) => (
                      <FoodItemCard key={idx} name={item} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-6 focus-visible:outline-none">
                  <h3 className="text-xl font-bold text-[#1A365D] mb-6">ביקורות</h3>
                  {/* TODO: Add option to write a review */}
                  {/* <div className="space-y-6">
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <p className="text-[#1A365D]">היה לכם ניסיון במסעדה? שתפו את הביקורת שלכם</p>
                      <Button className="mt-2 bg-[#1A365D] hover:bg-[#0F2542]">כתבו ביקורת</Button>
                    </div>
                  </div> */}
                </TabsContent>
              </Tabs>

              {/* Gallery Section - Using SquareGallery Component */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-[#1A365D] mb-4">תמונות מהמסעדה</h3>
                <SquareGallery images={galleryImages} />
              </div>

              {/* Recommendations Section */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#1A365D]">מסעדות נוספות באזור</h3>
                  <Button variant="ghost" className="text-[#1A365D] gap-1">
                    הצג הכל <ChevronLeft size={16} />
                  </Button>
                </div>
                <NearbyBusinesses coordinates={coordinates} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BusinessDetails;

const FoodItemCard = ({ name }: { name: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
  >
    <div className="h-26 relative bg-gradient-to-tr from-blue-50 to-sky-100 flex items-center justify-center p-4">
      <span className="text-lg font-bold text-[#1A365D] text-center">{name}</span>
    </div>
  </motion.div>
);

const Rating = ({ rating }: { rating: number | null }) => {
  const displayRating = rating || 0;
  return (
    <div className="flex flex-row-reverse items-center gap-1 rtl">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={18} className={i < displayRating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
      ))}
    </div>
  );
};
