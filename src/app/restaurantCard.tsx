import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, MapPin, Star } from "lucide-react";
interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    type: string;
    certification: string;
    address: string;
    halavi: boolean;
    bessari: boolean;
    parve: boolean;
    image: string;
  };
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const router = useRouter();

  return (
    <Card
      className="hover:shadow-lg transition-shadow rounded-lg cursor-pointer"
      onClick={() => router.push(`/business/${restaurant.id}`)}
    >
      {/* <Image
        src={props.restaurant.image}
        alt={props.restaurant.name}
        width={400}
        height={200}
        className="w-full h-48 object-cover rounded-t-lg" // Apply rounded class here
      /> */}
      <CardHeader>
        <div className="flex justify-between items-start flex-row-reverse">
          <div>
            <CardTitle className="text-xl">{restaurant.name}</CardTitle>
            <CardDescription dir="rtl">{restaurant.type}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {restaurant.halavi && (
              <Badge
                variant="outline"
                className="text-xs text-blue-600 border-blue-600"
              >
                חלבי
              </Badge>
            )}
            {restaurant.bessari && (
              <Badge
                variant="outline"
                className="text-xs text-red-600 border-red-600"
              >
                בשרי
              </Badge>
            )}
            {restaurant.parve && (
              <Badge
                variant="outline"
                className="text-xs text-green-600 border-green-600"
              >
                פרווה
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center flex-row-reverse">
          <div className="flex items-center gap-2 text-gray-600 mb-2 flex-row-reverse">
            <MapPin className="h-4 w-4" />
            <span className="text-sm text-end">{restaurant.address}</span>
          </div>
          <Badge
            className="text-sm flex justify-between align-center"
            variant="outline"
          >
            <Image
              src={
                "https://rest.jdn.co.il/wp-content/uploads/2022/09/Untitled-18-06.png"
              }
              alt="kosher beit yossef"
              width={40}
              height={40}
              className="mr-2"
            />
            {restaurant.certification}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
