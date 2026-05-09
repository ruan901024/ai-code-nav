// AI Tool/Project Types for the navigation site

export interface AITool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  stars: number;
  forks: number;
  language: string | null;
  tags: string[];
  isPremium: boolean; // Requires subscription to view full details
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  toolCount: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: string;
  monthlyPrice: number; // in cents
  yearlyPrice: number; // in cents
  features: string[];
}

export interface ScrapedData {
  tools: AITool[];
  categories: Category[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
