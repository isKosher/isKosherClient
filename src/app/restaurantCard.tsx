import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
type RestaurantCardProps = {
  restaurant: {
    name: string;
    type: string;
    rating: number;
    certification: string;
    address: string;
    isOpen: boolean;
    image: string;
  };
};

export default function RestaurantCard(props: RestaurantCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow rounded-lg">
      <Image
        src={props.restaurant.image}
        alt={props.restaurant.name}
        width={400}
        height={200}
        className="w-full h-48 object-cover rounded-t-lg" // Apply rounded class here
      />
      <CardHeader>
        <div className="flex justify-between items-start flex-row-reverse">
          <div>
            <CardTitle className="text-xl">{props.restaurant.name}</CardTitle>
            <CardDescription dir="rtl">{props.restaurant.type}</CardDescription>
          </div>
          <Badge variant={props.restaurant.isOpen ? "default" : "secondary"}>
            {props.restaurant.isOpen ? "פתוח" : "סגור"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-gray-600 mb-2 flex-row-reverse">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{props.restaurant.address}</span>
        </div>
        <div className="flex justify-between items-center flex-row-reverse">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {props.restaurant.rating}
            </span>
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
            {props.restaurant.certification}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
