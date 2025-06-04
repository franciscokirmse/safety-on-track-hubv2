
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  GraduationCap, 
  Award, 
  Users, 
  ArrowRight,
  CheckCircle,
  Play,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: GraduationCap,
      title: 'Treinamentos Completos',
      description: 'Cursos estruturados de segurança do trabalho e normas OSHA'
    },
    {
      icon: Play,
      title: 'Vídeos Curtos',
      description: 'Conteúdo rápido e prático para aprendizado contínuo'
    },
    {
      icon: Award,
      title: 'Certificações',
      description: 'Certificados válidos após conclusão dos treinamentos'
    },
    {
      icon: CheckCircle,
      title: 'Checklists Digitais',
      description: 'Inspeções e verificações de segurança digitalizadas'
    },
    {
      icon: BookOpen,
      title: 'Biblioteca Completa',
      description: 'Acesso a manuais, normas e documentação técnica'
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description: 'Acompanhe o progresso e desempenho da sua equipe'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <Shield className="w-16 h-16 text-blue-400" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Safety On
              <span className="text-blue-400"> Demand</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Plataforma completa de treinamentos e gestão de segurança do trabalho.
              Capacite sua equipe com conteúdo de qualidade e mantenha a conformidade
              com as normas OSHA.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 px-8 py-3 text-lg"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-gray-400 text-lg">
            Ferramentas modernas para gestão completa de segurança
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader>
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Pronto para transformar a segurança da sua empresa?
            </h3>
            <p className="text-gray-400 mb-8">
              Junte-se a centenas de empresas que já confiam no Safety On Demand
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Criar Conta Gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
