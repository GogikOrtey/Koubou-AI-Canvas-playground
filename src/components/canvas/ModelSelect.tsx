/**
 * Выпадающий список моделей картинок.
 * Один и тот же список стоит над полем промпта и в настройках.
 * Значение хранит App и передаёт в генерацию.
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IMAGE_MODELS, modelLabel } from "@/lib/models";

export function ModelSelect({
  value,
  onValueChange,
  className,
  side = "bottom",
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  side?: "top" | "bottom";
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className ?? "w-[420px]"}>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent side={side}>
        {IMAGE_MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {modelLabel(model)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
