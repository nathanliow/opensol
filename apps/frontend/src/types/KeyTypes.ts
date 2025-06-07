export type ApiKeyType = 'helius' | 'openai' | 'birdeye';

export type HeliusApiKeyTiers = 'free' | 'developer' | 'business' | 'professional';
export type BirdeyeApiKeyTiers = 'standard' | 'starter' | 'premium' | 'business' | 'enterprise';

export type ApiKey = {
  key: string;
  tier: HeliusApiKeyTiers | BirdeyeApiKeyTiers | null;
}