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
        const { method, url } = await onGetUploadParameters();
        
        const response = await fetch(url, {
          method,
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (response.ok) {
          uploadedUrls.push(url.split('?')[0]);
        }
      }

      if (onComplete && uploadedUrls.length > 0) {
        onComplete({
          successful: uploadedUrls.map((uploadURL) => ({ uploadURL })),
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error al subir archivos",
        description: "Por favor, inténtalo de nuevo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
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
      <Button
        type="button"
        onClick={() => document.getElementById('file-upload-input')?.click()}
        className={buttonClassName}
        disabled={isUploading}
        data-testid="button-upload-file"
      >
        {isUploading ? "Subiendo..." : children}
      </Button>
    </div>
  );
}