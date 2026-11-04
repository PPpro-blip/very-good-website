"use client";

import { Icon } from "@/components/ui/Icon";
import { useArcade } from "@/components/shell/ArcadeProvider";
import { audio } from "@/lib/audio";
import { store, useWowStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  slug,
  title,
  className,
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const { favorites } = useWowStore();
  const { toast } = useArcade();
  const active = favorites.includes(slug);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const added = store.toggleFavorite(slug);
        audio.sfx(added ? "coin" : "click");
        toast(added ? "Added to favourites" : "Removed from favourites", title, added ? "good" : "default");
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${title} from favourites` : `Add ${title} to favourites`}
      title={active ? "Remove from favourites" : "Add to favourites"}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border backdrop-blur transition-all duration-300",
        active
          ? "border-arc-pink/60 bg-arc-pink/20 text-arc-pink"
          : "border-white/15 bg-black/30 text-white/60 hover:border-white/35 hover:text-white",
        className,
      )}
    >
      <Icon name="heart" size={14} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
