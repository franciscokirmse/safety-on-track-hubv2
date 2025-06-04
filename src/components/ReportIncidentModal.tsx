import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentReported: () => void;
}

const ReportIncidentModal = ({ isOpen, onClose, onIncidentReported }: ReportIncidentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: '',
    injuryType: '',
  });

  const severityOptions = ['Baixa', 'Média', 'Alta'];
  const injuryTypes = ['Sem Ferimento', 'Ferimento Leve', 'Ferimento Grave', 'Quase Acidente'];

  // Limpar recursos da câmera quando o componente é desmontado
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Resetar estado de erro
      setCameraError(null);
      
      // Verificar se o navegador suporta a API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      // Tentar acessar a câmera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'environment' // Preferir câmera traseira em dispositivos móveis
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
        };
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      let errorMessage = 'Não foi possível acessar a câmera';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = 'Permissão para acessar a câmera foi negada';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Nenhuma câmera foi encontrada no dispositivo';
        }
      }
      
      setCameraError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Erro",
        description: "Erro ao capturar foto",
        variant: "destructive"
      });
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Não foi possível obter o contexto do canvas');
      }

      // Definir dimensões do canvas para corresponder ao vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Desenhar o frame do vídeo no canvas
      context.drawImage(video, 0, 0);

      // Converter para JPEG com qualidade 0.8 (80%)
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoTaken(photoData);
      stopCamera();
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      toast({
        title: "Erro",
        description: "Erro ao capturar a foto",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.location || !formData.severity || !formData.injuryType) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      let photoUrl = null;

      if (photoTaken) {
        // Converter base64 para blob
        const response = await fetch(photoTaken);
        const blob = await response.blob();
        const file = new File([blob], `incident-${Date.now()}.jpg`, { type: 'image/jpeg' });

        // Upload da foto para o Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-photos')
          .upload(`${user?.id}/${file.name}`, file);

        if (uploadError) throw uploadError;

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('incident-photos')
            .getPublicUrl(uploadData.path);
          
          photoUrl = publicUrl;
        }
      }

      // Criar o incidente no banco de dados
      const { error } = await supabase
        .from('incidents')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          severity: formData.severity,
          injury_type: formData.injuryType,
          photo_url: photoUrl,
          reported_by: user?.id,
          status: 'Aberto',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Incidente reportado com sucesso",
      });

      onIncidentReported();
      handleClose();
    } catch (error) {
      console.error('Erro ao reportar incidente:', error);
      toast({
        title: "Erro",
        description: "Erro ao reportar o incidente",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setPhotoTaken(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      severity: '',
      injuryType: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle style={{ color: '#f2f2f2' }}>Reportar Incidente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Título do Incidente</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Descreva brevemente o incidente..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Descrição Detalhada</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva o que aconteceu..."
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-gray-300">Local do Incidente</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Onde ocorreu o incidente..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Severidade</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({...formData, severity: value})}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {severityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Tipo de Ferimento</Label>
              <Select
                value={formData.injuryType}
                onValueChange={(value) => setFormData({...formData, injuryType: value})}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {injuryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-gray-300">Foto do Local</Label>
            <div className="relative mt-2">
              {!isCameraActive && !photoTaken && (
                <Button
                  onClick={startCamera}
                  className="w-full h-32 bg-gray-700 hover:bg-gray-600 border-2 border-dashed border-gray-500"
                  disabled={uploading}
                >
                  <Camera className="w-6 h-6 mr-2" />
                  Tirar Foto
                </Button>
              )}

              {isCameraActive && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <Button
                    onClick={takePhoto}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black hover:bg-gray-200"
                    disabled={uploading}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capturar
                  </Button>
                </div>
              )}

              {photoTaken && (
                <div className="relative">
                  <img
                    src={photoTaken}
                    alt="Foto do incidente"
                    className="w-full rounded-lg"
                  />
                  <Button
                    onClick={() => {
                      setPhotoTaken(null);
                      startCamera();
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {cameraError && (
                <p className="text-red-400 text-sm mt-2">{cameraError}</p>
              )}
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : 'Reportar Incidente'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportIncidentModal; 