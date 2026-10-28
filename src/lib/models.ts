/**
 * Каталог моделей картинок CloseRouter и один ключ на все модели.
 * Имена в apiModel совпадают с GET /v1/media/models у api.closerouter.dev.
 * Ключ из настроек лежит в localStorage. Если поле пустое, прокси берёт CLOSEROUTER_API_KEY из .env.
 */
export type ImageModel = {
  id: string;
  label: string;
  apiModel: string;
  /** Короткий ярус рядом с именем: Flare ближе к Flash, Sunburst ближе к Pro */
  tier?: string;
};

const KEY_STORAGE = "closerouterApiKey";
const MODEL_STORAGE = "modelId";

export const IMAGE_MODELS: ImageModel[] = [
  {
    id: "gpt-image-2.5-flare",
    label: "GPT Image 2.5 Flare",
    tier: "Flash",
    apiModel: "openai/gpt-image-2.5-flare",
  },
  {
    id: "gpt-image-2.5-sunburst",
    label: "GPT Image 2.5 Sunburst",
    tier: "Pro",
    apiModel: "openai/gpt-image-2.5-sunburst",
  },
  {
    id: "gemini-3.1-flash-image-preview",
    label: "Google: Nano Banana 2",
    apiModel: "google/gemini-3.1-flash-image-preview",
  },
  {
    id: "gemini-3-pro-image",
    label: "Google: Nano Banana Pro",
    apiModel: "google/gemini-3-pro-image",
  },
  {
    id: "qwen-image-3.0",
    label: "Qwen: Qwen Image 3.0",
    apiModel: "qwen/qwen-image-3.0",
  },
  {
    id: "qwen-image-3.0-pro",
    label: "Qwen: Qwen Image 3.0 Pro",
    apiModel: "qwen/qwen-image-3.0-pro",
  },
];

export const DEFAULT_MODEL_ID = "gpt-image-2.5-flare";

/** CloseRouter для Flare принимает не больше четырёх референсов */
export const MAX_REFERENCE_IMAGES = 4;

export const CLOSEROUTER_KEY_HELP = {
  title: "CloseRouter API Key",
  href: "https://closerouter.dev/keys",
  note: "One key for every model. An empty field uses CLOSEROUTER_API_KEY from .env",
};

/** Подпись пункта в списке, с ярусом если он задан */
export function modelLabel(model: ImageModel) {
  return model.tier ? `${model.label} (${model.tier})` : model.label;
}

/** Модель по id. Неизвестный id заменяется на Flare */
export function getImageModel(id: string) {
  return (
    IMAGE_MODELS.find((model) => model.id === id) ??
    IMAGE_MODELS.find((model) => model.id === DEFAULT_MODEL_ID)!
  );
}

/**
 * Ключ из настроек. Если его ещё не сохраняли, берёт старые поля OpenAI или Google,
 * куда ключ могли вписать до переключения на CloseRouter.
 */
export function loadApiKey() {
  return (
    localStorage.getItem(KEY_STORAGE) ||
    localStorage.getItem("openaiApiKey") ||
    localStorage.getItem("apiKey") ||
    ""
  );
}

/** Пишет или стирает ключ CloseRouter в localStorage */
export function saveApiKey(value: string) {
  if (value) localStorage.setItem(KEY_STORAGE, value);
  else localStorage.removeItem(KEY_STORAGE);
}

/** Последняя выбранная модель или Flare */
export function loadModelId() {
  const stored = localStorage.getItem(MODEL_STORAGE);
  return stored && IMAGE_MODELS.some((model) => model.id === stored)
    ? stored
    : DEFAULT_MODEL_ID;
}

/** Запоминает выбранную модель */
export function saveModelId(id: string) {
  localStorage.setItem(MODEL_STORAGE, id);
}
