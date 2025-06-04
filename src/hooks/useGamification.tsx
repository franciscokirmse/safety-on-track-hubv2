
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GamificationData {
  points: number;
  level: number;
  badges: string[];
  achievements: string[];
  streak_days: number;
}

export const useGamification = () => {
  const { user } = useAuth();
  const [gamificationData, setGamificationData] = useState<GamificationData>({
    points: 0,
    level: 1,
    badges: [],
    achievements: [],
    streak_days: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGamificationData();
    }
  }, [user]);

  const fetchGamificationData = async () => {
    try {
      const { data, error } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching gamification data:', error);
        return;
      }

      if (data) {
        setGamificationData({
          points: data.points || 0,
          level: data.level || 1,
          badges: data.badges || [],
          achievements: data.achievements || [],
          streak_days: data.streak_days || 0
        });
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardPoints = async (points: number, activityType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('award_points', {
          p_user_id: user.id,
          p_points: points,
          p_activity_type: activityType
        });

      if (error) {
        console.error('Error awarding points:', error);
        return;
      }

      // Refresh gamification data
      await fetchGamificationData();
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  return {
    gamificationData,
    loading,
    awardPoints,
    refreshData: fetchGamificationData
  };
};
