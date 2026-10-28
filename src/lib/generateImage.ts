/**
 * Генерация и правка картинок через CloseRouter.
 * Браузер ходит на /api/closerouter, прокси Vite из vite.imageProxy.ts пересылает запрос на api.closerouter.dev.
 * Ответ с b64_json превращается в data URL и уходит на холст в useGeneration.
 */
export type ReferenceImage = {
  mimeType: string;
  base64: string;
  dataUrl: string;
};

export class GenerationError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GenerationError";
    this.status = status;
  }
}

/** Текст ошибки из JSON CloseRouter или сырого ответа */
async function errorMessage(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as {
      error?: { message?: string };
      message?: string;
    };
    return json.error?.message || json.message || text || response.statusText;
  } catch {
    return text || response.statusText;
  }
}

/** Собирает data URL из base64 ответа Images API */
function imageDataUrl(payload: { data?: { b64_json?: string }[] }) {
  const b64 = payload.data?.[0]?.b64_json;
  if (!b64) throw new GenerationError("The model did not return an image");
  return `data:image/png;base64,${b64}`;
}

/**
 * Генерирует или правит картинку выбранной моделью CloseRouter.
 * Без референсов это /images/generations, с референсами multipart /images/edits.
 * Пустой ключ не уходит в заголовок: тогда прокси подставляет ключ из .env.
 */
export async function generateWithCloseRouter(
  apiKey: string,
  apiModel: string,
  prompt: string,
  references: ReferenceImage[]
) {
  const headers: Record<string, string> = {};
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  if (!references.length) {
    const response = await fetch("/api/closerouter/images/generations", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ model: apiModel, prompt, n: 1 }),
      signal: AbortSignal.timeout(180_000),
    });
    if (!response.ok) {
      throw new GenerationError(await errorMessage(response), response.status);
    }
    return imageDataUrl(await response.json());
  }

  const form = new FormData();
  form.append("model", apiModel);
  form.append("prompt", prompt);
  form.append("n", "1");
  references.forEach((image, index) => {
    const bytes = Uint8Array.from(atob(image.base64), (char) => char.charCodeAt(0));
    const extension = image.mimeType.split("/")[1] || "png";
    form.append(
      "image[]",
      new Blob([bytes], { type: image.mimeType }),
      `reference-${index}.${extension}`
    );
  });

  const response = await fetch("/api/closerouter/images/edits", {
    method: "POST",
    headers,
    body: form,
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) {
    throw new GenerationError(await errorMessage(response), response.status);
  }
  return imageDataUrl(await response.json());
}
