"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { KosherCertificate } from "@/types";
import KosherCertificateViewer from "./Kosher-certificate-viewer";

type KosherCertificatesListProps = {
  certificates: KosherCertificate[];
};

const KosherCertificatesList: React.FC<KosherCertificatesListProps> = ({ certificates }) => {
  const isExpired = (expirationDate: string | Date) => {
    const currentDate = new Date();
    const expDate = new Date(expirationDate);
    return expDate < currentDate;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {certificates.map((certificate) => {
        const expired = certificate.expiration_date ? isExpired(certificate.expiration_date) : true;

        return (
          <Card
            key={certificate.id}
            className="border border-blue-100 shadow-sm rounded-2xl hover:shadow-md transition"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-semibold text-[#1A365D]">תעודת כשרות</CardTitle>
                  <CardDescription className="text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar size={14} />
                    תוקף עד:{" "}
                    {certificate.expiration_date
                      ? new Date(certificate.expiration_date).toLocaleDateString("he-IL")
                      : "לא צוין תאריך"}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    expired
                      ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                      : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
                  }
                >
                  {expired ? "פג תוקף" : "בתוקף"}
                </Badge>
              </div>
            </CardHeader>

            {certificate.certificate && <KosherCertificateViewer certificateUrl={certificate.certificate} />}
          </Card>
        );
      })}
    </div>
  );
};

export default KosherCertificatesList;
