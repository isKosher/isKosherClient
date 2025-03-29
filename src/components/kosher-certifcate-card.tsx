"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { KosherCertificate, KosherType } from "@/types";

type KosherCertificatesCardProps = {
  certificates: KosherCertificate[];
  kosher_types: KosherType[];
};

const KosherCertificatesCard: React.FC<KosherCertificatesCardProps> = ({ certificates, kosher_types }) => {
  const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0);
  const currentCert = certificates[currentCertificateIndex];
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const currentDate = new Date();
    const expirationDateObj = new Date(currentCert.expiration_date || "");
    if (expirationDateObj < currentDate) {
      setIsExpired(true);
    } else {
      setIsExpired(false);
    }
  }, [currentCertificateIndex, currentCert.expiration_date]);

  // Navigation handlers
  const handleNextCertificate = () => {
    setCurrentCertificateIndex((prev) => (prev + 1) % Math.max(1, certificates.length));
  };

  const handlePrevCertificate = () => {
    setCurrentCertificateIndex((prev) => (prev > 0 ? prev - 1 : certificates.length - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-xl border border-blue-50 mb-6"
    >
      <div className="p-6 space-y-4">
        {/* Certificate Section */}
        <div className="pt-3">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">כשרויות</h4>
          <div className="flex justify-start gap-2 my-1">
            {kosher_types.map((type, idx) => (
              <div
                className="relative h-16 w-22 rounded-md border border-gray-300 flex items-center justify-center p-0.5"
                key={idx}
              >
                {type.kosher_icon_url ? (
                  <Image
                    src={type.kosher_icon_url}
                    alt="סוג השגחה"
                    width={64}
                    height={64}
                    className="object-contain h-full w-full"
                  />
                ) : (
                  <span className="text-sm text-gray-700 font-medium">{type.name}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-500 mb-2">תעודת כשרות</h4>
            {certificates.length > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handlePrevCertificate}>
                  <ChevronRight size={18} />
                </Button>
                <span className="text-xs text-gray-500">
                  {currentCertificateIndex + 1} / {certificates.length}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNextCertificate}>
                  <ChevronLeft size={18} />
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                {/* TODO: Add name to certifcate */}
                <h3 className="text-xl font-bold text-[#1A365D]">{/*currentCert.name || "N/A"*/}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                  <Calendar size={14} /> תוקף: {currentCert.expiration_date || "N/A"}
                </p>
              </div>
            </div>
            {currentCert.expiration_date && (
              <Badge
                className={
                  isExpired
                    ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                    : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
                }
              >
                {isExpired ? "פג תוקף" : "בתוקף"}
              </Badge>
            )}
          </div>
        </div>

        {/* Certificate Viewer */}
        {currentCert.certificate && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#1A365D] hover:bg-[#0F2542] flex items-center justify-center gap-2">
                  <span>צפה בתעודת הכשרות</span>
                  <ChevronLeft size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogTitle className="text-center">תעודת כשרות</DialogTitle>
                <div className="relative w-full h-auto overflow-hidden rounded-lg">
                  <Image
                    src={currentCert.certificate}
                    alt="תעודת כשרות"
                    width={400}
                    height={600}
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
};

export default KosherCertificatesCard;
