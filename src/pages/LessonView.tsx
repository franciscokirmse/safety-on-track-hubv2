import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Trophy, Loader2, ArrowLeft } from 'lucide-react';
import CertificateGenerator from '@/components/CertificateGenerator';
import Player from '@vimeo/player';

interface Lesson {
  id: string;
  title: string;
  url_video: string;
  description: string;
  course_id: string | null;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  category?: string;
  duration_minutes?: number;
  material_url?: string;
  courses?: {
    id: string;
    name: string;
  };
}

interface QuizQuestion {
  question: string;
}

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const playerRef = useRef<Player | null>(null);

  const quizQuestions: QuizQuestion[] = [
    { question: "Você compreendeu o conteúdo apresentado?" },
    { question: "As informações foram claras e objetivas?" },
    { question: "Você se sente confiante para aplicar o conhecimento?" }
  ];

  useEffect(() => {
    if (user && lessonId) {
      fetchLesson();
      checkProgress();
    }
  }, [user, lessonId]);

  const fetchLesson = async () => {
    try {
      console.log('Iniciando busca da aula...', { lessonId });
      
      // Primeiro, vamos buscar apenas a aula
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      console.log('Resposta da busca da aula:', { lessonData, lessonError });

      if (lessonError) {
        console.error('Erro ao buscar aula:', lessonError);
        toast({
          title: "Erro ao carregar aula",
          description: lessonError.message,
          variant: "destructive"
        });
        throw lessonError;
      }

      if (!lessonData) {
        console.log('Nenhuma aula encontrada com este ID');
        setError('Aula não encontrada');
        return;
      }

      // Se a aula tem course_id, vamos buscar o curso
      if (lessonData.course_id) {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, name')
          .eq('id', lessonData.course_id)
          .single();

        console.log('Resposta da busca do curso:', { courseData, courseError });

        if (!courseError && courseData) {
          const lessonWithCourse = {
            ...lessonData,
            courses: courseData
          } as Lesson;
          
          console.log('Dados completos da aula:', lessonWithCourse);
          setLesson(lessonWithCourse);
          return;
        }
      }

      // Se não tem curso ou houve erro ao buscar o curso
      setLesson(lessonData as Lesson);
    } catch (error) {
      console.error('Erro ao carregar a aula:', error);
      setError('Erro ao carregar a aula');
    } finally {
      setIsLoading(false);
    }
  };

  const checkProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user?.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error) throw error;
      
      if (data) {
        setProgress(data.watched_percentage);
        if (data.watched_percentage >= 90) {
          setShowQuiz(true);
        }
        if (data.completed) {
          setQuizCompleted(true);
        }
      }
    } catch (error) {
      console.error('Error checking progress:', error);
    }
  };

  const updateProgress = async (percentage: number, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user?.id,
          lesson_id: lessonId,
          watched_percentage: percentage,
          completed: completed,
          last_watched_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const handleQuizAnswer = async (answer: boolean) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const allCorrect = newAnswers.every(a => a === true);
      if (allCorrect) {
        setQuizCompleted(true);
        await updateProgress(100, true);
        
        toast({
          title: "Parabéns!",
          description: "Você completou a aula e o questionário com sucesso!"
        });
      } else {
        toast({
          title: "Atenção",
          description: "Por favor, revise o conteúdo e tente novamente.",
          variant: "destructive"
        });
        setCurrentQuestion(0);
        setAnswers([]);
      }
    }
  };

  const getVimeoEmbedUrl = (url: string) => {
    // Extrai o ID do vídeo da URL do Vimeo
    const vimeoId = url.match(/(?:vimeo\.com\/)(\d+)/)?.[1];
    if (!vimeoId) return url;
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
  };

  const handleVideoProgress = async (data: { seconds: number; duration: number }) => {
    const percentage = Math.floor((data.seconds / data.duration) * 100);
    setProgress(percentage);
    
    if (percentage % 5 === 0) {
      await updateProgress(percentage, false);
    }

    if (percentage >= 90) {
      setShowQuiz(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">{error}</h2>
          <Button onClick={() => navigate('/courses')}>Voltar para Cursos</Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Aula não encontrada</h2>
          <Button onClick={() => navigate('/courses')}>Voltar para Cursos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/courses')}
          className="text-white hover:bg-gray-800 mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="space-y-6">
          {/* Video Player */}
          {lesson?.url_video && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={getVimeoEmbedUrl(lesson.url_video)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                ref={(iframe) => {
                  if (iframe) {
                    try {
                      const player = new Player(iframe);
                      playerRef.current = player;
                      player.on('timeupdate', handleVideoProgress);
                    } catch (err) {
                      console.error('Erro ao inicializar player:', err);
                    }
                  }
                }}
              />
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Progresso da Aula</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Quiz Section */}
          {showQuiz && !quizCompleted && (
            <div className="space-y-4 p-6 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold">Questionário Final</h3>
              <div className="space-y-4">
                <p className="text-lg">{quizQuestions[currentQuestion].question}</p>
                <div className="space-x-4">
                  <Button 
                    onClick={() => handleQuizAnswer(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Sim
                  </Button>
                  <Button 
                    onClick={() => handleQuizAnswer(false)}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Não
                  </Button>
                </div>
                <div className="text-sm text-gray-400">
                  Questão {currentQuestion + 1} de {quizQuestions.length}
                </div>
              </div>
            </div>
          )}

          {/* Certificate Section */}
          {quizCompleted && (
            <div className="space-y-4 p-6 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-semibold">Parabéns! Você completou a aula!</h3>
              </div>
              
              <CertificateGenerator 
                courseId={lesson.course_id || ''}
                courseName={lesson.courses?.name || ''}
                onCertificateGenerated={() => {
                  toast({
                    title: "Sucesso!",
                    description: "Certificado gerado com sucesso!"
                  });
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonView;
