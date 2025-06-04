import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Play
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchLessons();
      if (user) {
        fetchUserProgress();
      }
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, profiles!courses_created_by_fkey(full_name)')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes do curso:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const progressMap = {};
      data?.forEach(progress => {
        progressMap[progress.lesson_id] = progress;
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071a3f' }}>
        <div style={{ color: '#f2f2f2' }} className="text-lg">Carregando detalhes do curso...</div>
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
                onClick={() => navigate('/courses')}
                className="text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{course?.name}</h1>
                <p className="text-sm text-gray-400">
                  {course?.profiles?.full_name ? `Por: ${course.profiles.full_name}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Overview */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Visão Geral do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">{course?.description}</p>
            <div className="flex items-center text-gray-400">
              <BookOpen className="w-4 h-4 mr-2" />
              {course?.total_lessons} aulas
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Aulas do Curso</h2>
          {lessons.map((lesson) => {
            const progress = userProgress[lesson.id];
            const isCompleted = progress?.completed;
            const watchedPercentage = progress?.watched_percentage || 0;

            return (
              <Card key={lesson.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg flex items-center">
                      {isCompleted && <CheckCircle className="w-5 h-5 text-green-400 mr-2" />}
                      {lesson.title}
                    </CardTitle>
                    <Badge variant={isCompleted ? "outline" : "secondary"} className={isCompleted ? "text-green-400 border-green-400" : ""}>
                      {isCompleted ? 'Concluída' : 'Pendente'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">{lesson.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      {lesson.duration_minutes} minutos
                    </div>

                    {watchedPercentage > 0 && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Progresso</span>
                          <span>{watchedPercentage}%</span>
                        </div>
                        <Progress value={watchedPercentage} className="h-1" />
                      </div>
                    )}

                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isCompleted ? 'Revisar Aula' : 'Iniciar Aula'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {lessons.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">
                Nenhuma aula encontrada
              </h3>
              <p className="text-gray-500">
                Este curso ainda não possui aulas cadastradas
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseDetails; 