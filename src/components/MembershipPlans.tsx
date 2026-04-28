import PlanCard from './PlanCard';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 5000,
    duration: 30,
    features: ['Standard Gym Access', 'Locker Room Access', 'Basic Performance Tracking'],
    tierColor: 'bg-zinc-400',
  },
  {
    id: 'pro',
    name: 'Pro Athlete',
    price: 15000,
    duration: 90,
    features: ['24/7 Facility Access', 'Personal Coaching Session', 'Recovery Suite (Sauna)', 'Nutrition Strategy'],
    tierColor: 'bg-amber-600',
  },
  {
    id: 'elite',
    name: 'Elite Member',
    price: 50000,
    duration: 365,
    features: ['All Pro Benefits', 'VIP Lounge Access', 'Unlimited Guest Passes', 'Dedicated Support'],
    tierColor: 'bg-black',
  },
];

interface MembershipPlansProps {
  userId: string;
  userEmail: string;
  onPaymentSuccess: (reference: string, planId: string, duration: number, planName: string) => void;
}

export default function MembershipPlans({ userId, userEmail, onPaymentSuccess }: MembershipPlansProps) {
  return (
    <div className="space-y-16 animate-in fade-in duration-1000 max-w-6xl">
      <div className="max-w-xl">
        <h2 className="text-4xl font-light tracking-tight text-black mb-4">Choose Your Access Level</h2>
        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
          Select the membership tier that aligns with your fitness goals. Each plan provides unique benefits and exclusive access to our world-class facilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            id={plan.id}
            name={plan.name}
            price={plan.price}
            duration={plan.duration}
            features={plan.features}
            tierColor={plan.tierColor}
            userId={userId}
            userEmail={userEmail}
            onSuccess={onPaymentSuccess}
          />
        ))}
      </div>

      {/* Trust Badges / Footer Info */}
       <div className="pt-10 border-t border-zinc-100 flex flex-col md:flex-row gap-12 justify-between items-center opacity-40">
        <div className="flex gap-8">
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-zinc-200 rounded-full" />
             <span className="text-[10px] font-bold">Secure Checkout</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-zinc-200 rounded-full" />
             <span className="text-[10px] font-bold">Instant Activation</span>
           </div>
        </div>
        <p className="text-[9px] font-bold">Authorized Payment Partner: Paystack</p>
      </div>
    </div>
  );
}
