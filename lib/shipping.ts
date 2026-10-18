/**
 * Internal carrier tracking (FedEx-branded UI).
 * Event list is shown newest-first (FedEx style).
 * Geography: leave a New York FedEx facility → network hubs → customer delivery address.
 */

export type ShipmentEvent = {
  code: string;
  label: string;
  detail: string;
  at: string;
  location?: string;
};

export type DeliveryAddress = {
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postal?: string;
  country?: string;
};

export type ShippingMeta = {
  carrierTracking?: string;
  carrierTrackingIssuedAt?: string;
  shipmentEvents?: ShipmentEvent[];
  deliveryAddress?: DeliveryAddress | null;
  [key: string]: unknown;
};

/** Origin: New York area FedEx Express facility (public-style location). */
export const ORIGIN_FACILITY =
  'FedEx Express, JFK International Airport Cargo, Queens, NY 11430';

export const ORIGIN_CITY = 'Queens, NY';

/** Major network hub often used on eastbound / southbound lanes. */
export const NETWORK_HUB = 'FedEx SuperHub, Memphis, TN 38118';

export type ShipStepCode =
  | 'LABEL'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

/** Admin step buttons (logical stages). */
export const SHIP_STEPS: {
  code: ShipStepCode;
  label: string;
}[] = [
  { code: 'LABEL', label: 'Shipping label created' },
  { code: 'PICKED_UP', label: 'Picked up' },
  { code: 'IN_TRANSIT', label: 'In transit' },
  { code: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { code: 'DELIVERED', label: 'Delivered' },
];

export function formatDeliveryAddress(addr?: DeliveryAddress | null): string {
  if (!addr) return '';
  return [addr.line1, addr.line2, [addr.city, addr.state, addr.postal].filter(Boolean).join(', '), addr.country]
    .filter(Boolean)
    .join(', ');
}

function destCityState(addr?: DeliveryAddress | null): string {
  if (!addr) return 'destination';
  const parts = [addr.city, addr.state].filter(Boolean);
  return parts.length ? parts.join(', ') : formatDeliveryAddress(addr) || 'destination';
}

function localStation(addr?: DeliveryAddress | null): string {
  const place = destCityState(addr);
  if (place === 'destination') return 'Local FedEx station';
  return `FedEx station near ${place}`;
}

export function generateTrackingNumber() {
  const body = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return `7946${body}`;
}

export function parseOrderMeta(raw: string | null | undefined): ShippingMeta {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ShippingMeta;
  } catch {
    return {};
  }
}

export function stringifyOrderMeta(meta: ShippingMeta) {
  return JSON.stringify(meta);
}

function hasCode(events: ShipmentEvent[], code: string) {
  return events.some((e) => e.code === code);
}

/** Build scan events for a stage. Chronological (oldest first in array). UI reverses for FedEx-style display. */
function eventsForStage(
  code: ShipStepCode,
  dest: string,
  addr: DeliveryAddress | null | undefined,
  at: string
): ShipmentEvent[] {
  const city = destCityState(addr);

  switch (code) {
    case 'LABEL':
      return [
        {
          code: 'LABEL',
          label: 'Shipment information sent to FedEx',
          detail: dest
            ? `Label created for delivery to ${dest}.`
            : 'Shipping label created. Tracking number issued.',
          at,
          location: ORIGIN_FACILITY,
        },
      ];
    case 'PICKED_UP':
      return [
        {
          code: 'PICKED_UP',
          label: 'Picked up',
          detail: 'Shipment picked up at FedEx origin facility in New York.',
          at,
          location: ORIGIN_FACILITY,
        },
      ];
    case 'IN_TRANSIT':
      // Multi-hop: leave NY → Memphis hub → toward destination region
      return [
        {
          code: 'IN_TRANSIT_DEPART_ORIGIN',
          label: 'Departed FedEx location',
          detail: 'Left origin facility in New York for the FedEx network.',
          at,
          location: ORIGIN_CITY,
        },
        {
          code: 'IN_TRANSIT_HUB',
          label: 'Arrived at FedEx hub',
          detail: 'Processed at the FedEx SuperHub for sorting toward the destination region.',
          at,
          location: NETWORK_HUB,
        },
        {
          code: 'IN_TRANSIT',
          label: 'In transit',
          detail: dest
            ? `On the way to ${city}. Next stop is the local facility serving the delivery address.`
            : 'On the way to the destination facility.',
          at,
          location: dest ? `En route to ${city}` : 'En route',
        },
      ];
    case 'OUT_FOR_DELIVERY':
      return [
        {
          code: 'AT_LOCAL',
          label: 'At local FedEx facility',
          detail: dest
            ? `Arrived at the facility that serves ${city}.`
            : 'Arrived at the local delivery facility.',
          at,
          location: localStation(addr),
        },
        {
          code: 'OUT_FOR_DELIVERY',
          label: 'Out for delivery',
          detail: dest
            ? `On vehicle for delivery to ${dest}.`
            : 'On vehicle for delivery.',
          at,
          location: dest || localStation(addr),
        },
      ];
    case 'DELIVERED':
      return [
        {
          code: 'DELIVERED',
          label: 'Delivered',
          detail: dest
            ? `Delivered to ${dest}.`
            : 'Delivered. Handover complete.',
          at,
          location: dest || 'Delivery address',
        },
      ];
    default:
      return [];
  }
}

const STAGE_ORDER: ShipStepCode[] = [
  'LABEL',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export function ensureTrackingOnMeta(meta: ShippingMeta, now = new Date()): ShippingMeta {
  if (meta.carrierTracking) return meta;
  const issued = now.toISOString();
  const tracking = generateTrackingNumber();
  const dest = formatDeliveryAddress(meta.deliveryAddress);
  const events = eventsForStage('LABEL', dest, meta.deliveryAddress, issued);
  return {
    ...meta,
    carrierTracking: tracking,
    carrierTrackingIssuedAt: issued,
    shipmentEvents: events,
  };
}

/** Append stage scans through stepCode (includes prior stages if missing). */
export function applyShipStep(
  meta: ShippingMeta,
  stepCode: ShipStepCode,
  now = new Date()
): ShippingMeta {
  let next = ensureTrackingOnMeta(meta, now);
  const events = [...(next.shipmentEvents || [])];
  const dest = formatDeliveryAddress(next.deliveryAddress);
  const iso = now.toISOString();
  const targetIdx = STAGE_ORDER.indexOf(stepCode);
  if (targetIdx < 0) return next;

  for (let i = 0; i <= targetIdx; i++) {
    const stage = STAGE_ORDER[i];
    // IN_TRANSIT expands to multiple codes
    if (stage === 'IN_TRANSIT') {
      if (hasCode(events, 'IN_TRANSIT') || hasCode(events, 'IN_TRANSIT_HUB')) continue;
      events.push(...eventsForStage('IN_TRANSIT', dest, next.deliveryAddress, iso));
      continue;
    }
    if (stage === 'OUT_FOR_DELIVERY') {
      if (hasCode(events, 'OUT_FOR_DELIVERY')) continue;
      events.push(...eventsForStage('OUT_FOR_DELIVERY', dest, next.deliveryAddress, iso));
      continue;
    }
    if (hasCode(events, stage)) continue;
    events.push(...eventsForStage(stage, dest, next.deliveryAddress, iso));
  }

  // Keep chronological order (oldest first); UI shows newest first
  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  // If same timestamp, keep insertion order by stable secondary: LABEL before PICKED_UP etc.
  return { ...next, shipmentEvents: events };
}

export function syncShipmentEvents(
  meta: ShippingMeta,
  orderStatus: string,
  now = new Date()
): ShippingMeta {
  if (orderStatus === 'PAID') return applyShipStep(meta, 'PICKED_UP', now);
  if (orderStatus === 'PROCESSING') return applyShipStep(meta, 'IN_TRANSIT', now);
  if (orderStatus === 'DELIVERED' || orderStatus === 'COLLECTED') {
    return applyShipStep(meta, 'DELIVERED', now);
  }
  return ensureTrackingOnMeta(meta, now);
}

export function currentShipmentStatus(events: ShipmentEvent[] | undefined) {
  if (!events || events.length === 0) return 'Label pending';
  return events[events.length - 1]?.label || 'In progress';
}

export function orderStatusForShipStep(code: ShipStepCode): string {
  switch (code) {
    case 'LABEL':
    case 'PICKED_UP':
      return 'PAID';
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return 'PROCESSING';
    case 'DELIVERED':
      return 'DELIVERED';
    default:
      return 'PAID';
  }
}
