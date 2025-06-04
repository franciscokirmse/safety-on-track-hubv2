import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateUrl: string;
  onDownload: () => void;
}

const CertificateModal = ({
  isOpen,
  onClose,
  certificateUrl,
  onDownload
}: CertificateModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Certificado de Conclusão</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 w-full bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={certificateUrl}
            className="w-full h-full border-0"
            title="Certificado"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal; 