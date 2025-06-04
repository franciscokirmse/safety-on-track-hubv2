
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Play, Share2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ShortVideos = () => {
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const { toast } = useToast();
  const [videos, setVideos] = useState([]);
  const [userLikes, setUserLikes] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
    if (user) {
      fetchUserLikes();
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('short_videos')
        .select(`
          *,
          profiles!short_videos_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const likedVideoIds = new Set(data?.map(like => like.video_id) || []);
      setUserLikes(likedVideoIds);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const toggleLike = async (videoId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir vídeos",
        variant: "destructive"
      });
      return;
    }

    try {
      const isLiked = userLikes.has(videoId);
      
      if (isLiked) {
        // Remove like
        await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);
        
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
      } else {
        // Add like
        await supabase
          .from('video_likes')
          .insert({
            user_id: user.id,
            video_id: videoId
          });
        
        setUserLikes(prev => new Set([...prev, videoId]));
        
        // Award points for liking video
        await awardPoints(2, 'video_liked');
        
        toast({
          title: "Curtiu! ❤️",
          description: "Você ganhou 2 pontos por curtir este vídeo.",
        });
      }

      // Update video likes count in UI
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, likes_count: video.likes_count + (isLiked ? -1 : 1) }
          : video
      ));

    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Erro",
        description: "Erro ao curtir vídeo",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071a3f' }}>
        <div style={{ color: '#f2f2f2' }} className="text-lg">Carregando vídeos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071a3f' }}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-center" style={{ color: '#f2f2f2' }}>
            Vídeos Curtos
          </h1>
          <p className="text-sm text-gray-400 text-center">
            Aprenda segurança de forma rápida
          </p>
        </div>

        {/* Videos Feed */}
        <div className="space-y-1">
          {videos.map((video) => (
            <div key={video.id} className="relative h-screen flex items-center">
              <Card className="w-full bg-gray-900 border-gray-700 rounded-none">
                <CardContent className="p-0 relative">
                  {/* Video Player */}
                  <div className="aspect-[9/16] bg-black flex items-center justify-center">
                    <iframe
                      src={video.url_vimeo?.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex justify-between items-end">
                      {/* Video Info */}
                      <div className="flex-1 pr-4">
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            {video.profiles?.full_name || 'Instrutor'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleLike(video.id)}
                          className={`rounded-full ${
                            userLikes.has(video.id) 
                              ? 'text-red-500 bg-red-500/20' 
                              : 'text-white bg-black/20'
                          } hover:bg-red-500/30`}
                        >
                          <Heart 
                            className={`w-6 h-6 ${userLikes.has(video.id) ? 'fill-current' : ''}`} 
                          />
                        </Button>
                        <span className="text-white text-sm text-center">
                          {video.likes_count || 0}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-white bg-black/20 hover:bg-gray-500/30"
                        >
                          <Share2 className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-screen text-center">
            <Play className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              Nenhum vídeo disponível
            </h3>
            <p className="text-gray-500">
              Novos vídeos em breve!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortVideos;
