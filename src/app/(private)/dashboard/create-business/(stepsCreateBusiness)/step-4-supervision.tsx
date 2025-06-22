"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { type FormData, isDateValid } from "@/lib/schemaCreateBusiness";
import { useState, useEffect } from "react";
import { FileUploader } from "@/components/file-uploader";
import { FileUploaderType, type FileUploadResponse, FolderType } from "@/types/file-upload";
import { DatePicker } from "@/components/date-picker";

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
          fileName: "",
          fileType: "",
          fileSize: 0,
        });
      } catch (error) {
        console.error("Failed to parse certificate file ID:", error);
      }
    }
  }, [certificateMetadata, certificateUrl, certificateFile]);

  const handleCertificateChange = (file: File | null, uploadResponse?: FileUploadResponse) => {
    setCertificateFile(file);

    if (uploadResponse) {
      setUploadedInfo(uploadResponse);
      setValue("kosher_certificate.certificate", uploadResponse.web_view_link);
      setValue("kosher_certificate.file_id", uploadResponse.id);
    } else if (file === null) {
      setValue("kosher_certificate.certificate", "");
      setValue("kosher_certificate.file_id", "");
      setUploadedInfo(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1A365D] to-[#2D5A87] bg-clip-text text-transparent mb-2">
          פיקוח וכשרות
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-sky-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="supervisor.name"
          render={({ field }) => (
            <FormItem className="group">
              <FormLabel className="text-[#1A365D] font-semibold transition-colors group-focus-within:text-sky-600">
                שם המשגיח
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="border-2 border-sky-100 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-300 hover:border-sky-200 bg-gradient-to-r from-white to-sky-50/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="supervisor.contact_info"
          render={({ field }) => (
            <FormItem className="group">
              <FormLabel className="text-[#1A365D] font-semibold transition-colors group-focus-within:text-sky-600">
                פרטי התקשרות
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="border-2 border-sky-100 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-300 hover:border-sky-200 bg-gradient-to-r from-white to-sky-50/30"
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
          <FormItem className="group">
            <FormLabel className="text-[#1A365D] font-semibold transition-colors group-focus-within:text-sky-600">
              רשות הפיקוח
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                className="border-2 border-sky-100 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-300 hover:border-sky-200 bg-gradient-to-r from-white to-sky-50/30"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Enhanced Certificate upload */}
      <div className="bg-gradient-to-br from-sky-50/50 to-blue-50/30 p-6 rounded-xl border border-sky-100">
        <FormField
          control={control}
          name="kosher_certificate.certificate"
          render={({ field }) => (
            <FileUploader
              label="אישור כשרות"
              value={certificateFile}
              uploaderType={FileUploaderType.IMAGE}
              onChange={handleCertificateChange}
              folderType={FolderType.CERTIFICATES}
              className="w-full"
              // Pass the uploadedInfo to the FileUploader so it can show the preview
              // and properly handle deletion of existing file
              uploadedInfo={uploadedInfo}
            />
          )}
        />
      </div>

      {/* Enhanced Date Picker using the new component */}
      <FormField
        control={control}
        name="kosher_certificate.expiration_date"
        render={({ field }) => (
          <FormItem className="flex flex-col group">
            <FormLabel className="text-[#1A365D] font-semibold mb-3 transition-colors group-focus-within:text-sky-600">
              תאריך תפוגת תעודה
            </FormLabel>
            <FormControl>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                disabled={(date) => !isDateValid(date)}
                placeholder="בחר תאריך תפוגה"
                variant="modern"
                dir="rtl"
                showIcons={true}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
