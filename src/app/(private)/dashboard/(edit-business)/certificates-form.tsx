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
import { FileUploaderType, FolderType, type FileUploadResponse } from "@/types/file-upload";
import { addBusinessCertificate, deleteBusinessCertificate } from "@/app/actions/dashboardAction";
import KosherCertificateViewer from "@/components/Kosher-certificate-viewer";

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
  const [loadingStates, setLoadingStates] = useState<{
    adding: boolean;
    deleting: string | null;
  }>({
    adding: false,
    deleting: null,
  });
  const [error, setError] = useState<string | null>(null);

  const handleRemoveCertificate = async (id: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, deleting: id }));
      setError(null);

      await deleteBusinessCertificate({
        business_id: business.business_id,
        certificate_id: id,
      });

      setCertificates(certificates.filter((cert) => cert.id !== id));
    } catch (err) {
      console.error("Failed to delete certificate:", err);
      setError(err instanceof Error ? err.message : "שגיאה במחיקת תעודה");
    } finally {
      setLoadingStates((prev) => ({ ...prev, deleting: null }));
    }
  };

  const handleCertificateFileChange = (file: File | null, uploadResponse?: FileUploadResponse) => {
    setCertificateFile(file);

    if (uploadResponse) {
      setUploadedInfo(uploadResponse);
      setNewCertificate((prev) => ({
        ...prev,
        certificate: uploadResponse.web_view_link,
      }));
    } else if (file === null) {
      setUploadedInfo(null);
      setNewCertificate((prev) => ({
        ...prev,
        certificate: "",
      }));
    }
  };

  const handleAddCertificate = async () => {
    if (!newCertificate.certificate || !newCertificate.expiration_date) {
      setError("יש למלא את כל השדות");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, adding: true }));
      setError(null);

      const response = await addBusinessCertificate({
        business_id: business.business_id,
        certificate: newCertificate,
      });

      if (!response.id) {
        throw new Error("Failed to get certificate ID from response");
      }

      const addedCertificate = { ...newCertificate, id: response.id };
      setCertificates([...certificates, addedCertificate]);
      setNewCertificate({ certificate: "", expiration_date: "" });
      setCertificateFile(null);
      setUploadedInfo(null);
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add certificate:", err);
      setError(err instanceof Error ? err.message : "שגיאה בהוספת תעודה");
    } finally {
      setLoadingStates((prev) => ({ ...prev, adding: false }));
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setCertificateFile(null);
    setUploadedInfo(null);
    setNewCertificate({ certificate: "", expiration_date: "" });
    setError(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
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
                uploaderType={FileUploaderType.ANY}
                folderType={FolderType.CERTIFICATES}
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
                  onClick={handleCancelAdd}
                  className="border-gray-300"
                  disabled={loadingStates.adding}
                >
                  ביטול
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#1A365D] hover:bg-[#2D4A6D]"
                  onClick={handleAddCertificate}
                  disabled={loadingStates.adding}
                >
                  {loadingStates.adding ? (
                    <>
                      <span className="ml-2">מוסיף...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </>
                  ) : (
                    "הוסף"
                  )}
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
                    <KosherCertificateViewer certificateUrl={certificate.certificate} variant="link" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveCertificate(certificate.id)}
                    disabled={loadingStates.deleting === certificate.id || isAdding}
                  >
                    {loadingStates.deleting === certificate.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}

      <div className="flex justify-start pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onClose(true)}
          className="border-gray-300"
          disabled={Object.values(loadingStates).some(Boolean) || isAdding}
        >
          סגור
        </Button>
      </div>
    </div>
  );
}
