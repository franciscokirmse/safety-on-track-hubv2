import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  Award, 
  TrendingUp,
  Plus,
  Video,
  BookOpen,
  Trophy,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLessons: 0,
    totalCourses: 0,
    totalCertificates: 0
  });
  const [topStudents, setTopStudents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  // Form states
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    url_video: '',
    material_url: '',
    category: '',
    duration_minutes: '',
    course_id: ''
  });

  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    total_lessons: ''
  });

  useEffect(() => {
    fetchAdminStats();
    fetchTopStudents();
    fetchRecentActivity();
    fetchAvailableCourses();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const [usersResult, lessonsResult, coursesResult, certificatesResult] = await Promise.all([
        supabase.from('profiles').select('id'),
        supabase.from('lessons').select('id'),
        supabase.from('courses').select('id'),
        supabase.from('certificates').select('id')
      ]);

      setStats({
        totalUsers: usersResult.data?.length || 0,
        totalLessons: lessonsResult.data?.length || 0,
        totalCourses: coursesResult.data?.length || 0,
        totalCertificates: certificatesResult.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchTopStudents = async () => {
    try {
      const { data } = await supabase
        .from('gamification')
        .select(`
          points,
          level,
          badges,
          profiles!inner(full_name, email)
        `)
        .order('points', { ascending: false })
        .limit(10);

      setTopStudents(data || []);
    } catch (error) {
      console.error('Error fetching top students:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data } = await supabase
        .from('user_lesson_progress')
        .select(`
          completed_at,
          lessons!inner(title),
          profiles!inner(full_name)
        `)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(10);

      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      if (!lessonForm.course_id) {
        throw new Error('Por favor, selecione um curso');
      }

      console.log('Tentando criar aula com:', lessonForm);

      const { error } = await supabase
        .from('lessons')
        .insert([{
          ...lessonForm,
          duration_minutes: parseInt(lessonForm.duration_minutes) || null,
          created_by: user?.id
        }]);

      if (error) {
        console.error('Erro ao criar aula:', error);
        throw error;
      }

      // Buscar o curso atual
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('total_lessons')
        .eq('id', lessonForm.course_id)
        .single();

      if (courseError) throw courseError;

      // Atualizar o número total de aulas do curso
      const { error: updateError } = await supabase
        .from('courses')
        .update({ 
          total_lessons: (courseData?.total_lessons || 0) + 1
        })
        .eq('id', lessonForm.course_id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso!",
        description: "Aula criada com sucesso."
      });

      setLessonForm({
        title: '',
        description: '',
        url_video: '',
        material_url: '',
        category: '',
        duration_minutes: '',
        course_id: ''
      });

      fetchAdminStats();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar aula: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      console.log('Tentando criar curso com:', courseForm);

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...courseForm,
          total_lessons: parseInt(courseForm.total_lessons) || 0,
          created_by: user?.id
        }])
        .select();

      if (error) {
        console.error('Erro ao criar curso:', error);
        throw error;
      }

      console.log('Curso criado com sucesso:', data);

      toast({
        title: "Sucesso!",
        description: "Curso criado com sucesso."
      });

      setCourseForm({
        name: '',
        description: '',
        total_lessons: ''
      });

      fetchAdminStats();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar curso: " + error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-400">
            Gerencie usuários, conteúdos e acompanhe o progresso
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total de Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total de Aulas
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalLessons}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total de Cursos
              </CardTitle>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Certificados Emitidos
              </CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCertificates}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="create-lesson" className="data-[state=active]:bg-blue-600">
              Criar Aula
            </TabsTrigger>
            <TabsTrigger value="create-course" className="data-[state=active]:bg-blue-600">
              Criar Curso
            </TabsTrigger>
            <TabsTrigger value="gamification" className="data-[state=active]:bg-blue-600">
              Gamificação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Students */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Top Estudantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topStudents.map((student, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-600' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">{student.profiles.full_name}</p>
                            <p className="text-gray-400 text-sm">Nível {student.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{student.points} pts</p>
                          <div className="flex space-x-1">
                            {student.badges?.slice(0, 3).map((badge, badgeIndex) => (
                              <Badge key={badgeIndex} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white text-sm">
                            <span className="font-medium">{activity.profiles.full_name}</span> completou
                          </p>
                          <p className="text-gray-400 text-sm">{activity.lessons.title}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(activity.completed_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create-lesson">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Nova Aula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateLesson} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título da Aula
                    </label>
                    <Input
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Digite o título da aula"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição
                    </label>
                    <Textarea
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Descrição da aula"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        URL do Vídeo
                      </label>
                      <Input
                        value={lessonForm.url_video}
                        onChange={(e) => setLessonForm({...lessonForm, url_video: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="https://vimeo.com/..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Material PDF (opcional)
                      </label>
                      <Input
                        value={lessonForm.material_url}
                        onChange={(e) => setLessonForm({...lessonForm, material_url: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="URL do material PDF"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Categoria
                      </label>
                      <Select onValueChange={(value) => setLessonForm({...lessonForm, category: value})}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="EPI">EPI</SelectItem>
                          <SelectItem value="Altura">Trabalho em Altura</SelectItem>
                          <SelectItem value="Emergência">Emergência</SelectItem>
                          <SelectItem value="Máquinas">Segurança em Máquinas</SelectItem>
                          <SelectItem value="Química">Segurança Química</SelectItem>
                          <SelectItem value="Geral">Segurança Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Curso
                      </label>
                      <Select 
                        onValueChange={(value) => setLessonForm({...lessonForm, course_id: value})}
                        value={lessonForm.course_id}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione um curso" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {availableCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duração (minutos)
                      </label>
                      <Input
                        type="number"
                        value={lessonForm.duration_minutes}
                        onChange={(e) => setLessonForm({...lessonForm, duration_minutes: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="120"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Video className="w-4 h-4 mr-2" />
                    Criar Aula
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-course">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Novo Curso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome do Curso
                    </label>
                    <Input
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Digite o nome do curso"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição do Curso
                    </label>
                    <Textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Descrição detalhada do curso"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total de Aulas
                    </label>
                    <Input
                      type="number"
                      value={courseForm.total_lessons}
                      onChange={(e) => setCourseForm({...courseForm, total_lessons: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="10"
                      required
                    />
                  </div>

                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Criar Curso
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gamification">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Sistema de Pontos</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <div className="space-y-2">
                    <p>• Completar aula: <span className="text-green-400 font-bold">10 pontos</span></p>
                    <p>• Completar curso: <span className="text-blue-400 font-bold">50 pontos</span></p>
                    <p>• Curtir vídeo: <span className="text-yellow-400 font-bold">2 pontos</span></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Níveis</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <div className="space-y-2">
                    <p>• Nível 1: 0-99 pontos</p>
                    <p>• Nível 2: 100-199 pontos</p>
                    <p>• Nível 3: 200-299 pontos</p>
                    <p>• E assim por diante...</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Medalhas</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>Aprendiz: 5 aulas concluídas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-blue-400" />
                      <span>Expert: 1 curso concluído</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
