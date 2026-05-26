import { Item } from "@/lib/types";
import { Copy, Star } from "lucide-react";
import Link from "next/link";

interface ItemCardProps {
  item: Item;
  showImage?: boolean;
  compact?: boolean;
}

export default function ItemCard({ item, showImage = false, compact = false }: ItemCardProps) {
  return (
    <Link href={`/detail/${item.id}`} className="block">
      <div className="bg-white border border-border rounded-2xl p-4 active:scale-[0.98] transition-transform">
        <div className="flex gap-3">
          {showImage && item.image_url && (
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-soft">
              <img
                src={item.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className={`text-text-primary leading-relaxed ${
                compact ? "text-[13px] line-clamp-2" : "text-[15px] line-clamp-3 font-medium"
              }`}
            >
              {item.content}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[11px] font-semibold text-brand-purple bg-surface-section px-2 py-0.5 rounded">
                {item.category}
              </span>
              {item.content_type === "image" && (
                <span className="text-[11px] text-text-muted">이미지</span>
              )}
              <span className="text-[11px] text-text-muted">{item.created_at}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <button className="p-1.5 text-text-muted hover:text-brand-purple transition-colors">
              <Star size={16} strokeWidth={1.5} />
            </button>
            <button
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(item.content);
              }}
            >
              <Copy size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
