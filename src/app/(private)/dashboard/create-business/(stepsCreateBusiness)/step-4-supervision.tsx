"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FormData } from "@/lib/schemaCreateBusiness";
import { useState, useEffect } from "react";
import { FileUploader } from "@/components/file-uploader";
import { FileUploaderType, FileUploadResponse, FolderGoogleType } from "@/types/file-upload";
//TODO: preview image after back step (change url of google drive...)
export function Step4Supervision() {
  const { control, watch, setValue } = useFormContext<FormData>();
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<FileUploadResponse | null>(null);

  // Watch for certificate URL and metadata to restore state when navigating back
  const certificateUrl = watch("kosher_certificate.certificate");
  const certificateMetadata = watch("kosher_certificate.file_id");

  // Effect to restore file info when navigating back to this step
  useEffect(() => {
    if (certificateMetadata && !certificateFile) {
      try {
        setUploadedInfo({
          id: certificateMetadata,
          web_view_link: certificateUrl,
        });
      } catch (error) {
        console.error("Failed to parse certificate file ID:", error);
      }
    }
  }, [certificateMetadata, certificateUrl, certificateFile]);

  const formatDateInHebrew = (date: Date | null): string => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy", { locale: he });
  };

  const handleCertificateChange = (file: File | null, uploadResponse?: FileUploadResponse) => {
    // Set the file object in the local state
    setCertificateFile(file);

    if (uploadResponse) {
      // Store the upload info for future reference
      setUploadedInfo(uploadResponse);

      // Store the URL in the form field
      setValue("kosher_certificate.certificate", uploadResponse.web_view_link);

      // Store id in a separate field to help reconstruct the state when navigating back
      setValue("kosher_certificate.file_id", uploadResponse.id);
    } else if (file === null) {
      // Clear all related fields when file is removed
      setValue("kosher_certificate.certificate", "");
      setValue("kosher_certificate.file_id", "");
      setUploadedInfo(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#1A365D]">פיקוח וכשרות</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="supervisor.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם המשגיח</FormLabel>
              <FormControl>
                <Input {...field} className="border-sky-200 focus:border-sky-500 transition-all duration-300" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="supervisor.contact_info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>פרטי התקשרות</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="border-sky-200 focus:border-sky-500 transition-all duration-300"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="supervisor.authority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>רשות הפיקוח</FormLabel>
            <FormControl>
              <Input {...field} className="border-sky-200 focus:border-sky-500 transition-all duration-300" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Certificate upload with FileUploader */}
      <FormField
        control={control}
        name="kosher_certificate.certificate"
        render={({ field }) => (
          <FileUploader
            label="אישור כשרות"
            value={certificateFile}
            uploaderType={FileUploaderType.IMAGE}
            onChange={handleCertificateChange}
            folderType={FolderGoogleType.CERTIFICATES}
            className="w-full"
            // Pass the uploadedInfo to the FileUploader so it can show the preview
            // and properly handle deletion of existing file
            uploadedInfo={uploadedInfo}
          />
        )}
      />

      <FormField
        control={control}
        name="kosher_certificate.expiration_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>תאריך תפוגת תעודה</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-[240px] pr-3 text-right font-normal border-sky-200 focus:border-sky-500",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    {field.value ? formatDateInHebrew(field.value) : <span>בחר תאריך</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date() || date > new Date("2100-01-01")}
                  initialFocus
                  locale={he}
                  dir="rtl"
                  className="rtl"
                  weekStartsOn={0}
                  showOutsideDays={true}
                  fixedWeeks
                  classNames={{
                    day_selected: "bg-sky-500 text-white",
                    day_today: "bg-sky-100 text-sky-900",
                    day_outside: "text-gray-300",
                    day_disabled: "text-gray-300 opacity-50",
                    day_range_middle: "bg-sky-50",
                    day_hidden: "invisible",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm relative p-0 rounded-md focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-sky-100 rounded-md",
                  }}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
