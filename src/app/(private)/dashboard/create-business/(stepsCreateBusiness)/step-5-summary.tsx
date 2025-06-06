"use client";

import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, MapPin, UtensilsCrossed, Star, Calendar, ScrollText, User } from "lucide-react";
import { FormData } from "@/lib/schemaCreateBusiness";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
//TODO: show like of certifcate
export function Step5Summary() {
  const { watch } = useFormContext<FormData>();
  const formData = watch();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#1A365D] text-center mb-8">סיכום פרטי העסק</h2>
      <motion.div
        className="mt-8 p-4 bg-sky-50 rounded-lg text-[#1A365D] text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm">אנא בדוק את כל הפרטים לפני השליחה.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Details Card */}
        <motion.div {...fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">פרטי העסק</CardTitle>
              <Building2 className="h-5 w-5 text-[#1A365D]" />
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Building2 className="h-4 w-4 text-sky-500" />
                <span className="font-medium">{formData.business_name}</span>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <Phone className="h-4 w-4 text-sky-500" />
                <span>{formData.business_phone}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600 border-t pt-2">{formData.business_details}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Location Card */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">מיקום</CardTitle>
              <MapPin className="h-5 w-5 text-[#1A365D]" />
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <MapPin className="h-4 w-4 text-sky-500" />
                <span>
                  {formData.location.address} {formData.location.street_number}, {formData.location.city}
                </span>
              </div>
              {formData.location.region && (
                <div className="flex items-center space-x-4 space-x-reverse">
                  <MapPin className="h-4 w-4 text-sky-500 opacity-50" />
                  <span className="text-gray-600">{formData.location.region}</span>
                </div>
              )}
              {formData.location.location_details && (
                <div className="mt-2 text-sm text-gray-600 border-t pt-2">{formData.location.location_details}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Food and Kosher Card */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">אוכל וכשרות</CardTitle>
              <UtensilsCrossed className="h-5 w-5 text-[#1A365D]" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <div className="text-sm font-medium mb-2">סוג העסק</div>
                <Badge variant="secondary">{formData.business_type.name}</Badge>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">סוגי כשרות</div>
                <div className="flex flex-wrap gap-2">
                  {formData.kosher_types.map((type) => (
                    <Badge key={type.id} variant="outline" className="bg-sky-50">
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">סוגי אוכל</div>
                <div className="flex flex-wrap gap-2">
                  {formData.food_types.map((type) => (
                    <Badge key={type.id} variant="outline" className="bg-sky-50">
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">פריטי מזון</div>
                <div className="flex flex-wrap gap-2">
                  {formData.food_items.map((item) => (
                    <Badge key={item.id} variant="outline" className="bg-sky-50">
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Supervision Card */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">פיקוח וכשרות</CardTitle>
              <ScrollText className="h-5 w-5 text-[#1A365D]" />
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <User className="h-4 w-4 text-sky-500" />
                <span className="font-medium">{formData.supervisor.name}</span>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <Star className="h-4 w-4 text-sky-500" />
                <span>{formData.supervisor.authority}</span>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <Calendar className="h-4 w-4 text-sky-500" />
                {formData.kosher_certificate.expiration_date ? (
                  <span>תוקף תעודה: {format(new Date(formData.kosher_certificate.expiration_date), "dd/MM/yyyy")}</span>
                ) : (
                  <span className="text-gray-500">תוקף תעודה לא צוין</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
