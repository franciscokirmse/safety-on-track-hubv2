import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Play, 
  BookOpen,
  Clock,
  CheckCircle,
  Filter,
  Search,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const progressMap = {};
      data?.forEach(progress => {
        progressMap[progress.course_id] = progress;
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const startCourse = async (courseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          status: 'in_progress',
          progress_percentage: 0,
          lessons_completed: 0
        });

      if (error) throw error;
      
      fetchUserProgress();
      navigate(`/course/${courseId}`);
    } catch (error) {
      console.error('Error starting course:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071a3f' }}>
        <div style={{ color: '#f2f2f2' }} className="text-lg">Carregando aulas iniciadas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071a3f', color: '#f2f2f2' }}>
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
                <h1 className="text-2xl font-bold" style={{ color: '#f2f2f2' }}>Cursos</h1>
                <p className="text-sm text-gray-400">Continue seus estudos em segurança</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar aulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const progress = userProgress[course.id];
            const isStarted = progress?.status !== 'not_started' && progress?.status;
            const isCompleted = progress?.status === 'completed';

            return (
              <Card key={course.id} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      Curso
                    </Badge>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <CardTitle style={{ color: '#f2f2f2' }} className="text-lg line-clamp-2">
                    {course.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {course.description}
                  </p>

                  <div className="flex items-center text-gray-400 text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {course.total_lessons} aulas
                  </div>

                  {progress && isStarted && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>{Math.round(progress.progress_percentage || 0)}%</span>
                      </div>
                      <Progress value={progress.progress_percentage || 0} className="h-2" />
                    </div>
                  )}

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => isStarted ? navigate(`/course-details/${course.id}`) : startCourse(course.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isCompleted ? 'Revisar Curso' : isStarted ? 'Continuar' : 'Iniciar Curso'}
                  </Button>

                  {course.profiles && (
                    <p className="text-xs text-gray-500">
                      Por: {course.profiles.full_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              Nenhuma aula encontrada
            </h3>
            <p className="text-gray-500">
              Tente ajustar os termos de busca
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
