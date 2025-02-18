"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface GalleryImage {
  src: string;
  alt: string;
}

interface SquareGalleryProps {
  images: GalleryImage[];
}

export default function SquareGallery({ images }: SquareGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return <div>No images to display</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-0">
        <AspectRatio ratio={1}>
          <div className="relative w-full h-full">
            {/* Main image */}
            <div className="absolute inset-0 h-[calc(100%-20%)]">
              <Image
                src={images[currentIndex].src || "/placeholder.svg"}
                alt={images[currentIndex].alt}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </div>

            {/* Thumbnail row */}
            <div className="absolute bottom-0 left-0 right-0 h-[20%] grid grid-cols-4 gap-1 p-1 bg-background">
              {images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative w-full h-full overflow-hidden rounded",
                    index === currentIndex && "ring-2 ring-primary"
                  )}
                  onClick={() => setCurrentIndex(index)}
                >
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    layout="fill"
                    objectFit="cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </AspectRatio>
      </CardContent>
    </Card>
  );
}
