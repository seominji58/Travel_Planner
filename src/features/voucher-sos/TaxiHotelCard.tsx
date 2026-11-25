import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Check,
  Copy,
  ExternalLink,
  MapPin,
  Maximize2,
  Phone,
  X,
} from 'lucide-react';
import type { HotelTaxiCardData } from '../../types/travel';
import { buildSafeGoogleMapsUrl, sanitizeTelHref } from '../../utils/validation';

async function copyTextSafely(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function createHotelPopupNode(nameJa: string, nameKo: string): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.style.fontSize = '12px';
  wrap.style.fontWeight = '700';
  wrap.style.color = '#0F172A';
  wrap.textContent = nameJa;

  const sub = document.createElement('div');
  sub.style.fontSize = '11px';
  sub.style.fontWeight = '500';
  sub.style.color = '#475569';
  sub.style.marginTop = '2px';
  sub.textContent = nameKo;
  wrap.appendChild(sub);

  return wrap;
}

export function TaxiHotelCard({ hotel }: { hotel: HotelTaxiCardData }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const miniMapRef = useRef<HTMLDivElement | null>(null);

  const telHref = sanitizeTelHref(hotel.phone);
  const googleMapsUrl = buildSafeGoogleMapsUrl(hotel.lat, hotel.lng, hotel.nameJa);

  useEffect(() => {
    if (!miniMapRef.current) return undefined;

    const map = L.map(miniMapRef.current, {
      center: [hotel.lat, hotel.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OSM',
    }).addTo(map);

    const pinNode = document.createElement('div');
    pinNode.style.width = '30px';
    pinNode.style.height = '30px';
    pinNode.style.borderRadius = '9999px';
    pinNode.style.background = '#0D9488';
    pinNode.style.color = '#ffffff';
    pinNode.style.fontWeight = '900';
    pinNode.style.fontSize = '13px';
    pinNode.style.display = 'flex';
    pinNode.style.alignItems = 'center';
    pinNode.style.justifyContent = 'center';
    pinNode.style.border = '3px solid #ffffff';
    pinNode.style.boxShadow = '0 4px 12px rgba(15,23,42,0.35)';
    pinNode.textContent = 'H';

    const hotelPin = L.divIcon({
      className: 'tp-map-pin',
      html: pinNode,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    L.marker([hotel.lat, hotel.lng], { icon: hotelPin })
      .addTo(map)
      .bindPopup(createHotelPopupNode(hotel.nameJa, hotel.nameKo));

    return () => {
      map.remove();
    };
  }, [hotel.lat, hotel.lng, hotel.nameJa, hotel.nameKo]);

  useEffect(() => {
    if (!copiedAddress) {
      return undefined;
    }
    const timer = window.setTimeout(() => setCopiedAddress(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedAddress]);

  useEffect(() => {
    if (!isFullscreen) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const handleCopyJapaneseAddress = async () => {
    const ok = await copyTextSafely(`${hotel.nameJa} ${hotel.addressJa}`);
    if (ok) {
      setCopiedAddress(true);
    }
  };

  return (
    <section aria-labelledby="taxi-card-heading">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="taxi-card-heading"
          className="text-[17px] font-bold text-[var(--color-text-main)] tracking-tight"
        >
          현지어 택시 카드
        </h2>
        <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
          기사님 제시용
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-white shadow-xs">
        {/* Dark Navy Header */}
        <div className="bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between gap-2">
          <p className="text-xs font-bold leading-snug tracking-tight">
            🚕 기사님께 보여주세요 · <span className="font-jp">タクシー運転手様へ</span>
          </p>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="현지어 택시 카드 크게 보기"
            className="min-h-[36px] shrink-0 inline-flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 active:bg-white/25"
          >
            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>크게 보기</span>
          </button>
        </div>

        {/* High-Contrast White Body */}
        <div className="p-5">
          <p className="font-jp text-2xl font-black text-[#0F172A] leading-tight tracking-tight">
            {hotel.nameJa}
          </p>
          <p className="mt-1 font-jp text-xs font-medium text-[var(--color-text-sub)]">
            {hotel.readingJa}
          </p>

          <div className="mt-3.5 font-jp text-[15px] font-bold text-[#0F172A] bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
            {hotel.addressJa}
          </div>

          <p className="mt-2.5 text-xs font-medium text-[var(--color-text-sub)]">
            {hotel.nameKo} · {hotel.addressKo}
          </p>
          <p className="mt-1 flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--color-text-muted)] tabular-nums">
            <MapPin className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
            <span>
              GPS {hotel.lat.toFixed(4)}, {hotel.lng.toFixed(4)}
            </span>
          </p>

          {/* Embedded Interactive Hotel Mini-Map */}
          <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border)]">
            <div
              ref={miniMapRef}
              aria-label="신주쿠 프린스 호텔 위치 지도"
              className="h-[150px] w-full"
            />
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleCopyJapaneseAddress()}
              aria-label="일본어 주소 복사"
              className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors ${
                copiedAddress
                  ? 'border-emerald-200 bg-[var(--color-success-soft)] text-[var(--color-success)]'
                  : 'border-[var(--color-border)] bg-white text-[var(--color-text-main)] hover:bg-slate-50 active:bg-slate-100'
              }`}
            >
              {copiedAddress ? (
                <>
                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0 text-[var(--color-text-sub)]" aria-hidden="true" />
                  <span>일본어 주소 복사</span>
                </>
              )}
            </button>

            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="구글 지도에서 호텔 위치 보기"
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-3 text-xs font-bold text-white transition-colors"
              >
                <span>구글 지도 길찾기</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </a>
            )}
          </div>

          <a
            href={telHref}
            aria-label={`호텔 전화 연결 (${hotel.phone})`}
            className="mt-2 min-h-[42px] w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary-soft)] px-3 text-xs font-bold text-[var(--color-primary)] transition-colors hover:bg-[#DCEAFE] active:bg-[#CFE3FD]"
          >
            <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>호텔 프론트 전화 ({hotel.phone})</span>
          </a>
        </div>
      </div>

      {/* Fullscreen Ultra-High-Contrast Modal */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="taxi-fullscreen-title"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0F172A] text-white p-5 overflow-y-auto"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-jp text-sm font-bold text-amber-300">
                🚕 タクシー運転手様へ
              </p>
              <p
                id="taxi-fullscreen-title"
                className="text-xs font-medium text-slate-300 mt-0.5"
              >
                운전기사님께 이 화면을 보여주세요
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="택시 카드 크게 보기 닫기"
              className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <div className="my-6 rounded-[20px] bg-white p-6 text-[#0F172A] shadow-2xl">
            <span className="inline-flex items-center rounded-full bg-[#0F172A] px-3 py-1 font-jp text-xs font-bold text-white">
              ここへお願いします (이곳으로 가주세요)
            </span>

            <p className="mt-4 font-jp text-3xl sm:text-4xl font-black leading-tight tracking-tight text-[#0F172A] break-keep">
              {hotel.nameJa}
            </p>
            <p className="mt-2 font-jp text-sm font-semibold text-slate-600">
              {hotel.readingJa}
            </p>

            <div className="mt-5 rounded-2xl border-2 border-slate-300 bg-slate-100 p-4 font-jp text-xl font-bold leading-relaxed text-[#0F172A]">
              {hotel.addressJa}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
              <span className="text-xs font-semibold text-slate-600">
                {hotel.nameKo} · GPS {hotel.lat.toFixed(4)}, {hotel.lng.toFixed(4)}
              </span>
              <span className="font-mono text-sm font-extrabold text-[#0F172A] tabular-nums">
                TEL {hotel.phone}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pb-1">
            <p className="text-center text-xs font-medium text-slate-300">
              운전기사님께 이 화면을 보여주세요
            </p>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="w-full h-12 rounded-xl bg-white text-[15px] font-extrabold text-[#0F172A] transition-colors hover:bg-slate-100 active:bg-slate-200"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
