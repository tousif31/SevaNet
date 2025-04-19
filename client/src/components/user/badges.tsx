import { Badge as BadgeComponent } from "@/components/ui/badge";
import { 
  Award, 
  Star, 
  Trophy, 
  MessageCircle, 
  MessageSquare, 
  CheckCircle, 
  CheckSquare,
  LucideIcon
} from "lucide-react";
import { Badge as BadgeType, badgeDefinitions } from "@shared/schema";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgesProps {
  badges: string[];
  className?: string;
}

// Map badge icons to Lucide components
const iconMap: Record<string, LucideIcon> = {
  'star': Star,
  'award': Award,
  'trophy': Trophy,
  'message-circle': MessageCircle,
  'message-square': MessageSquare,
  'check-circle': CheckCircle,
  'check-square': CheckSquare
};

export function Badges({ badges, className = "" }: BadgesProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <BadgeComponent variant="outline" className="text-gray-400">
          No badges yet
        </BadgeComponent>
      </div>
    );
  }

  // Find badge details for each badge ID
  const badgeDetails = badges.map(badgeId => 
    badgeDefinitions.find(def => def.id === badgeId)
  ).filter(Boolean) as BadgeType[];

  // Sort badges by level (highest first)
  const sortedBadges = [...badgeDetails].sort((a, b) => b.level - a.level);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <TooltipProvider>
        {sortedBadges.map((badge) => {
          const Icon = iconMap[badge.icon] || Star;
          
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div>
                  <BadgeComponent 
                    variant={getBadgeVariant(badge.level)}
                    className="cursor-help"
                  >
                    <Icon className="mr-1 h-3 w-3" />
                    {badge.name}
                  </BadgeComponent>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}

// Helper function to determine badge variant based on level
function getBadgeVariant(level: number): "default" | "secondary" | "destructive" | "outline" {
  switch (level) {
    case 3:
      return "destructive"; // Gold/highest level
    case 2:
      return "secondary"; // Silver/mid level
    case 1:
      return "default"; // Bronze/basic level
    default:
      return "outline"; // Default
  }
}