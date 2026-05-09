export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceCents: number; // amount in cents (¥29 = 2900)
  interval: 'month' | 'year';
  features: string[];
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_monthly',
    name: '月度会员',
    description: '每月 ¥29，随时取消',
    priceCents: 2900,
    interval: 'month',
    features: [
      '解锁所有高级AI工具导航',
      '每日无限次API调用',
      '优先客服支持',
      '专属社区访问权限',
    ],
  },
  {
    id: 'plan_yearly',
    name: '年度会员',
    description: '每年 ¥249，节省约 13%',
    priceCents: 24900,
    interval: 'year',
    features: [
      '解锁所有高级AI工具导航',
      '每日无限次API调用',
      '优先客服支持',
      '专属社区访问权限',
      '早期新功能体验资格',
      '年度会员专属徽章',
    ],
  },
];

export function getPlanById(id: string): SubscriptionPlan | undefined {
  return PLANS.find((plan) => plan.id === id);
}
