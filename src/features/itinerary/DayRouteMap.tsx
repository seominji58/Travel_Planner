import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Crosshair,
  ExternalLink,
  Map as MapIcon,
  Navigation,
} from 'lucide-react';
import { DAY_INFO } from '../../data/mockData';
import type { DayNumber, ScheduleItem, ScheduleStatus } from '../../types/travel';
import {
  buildSafeGoogleMapsUrl,
  isValidLatitude,
  isValidLongitude,
} from '../../utils/validation';

interface DayRouteMapProps {
  day: DayNumber;
  items: ScheduleItem[];
  focusedItemId: string | null;
  onSelectItem: (id: string) => void;
}

const STATUS_PIN_COLOR: Record<ScheduleStatus, string> = {
  완료: '#10B981',
  '진행 중': '#1D6FE2',
  예정: '#475569',
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Builds Leaflet popup content strictly with DOM nodes + textContent (zero HTML string injection).
 */
function createSafePopupElement(
  item: ScheduleItem & { lat: number; lng: number },
  stepNumber: number,
  accentColor: string,
): HTMLDivElement {
  const root = document.createElement('div');
  root.style.minWidth = '170px';
  root.style.maxWidth = '220px';

  const metaRow = document.createElement('div');
  metaRow.style.display = 'flex';
  metaRow.style.alignItems = 'center';
  metaRow.style.gap = '6px';
  metaRow.style.marginBottom = '2px';

  const stepSpan = document.createElement('span');
  stepSpan.style.fontSize = '11px';
  stepSpan.style.fontWeight = '800';
  stepSpan.style.color = accentColor;
  stepSpan.textContent = `${stepNumber}번 · ${item.time}`;
  metaRow.appendChild(stepSpan);

  const catSpan = document.createElement('span');
  catSpan.style.fontSize = '10px';
  catSpan.style.fontWeight = '700';
  catSpan.style.padding = '1px 6px';
  catSpan.style.borderRadius = '9999px';
  catSpan.style.background = '#F1F5F9';
  catSpan.style.color = '#475569';
  catSpan.textContent = item.category;
  metaRow.appendChild(catSpan);

  root.appendChild(metaRow);

  const titleEl = document.createElement('div');
  titleEl.style.fontSize = '13px';
  titleEl.style.fontWeight = '800';
  titleEl.style.color = '#0F172A';
  titleEl.textContent = item.title;
  root.appendChild(titleEl);

  if (item.address) {
    const addrEl = document.createElement('div');
    addrEl.style.fontSize = '11px';
    addrEl.style.color = '#475569';
    addrEl.style.marginTop = '3px';
    addrEl.textContent = item.address;
    root.appendChild(addrEl);
  }

  const gpsEl = document.createElement('div');
  gpsEl.style.fontSize = '10px';
  gpsEl.style.fontFamily = 'monospace';
  gpsEl.style.color = '#64748B';
  gpsEl.style.marginTop = '4px';
  gpsEl.textContent = `GPS ${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`;
  root.appendChild(gpsEl);

  const safeUrl = buildSafeGoogleMapsUrl(item.lat, item.lng, item.address ?? item.title);
  if (safeUrl) {
    const linkEl = document.createElement('a');
    linkEl.href = safeUrl;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
    linkEl.style.display = 'inline-block';
    linkEl.style.marginTop = '6px';
    linkEl.style.fontSize = '11px';
    linkEl.style.fontWeight = '700';
    linkEl.style.color = '#1D6FE2';
    linkEl.style.textDecoration = 'none';
    linkEl.textContent = '구글 지도로 길찾기 →';
    root.appendChild(linkEl);
  }

  return root;
}

export function DayRouteMap({
  day,
  items,
  focusedItemId,
  onSelectItem,
}: DayRouteMapProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedCoord, setCopiedCoord] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  const geoItems = useMemo(
    () =>
      items.filter(
        (item): item is ScheduleItem & { lat: number; lng: number } =>
          isValidLatitude(item.lat) && isValidLongitude(item.lng),
      ),
    [items],
  );

  const totalDistanceKm = useMemo(() => {
    if (geoItems.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < geoItems.length; i += 1) {
      sum += haversineKm(
        geoItems[i - 1].lat,
        geoItems[i - 1].lng,
        geoItems[i].lat,
        geoItems[i].lng,
      );
    }
    return sum;
  }, [geoItems]);

  const activeItem = useMemo(() => {
    if (focusedItemId) {
      const found = geoItems.find((item) => item.id === focusedItemId);
      if (found) return found;
    }
    return (
      geoItems.find((item) => item.status === '진행 중') ?? geoItems[0] ?? null
    );
  }, [focusedItemId, geoItems]);

  const activeMapUrl = activeItem
    ? buildSafeGoogleMapsUrl(activeItem.lat, activeItem.lng, activeItem.address ?? activeItem.title)
    : null;

  useEffect(() => {
    if (!copiedCoord) return;
    const timer = window.setTimeout(() => setCopiedCoord(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedCoord]);

  useEffect(() => {
    if (!isExpanded || !mapContainerRef.current) {
      return undefined;
    }

    const map = L.map(mapContainerRef.current, {
      center: [35.6951, 139.75],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = group;

    return () => {
      markersMapRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, [isExpanded]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!isExpanded || !map || !group) return;

    group.clearLayers();
    markersMapRef.current.clear();

    if (geoItems.length === 0) {
      map.setView([35.6895, 139.6917], 11);
      return;
    }

    const latLngs: L.LatLngTuple[] = [];

    geoItems.forEach((item, idx) => {
      const point: L.LatLngTuple = [item.lat, item.lng];
      latLngs.push(point);

      const isFocused = item.id === focusedItemId;
      const bg = STATUS_PIN_COLOR[item.status];
      const pinEl = document.createElement('div');
      pinEl.style.width = '28px';
      pinEl.style.height = '28px';
      pinEl.style.borderRadius = '9999px';
      pinEl.style.background = bg;
      pinEl.style.color = '#ffffff';
      pinEl.style.fontWeight = '800';
      pinEl.style.fontSize = '12px';
      pinEl.style.display = 'flex';
      pinEl.style.alignItems = 'center';
      pinEl.style.justifyContent = 'center';
      pinEl.style.border = '2.5px solid #ffffff';
      pinEl.style.boxShadow =
        isFocused || item.status === '진행 중'
          ? '0 0 0 4px rgba(29,111,226,0.28),0 4px 10px rgba(15,23,42,0.28)'
          : '0 3px 8px rgba(15,23,42,0.24)';
      if (isFocused || item.status === '진행 중') {
        pinEl.style.transform = 'scale(1.12)';
      }
      pinEl.textContent = String(idx + 1);

      const icon = L.divIcon({
        className: 'tp-map-pin',
        html: pinEl,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker(point, { icon }).addTo(group);
      const popupNode = createSafePopupElement(item, idx + 1, bg);
      marker.bindPopup(popupNode, {
        autoPanPaddingTopLeft: L.point(16, 20),
        autoPanPaddingBottomRight: L.point(16, 16),
      });

      marker.on('click', () => {
        onSelectItem(item.id);
      });

      markersMapRef.current.set(item.id, marker);
    });

    if (latLngs.length >= 2) {
      L.polyline(latLngs, {
        color: '#1D6FE2',
        weight: 3,
        opacity: 0.72,
        dashArray: '6 6',
      }).addTo(group);
    }

    if (latLngs.length === 1) {
      map.setView(latLngs[0], 14, { animate: false });
    } else {
      map.fitBounds(L.latLngBounds(latLngs), {
        padding: [34, 34],
        maxZoom: 14,
      });
    }
  }, [geoItems, isExpanded, focusedItemId, onSelectItem]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isExpanded || !map || !focusedItemId) return;

    const target = geoItems.find((item) => item.id === focusedItemId);
    const marker = markersMapRef.current.get(focusedItemId);
    if (!target || !marker) return;

    map.flyTo([target.lat, target.lng], 14, { duration: 0.55 });
    marker.openPopup();
  }, [focusedItemId, geoItems, isExpanded]);

  const handleFitAllBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || geoItems.length === 0) return;
    if (geoItems.length === 1) {
      map.flyTo([geoItems[0].lat, geoItems[0].lng], 14, { duration: 0.45 });
    } else {
      map.fitBounds(
        L.latLngBounds(geoItems.map((item) => [item.lat, item.lng] as L.LatLngTuple)),
        { padding: [34, 34], maxZoom: 14 },
      );
    }
  };

  const handleCopyCoords = async () => {
    if (!activeItem) return;
    const coordText = `${activeItem.lat.toFixed(4)}, ${activeItem.lng.toFixed(4)}`;
    try {
      await navigator.clipboard.writeText(coordText);
      setCopiedCoord(true);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-[var(--color-border)] bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <MapIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[var(--color-text-main)] truncate">
              {DAY_INFO[day].label} 투어 동선 지도
            </p>
            <p className="text-[11px] font-medium text-[var(--color-text-muted)] tabular-nums truncate">
              위치 핀 {geoItems.length}곳
              {totalDistanceKm > 0 ? ` · 직선 약 ${totalDistanceKm.toFixed(1)}km` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isExpanded && geoItems.length > 0 && (
            <button
              type="button"
              onClick={handleFitAllBounds}
              aria-label="전체 동선 한눈에 보기"
              title="전체 동선 한눈에 보기"
              className="inline-flex items-center gap-1 min-h-[32px] px-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-app)] text-[11px] font-semibold text-[var(--color-text-sub)] hover:bg-slate-100 transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
              <span>전체</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="inline-flex items-center gap-1 min-h-[32px] px-2.5 rounded-lg border border-[var(--color-border)] bg-white text-[11px] font-semibold text-[var(--color-text-sub)] hover:bg-slate-50 transition-colors"
          >
            <span>{isExpanded ? '접기' : '지도 보기'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Map Canvas + Active Pin Footer */}
      {isExpanded && (
        <>
          <div className="relative">
            <div
              ref={mapContainerRef}
              aria-label={`${DAY_INFO[day].label} 도쿄 일정 지도`}
              className="h-[248px] w-full"
            />

            {geoItems.length === 0 && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4 text-center">
                <div className="rounded-xl bg-white/95 px-4 py-3 text-xs font-semibold text-[var(--color-text-main)] shadow-md">
                  좌표가 등록된 일정이 없습니다. 일정 추가 시 명소 프리셋이나 좌표를 입력해 보세요.
                </div>
              </div>
            )}
          </div>

          {activeItem && (
            <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-app)] px-3.5 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Navigation
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden="true"
                    />
                    <span className="text-[12.5px] font-bold text-[var(--color-text-main)] truncate">
                      {activeItem.title}
                    </span>
                  </div>
                  {activeItem.address && (
                    <p className="mt-0.5 text-[11.5px] text-[var(--color-text-sub)] truncate">
                      {activeItem.address}
                    </p>
                  )}
                  <p className="mt-0.5 font-mono text-[11px] font-semibold text-[var(--color-text-muted)] tabular-nums">
                    GPS {activeItem.lat.toFixed(4)}, {activeItem.lng.toFixed(4)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleCopyCoords()}
                    aria-label="선택 위치 좌표 복사"
                    className={`inline-flex items-center gap-1 min-h-[32px] px-2 rounded-lg border text-[11px] font-bold transition-colors ${
                      copiedCoord
                        ? 'border-emerald-200 bg-[var(--color-success-soft)] text-[var(--color-success)]'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-sub)] hover:bg-slate-50'
                    }`}
                  >
                    {copiedCoord ? (
                      <>
                        <Check className="w-3 h-3" aria-hidden="true" />
                        <span>복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        <span>좌표</span>
                      </>
                    )}
                  </button>

                  {activeMapUrl && (
                    <a
                      href={activeMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 min-h-[32px] px-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[11px] font-bold text-white transition-colors"
                    >
                      <span>길찾기</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
