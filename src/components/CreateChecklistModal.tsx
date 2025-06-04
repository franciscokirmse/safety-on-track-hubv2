
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (checklist: any) => void;
}

const CreateChecklistModal = ({ isOpen, onClose, onCreate }: CreateChecklistModalProps) => {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState(['']);
  const { toast } = useToast();

  const addItem = () => {
    setItems([...items, '']);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const validItems = items.filter(item => item.trim());
    if (validItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma tarefa",
        variant: "destructive"
      });
      return;
    }

    const newChecklist = {
      id: Date.now(),
      title: title.trim(),
      items: validItems.map((text, index) => ({
        id: index + 1,
        text: text.trim(),
        completed: false
      })),
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    onCreate(newChecklist);
    
    // Reset form
    setTitle('');
    setItems(['']);
    onClose();

    toast({
      title: "Sucesso!",
      description: "Lista criada com sucesso",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#f2f2f2' }}>Nova Lista de Verificação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Título da Lista</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300">Tarefas</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={`Tarefa ${index + 1}...`}
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                  />
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Tarefa
            </Button>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Criar Lista
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChecklistModal;
