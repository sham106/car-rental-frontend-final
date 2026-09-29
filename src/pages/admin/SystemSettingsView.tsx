import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Shield,
  Clock,
  Coins,
  FileCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { ADMIN_THEME } from '../../constants/adminTheme';
import { useAdminData } from '../../context/AdminDataContext';
import { list, update } from '../../services/api';

export const SystemSettingsView: React.FC = () => {
  const { refreshAll } = useAdminData();

  // Settings local state with sensible operational defaults
  const [companyName, setCompanyName] = useState('Oceane Car Rental Mauritius Ltd');
  const [brn, setBrn] = useState('C14092817');
  const [vatNumber, setVatNumber] = useState('VAT27192801');
  const [phone, setPhone] = useState('+230 5250 8899');
  const [email, setEmail] = useState('operations@oceanerental.mu');
  const [headquarters, setHeadquarters] = useState('SSR International Airport Hub & Grand Baie Coastal Depot');

  // Policy Settings
  const [defaultDeposit, setDefaultDeposit] = useState(15000);
  const [airportDeliveryFee, setAirportDeliveryFee] = useState(0);
  const [hotelDeliveryFee, setHotelDeliveryFee] = useState(500);
  const [serviceIntervalKm, setServiceIntervalKm] = useState(10000);
  const [complianceNoticeDays, setComplianceNoticeDays] = useState(30);
  const [serviceNoticeDays, setServiceNoticeDays] = useState(14);
  const [serviceNoticeKm, setServiceNoticeKm] = useState(1500);
  const [returnNoticeDays, setReturnNoticeDays] = useState(1);
  const [currencySymbol, setCurrencySymbol] = useState('Rs (MUR)');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState<number | undefined>();
  useEffect(() => {
    list<Record<string, any>>('settings').then(rows => {
      const s = rows[0]; if (!s) return;
      setCompanyName(s.companyName); setBrn(s.brn || ''); setVatNumber(s.vatNumber || '');
      setPhone(s.phone || ''); setEmail(s.email || ''); setHeadquarters(s.headquarters || '');
      setDefaultDeposit(s.defaultDeposit); setAirportDeliveryFee(s.airportDeliveryFee);
      setHotelDeliveryFee(s.hotelDeliveryFee); setServiceIntervalKm(s.serviceIntervalKm);
      setComplianceNoticeDays(s.complianceNoticeDays); setCurrencySymbol(s.currencySymbol);
      setServiceNoticeDays(s.serviceNoticeDays ?? 14); setServiceNoticeKm(s.serviceNoticeKm ?? 1500); setReturnNoticeDays(s.returnNoticeDays ?? 1);
      setVersion(s.version); setLoaded(true);
    }).catch(e => setSaveError(e.message));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSavedSuccess(false); setSaveError('');
    try {
      const result = await update<{version:number}>('settings', 'company', {companyName,brn,vatNumber,phone,email,headquarters,defaultDeposit,airportDeliveryFee,hotelDeliveryFee,serviceIntervalKm,complianceNoticeDays,serviceNoticeDays,serviceNoticeKm,returnNoticeDays,currencySymbol,version});
      setVersion(result.version); setSavedSuccess(true); await refreshAll();
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'Unable to save settings.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            System & Fleet Settings
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Configure enterprise operational parameters, legal credentials, rental policies, and maintenance triggers
          </p>
        </div>
      </div>

      {saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-[#EEF5F1] border border-[#CCE0D5] text-[#24313A] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#4F7D61] flex-shrink-0" />
          <span className="text-xs font-medium">
            Fleet operations settings updated and persisted successfully.
          </span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Company Profile */}
        <div
          className="p-6 rounded-xl border bg-white shadow-2xs space-y-4"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#DCE2E6]">
            <Building className="w-5 h-5 text-[#35658A]" />
            <h2 className="text-base font-semibold text-[#24313A]">
              Corporate & Legal Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">Company Registered Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">Business Registration Number (BRN)</label>
              <input
                type="text"
                value={brn}
                onChange={(e) => setBrn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A] font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">VAT Registration Number</label>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A] font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">Operations Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">Fleet Operations Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">Operational Hub / Base</label>
              <input
                type="text"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A]"
              />
            </div>
          </div>
        </div>

        {/* Rental & Financial Defaults */}
        <div
          className="p-6 rounded-xl border bg-white shadow-2xs space-y-4"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#DCE2E6]">
            <Coins className="w-5 h-5 text-[#35658A]" />
            <h2 className="text-base font-semibold text-[#24313A]">
              Rental Rates & Deposit Defaults
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">Standard Security Deposit (Rs)</label>
              <input
                type="number"
                value={defaultDeposit}
                onChange={(e) => setDefaultDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A]"
              />
              <span className="text-[11px] text-[#65727B] mt-1 block">Held on card during rental handover</span>
            </div>
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">Airport Handover Surcharge (Rs)</label>
              <input
                type="number"
                value={airportDeliveryFee}
                onChange={(e) => setAirportDeliveryFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A]"
              />
              <span className="text-[11px] text-[#65727B] mt-1 block">Free delivery included across airport counter</span>
            </div>
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">Hotel / Resort Delivery Fee (Rs)</label>
              <input
                type="number"
                value={hotelDeliveryFee}
                onChange={(e) => setHotelDeliveryFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A]"
              />
              <span className="text-[11px] text-[#65727B] mt-1 block">Applicable for distant resort deliveries</span>
            </div>
          </div>
        </div>

        {/* Maintenance & Compliance Alerts */}
        <div
          className="p-6 rounded-xl border bg-white shadow-2xs space-y-4"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#DCE2E6]">
            <Shield className="w-5 h-5 text-[#35658A]" />
            <h2 className="text-base font-semibold text-[#24313A]">
              Automated Maintenance & Legal Expiry Triggers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">Scheduled Service Interval (km)</label>
              <input
                type="number"
                value={serviceIntervalKm}
                onChange={(e) => setServiceIntervalKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A]"
              />
              <span className="text-[11px] text-[#65727B] mt-1 block">
                Standard oil, filter & mechanical safety check cycle
              </span>
            </div>
            <div>
              <label className="font-semibold text-[#24313A] block mb-1">
                Compliance Expiry Advance Notice (Days)
              </label>
              <input
                type="number"
                aria-label="Compliance advance notice (days)"
                min={1} max={365} required
                value={complianceNoticeDays}
                onChange={(e) => setComplianceNoticeDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE2E6] text-[#24313A] focus:outline-none focus:border-[#35658A]"
              />
              <span className="text-[11px] text-[#65727B] mt-1 block">
                Flags Fitness, Insurance, MVL and Licence in the action queue
              </span>
            </div>
            <label className="font-semibold text-[#24313A]">Service advance notice (days)
              <input type="number" min={1} max={365} required value={serviceNoticeDays} onChange={e => setServiceNoticeDays(Number(e.target.value))} className="mt-1 block w-full rounded-lg border p-2" />
              <span className="mt-1 block text-[11px] font-normal text-[#65727B]">Warn before the next service date.</span>
            </label>
            <label className="font-semibold text-[#24313A]">Service advance notice (km)
              <input type="number" min={0} max={100000} required value={serviceNoticeKm} onChange={e => setServiceNoticeKm(Number(e.target.value))} className="mt-1 block w-full rounded-lg border p-2" />
              <span className="mt-1 block text-[11px] font-normal text-[#65727B]">Warn when the recorded odometer is within this distance of the next service.</span>
            </label>
            <label className="font-semibold text-[#24313A]">Return advance notice (days)
              <input type="number" min={0} max={30} required value={returnNoticeDays} onChange={e => setReturnNoticeDays(Number(e.target.value))} className="mt-1 block w-full rounded-lg border p-2" />
              <span className="mt-1 block text-[11px] font-normal text-[#65727B]">Covers active rentals and internal assignments.</span>
            </label>
            <p className="text-xs text-[#65727B]">These settings control in-app reminders. Email, SMS and push delivery are not enabled by these settings.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving || !loaded}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Save className="w-4 h-4" />
            <span>Save All System Parameters</span>
          </button>
        </div>
      </form>

    </div>
  );
};
