import { MembershipPlan } from './types';

export const PLANS: MembershipPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 5000,
    durationDays: 30,
    description: 'Perfect for beginners starting their fitness journey.',
    features: [
      'Access to gym equipment',
      'Locker room access',
      'Free water refill'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Athlete',
    price: 15000,
    durationDays: 90,
    description: 'For dedicated athletes who want more.',
    features: [
      'Everything in Starter',
      'Access to sauna',
      '1 Free personal training session',
      'Priority support'
    ]
  },
  {
    id: 'elite',
    name: 'Elite Performance',
    price: 50000,
    durationDays: 365,
    description: 'The ultimate commitment to your health.',
    features: [
      'Everything in Pro',
      'Unlimited group classes',
      'Nutrition planning',
      'Free gym merch'
    ]
  }
];
