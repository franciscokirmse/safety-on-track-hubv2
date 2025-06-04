
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Target, 
  Play,
  Trophy,
  Clock,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Simulators = () => {
  const navigate = useNavigate();

  const simulators = [
    {
      id: 1,
      title: "Fire Safety Simulator",
      description: "Practice fire evacuation procedures",
      duration: "15 min",
      difficulty: "Beginner",
      rating: 4.8,
      progress: 85,
      status: "in_progress"
    },
    {
      id: 2,
      title: "Fall Protection Training",
      description: "Virtual reality harness and equipment training",
      duration: "25 min",
      difficulty: "Intermediate",
      rating: 4.9,
      progress: 100,
      status: "completed"
    },
    {
      id: 3,
      title: "Chemical Spill Response",
      description: "Emergency response procedures simulation",
      duration: "20 min",
      difficulty: "Advanced",
      rating: 4.7,
      progress: 0,
      status: "not_started"
    },
    {
      id: 4,
      title: "Machinery Safety Check",
      description: "Equipment inspection simulation",
      duration: "30 min",
      difficulty: "Intermediate",
      rating: 4.6,
      progress: 45,
      status: "in_progress"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-900/20 text-green-400';
      case 'Intermediate':
        return 'bg-yellow-900/20 text-yellow-400';
      case 'Advanced':
        return 'bg-red-900/20 text-red-400';
      default:
        return 'bg-gray-800 text-gray-400';
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
    <div className="min-h-screen bg-gray-900 text-white">
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
                <h1 className="text-2xl font-bold text-white">Simulators</h1>
                <p className="text-sm text-gray-400">Virtual safety training</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulators.map((simulator) => (
            <Card key={simulator.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-white">{simulator.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">{simulator.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">{simulator.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">{simulator.rating}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(simulator.difficulty)}`}>
                    {simulator.difficulty}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(simulator.status)}`}>
                    {simulator.status === 'completed' ? 'Concluído' :
                     simulator.status === 'in_progress' ? 'Em Progresso' : 'Não Iniciado'}
                  </span>
                </div>

                {simulator.status !== 'not_started' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Progresso</span>
                      <span>{simulator.progress}%</span>
                    </div>
                    <Progress value={simulator.progress} className="h-2" />
                  </div>
                )}

                <Button 
                  className={`w-full ${
                    simulator.status === 'completed' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {simulator.status === 'completed' ? 'Revisar' : 
                   simulator.status === 'in_progress' ? 'Continuar' : 'Iniciar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Simulators;
