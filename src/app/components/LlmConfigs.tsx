export const LLM_TYPES = [
  "Azure OpenAI",
  "OpenAI",
  "Gemini",
  "Anthropic"
] as const;

export type LLMType = typeof LLM_TYPES[number];

export const DEFAULT_LLM_CONFIGS: Record<LLMType, string> = {
  "Azure OpenAI": `AZURE_OPENAI_API_KEY=<your-azure-openai-api-key>
AZURE_OPENAI_MODEL_NAME=<your-azure-openai-model-name>
AZURE_OPENAI_API_BASE=<your-azure-openai-api-base>
AZURE_OPENAI_API_VERSION=<your-azure-openai-api-version>
AZURE_OPENAI_DEPLOYMENT_NAME=<your-azure-openai-deployment-name>`,

  "OpenAI": `OPENAI_API_KEY=<your-openai-api-key>
OPENAI_MODEL_NAME=<your-openai-model-name>`,

  "Gemini": `GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL_NAME=<your-gemini-model-name>`,

  "Anthropic": `ANTHROPIC_API_KEY=<your-anthropic-api-key>
ANTHROPIC_MODEL_NAME=<your-anthropic-model-name>`
};