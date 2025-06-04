
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Award, 
  Download,
  Calendar,
  User,
  ExternalLink,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CertificateGenerator from '@/components/CertificateGenerator';

const Certificates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
      fetchCompletedCourses();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses!inner(name, description)
        `)
        .eq('user_id', user?.id)
        .order('issued_date', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const fetchCompletedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select(`
          *,
          courses!inner(id, name, description)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setCompletedCourses(data || []);
    } catch (error) {
      console.error('Error fetching completed courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = (certificate: any) => {
    // Generate and download the certificate PDF
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificado - ${certificate.courses.name}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate {
            background: white;
            border: 8px solid #d4af37;
            border-radius: 15px;
            padding: 60px;
            width: 800px;
            text-align: center;
            box-shadow: 0 0 30px rgba(0,0,0,0.3);
          }
          .header {
            color: #1e3a8a;
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          .subtitle {
            color: #666;
            font-size: 18px;
            margin-bottom: 40px;
          }
          .recipient {
            font-size: 36px;
            color: #1e3a8a;
            font-weight: bold;
            margin: 30px 0;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 10px;
          }
          .course {
            font-size: 24px;
            color: #333;
            margin: 30px 0;
            font-style: italic;
          }
          .date {
            font-size: 16px;
            color: #666;
            margin-top: 40px;
          }
          .certificate-number {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">Certificado</div>
          <div class="subtitle">Safety On Demand - Treinamentos em Segurança do Trabalho</div>
          
          <p style="font-size: 20px; color: #333; margin: 30px 0;">
            Certificamos que
          </p>
          
          <div class="recipient">${user?.user_metadata?.full_name || user?.email}</div>
          
          <p style="font-size: 18px; color: #333; margin: 20px 0;">
            concluiu com êxito o curso
          </p>
          
          <div class="course">${certificate.courses.name}</div>
          
          <p style="font-size: 16px; color: #666; margin: 20px 0;">
            demonstrando conhecimento e competência em segurança do trabalho
            conforme as normas OSHA e regulamentações aplicáveis.
          </p>
          
          <div class="date">
            Emitido em: ${new Date(certificate.issued_date).toLocaleDateString('pt-BR')}
          </div>
          
          <div class="certificate-number">
            Certificado ID: ${certificate.certificate_number}
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(certificateHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Carregando certificados...</div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-white">Certificados</h1>
                <p className="text-sm text-gray-400">Seus certificados de conclusão</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Certificados Obtidos
              </CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{certificates.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Cursos Concluídos
              </CardTitle>
              <Trophy className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completedCourses.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Disponíveis para Gerar
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {completedCourses.length - certificates.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Section */}
        {certificates.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Meus Certificados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-yellow-600 text-white">
                        Certificado
                      </Badge>
                      <Award className="w-6 h-6 text-yellow-400" />
                    </div>
                    <CardTitle className="text-white text-lg">
                      {certificate.courses.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-400 text-sm">
                      {certificate.courses.description}
                    </p>

                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Emitido em: {new Date(certificate.issued_date).toLocaleDateString('pt-BR')}
                    </div>

                    <div className="flex items-center text-gray-400 text-sm">
                      <User className="w-4 h-4 mr-2" />
                      ID: {certificate.certificate_number}
                    </div>

                    <Button
                      onClick={() => downloadCertificate(certificate)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Certificado
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Certificates Section */}
        {completedCourses.filter(course => 
          !certificates.some(cert => cert.course_id === course.course_id)
        ).length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Certificados Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses
                .filter(course => !certificates.some(cert => cert.course_id === course.course_id))
                .map((course) => (
                <Card key={course.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-600 text-white">
                        Disponível
                      </Badge>
                      <Trophy className="w-6 h-6 text-green-400" />
                    </div>
                    <CardTitle className="text-white text-lg">
                      {course.courses.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-400 text-sm">
                      {course.courses.description}
                    </p>

                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Concluído em: {new Date(course.completed_at).toLocaleDateString('pt-BR')}
                    </div>

                    <CertificateGenerator
                      courseId={course.course_id}
                      courseName={course.courses.name}
                      onCertificateGenerated={() => {
                        fetchCertificates();
                        fetchCompletedCourses();
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {certificates.length === 0 && completedCourses.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              Nenhum certificado disponível
            </h3>
            <p className="text-gray-500 mb-6">
              Complete cursos para gerar seus certificados
            </p>
            <Button 
              onClick={() => navigate('/courses')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ver Cursos Disponíveis
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Certificates;
