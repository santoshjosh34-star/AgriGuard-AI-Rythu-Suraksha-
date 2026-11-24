import { useEffect, useState } from 'react';
import { Check, LocateFixed, Loader2, MapPin, PauseCircle, ShieldCheck } from 'lucide-react';
import {
  INDIAN_LOCATION_PRESETS,
  findLocationPresetMatch,
  localizeCropsList,
  localizeDrainageType,
  localizeFarmerName,
  localizeGrowthStage,
  localizeLocationText,
  localizeSoilType,
} from '../lib/domainTranslations';
import { formatGpsCoordinates } from '../lib/profileLocationUtils';
import { TRANSLATIONS } from '../lib/translations';
import type { FarmerProfile, GrowthStage, Language, SoilType } from '../types/agriguard';
import { ProfilePhotoControls } from './ProfilePhotoControls';

interface MyFarmViewProps {
  farmer: FarmerProfile;
  language: Language;
  isAcquiringGps: boolean;
  gpsErrorMessage: string | null;
  onEnableLiveGps: () => void;
  onStopLiveGps: () => void;
  onUpdatePhoto: (dataUrl: string | null) => void;
  onSaveProfile: (updated: FarmerProfile) => void;
}

const SOIL_OPTIONS: SoilType[] = [
  'Alluvial',
  'Black Cotton (Vertisol)',
  'Red Loamy',
  'Coastal Sandy',
  'Clayey',
  'Unknown',
];

const GROWTH_STAGE_OPTIONS: GrowthStage[] = [
  'Nursery / Sowing',
  'Vegetative',
  'Tillering / Branching',
  'Flowering / Panicle Initiation',
  'Grain Filling / Pod Development',
  'Maturity / Pre-Harvest',
];

const DRAINAGE_OPTIONS: FarmerProfile['drainageType'][] = [
  'Natural Slope',
  'Low-Lying / Basin',
  'Raised Bunds',
  'Unknown',
];

const FARMER_IMG = '/src/assets/images/farmer_avatar_default_1795354948454.jpg';

export function MyFarmView({
  farmer,
  language,
  isAcquiringGps,
  gpsErrorMessage,
  onEnableLiveGps,
  onStopLiveGps,
  onUpdatePhoto,
  onSaveProfile,
}: MyFarmViewProps) {
  const dict = TRANSLATIONS[language];
  const [form, setForm] = useState<FarmerProfile>(() => ({
    ...farmer,
    name: localizeFarmerName(farmer.name, language),
    state: localizeLocationText(farmer.state, language),
    district: localizeLocationText(farmer.district, language),
    location: localizeLocationText(farmer.location, language),
  }));
  const [cropsInput, setCropsInput] = useState(() =>
    localizeCropsList(farmer.crops, language).join(', ')
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedNotice, setSavedNotice] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  // Sync localized labels when language changes (preserving any custom user input not in known dictionary)
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: localizeFarmerName(prev.name, language),
      state: localizeLocationText(prev.state, language),
      district: localizeLocationText(prev.district, language),
      location: localizeLocationText(prev.location, language),
      preferredLanguage: language,
    }));
    setCropsInput((prev) =>
      localizeCropsList(
        prev
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        language
      ).join(', ')
    );
  }, [language]);

  // Sync location, photo, and GPS fields when updated externally by live GPS or photo controls
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      state: localizeLocationText(farmer.state, language),
      district: localizeLocationText(farmer.district, language),
      location: localizeLocationText(farmer.location, language),
      profilePhotoDataUrl: farmer.profilePhotoDataUrl,
      gpsCoordinates: farmer.gpsCoordinates,
      liveLocationEnabled: farmer.liveLocationEnabled,
    }));
    setAvatarFailed(false);
  }, [
    farmer.state,
    farmer.district,
    farmer.location,
    farmer.profilePhotoDataUrl,
    farmer.gpsCoordinates,
    farmer.liveLocationEnabled,
    language,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = dict.myFarm.errName;
    if (!form.state.trim()) nextErrors.state = dict.myFarm.errState;
    if (!form.district.trim()) nextErrors.district = dict.myFarm.errDistrict;
    if (!form.location.trim()) nextErrors.location = dict.myFarm.errLocation;

    const parsedCrops = cropsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsedCrops.length === 0) nextErrors.crops = dict.myFarm.errCrops;

    if (Number.isNaN(form.farmSizeAcres) || form.farmSizeAcres <= 0 || form.farmSizeAcres > 2000) {
      nextErrors.farmSizeAcres = dict.myFarm.errSize;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSavedNotice(false);
      return;
    }

    setErrors({});
    const updated: FarmerProfile = {
      ...form,
      name: form.name.trim(),
      state: form.state.trim(),
      district: form.district.trim(),
      location: form.location.trim(),
      crops: parsedCrops,
    };
    onSaveProfile(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const activePresetId =
    findLocationPresetMatch({
      state: form.state,
      district: form.district,
      location: form.location,
    })?.id ?? '';

  const handleQuickPresetChange = (presetId: string) => {
    const preset = INDIAN_LOCATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setForm((prev) => ({
      ...prev,
      state: preset.state[language],
      district: preset.district[language],
      location: preset.location[language],
      drainageType: preset.drainageType,
      nearCoastOrRiver: preset.nearCoastOrRiver,
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-8">
        <div className="border-b border-[#C5D9C8] pb-4">
          <h2 className="font-display text-xl font-semibold text-[#14291D]">
            {dict.nav['my-farm']}
          </h2>
          <p className="mt-1 text-sm text-[#355240]">{dict.myFarm.subtitle}</p>
        </div>

        {/* Live Device GPS Tracking Panel */}
        <div
          data-testid="my-farm-gps-panel"
          className="mt-5 rounded-lg border border-[#B5CEBA] bg-[#D8E7DA] p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#143D2B]">
                <LocateFixed className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{dict.myFarm.gpsSectionTitle}</span>
                {farmer.liveLocationEnabled && farmer.gpsCoordinates && (
                  <span className="rounded-xs bg-[#C9E7D0] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#143D2B]">
                    {dict.overview.gpsActiveBadge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#355240]">
                {dict.myFarm.gpsSectionDesc}
              </p>

              {isAcquiringGps && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#143D2B]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  <span>{dict.myFarm.gpsAcquiringStatus}</span>
                </p>
              )}

              {farmer.gpsCoordinates && !isAcquiringGps && (
                <p
                  data-testid="gps-coordinates-readout"
                  className="mt-2 font-mono text-xs text-[#14291D]"
                >
                  {formatGpsCoordinates(
                    farmer.gpsCoordinates.lat,
                    farmer.gpsCoordinates.lon,
                    language
                  )}
                  {farmer.gpsCoordinates.accuracyM !== undefined
                    ? ` · ${dict.myFarm.gpsAccuracyPrefix}${Math.round(
                        farmer.gpsCoordinates.accuracyM
                      )} ${language === 'hi' || language === 'te' ? (language === 'hi' ? 'मी.' : 'మీ.') : 'm'}`
                    : ''}
                  {farmer.gpsCoordinates.resolvedLabel
                    ? ` · ${localizeLocationText(farmer.gpsCoordinates.resolvedLabel, language)}`
                    : ''}
                </p>
              )}

              {gpsErrorMessage && (
                <p
                  data-testid="my-farm-gps-error"
                  className="mt-2 rounded-md border border-[#F5C2C7] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]"
                >
                  {gpsErrorMessage}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                data-testid="my-farm-allow-gps-btn"
                disabled={isAcquiringGps}
                onClick={onEnableLiveGps}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-[#143D2B] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#0F2D20] disabled:opacity-60 whitespace-nowrap"
              >
                {isAcquiringGps ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {farmer.liveLocationEnabled && farmer.gpsCoordinates
                    ? dict.myFarm.refreshGpsBtn
                    : dict.myFarm.allowGpsBtn}
                </span>
              </button>

              {farmer.liveLocationEnabled && (
                <button
                  type="button"
                  data-testid="my-farm-stop-gps-btn"
                  onClick={onStopLiveGps}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#9EC4A8] bg-[#E9F2EA] px-3 py-2 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap"
                >
                  <PauseCircle className="h-3.5 w-3.5 text-[#355240]" aria-hidden="true" />
                  <span>{dict.myFarm.stopGpsBtn}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="farmer-name" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.nameLabel}
              </label>
              <input
                id="farmer-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              />
              {errors.name && <p className="mt-1 text-xs text-[#B91C1C]">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="farmer-language" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.langLabel}
              </label>
              <select
                id="farmer-language"
                value={form.preferredLanguage}
                onChange={(e) =>
                  setForm({ ...form, preferredLanguage: e.target.value as Language })
                }
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              >
                <option value="en">
                  {language === 'hi' ? 'अंग्रेज़ी' : language === 'te' ? 'ఆంగ్లం' : 'English'}
                </option>
                <option value="hi">
                  {language === 'hi' ? 'हिन्दी' : language === 'te' ? 'హిందీ' : 'Hindi'}
                </option>
                <option value="te">
                  {language === 'hi' ? 'तेलुगु' : language === 'te' ? 'తెలుగు' : 'Telugu'}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="my-farm-quick-location" className="block text-xs font-semibold text-[#14291D]">
              {dict.myFarm.quickLocationLabel}
            </label>
            <select
              id="my-farm-quick-location"
              data-testid="my-farm-quick-location-select"
              value={activePresetId}
              onChange={(e) => handleQuickPresetChange(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
            >
              <option value="">{dict.myFarm.customLocationOption}</option>
              {INDIAN_LOCATION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.district[language]}, {preset.state[language]} ({preset.location[language]})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="farmer-state" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.stateLabel}
              </label>
              <input
                id="farmer-state"
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              />
              {errors.state && <p className="mt-1 text-xs text-[#B91C1C]">{errors.state}</p>}
            </div>

            <div>
              <label htmlFor="farmer-district" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.districtLabel}
              </label>
              <input
                id="farmer-district"
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              />
              {errors.district && <p className="mt-1 text-xs text-[#B91C1C]">{errors.district}</p>}
            </div>

            <div>
              <label htmlFor="farmer-location" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.locationLabel}
              </label>
              <input
                id="farmer-location"
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              />
              {errors.location && <p className="mt-1 text-xs text-[#B91C1C]">{errors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="farmer-crops" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.cropsLabel}
              </label>
              <input
                id="farmer-crops"
                type="text"
                value={cropsInput}
                onChange={(e) => setCropsInput(e.target.value)}
                placeholder={dict.myFarm.cropsPlaceholder}
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              />
              {errors.crops && <p className="mt-1 text-xs text-[#B91C1C]">{errors.crops}</p>}
            </div>

            <div>
              <label htmlFor="farmer-size" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.farmSizeLabel}
              </label>
              <input
                id="farmer-size"
                type="number"
                step="0.5"
                min="0.1"
                value={form.farmSizeAcres}
                onChange={(e) =>
                  setForm({ ...form, farmSizeAcres: Number(e.target.value) })
                }
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 font-mono text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              />
              {errors.farmSizeAcres && (
                <p className="mt-1 text-xs text-[#B91C1C]">{errors.farmSizeAcres}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="farmer-soil" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.soilTypeLabel}
              </label>
              <select
                id="farmer-soil"
                value={form.soilType}
                onChange={(e) => setForm({ ...form, soilType: e.target.value as SoilType })}
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              >
                {SOIL_OPTIONS.map((soil) => (
                  <option key={soil} value={soil}>
                    {localizeSoilType(soil, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="farmer-stage" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.growthStageLabel}
              </label>
              <select
                id="farmer-stage"
                value={form.growthStage}
                onChange={(e) =>
                  setForm({ ...form, growthStage: e.target.value as GrowthStage })
                }
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              >
                {GROWTH_STAGE_OPTIONS.map((stage) => (
                  <option key={stage} value={stage}>
                    {localizeGrowthStage(stage, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="farmer-drainage" className="block text-xs font-semibold text-[#14291D]">
                {dict.myFarm.drainageLabel}
              </label>
              <select
                id="farmer-drainage"
                value={form.drainageType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    drainageType: e.target.value as FarmerProfile['drainageType'],
                  })
                }
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              >
                {DRAINAGE_OPTIONS.map((drainage) => (
                  <option key={drainage} value={drainage}>
                    {localizeDrainageType(drainage, language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="near-coast-river"
              type="checkbox"
              checked={form.nearCoastOrRiver}
              onChange={(e) => setForm({ ...form, nearCoastOrRiver: e.target.checked })}
              className="h-4 w-4 rounded border-[#9EC4A8] text-[#143D2B] focus:ring-[#143D2B]"
            />
            <label htmlFor="near-coast-river" className="text-sm text-[#243F2F]">
              {dict.myFarm.nearCoastLabel}
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#C5D9C8] pt-4">
            <button
              type="submit"
              className="min-h-[42px] rounded-md bg-[#143D2B] px-5 py-2 text-sm font-medium text-white hover:bg-[#0F2D20] whitespace-nowrap"
            >
              {dict.common.saveProfile}
            </button>
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#15803D]">
                <Check className="h-4 w-4" aria-hidden="true" />
                {dict.common.saved}
              </span>
            )}
          </div>
        </form>
      </section>

      <aside className="space-y-4 lg:col-span-4">
        <div className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
          <div className="flex items-center gap-4">
            {!avatarFailed ? (
              <img
                data-testid="my-farm-avatar-img"
                src={farmer.profilePhotoDataUrl || FARMER_IMG}
                alt={localizeFarmerName(farmer.name, language)}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="h-16 w-16 rounded-full border border-[#9EC4A8] object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#9EC4A8] bg-[#D0E2D3] font-display text-lg font-semibold text-[#143D2B]">
                {Array.from(localizeFarmerName(farmer.name, language).trim())
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-display truncate text-lg font-semibold text-[#14291D]">
                {localizeFarmerName(farmer.name, language)}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#355240]">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {localizeLocationText(farmer.location, language)},{' '}
                  {localizeLocationText(farmer.district, language)}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-[#C5D9C8] pt-4">
            <div className="mb-2 text-xs font-semibold text-[#14291D]">
              {dict.myFarm.photoSectionTitle}
            </div>
            <ProfilePhotoControls
              currentPhotoUrl={farmer.profilePhotoDataUrl}
              language={language}
              onUpdatePhoto={(url) => {
                setAvatarFailed(false);
                onUpdatePhoto(url);
              }}
            />
          </div>

          <dl className="mt-5 divide-y divide-[#C5D9C8] text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-[#355240]">{dict.myFarm.summaryState}</dt>
              <dd className="font-medium text-[#14291D]">
                {localizeLocationText(farmer.state, language)}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#355240]">{dict.myFarm.summaryCrops}</dt>
              <dd className="font-medium text-[#14291D] text-right">
                {localizeCropsList(farmer.crops, language).join(', ')}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#355240]">{dict.myFarm.summaryArea}</dt>
              <dd className="font-mono font-medium text-[#14291D]">
                {farmer.farmSizeAcres} {dict.common.acresUnit}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#355240]">{dict.myFarm.summaryStage}</dt>
              <dd className="font-medium text-[#14291D] text-right">
                {localizeGrowthStage(farmer.growthStage, language)}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#355240]">{dict.myFarm.summarySoil}</dt>
              <dd className="font-medium text-[#14291D]">
                {localizeSoilType(farmer.soilType, language)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#143D2B]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>{dict.myFarm.privacyTitle}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#355240]">{dict.myFarm.privacyDesc}</p>
        </div>
      </aside>
    </div>
  );
}
