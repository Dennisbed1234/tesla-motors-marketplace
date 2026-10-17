import Link from 'next/link';
import { formatMoney } from '@/lib/utils';

type Props = {
  slug: string;
  model: string;
  trim: string;
  modelYear: number;
  price: number | string;
  currency?: string;
  rangeEpa?: number | null;
  accel060?: string | null;
  inventoryStatus: string;
  condition: string;
  imageUrl?: string | null;
  featured?: boolean;
};

export function VehicleCard(v: Props) {
  const price = Number(v.price);
  const isCatalog = v.inventoryStatus === 'CATALOG_ONLY' || price <= 0;

  return (
    <article className="card group flex flex-col transition hover:border-white/25">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
        {v.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.imageUrl}
            alt={`${v.modelYear} Tesla ${v.model} ${v.trim}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-500">Image unavailable</div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {v.inventoryStatus === 'AVAILABLE' && (
            <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase text-black">
              Available
            </span>
          )}
          {isCatalog && (
            <span className="rounded-full bg-ink-700/90 px-2 py-0.5 text-[10px] font-semibold uppercase text-ink-100">
              Catalog only
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-ink-400">{v.modelYear}</p>
        <h3 className="mt-0.5 text-lg font-semibold tracking-tight">
          {v.model} <span className="font-normal text-ink-300">{v.trim}</span>
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
          {v.rangeEpa ? <span>{v.rangeEpa} mi EPA est.</span> : null}
          {v.accel060 ? <span>0–60 {v.accel060}</span> : null}
        </div>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {isCatalog ? (
              <p className="text-sm text-ink-400">Reference only</p>
            ) : (
              <>
                <p className="text-xs text-ink-400">From</p>
                <p className="text-xl font-semibold">{formatMoney(price, v.currency)}</p>
              </>
            )}
          </div>
          <Link href={`/vehicles/${v.slug}`} className="btn-secondary !px-4 !py-2 text-xs">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
