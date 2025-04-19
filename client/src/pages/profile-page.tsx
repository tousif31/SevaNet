import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ProfileCard } from "@/components/user/profile-card";
import { badgeDefinitions, Badge as BadgeType } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

// Helper function to get the correct count property based on badge type
function getUserCountForBadgeType(user: any, type: 'reports' | 'updates' | 'completed'): number {
  if (!user) return 0;
  
  switch (type) {
    case 'reports':
      return user.reportCount || 0;
    case 'updates':
      return user.updateCount || 0;
    case 'completed':
      return user.completedCount || 0;
    default:
      return 0;
  }
}

export default function ProfilePage(): React.ReactElement {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userReports, isLoading: isReportsLoading } = useQuery({
    queryKey: ['/api/reports/user'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!user,
  });

  if (isLoading || isReportsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  // Find the next badges the user can earn
  const earnedBadgeIds = user.badges as string[] || [];
  const nextBadges = badgeDefinitions
    .filter(badge => !earnedBadgeIds.includes(badge.id))
    .sort((a, b) => {
      // Sort by type and then by count (ascending)
      if (a.criteria.type === b.criteria.type) {
        return a.criteria.count - b.criteria.count;
      }
      return a.criteria.type.localeCompare(b.criteria.type);
    })
    .slice(0, 3); // Show up to 3 next badges

  // Group earned badges by type
  const earnedBadges = earnedBadgeIds
    .map(id => badgeDefinitions.find(b => b.id === id))
    .filter(Boolean) as BadgeType[];
  
  const reportBadges = earnedBadges.filter(b => b.criteria.type === 'reports');
  const updateBadges = earnedBadges.filter(b => b.criteria.type === 'updates');
  const completedBadges = earnedBadges.filter(b => b.criteria.type === 'completed');

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProfileCard user={user} />
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>
                Badges you've earned for your civic contributions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {earnedBadges.length === 0 ? (
                <p className="text-muted-foreground italic">
                  You haven't earned any badges yet. Start by reporting civic issues!
                </p>
              ) : (
                <>
                  {reportBadges.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm mb-2">Reporting Badges</h3>
                      <div className="flex flex-wrap gap-2">
                        {reportBadges.map(badge => (
                          <div key={badge.id} className="bg-muted rounded-md p-3 flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <span className="text-primary text-lg">🏆</span>
                            </div>
                            <div>
                              <p className="font-medium">{badge.name}</p>
                              <p className="text-sm text-muted-foreground">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {updateBadges.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm mb-2">Engagement Badges</h3>
                      <div className="flex flex-wrap gap-2">
                        {updateBadges.map(badge => (
                          <div key={badge.id} className="bg-muted rounded-md p-3 flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <span className="text-primary text-lg">💬</span>
                            </div>
                            <div>
                              <p className="font-medium">{badge.name}</p>
                              <p className="text-sm text-muted-foreground">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {completedBadges.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm mb-2">Resolution Badges</h3>
                      <div className="flex flex-wrap gap-2">
                        {completedBadges.map(badge => (
                          <div key={badge.id} className="bg-muted rounded-md p-3 flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <span className="text-primary text-lg">✅</span>
                            </div>
                            <div>
                              <p className="font-medium">{badge.name}</p>
                              <p className="text-sm text-muted-foreground">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Next Badges to Earn</CardTitle>
              <CardDescription>
                Keep contributing to unlock these achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nextBadges.length === 0 ? (
                <p className="text-muted-foreground italic">
                  Congratulations! You've earned all available badges.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {nextBadges.map(badge => (
                    <div key={badge.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
                        {badge.criteria.type === 'reports' && <span className="text-2xl">🏆</span>}
                        {badge.criteria.type === 'updates' && <span className="text-2xl">💬</span>}
                        {badge.criteria.type === 'completed' && <span className="text-2xl">✅</span>}
                      </div>
                      <h3 className="font-medium text-center mb-1">{badge.name}</h3>
                      <p className="text-sm text-center text-muted-foreground">{badge.description}</p>
                      
                      <div className="mt-4">
                        <div className="bg-muted h-2 rounded-full w-full overflow-hidden">
                          <div 
                            className="bg-primary h-full"
                            style={{ 
                              width: `${Math.min(
                                100, 
                                (getUserCountForBadgeType(user, badge.criteria.type) / badge.criteria.count) * 100
                              )}%` 
                            }}
                          />
                        </div>
                        <p className="text-xs text-center mt-1">
                          {getUserCountForBadgeType(user, badge.criteria.type)} / {badge.criteria.count}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}