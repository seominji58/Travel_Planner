import { useEffect, useState } from 'react';
import {
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_HOTEL_TAXI_CARD,
  INITIAL_VOUCHERS,
} from '../../data/mockData';
import type { VoucherItem } from '../../types/travel';
import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
} from '../../utils/storage';
import { sanitizeStoredVouchers } from '../../utils/validation';
import { EmergencyContacts } from './EmergencyContacts';
import { QrVoucherModal } from './QrVoucherModal';
import { TaxiHotelCard } from './TaxiHotelCard';
import { VoucherCardList } from './VoucherCardList';

export function VoucherSosPage({ resetKey }: { resetKey: number }) {
  const [vouchers, setVouchers] = useState<VoucherItem[]>(() =>
    loadFromStorage<VoucherItem[]>(
      STORAGE_KEYS.VOUCHERS,
      INITIAL_VOUCHERS,
      sanitizeStoredVouchers,
    ),
  );
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(
    null,
  );

  useEffect(() => {
    const syncedVouchers = loadFromStorage<VoucherItem[]>(
      STORAGE_KEYS.VOUCHERS,
      INITIAL_VOUCHERS,
      sanitizeStoredVouchers,
    );
    setVouchers(syncedVouchers);
    setSelectedVoucher(null);
  }, [resetKey]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.VOUCHERS, vouchers);
  }, [vouchers]);

  return (
    <div className="space-y-6 pb-4">
      <VoucherCardList vouchers={vouchers} onSelect={setSelectedVoucher} />
      <TaxiHotelCard hotel={INITIAL_HOTEL_TAXI_CARD} />
      <EmergencyContacts contacts={INITIAL_EMERGENCY_CONTACTS} />
      <QrVoucherModal
        voucher={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
      />
    </div>
  );
}
