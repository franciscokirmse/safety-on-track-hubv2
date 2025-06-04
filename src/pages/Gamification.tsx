
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  Award, 
  Target,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import GamificationBadge from '@/components/GamificationBadge';

const Gamification = () => {
  const { user } = useAuth();
  const { gamificationData, loading } = useGamification();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
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
        .limit(20);

      setLeaderboard(data || []);

      // Find user rank
      if (user && data) {
        const rank = data.findIndex((item: any) => item.profiles.email === user.email);
        setUserRank(rank + 1);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const nextLevelPoints = (gamificationData.level) * 100;
  const currentLevelProgress = (gamificationData.points % 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gamificação
          </h1>
          <p className="text-gray-400">
            Acompanhe seu progresso e compete com outros estudantes
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Seu Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Nível {gamificationData.level}</span>
                    <span className="text-blue-400">{gamificationData.points} pontos</span>
                  </div>
                  <Progress 
                    value={currentLevelProgress} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {100 - currentLevelProgress} pontos para o próximo nível
                  </p>
                </div>
                <GamificationBadge 
                  points={gamificationData.points}
                  level={gamificationData.level}
                  badges={gamificationData.badges}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  #{userRank || 'N/A'}
                </div>
                <p className="text-gray-400">Sua posição no ranking</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-400" />
                Sequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {gamificationData.streak_days}
                </div>
                <p className="text-gray-400">Dias consecutivos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Collection */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-400" />
              Suas Medalhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gamificationData.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {gamificationData.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-700 rounded-lg p-3">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-white font-medium capitalize">{badge}</p>
                      <p className="text-xs text-gray-400">Medalha conquistada</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Você ainda não conquistou nenhuma medalha. Continue estudando!</p>
            )}
          </CardContent>
        </Card>

        {/* Points System Info */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-400" />
              Como Ganhar Pontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-2">+10</div>
                <p className="text-white font-medium">Completar Aula</p>
                <p className="text-xs text-gray-400">Termine uma aula completa</p>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-400 mb-2">+50</div>
                <p className="text-white font-medium">Completar Curso</p>
                <p className="text-xs text-gray-400">Finalize um curso inteiro</p>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400 mb-2">+2</div>
                <p className="text-white font-medium">Curtir Vídeo</p>
                <p className="text-xs text-gray-400">Interaja com o conteúdo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Ranking Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((player, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    player.profiles.email === user?.email ? 'bg-blue-900/20 border border-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-600 text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' : 
                      index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{player.profiles.full_name}</p>
                      <p className="text-gray-400 text-sm">Nível {player.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{player.points} pontos</p>
                    <div className="flex space-x-1 justify-end">
                      {player.badges?.slice(0, 3).map((badge: string, badgeIndex: number) => (
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
      </div>
    </div>
  );
};

export default Gamification;
