import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { Badges } from "./badges";

interface ProfileCardProps {
  user: User;
  className?: string;
}

export function ProfileCard({ user, className = "" }: ProfileCardProps) {
  // Generate avatar fallback from user's initials
  const getInitials = () => {
    if (!user.name) return "U";
    return user.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src="" alt={user.name} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>@{user.username}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Achievements</h4>
            <Badges badges={user.badges as string[] || []} />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <p className="text-2xl font-bold">{user.reportCount || 0}</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user.updateCount || 0}</p>
              <p className="text-xs text-muted-foreground">Updates</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user.completedCount || 0}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}