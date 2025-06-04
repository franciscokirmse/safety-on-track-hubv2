
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  CheckSquare, 
  Plus,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateChecklistModal from '@/components/CreateChecklistModal';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/hooks/use-toast';

const Checklists = () => {
  const navigate = useNavigate();
  const { awardPoints } = useGamification();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [checklists, setChecklists] = useState([
    {
      id: 1,
      title: "Inspeção Diária de Segurança",
      items: [
        { id: 1, text: "Verificar saídas de emergência", completed: true },
        { id: 2, text: "Conferir localização dos extintores", completed: true },
        { id: 3, text: "Inspecionar equipamentos de proteção individual", completed: false },
        { id: 4, text: "Revisar procedimentos de segurança com a equipe", completed: false }
      ],
      date: "2024-05-30",
      status: "in_progress"
    },
    {
      id: 2,
      title: "Verificação Semanal de Equipamentos",
      items: [
        { id: 5, text: "Testar cintos de segurança", completed: true },
        { id: 6, text: "Verificar condição das ferramentas", completed: true },
        { id: 7, text: "Conferir segurança das escadas", completed: true },
        { id: 8, text: "Atualizar log de manutenção", completed: true }
      ],
      date: "2024-05-29",
      status: "completed"
    }
  ]);

  const toggleItem = async (checklistId: number, itemId: number) => {
    setChecklists(prevChecklists => {
      return prevChecklists.map(checklist => {
        if (checklist.id === checklistId) {
          const updatedItems = checklist.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          );
          const completedCount = updatedItems.filter(item => item.completed).length;
          const oldCompletedCount = checklist.items.filter(item => item.completed).length;
          const newStatus = completedCount === updatedItems.length ? 'completed' : 
                           completedCount > 0 ? 'in_progress' : 'pending';
          
          // Award points if checklist was just completed
          if (newStatus === 'completed' && checklist.status !== 'completed') {
            awardPoints(5, 'checklist_completed');
            toast({
              title: "Parabéns! 🎉",
              description: "Checklist concluída! Você ganhou 5 pontos.",
            });
          }
          
          return { ...checklist, items: updatedItems, status: newStatus };
        }
        return checklist;
      });
    });
  };

  const handleCreateChecklist = (newChecklist: any) => {
    setChecklists(prev => [...prev, newChecklist]);
  };

  const getProgress = (items: any[]) => {
    const completed = items.filter(item => item.completed).length;
    return (completed / items.length) * 100;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckSquare className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/20 text-green-400';
      case 'in_progress':
        return 'bg-blue-900/20 text-blue-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071a3f', color: '#f2f2f2' }}>
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#f2f2f2' }}>Checklists</h1>
                <p className="text-sm text-gray-400">Gerencie listas de verificação de segurança</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Checklist
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {checklists.map((checklist) => (
            <Card key={checklist.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    {getStatusIcon(checklist.status)}
                    <span style={{ color: '#f2f2f2' }}>{checklist.title}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(checklist.status)}`}>
                      {checklist.status === 'completed' ? 'Concluído' : 
                       checklist.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                    </span>
                    <span className="text-sm text-gray-400">{checklist.date}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Progresso</span>
                    <span>{Math.round(getProgress(checklist.items))}%</span>
                  </div>
                  <Progress value={getProgress(checklist.items)} className="h-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklist.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(checklist.id, item.id)}
                        className="border-gray-600 data-[state=checked]:bg-green-600"
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className={`text-sm cursor-pointer ${
                          item.completed ? 'line-through text-gray-500' : 'text-gray-300'
                        }`}
                      >
                        {item.text}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <CreateChecklistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateChecklist}
      />
    </div>
  );
};

export default Checklists;
