"use client";
import { useEffect, useState, useCallback } from "react";
import { Building, Edit, FileText, ImageIcon, Info, MapPin, MoreHorizontal, Plus, Star, Users } from "lucide-react";
import type { UserOwnedBusinessResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import KosherSupervisorsList from "@/components/kosher-supervisors-list";
import KosherCertificatesList from "@/components/kosher-certificates-list";
import { getMyBusinessAction } from "@/app/actions/dashboardAction";
import BusinessDetailsForm from "./(edit-business)/business-details-form";
import KosherTypesForm from "./(edit-business)/kosher-types-form";
import SupervisorsForm from "./(edit-business)/supervisors-form";
import CertificatesForm from "./(edit-business)/certificates-form";
import PhotosForm from "./(edit-business)/photos-form";
import ErrorPage from "@/components/ErrorPage";
import Link from "next/link";
import BusinessesAdminListSkeleton from "@/components/businesses-admin-list-skeleton";
import BusinessesAdminSearch from "@/components/businesses-admin-search";
import BusinessesAdminError from "@/components/businesses-admin-error";
import { toast } from "sonner";

export default function DashboardClient() {
  const [userBusinesses, setUserBusinesses] = useState<UserOwnedBusinessResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<UserOwnedBusinessResponse | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<string>("details");
  const [searchTerm, setSearchTerm] = useState("");

  const refreshBusinessData = useCallback(async () => {
    try {
      setIsLoading(true);
      const businesses = await getMyBusinessAction();
      setUserBusinesses(businesses);

      if (selectedBusiness) {
        const updatedBusiness = businesses.find((b) => b.business_id === selectedBusiness.business_id);
        if (updatedBusiness) {
          setSelectedBusiness(updatedBusiness);
        }
      }
      setError(null);
    } catch (err) {
      console.error("Failed to refresh business data:", err);
      setError("Failed to refresh your businesses. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedBusiness]);

  const handleDialogClose = (refreshData = false, message?: string) => {
    setEditDialogOpen(false);
    if (refreshData) {
      refreshBusinessData();
      if (message) {
        toast.success(message);
      }
    }
  };

  useEffect(() => {
    const updateUserBusinesses = async () => {
      try {
        setIsLoading(true);
        const businesses = await getMyBusinessAction();
        setUserBusinesses(businesses);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user businesses:", err);
        setError("Failed to load your businesses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    updateUserBusinesses();
  }, []);

  const handleEditSection = (business: UserOwnedBusinessResponse, section: string) => {
    setSelectedBusiness(business);
    setEditSection(section);
    setEditDialogOpen(true);
  };

  const handleBusinessSelect = (business: UserOwnedBusinessResponse) => {
    setSelectedBusiness(business);
    setActiveTab("overview");
  };

  const filteredBusinesses = userBusinesses.filter((business) =>
    business.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderNoBusinesses = () => {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-80">
        <ImageIcon className="w-10 h-10 text-sky-300 mb-3" />
        <div className="text-lg font-semibold text-[#1A365D] mb-1">לא נמצאו עסקים</div>
        <div className="text-[#2D4A6D] text-sm mb-3">נסה לשנות את מילות החיפוש או להוסיף עסק חדש</div>
        <Button asChild variant="outline" size="sm" className="text-[#1A365D] border-sky-200">
          <Link href="/dashboard/create-business">
            <Plus className="h-4 w-4 ml-1" /> הוסף עסק חדש
          </Link>
        </Button>
      </div>
    );
  };

  const renderEditForm = () => {
    if (!selectedBusiness) return null;

    switch (editSection) {
      case "details":
        return <BusinessDetailsForm business={selectedBusiness} onClose={handleDialogClose} />;
      case "kosher":
        return <KosherTypesForm business={selectedBusiness} onClose={handleDialogClose} />;
      case "supervisors":
        return <SupervisorsForm business={selectedBusiness} onClose={handleDialogClose} />;
      case "certificates":
        return <CertificatesForm business={selectedBusiness} onClose={handleDialogClose} />;
      case "photos":
        return <PhotosForm business={selectedBusiness} onClose={handleDialogClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="mx-auto px-4 py-8 md:py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-serif text-[#1A365D] font-bold mb-2">לוח הבקרה שלי</h2>
            <p className="text-[#2D4A6D] text-md lg:text-lg">נהל את העסקים שלך</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3">
              <div className="sticky top-4">
                <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
                  <h3 className="text-xl font-medium text-[#1A365D]">העסקים שלי</h3>
                  <div className="flex gap-2 items-center">
                    <BusinessesAdminSearch value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button asChild variant="outline" size="sm" className="text-[#1A365D] border-sky-200">
                      <Link href="/dashboard/create-business">
                        <Plus className="h-4 w-4 ml-1" /> הוסף עסק
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {!isLoading && !error && filteredBusinesses.length === 0 && renderNoBusinesses()}
                  {error ? (
                    <BusinessesAdminError message={error} onRetry={refreshBusinessData} />
                  ) : isLoading ? (
                    <BusinessesAdminListSkeleton />
                  ) : (
                    filteredBusinesses.map((business) => (
                      <Card
                        key={business.business_id}
                        className={`cursor-pointer transition-all hover:border-sky-300 ${
                          selectedBusiness?.business_id === business.business_id
                            ? "border-sky-500 shadow-md"
                            : "border-gray-300"
                        }`}
                        onClick={() => handleBusinessSelect(business)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg text-[#1A365D]">{business.business_name}</CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => handleEditSection(business, "details")}>
                                  <Edit className="ml-2 h-4 w-4" /> ערוך פרטים
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditSection(business, "kosher")}>
                                  <Star className="ml-2 h-4 w-4" /> ערוך כשרות
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditSection(business, "supervisors")}>
                                  <Users className="ml-2 h-4 w-4" /> ערוך משגיחים
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditSection(business, "certificates")}>
                                  <FileText className="ml-2 h-4 w-4" /> ערוך תעודות
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditSection(business, "photos")}>
                                  <ImageIcon className="ml-2 h-4 w-4" /> ערוך תמונות
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {/* Fixed: Replace CardDescription with div to avoid p > div nesting */}
                          <div className="text-[#2D4A6D] text-sm space-y-1">
                            <div className="flex items-center">
                              <Building className="h-3.5 w-3.5 ml-1" />
                              <span>{business.business_type}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 ml-1" />
                              <span>
                                {business.location.address} {business.location.street_number}, {business.location.city}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardFooter className="pt-0 pb-3">
                          <div className="flex flex-wrap gap-1">
                            {business.kosher_types.slice(0, 2).map((type) => (
                              <Badge
                                key={type.id}
                                variant="outline"
                                className="bg-sky-50 text-[#1A365D] border-sky-200"
                              >
                                {type.name}
                              </Badge>
                            ))}
                            {business.kosher_types.length > 2 && (
                              <Badge variant="outline" className="bg-sky-50 text-[#1A365D] border-sky-200">
                                +{business.kosher_types.length - 2}
                              </Badge>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="w-full lg:w-2/3">
              {selectedBusiness ? (
                <Card className="border-gray-300">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl text-[#1A365D]">{selectedBusiness.business_name}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#1A365D] border-sky-200"
                          onClick={() => handleEditSection(selectedBusiness, "details")}
                        >
                          <Edit className="h-4 w-4 ml-1" /> ערוך עסק
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-[#2D4A6D]">{selectedBusiness.business_details}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs dir="rtl" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-5 mb-4">
                        <TabsTrigger value="overview">סקירה</TabsTrigger>
                        <TabsTrigger value="kosher">כשרות</TabsTrigger>
                        <TabsTrigger value="supervisors">משגיחים</TabsTrigger>
                        <TabsTrigger value="certificates">תעודות</TabsTrigger>
                        <TabsTrigger value="photos">תמונות</TabsTrigger>
                      </TabsList>

                      <TabsContent dir="rtl" value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card dir="rtl">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-md flex items-center text-[#1A365D]">
                                <Info className="h-4 w-4 ml-2" /> פרטי עסק
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <dl className="space-y-2 text-right" dir="rtl">
                                <div className="flex items-center gap-1">
                                  <dt className="text-[#2D4A6D] font-medium">סוג עסק:</dt>
                                  <dd className="text-[#2D4A6D]">{selectedBusiness.business_type}</dd>
                                </div>
                                <div className="flex items-center gap-1">
                                  <dt className="text-[#2D4A6D] font-medium">טלפון:</dt>
                                  <dd className="text-[#2D4A6D]">{selectedBusiness.business_number}</dd>
                                </div>
                                {selectedBusiness.business_rating && (
                                  <div className="flex items-center gap-1">
                                    <dt className="text-[#2D4A6D] font-medium">דירוג:</dt>
                                    <dd className="text-[#2D4A6D] flex items-center">
                                      {selectedBusiness.business_rating}
                                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                                    </dd>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <dt className="text-[#2D4A6D] font-medium">כתובת:</dt>
                                  <dd className="text-[#2D4A6D]">
                                    {selectedBusiness.location.address} {selectedBusiness.location.street_number},{" "}
                                    {selectedBusiness.location.city}
                                  </dd>
                                </div>
                                {selectedBusiness.location.region && (
                                  <div className="flex items-center gap-1">
                                    <dt className="text-[#2D4A6D] font-medium">אזור:</dt>
                                    <dd className="text-[#2D4A6D]">{selectedBusiness.location.region}</dd>
                                  </div>
                                )}
                                {selectedBusiness.location.location_details && (
                                  <div className="flex flex-col gap-1">
                                    <dt className="text-[#2D4A6D] font-medium">פרטי מיקום:</dt>
                                    <dd className="text-[#2D4A6D] text-sm">
                                      {selectedBusiness.location.location_details}
                                    </dd>
                                  </div>
                                )}
                              </dl>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-[#1A365D]"
                                onClick={() => handleEditSection(selectedBusiness, "details")}
                              >
                                <Edit className="h-3.5 w-3.5 ml-1" /> ערוך
                              </Button>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-md flex items-center text-[#1A365D]">
                                <Star className="h-4 w-4 ml-2" /> כשרות
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  {selectedBusiness.kosher_types.map((type) => (
                                    <Badge
                                      key={type.id}
                                      variant="outline"
                                      className="bg-sky-50 text-[#1A365D] border-sky-200"
                                    >
                                      {type.name}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="mt-2">
                                  <span className="text-[#2D4A6D] font-medium">סוגי מזון:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedBusiness.food_types.map((type, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="bg-sky-50 text-[#1A365D] border-sky-200"
                                      >
                                        {type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="text-[#2D4A6D] font-medium">פריטי מזון:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedBusiness.food_item_types.map((item, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="bg-sky-50 text-[#1A365D] border-sky-200"
                                      >
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-[#1A365D]"
                                onClick={() => handleEditSection(selectedBusiness, "kosher")}
                              >
                                <Edit className="h-3.5 w-3.5 ml-1" /> ערוך
                              </Button>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center text-[#1A365D]">
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
                              className="mt-3 text-[#1A365D]"
                              onClick={() => handleEditSection(selectedBusiness, "photos")}
                            >
                              <Edit className="h-3.5 w-3.5 ml-1" /> ערוך
                            </Button>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="kosher">
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-xl text-[#1A365D]">תעודות כשרות</CardTitle>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[#1A365D] border-sky-200"
                                onClick={() => handleEditSection(selectedBusiness, "kosher")}
                              >
                                <Edit className="h-4 w-4 ml-1" /> ערוך
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-[#1A365D] mb-2">סוגי כשרות</h4>
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
                                      <span className="text-[#1A365D]">{type.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Separator />

                              <div>
                                <h4 className="font-medium text-[#1A365D] mb-2">סוגי מזון</h4>
                                <div className="flex flex-wrap gap-1">
                                  {selectedBusiness.food_types.map((type, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-sky-50 text-[#1A365D] border-sky-200"
                                    >
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <Separator />

                              <div>
                                <h4 className="font-medium text-[#1A365D] mb-2">פריטי מזון</h4>
                                <div className="flex flex-wrap gap-1">
                                  {selectedBusiness.food_item_types.map((item, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-sky-50 text-[#1A365D] border-sky-200"
                                    >
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="supervisors">
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-xl text-[#1A365D]">משגיחי כשרות</CardTitle>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[#1A365D] border-sky-200"
                                onClick={() => handleEditSection(selectedBusiness, "supervisors")}
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

                      <TabsContent value="certificates">
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-xl text-[#1A365D]">תעודות</CardTitle>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[#1A365D] border-sky-200"
                                onClick={() => handleEditSection(selectedBusiness, "certificates")}
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

                      <TabsContent value="photos">
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-xl text-[#1A365D]">תמונות העסק</CardTitle>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[#1A365D] border-sky-200"
                                onClick={() => handleEditSection(selectedBusiness, "photos")}
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
                                    <div className="mt-1 text-sm text-[#2D4A6D]">{photo.photo_info}</div>
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
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Building className="h-12 w-12 text-[#1A365D] opacity-30 mb-4" />
                  <h3 className="text-lg font-medium text-[#1A365D]">בחר עסק לצפייה</h3>
                  <p className="text-[#2D4A6D] mt-1">לחץ על אחד העסקים מהרשימה כדי לצפות בפרטים ולערוך</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-xl max-h-[100vh] overflow-y-auto">
          <DialogHeader className="text-right sm:text-center">
            <DialogTitle className="text-[#1A365D]">
              {editSection === "details" && "עריכת פרטי עסק"}
              {editSection === "kosher" && "עריכת פרטי כשרות"}
              {editSection === "supervisors" && "עריכת משגיחים"}
              {editSection === "certificates" && "עריכת תעודות"}
              {editSection === "photos" && "עריכת תמונות"}
            </DialogTitle>
            <DialogDescription className="text-[#2D4A6D]">{selectedBusiness?.business_name}</DialogDescription>
          </DialogHeader>
          {renderEditForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
