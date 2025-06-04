import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Plus,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ReportIncidentModal from '@/components/ReportIncidentModal';

const Incidents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles:reported_by(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Erro ao carregar incidentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'alta':
        return 'bg-red-900/20 text-red-400';
      case 'média':
        return 'bg-yellow-900/20 text-yellow-400';
      case 'baixa':
        return 'bg-green-900/20 text-green-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberto':
        return 'bg-red-900/20 text-red-400';
      case 'em investigação':
        return 'bg-yellow-900/20 text-yellow-400';
      case 'resolvido':
      case 'fechado':
        return 'bg-green-900/20 text-green-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  const getInjuryTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ferimento leve':
        return 'bg-orange-900/20 text-orange-400';
      case 'ferimento grave':
        return 'bg-red-900/20 text-red-400';
      case 'sem ferimento':
      case 'quase acidente':
        return 'bg-blue-900/20 text-blue-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071a3f' }}>
        <div style={{ color: '#f2f2f2' }} className="text-lg">Carregando incidentes...</div>
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
                <h1 className="text-2xl font-bold text-white">Incidentes</h1>
                <p className="text-sm text-gray-400">Rastreamento e gerenciamento de incidentes de segurança</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowReportModal(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Relatar Incidente
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{incidents.length}</div>
                <div className="text-sm text-gray-400">Total de Incidentes</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {incidents.filter(i => i.status === 'Em investigação').length}
                </div>
                <div className="text-sm text-gray-400">Em Investigação</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {incidents.filter(i => i.status === 'Aberto').length}
                </div>
                <div className="text-sm text-gray-400">Abertos</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {incidents.filter(i => ['Resolvido', 'Fechado'].includes(i.status)).length}
                </div>
                <div className="text-sm text-gray-400">Resolvidos</div>
              </CardContent>
            </Card>
          </div>

          {/* Incidents List */}
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                      <span className="text-white">{incident.title}</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                      <Badge className={getInjuryTypeColor(incident.injury_type)}>
                        {incident.injury_type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">{incident.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Data:</span>
                      <span className="text-white">
                        {new Date(incident.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Local:</span>
                      <span className="text-white">{incident.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Reportado por:</span>
                      <span className="text-white">{incident.profiles?.full_name}</span>
                    </div>
                  </div>

                  {incident.photo_url && (
                    <div className="mt-4">
                      <img 
                        src={incident.photo_url} 
                        alt="Foto do incidente" 
                        className="w-full max-w-lg rounded-lg mx-auto"
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      Atualizar Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {incidents.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  Nenhum incidente reportado
                </h3>
                <p className="text-gray-500">
                  Os incidentes reportados aparecerão aqui
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ReportIncidentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onIncidentReported={fetchIncidents}
      />
    </div>
  );
};

export default Incidents;
