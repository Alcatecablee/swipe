import { Card } from '@/components/ui/card';
import { Lightbulb, TrendingUp, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface SuccessTipsCardProps {
  applicationCount: number;
  conversionRate: number;
  profileCompletionScore: number;
}

export function SuccessTipsCard({ 
  applicationCount, 
  conversionRate, 
  profileCompletionScore 
}: SuccessTipsCardProps) {
  const [, setLocation] = useLocation();

  const tips = [];

  // Profile completion tip
  if (profileCompletionScore < 80) {
    tips.push({
      icon: Target,
      title: 'Complete Your Profile',
      description: `Your profile is ${profileCompletionScore}% complete. Complete profiles get 3x more responses!`,
      action: () => setLocation('/profile'),
      actionText: 'Complete Profile',
    });
  }

  // Conversion rate tip
  if (conversionRate < 15 && applicationCount > 5) {
    tips.push({
      icon: TrendingUp,
      title: 'Be More Selective',
      description: 'Your conversion rate is low. Try swiping right only on jobs that match your skills.',
      action: null,
      actionText: null,
    });
  }

  // Email application tip
  if (applicationCount > 0) {
    tips.push({
      icon: Zap,
      title: 'Use Email Applications',
      description: 'Jobs with "Instant Apply" badge get submitted automatically via email!',
      action: () => setLocation('/app'),
      actionText: 'Find Email Jobs',
    });
  }

  // Default tip
  if (tips.length === 0) {
    tips.push({
      icon: Lightbulb,
      title: 'Start Applying!',
      description: 'Swipe right on 10-20 jobs daily to maximize your chances of landing interviews.',
      action: () => setLocation('/app'),
      actionText: 'Find Jobs',
    });
  }

  const tip = tips[0]; // Show first tip
  const Icon = tip.icon;

  return (
    <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
            {tip.title}
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            {tip.description}
          </p>
          {tip.action && tip.actionText && (
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={tip.action}
            >
              {tip.actionText}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
