"use client";

import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";

type KosherCertificateViewerProps = {
  certificateUrl: string;
  title?: string;
  variant?: "button" | "link";
};

const KosherCertificateViewer = ({
  certificateUrl,
  title = "תעודת כשרות",
  variant = "button",
}: KosherCertificateViewerProps) => {
  const trigger =
    variant === "link" ? (
      <span className="text-[#1A365D] hover:text-sky-700 underline text-sm mt-1 inline-block cursor-pointer">
        צפה בתעודה
      </span>
    ) : (
      <Button className="w-full bg-[#1A365D] hover:bg-[#0F2542] flex items-center justify-center gap-2">
        <span>{title}</span>
        <ChevronLeft size={16} />
      </Button>
    );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-center">{title}</DialogTitle>
        <div className="relative w-full h-auto overflow-hidden rounded-lg">
          <Image src={certificateUrl} alt={title} width={400} height={600} className="object-contain w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KosherCertificateViewer;
