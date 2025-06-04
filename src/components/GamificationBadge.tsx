
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, Target } from 'lucide-react';

interface GamificationBadgeProps {
  points: number;
  level: number;
  badges?: string[];
}

const GamificationBadge = ({ points, level, badges = [] }: GamificationBadgeProps) => {
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'learner':
        return <Star className="w-3 h-3" />;
      case 'expert':
        return <Trophy className="w-3 h-3" />;
      case 'achiever':
        return <Award className="w-3 h-3" />;
      default:
        return <Target className="w-3 h-3" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'learner':
        return 'bg-yellow-600';
      case 'expert':
        return 'bg-blue-600';
      case 'achiever':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-600">
        Nível {level}
      </Badge>
      <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-600">
        {points} pts
      </Badge>
      {badges.slice(0, 2).map((badge, index) => (
        <Badge 
          key={index} 
          className={`${getBadgeColor(badge)} text-white flex items-center space-x-1`}
        >
          {getBadgeIcon(badge)}
          <span className="capitalize">{badge}</span>
        </Badge>
      ))}
    </div>
  );
};

export default GamificationBadge;
