import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Check, Users } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ReferralWidgetProps {
  userId: string;
}

export function ReferralWidget({ userId }: ReferralWidgetProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: referralStats } = useQuery({
    queryKey: [`/api/referral-stats/${userId}`],
    enabled: !!userId,
  });

  const referralCode = referralStats?.referralCode || '';
  const totalReferrals = referralStats?.totalReferrals || 0;
  const bonusSwipes = referralStats?.bonusSwipesEarned || 0;

  const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: 'Link copied!',
      description: 'Share it with friends to earn bonus swipes',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Refer Friends
        </h3>
        {totalReferrals > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {totalReferrals} referred
          </div>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share your unique link and earn <strong className="text-primary">+10 swipes</strong> for each friend who joins!
        </p>

        <div className="flex gap-2">
          <div className="flex-1 p-3 bg-background rounded-lg border font-mono text-sm truncate">
            {referralCode || 'Loading...'}
          </div>
          <Button
            onClick={copyToClipboard}
            variant="default"
            size="icon"
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {bonusSwipes > 0 && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              You've earned +{bonusSwipes} bonus swipes! 🎉
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
