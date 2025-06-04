
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: any) => void;
}

const DocumentUploadModal = ({ isOpen, onClose, onUpload }: DocumentUploadModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const categories = [
    'Regulamentações',
    'Procedimentos de Segurança',
    'Segurança Química',
    'Emergência',
    'Equipamentos',
    'Checklists'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category || !file) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Simulate file upload (in real app, upload to Supabase Storage)
      const fileUrl = URL.createObjectURL(file);
      
      const newDocument = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        category,
        type: file.type.includes('pdf') ? 'PDF' : 'DOCX',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        url: fileUrl,
        created_at: new Date().toISOString()
      };

      onUpload(newDocument);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setFile(null);
      onClose();

      toast({
        title: "Sucesso!",
        description: "Documento carregado com sucesso",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar documento",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#f2f2f2' }}>Novo Documento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Título do Documento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o documento..."
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-gray-300">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-white">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file" className="text-gray-300">Arquivo</Label>
            <div className="mt-1">
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0"
              />
              {file && (
                <p className="text-sm text-gray-400 mt-1">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={uploading}
            >
              {uploading ? (
                'Carregando...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;
