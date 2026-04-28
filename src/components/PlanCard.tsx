import { Check, ShieldCheck, Cpu } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';

interface PlanCardProps {
  key?: string | number;
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  userId: string;
  userEmail: string;
  onSuccess: (reference: string, planId: string, duration: number, planName: string) => void;
  tierColor: string;
}

export default function PlanCard({ id, name, price, duration, features, userId, userEmail, onSuccess, tierColor }: PlanCardProps) {
  const config = {
    reference: `GYM_${new Date().getTime()}`,
    email: userEmail,
    amount: price * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    metadata: {
      userId,
      planId: id,
      durationDays: duration,
      planName: name,
      custom_fields: [
        { display_name: 'Plan Name',  variable_name: 'plan_name',  value: name },
        { display_name: 'User ID',    variable_name: 'user_id',    value: userId },
        { display_name: 'Duration',   variable_name: 'duration',   value: `${duration} days` },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <div className="group flex flex-col">
      {/* Card Face */}
      <div
        className={`relative rounded-2xl p-6 shadow-lg overflow-hidden transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl ${tierColor} text-white`}
        style={{ aspectRatio: '1.586 / 1' }}
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/40 font-normal mb-0.5">Membership Plan</p>
              <h3 className="text-lg font-medium">{name}</h3>
            </div>
            <Cpu className="w-7 h-7 opacity-20" />
          </div>

          <div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-light">₦{price.toLocaleString()}</span>
              <span className="text-xs text-white/40 font-normal">/ {duration} days</span>
            </div>
            <p className="text-xs text-white/30 font-normal">Iron & Grit Athletics</p>
          </div>
        </div>

        <ShieldCheck className="absolute -bottom-6 -right-6 w-28 h-28 opacity-[0.05] text-white pointer-events-none" />
      </div>

      {/* Features & Button */}
      <div className="mt-5 flex flex-col flex-grow">
        <ul className="space-y-2.5 mb-6 flex-grow">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-600 font-normal">
              <Check className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={() => initializePayment({
            onSuccess: (res: any) => onSuccess(res.reference, id, duration, name),
            onClose: () => {},
          })}
          className="w-full bg-white border border-zinc-200 text-black py-3.5 text-sm font-medium hover:bg-black hover:text-white hover:border-black transition-all rounded-xl"
        >
          Select {name} Plan
        </button>
      </div>
    </div>
  );
}
