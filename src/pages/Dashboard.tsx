import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Award, 
  Play, 
  BookOpen, 
  TrendingUp,
  Users,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trophy,
  CheckSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalVideos: 0,
    totalLessons: 0
  });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id');

      // Fetch short videos
      const { data: videos } = await supabase
        .from('short_videos')
        .select('id');

      // Fetch lessons
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id');

      // Fetch completed courses for user
      let completedCourses = 0;
      if (user) {
        const { data: progress } = await supabase
          .from('user_course_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'completed');
        
        completedCourses = progress?.length || 0;
      }

      setStats({
        totalCourses: courses?.length || 0,
        completedCourses,
        totalVideos: videos?.length || 0,
        totalLessons: lessons?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const quickActions = [
    {
      title: 'Cursos',
      description: 'Conteúdo rápido sobre segurança',
      icon: GraduationCap,
      color: 'bg-blue-600',
      onClick: () => navigate('/courses')
    },
    {
      title: 'SafeShorts',
      description: 'Treinamentos detalhados',
      icon: Play,
      color: 'bg-red-600',
      onClick: () => navigate('/short-videos')
    },
    {
      title: 'Gamificação',
      description: 'Prática interativa',
      icon: Trophy,
      color: 'bg-green-600',
      onClick: () => navigate('/gamification')
    },
    {
      title: 'Listas',
      description: 'Verificações de segurança',
      icon: CheckSquare,
      color: 'bg-yellow-600',
      onClick: () => navigate('/checklists')
    }
  ];

  const recentActivity = [
    {
      type: 'course',
      title: 'Segurança em Alturas - Módulo 1',
      time: '2 horas atrás',
      status: 'completed'
    },
    {
      type: 'video',
      title: 'EPI - Uso Correto de Capacetes',
      time: '5 horas atrás',
      status: 'watched'
    },
    {
      type: 'checklist',
      title: 'Inspeção Diária de Equipamentos',
      time: '1 dia atrás',
      status: 'completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo ao Safety On Demand
          </h1>
          <p className="text-gray-400">
            Gerencie seus treinamentos e mantenha sua equipe segura
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Cursos Disponíveis
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
              <p className="text-xs text-gray-400">
                {stats.completedCourses} concluídos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Vídeos Curtos
              </CardTitle>
              <Play className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalVideos}</div>
              <p className="text-xs text-gray-400">
                Disponíveis para assistir
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Aulas Completas
              </CardTitle>
              <BookOpen className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalLessons}</div>
              <p className="text-xs text-gray-400">
                Conteúdo detalhado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Progresso Geral
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalCourses > 0 ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0}%
              </div>
              <Progress 
                value={stats.totalCourses > 0 ? (stats.completedCourses / stats.totalCourses) * 100 : 0} 
                className="mt-2 h-2" 
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    className={`${action.color} hover:opacity-90 h-auto p-4 flex flex-col items-center text-center`}
                  >
                    <action.icon className="w-8 h-8 mb-2" />
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs opacity-80">{action.description}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'course' && <GraduationCap className="w-6 h-6 text-blue-400" />}
                      {activity.type === 'video' && <Play className="w-6 h-6 text-red-400" />}
                      {activity.type === 'checklist' && <CheckCircle className="w-6 h-6 text-green-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                      className="flex-shrink-0"
                    >
                      {activity.status === 'completed' ? 'Concluído' : 'Assistido'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Alert */}
        <Card className="bg-yellow-900/20 border-yellow-700 mt-8">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Lembrete de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-200">
              Não esqueça de realizar sua inspeção diária de EPIs. 
              A segurança começa com a verificação adequada dos equipamentos.
            </p>
            <Button 
              className="mt-4 bg-yellow-600 hover:bg-yellow-700"
              onClick={() => navigate('/checklists')}
            >
              Realizar Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
