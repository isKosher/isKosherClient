import React, { useState } from "react";
import { Building, Edit, ImageIcon, Info, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import KosherSupervisorsList from "@/components/kosher-supervisors-list";
import KosherCertificatesList from "@/components/kosher-certificates-list";
import type { UserOwnedBusinessResponse } from "@/types";
import type { EditSection, TabValue } from "@/constants/dashboard";
import { DASHBOARD_CONSTANTS } from "@/constants/dashboard";

interface BusinessDetailsProps {
  selectedBusiness: UserOwnedBusinessResponse | null;
  onEdit: (business: UserOwnedBusinessResponse, section: EditSection) => void;
}

const EmptyBusinessState = React.memo(() => (
  <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded-lg p-6 text-center">
    <Building className={`h-12 w-12 ${DASHBOARD_CONSTANTS.COLORS.PRIMARY} opacity-30 mb-4`} />
    <h3 className={`text-lg font-medium ${DASHBOARD_CONSTANTS.COLORS.PRIMARY}`}>בחר עסק לצפייה</h3>
    <p className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} mt-1`}>לחץ על אחד העסקים מהרשימה כדי לצפות בפרטים ולערוך</p>
  </div>
));

EmptyBusinessState.displayName = "EmptyBusinessState";

export const BusinessDetails = React.memo<BusinessDetailsProps>(({ selectedBusiness, onEdit }) => {
  const [activeTab, setActiveTab] = useState<TabValue>(DASHBOARD_CONSTANTS.TABS.OVERVIEW);

  if (!selectedBusiness) {
    return <EmptyBusinessState />;
  }

  const handleEdit = (section: EditSection) => {
    onEdit(selectedBusiness, section);
  };

  return (
    <div className="w-full lg:w-2/3">
      <Card className="border-gray-300">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={`text-2xl ${DASHBOARD_CONSTANTS.COLORS.PRIMARY}`}>
              {selectedBusiness.business_name}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`${DASHBOARD_CONSTANTS.COLORS.PRIMARY} border-sky-200`}
                onClick={() => handleEdit(DASHBOARD_CONSTANTS.EDIT_SECTIONS.DETAILS)}
              >
                <Edit className="h-4 w-4 ml-1" /> ערוך עסק
              </Button>
            </div>
          </div>
          <CardDescription className={DASHBOARD_CONSTANTS.COLORS.SECONDARY}>
            {selectedBusiness.business_details}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs dir="rtl" value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value={DASHBOARD_CONSTANTS.TABS.OVERVIEW}>סקירה</TabsTrigger>
              <TabsTrigger value={DASHBOARD_CONSTANTS.TABS.KOSHER}>כשרות</TabsTrigger>
              <TabsTrigger value={DASHBOARD_CONSTANTS.TABS.SUPERVISORS}>משגיחים</TabsTrigger>
              <TabsTrigger value={DASHBOARD_CONSTANTS.TABS.CERTIFICATES}>תעודות</TabsTrigger>
              <TabsTrigger value={DASHBOARD_CONSTANTS.TABS.PHOTOS}>תמונות</TabsTrigger>
            </TabsList>

            <TabsContent dir="rtl" value={DASHBOARD_CONSTANTS.TABS.OVERVIEW} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {" "}
                <Card dir="rtl">
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-md flex items-center ${DASHBOARD_CONSTANTS.COLORS.PRIMARY}`}>
                      <Info className="h-4 w-4 ml-2" /> פרטי עסק
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2 text-right" dir="rtl">
                      <div className="flex items-center gap-1">
                        <dt className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} font-medium`}>סוג עסק:</dt>
                        <dd className={DASHBOARD_CONSTANTS.COLORS.SECONDARY}>{selectedBusiness.business_type}</dd>
                      </div>
                      <div className="flex items-center gap-1">
                        <dt className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} font-medium`}>טלפון:</dt>
                        <dd className={DASHBOARD_CONSTANTS.COLORS.SECONDARY}>{selectedBusiness.business_number}</dd>
                      </div>
                      {selectedBusiness.business_rating !== 0 && (
                        <div className="flex items-center gap-1">
                          <dt className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} font-medium`}>דירוג:</dt>
                          <dd className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} flex items-center`}>
                            {selectedBusiness.business_rating}
                            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                          </dd>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <dt className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} font-medium`}>כתובת:</dt>
                        <dd className={DASHBOARD_CONSTANTS.COLORS.SECONDARY}>
                          {selectedBusiness.location.address} {selectedBusiness.location.street_number},{" "}
                          {selectedBusiness.location.city}
                        </dd>
                      </div>
                      {selectedBusiness.location.region && (
                        <div className="flex items-center gap-1">
                          <dt className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} font-medium`}>אזור:</dt>
                          <dd className={DASHBOARD_CONSTANTS.COLORS.SECONDARY}>{selectedBusiness.location.region}</dd>
                        </div>
                      )}
                      {selectedBusiness.location.location_details && (
                        <div className="flex flex-col gap-1">
                          <dt className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} font-medium`}>פרטי מיקום:</dt>
                          <dd className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} text-sm`}>
                            {selectedBusiness.location.location_details}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`mt-2 ${DASHBOARD_CONSTANTS.COLORS.PRIMARY}`}
                      onClick={() => handleEdit(DASHBOARD_CONSTANTS.EDIT_SECTIONS.DETAILS)}
                    >
                      <Edit className="h-3.5 w-3.5 ml-1" /> ערוך
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-md flex items-center text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}>
                      <Star className="h-4 w-4 ml-2" /> כשרות
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {selectedBusiness.kosher_types.map((type) => (
                          <Badge key={type.id} variant="outline" className={DASHBOARD_CONSTANTS.STYLES.BADGE_PRIMARY}>
                            {type.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2">
                        <span className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} font-medium`}>סוגי מזון:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedBusiness.food_types.map((type, index) => (
                            <Badge key={index} variant="outline" className={DASHBOARD_CONSTANTS.STYLES.BADGE_PRIMARY}>
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} font-medium`}>פריטי מזון:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedBusiness.food_item_types.map((item, index) => (
                            <Badge key={index} variant="outline" className={DASHBOARD_CONSTANTS.STYLES.BADGE_PRIMARY}>
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`mt-2 ${DASHBOARD_CONSTANTS.COLORS.PRIMARY}`}
                      onClick={() => handleEdit(DASHBOARD_CONSTANTS.EDIT_SECTIONS.KOSHER)}
                    >
                      <Edit className="h-3.5 w-3.5 ml-1" /> ערוך
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-md flex items-center text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}>
                    <ImageIcon className="h-4 w-4 ml-2" /> תמונות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {selectedBusiness.business_photos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden">
                        <img
                          src={photo.url || "/placeholder.svg"}
                          alt={photo.photo_info || "תמונת עסק"}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`mt-3 text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}
                    onClick={() => handleEdit(DASHBOARD_CONSTANTS.EDIT_SECTIONS.PHOTOS)}
                  >
                    <Edit className="h-3.5 w-3.5 ml-1" /> ערוך
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value={DASHBOARD_CONSTANTS.TABS.KOSHER}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className={`text-xl text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}>
                      תעודות כשרות
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}] border-sky-200`}
                      onClick={() => handleEdit(DASHBOARD_CONSTANTS.EDIT_SECTIONS.KOSHER)}
                    >
                      <Edit className="h-4 w-4 ml-1" /> ערוך
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className={`font-medium text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}] mb-2`}>סוגי כשרות</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedBusiness.kosher_types.map((type) => (
                          <div
                            key={type.id}
                            className="flex items-center p-2 border border-sky-200 rounded-md bg-sky-50"
                          >
                            {type.kosher_icon_url && (
                              <img
                                src={type.kosher_icon_url || "/placeholder.svg"}
                                alt={type.name}
                                className="w-8 h-8 object-contain ml-2"
                              />
                            )}
                            <span className={`text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}>{type.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className={`font-medium ${DASHBOARD_CONSTANTS.COLORS.PRIMARY} mb-2`}>סוגי מזון</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedBusiness.food_types.map((type, index) => (
                          <Badge key={index} variant="outline" className={DASHBOARD_CONSTANTS.STYLES.BADGE_PRIMARY}>
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className={`font-medium ${DASHBOARD_CONSTANTS.COLORS.PRIMARY} mb-2`}>פריטי מזון</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedBusiness.food_item_types.map((item, index) => (
                          <Badge key={index} variant="outline" className={DASHBOARD_CONSTANTS.STYLES.BADGE_PRIMARY}>
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value={DASHBOARD_CONSTANTS.TABS.SUPERVISORS}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className={`text-xl text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}>
                      משגיחי כשרות
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}] border-sky-200`}
                      onClick={() => handleEdit(DASHBOARD_CONSTANTS.EDIT_SECTIONS.SUPERVISORS)}
                    >
                      <Edit className="h-4 w-4 ml-1" /> ערוך
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <KosherSupervisorsList supervisors={selectedBusiness.supervisors} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value={DASHBOARD_CONSTANTS.TABS.CERTIFICATES}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className={`text-xl text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}>תעודות</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}] border-sky-200`}
                      onClick={() => handleEdit(DASHBOARD_CONSTANTS.EDIT_SECTIONS.CERTIFICATES)}
                    >
                      <Edit className="h-4 w-4 ml-1" /> ערוך
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <KosherCertificatesList certificates={selectedBusiness.certificates} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value={DASHBOARD_CONSTANTS.TABS.PHOTOS}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className={`text-xl text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}>
                      תמונות העסק
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}] border-sky-200`}
                      onClick={() => handleEdit(DASHBOARD_CONSTANTS.EDIT_SECTIONS.PHOTOS)}
                    >
                      <Edit className="h-4 w-4 ml-1" /> ערוך
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedBusiness.business_photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden">
                          <img
                            src={photo.url || "/placeholder.svg"}
                            alt={photo.photo_info || "תמונת עסק"}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        {photo.photo_info && (
                          <div className={`mt-1 text-sm text-[${DASHBOARD_CONSTANTS.COLORS.SECONDARY}]`}>
                            {photo.photo_info}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});

BusinessDetails.displayName = "BusinessDetails";
