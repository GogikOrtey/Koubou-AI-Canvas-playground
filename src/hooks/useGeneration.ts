/**
 * Генерация картинки с холста: плейсхолдер, запрос в CloseRouter, подстановка результата.
 * Модель и ключ приходят из App. Пустой ключ допустим: прокси подставляет CLOSEROUTER_API_KEY из .env.
 */
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { CanvasImageData } from "@/lib/types";
import {
  generateId,
  makePlaceholderSVGDataUrl,
  dataUrlToBase64AndMime,
} from "@/lib/utils";
import { getImageModel, MAX_REFERENCE_IMAGES } from "@/lib/models";
import {
  GenerationError,
  generateWithCloseRouter,
  type ReferenceImage,
} from "@/lib/generateImage";

/**
 * Хук генерации: плейсхолдер в центре холста, запрос к модели, замена плейсхолдера картинкой.
 * Ошибку показывает тостом и убирает плейсхолдер. При 401 открывает настройки.
 */
function useGeneration(
  apiKey: string,
  modelId: string,
  setConfigOpen: (open: boolean) => void,
  images: CanvasImageData[],
  setImages: (
    images:
      | CanvasImageData[]
      | ((prev: CanvasImageData[]) => CanvasImageData[])
  ) => void,
  getCurrentCenterPosition: () => { x: number; y: number }
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldBlur, setShouldBlur] = useState(false);
  const generationMapRef = useRef<Record<string, string | number>>({});

  const callGenerateImage = useCallback(
    async (prompt: string, selectedIds: Set<string | number>) => {
      const model = getImageModel(modelId);

      setIsGenerating(true);
      setShouldBlur(true);

      const placeholderId = generateId("placeholder");
      const placeholderSrc = makePlaceholderSVGDataUrl(500, 500);
      const center = getCurrentCenterPosition();
      const placeholderImage: CanvasImageData = {
        id: placeholderId,
        src: placeholderSrc,
        x: center.x - 250,
        y: center.y - 250,
        width: 500,
        height: 500,
        isPlaceholder: true,
        isGenerating: true,
      };

      setImages((prev) => [...prev, placeholderImage]);

      const requestId = generateId("genreq");
      generationMapRef.current[requestId] = placeholderId;

      const dropPlaceholder = () => {
        const placeholderImageId = generationMapRef.current[requestId];
        setImages((prev) => prev.filter((img) => img.id !== placeholderImageId));
        delete generationMapRef.current[requestId];
        setIsGenerating(false);
        setShouldBlur(false);
      };

      try {
        const references: ReferenceImage[] = [];
        for (const id of selectedIds) {
          const srcImage = images.find((im) => im.id === id);
          if (!srcImage) continue;
          const parsed = dataUrlToBase64AndMime(srcImage.src);
          if (!parsed) {
            console.warn("Skipping selected image - not a base64 data URL", id);
            continue;
          }
          references.push({ ...parsed, dataUrl: srcImage.src });
        }

        let usedReferences = references;
        if (references.length > MAX_REFERENCE_IMAGES) {
          usedReferences = references.slice(0, MAX_REFERENCE_IMAGES);
          toast.message(`Using the first ${MAX_REFERENCE_IMAGES} selected images`);
        }

        const dataUrl = await generateWithCloseRouter(
          apiKey,
          model.apiModel,
          prompt,
          usedReferences
        );

        const placeholderImageId = generationMapRef.current[requestId];
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let width: number;
          let height: number;
          const maxSize = 500;

          if (img.width > img.height) {
            width = maxSize;
            height = maxSize / aspectRatio;
          } else {
            height = maxSize;
            width = maxSize * aspectRatio;
          }

          setTimeout(() => {
            setImages((prev) =>
              prev.map((imgObj) =>
                imgObj.id === placeholderImageId
                  ? {
                      ...imgObj,
                      src: dataUrl,
                      width,
                      height,
                      x: center.x - width / 2,
                      y: center.y - height / 2,
                      isPlaceholder: false,
                      isGenerating: false,
                      generationRequestId: undefined,
                    }
                  : imgObj
              )
            );

            setTimeout(() => {
              setShouldBlur(false);
              setIsGenerating(false);
            }, 300);

            delete generationMapRef.current[requestId];
          }, 500);
        };

        img.onerror = (err) => {
          console.error("Failed to load returned image", err);
          dropPlaceholder();
        };
        img.src = dataUrl;
      } catch (err) {
        console.error("Generation error:", err);
        dropPlaceholder();
        if (err instanceof GenerationError && err.status === 401) {
          setConfigOpen(true);
        }
        const message = err instanceof Error ? err.message : "Generation failed";
        toast.error(message);
      }
    },
    [apiKey, modelId, images, getCurrentCenterPosition, setConfigOpen, setImages]
  );

  return { isGenerating, shouldBlur, callGenerateImage };
}

export { useGeneration };
