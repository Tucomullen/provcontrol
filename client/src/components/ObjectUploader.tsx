import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: any) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length > maxNumberOfFiles) {
      toast({
        title: "Demasiados archivos",
        description: `Solo puedes subir ${maxNumberOfFiles} archivo(s) a la vez`,
        variant: "destructive",
      });
      return;
    }

    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Archivo demasiado grande",
        description: `Tamaño máximo: ${(maxFileSize / 1024 / 1024).toFixed(0)} MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of files) {
        console.log("Getting upload parameters for file:", file.name);
        const { method, url } = await onGetUploadParameters();
        console.log("Upload URL:", url);
        
        const response = await fetch(url, {
          method,
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        console.log("Upload response status:", response.status, response.statusText);

        if (response.ok) {
          let result;
          const contentType = response.headers.get('content-type');
          console.log("Response content-type:", contentType);
          
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
            console.log("Upload result:", result);
            // El servidor devuelve { url, fileId }, usar la URL del resultado
            const fileUrl = result.url || url.split('?')[0];
            uploadedUrls.push(fileUrl);
          } else {
            // Si no es JSON, usar la URL directamente sin query params
            const fileUrl = url.split('?')[0];
            uploadedUrls.push(fileUrl);
          }
        } else {
          const errorText = await response.text();
          console.error("Upload failed:", response.status, errorText);
          throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
        }
      }

      console.log("All files uploaded, URLs:", uploadedUrls);

      if (onComplete && uploadedUrls.length > 0) {
        const completeResult = {
          successful: uploadedUrls.map((uploadURL) => ({ uploadURL })),
        };
        console.log("Calling onComplete with:", completeResult);
        onComplete(completeResult);
      } else if (uploadedUrls.length === 0) {
        throw new Error("No files were uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error al subir archivos",
        description: error instanceof Error ? error.message : "Por favor, inténtalo de nuevo",
        variant: "destructive",
      });
    } finally {
      console.log("Resetting upload state");
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div>
      <Input
        type="file"
        multiple={maxNumberOfFiles > 1}
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="file-upload-input"
        accept="image/*,application/pdf,.doc,.docx"
      />
      <div
        onClick={() => !isUploading && document.getElementById('file-upload-input')?.click()}
        className={buttonClassName}
        data-testid="button-upload-file"
        style={{ cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.6 : 1 }}
      >
        {isUploading ? "Subiendo..." : children}
      </div>
    </div>
  );
}