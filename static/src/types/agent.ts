export interface Agent {
  id: string;
  creatorId: string;
  name: string;
  prompt: {
    scene?: string;
    agentPersonality?: string;
    userPurchasingPower?: string;
    userConsumptionIntention?: string;
    userConsumptionPhilosophy?: string;
    name?: string;
    buyingPower?: string;
    customerProfile?: string;
    consumptionHabits?: string;
    consumptionConcepts?: string;
  };
  promptText: string | null;
  ratingDimensions: RatingDimension[];
  avatar: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatingDimension {
  keyword: string;
  score: number;
}

export interface AgentListResponse {
  code: number;
  message: string;
  data: {
    list: Agent[];
    total: number;
    page: number;
    pageSize: number;
  };
}
