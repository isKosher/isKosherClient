"use client";
import type React from "react";
import { useState } from "react";
import type { UserOwnedBusinessResponse } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/file-uploader";
import { FileUploaderType, FolderGoogleType, type FileUploadResponse } from "@/types/file-upload";
import { updateBusinessCertificates } from "@/app/actions/dashboardAction";

type CertificatesFormProps = {
  business: UserOwnedBusinessResponse;
  onClose: (refreshData?: boolean, message?: string) => void;
};

type Certificate = {
  id: string;
  certificate: string;
  expiration_date: string;
};

export default function CertificatesForm({ business, onClose }: CertificatesFormProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([...business.certificates]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCertificate, setNewCertificate] = useState<Omit<Certificate, "id">>({
    certificate: "",
    expiration_date: "",
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<FileUploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveCertificate = (id: string) => {
    setCertificates(certificates.filter((cert) => cert.id !== id));
  };

  const handleCertificateFileChange = (file: File | null, uploadResponse?: FileUploadResponse) => {
    setCertificateFile(file);

    if (uploadResponse) {
      setUploadedInfo(uploadResponse);
      setNewCertificate({
        ...newCertificate,
        certificate: uploadResponse.web_view_link,
      });
    } else if (file === null) {
      setUploadedInfo(null);
      setNewCertificate({
        ...newCertificate,
        certificate: "",
      });
    }
  };

  const handleAddCertificate = () => {
    if (newCertificate.certificate && newCertificate.expiration_date) {
      const id = crypto.randomUUID();
      setCertificates([...certificates, { ...newCertificate, id }]);
      setNewCertificate({ certificate: "", expiration_date: "" });
      setCertificateFile(null);
      setUploadedInfo(null);
      setIsAdding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const response = await updateBusinessCertificates({
        businessId: business.business_id,
        certificates: certificates.map((cert) => ({
          id: cert.id,
          certificate: cert.certificate,
          expiration_date: cert.expiration_date,
        })),
      });

      if (response.error) {
        throw new Error(response.message);
      }

      onClose(true, "התעודות עודכנו בהצלחה");
    } catch (err) {
      console.error("Failed to update certificates:", err);
      setError(err instanceof Error ? err.message : "שגיאה בעדכון התעודות");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div>
        <div className="flex justify-between items-center mb-4">
          <Label className="text-[#1A365D] text-lg">תעודות כשרות</Label>
          {!isAdding && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-[#1A365D] border-sky-200"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 ml-1" /> הוסף תעודה
            </Button>
          )}
        </div>

        {isAdding && (
          <Card className="border-sky-200 mb-4">
            <CardContent className="p-4 space-y-3">
              <FileUploader
                label="תעודת כשרות"
                value={certificateFile}
                onChange={handleCertificateFileChange}
                uploaderType={FileUploaderType.DOCUMENT}
                folderType={FolderGoogleType.CERTIFICATES}
                maxSizeMB={10}
                direction="rtl"
                uploadedInfo={uploadedInfo}
              />

              <div>
                <Label className="text-[#1A365D]">תאריך תפוגה</Label>
                <Input
                  type="date"
                  className="border-sky-200 focus:border-sky-500 mt-1"
                  value={newCertificate.expiration_date}
                  onChange={(e) => setNewCertificate({ ...newCertificate, expiration_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setCertificateFile(null);
                    setUploadedInfo(null);
                    setNewCertificate({ certificate: "", expiration_date: "" });
                  }}
                  className="border-gray-300"
                >
                  ביטול
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#1A365D] hover:bg-[#2D4A6D]"
                  onClick={handleAddCertificate}
                  disabled={!newCertificate.certificate || !newCertificate.expiration_date}
                >
                  הוסף
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="border-sky-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-[#1A365D]">תעודת כשרות</h4>
                    <p className="text-[#2D4A6D] text-sm">
                      בתוקף עד: {new Date(certificate.expiration_date).toLocaleDateString("he-IL")}
                    </p>
                    <a
                      href={certificate.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1A365D] hover:text-sky-700 underline text-sm mt-1 inline-block"
                    >
                      צפה בתעודה
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveCertificate(certificate.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {error && <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">{error}</div>}
        <div className="flex justify-start gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            className="border-gray-300"
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button type="submit" className="bg-[#1A365D] hover:bg-[#2D4A6D]" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="ml-2">שומר שינויים...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </>
            ) : (
              "שמור שינויים"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
