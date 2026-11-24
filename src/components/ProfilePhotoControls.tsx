import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, RotateCcw, X } from 'lucide-react';
import { captureVideoFrameAsDataUrl, compressAvatarImageFile } from '../lib/imageResize';
import { validateProfileImageDataUrl } from '../lib/profileLocationUtils';
import { TRANSLATIONS } from '../lib/translations';
import type { Language } from '../types/agriguard';

interface ProfilePhotoControlsProps {
  currentPhotoUrl?: string | null;
  language: Language;
  onUpdatePhoto: (dataUrl: string | null) => void;
  compact?: boolean;
}

export function ProfilePhotoControls({
  currentPhotoUrl,
  language,
  onUpdatePhoto,
  compact = false,
}: ProfilePhotoControlsProps) {
  const dict = TRANSLATIONS[language];
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCamInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [photoError, setPhotoError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const handleFilePicked = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);

    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
      setPhotoError(
        language === 'hi'
          ? 'केवल जेपीजी, पीएनजी या वेबपी प्रोफ़ाइल फोटो समर्थित हैं।'
          : language === 'te'
          ? 'కేవలం జేపీజీ, పీఎన్‌జీ లేదా వెబ్‌పీ ప్రొఫైల్ ఫోటోలు మాత్రమే అనుమతించబడతాయి.'
          : 'Only JPG, PNG, or WebP profile photos are supported.'
      );
      return;
    }

    try {
      const compressed = await compressAvatarImageFile(file);
      const check = validateProfileImageDataUrl(compressed, language);
      if (!check.valid) {
        setPhotoError(check.error);
        return;
      }
      onUpdatePhoto(compressed);
    } catch {
      setPhotoError(
        language === 'hi'
          ? 'फोटो पढ़ने में असमर्थ। कृपया दूसरी छवि चुनें।'
          : language === 'te'
          ? 'ఫోటో చదవడం సాధ్యం కాలేదు. దయచేసి మరొక ఫోటోను ఎంచుకోండి.'
          : 'Unable to read image file. Please try another photo.'
      );
    }
  };

  const handleOpenCamera = async () => {
    setPhotoError(null);
    setCameraError(null);

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      // Fallback to native mobile camera capture file input if WebRTC getUserMedia isn't supported
      mobileCamInputRef.current?.click();
      return;
    }

    setCameraOpen(true);
    setCameraStarting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch {
      setCameraError(dict.myFarm.cameraDeniedErr);
    } finally {
      setCameraStarting(false);
    }
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setCameraOpen(false);
    setCameraError(null);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const dataUrl = captureVideoFrameAsDataUrl(videoRef.current);
    if (!dataUrl) {
      setCameraError(dict.myFarm.cameraDeniedErr);
      return;
    }
    const check = validateProfileImageDataUrl(dataUrl, language);
    if (!check.valid) {
      setPhotoError(check.error);
      handleCloseCamera();
      return;
    }
    onUpdatePhoto(dataUrl);
    handleCloseCamera();
  };

  return (
    <div className="space-y-2.5">
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        data-testid="profile-photo-file-input"
        onChange={(e) => {
          void handleFilePicked(e.target.files?.[0]);
          e.target.value = '';
        }}
        className="sr-only"
      />
      <input
        ref={mobileCamInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        data-testid="profile-photo-camera-input"
        onChange={(e) => {
          void handleFilePicked(e.target.files?.[0]);
          e.target.value = '';
        }}
        className="sr-only"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="upload-profile-photo-btn"
          onClick={() => uploadInputRef.current?.click()}
          className={`inline-flex items-center gap-1.5 rounded-md border border-[#9EC4A8] bg-[#D8E7DA] font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap ${
            compact ? 'min-h-[34px] px-2.5 py-1 text-xs' : 'min-h-[36px] px-3 py-1.5 text-xs'
          }`}
        >
          <ImagePlus className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
          <span>{dict.myFarm.uploadPhotoBtn}</span>
        </button>

        <button
          type="button"
          data-testid="camera-profile-photo-btn"
          onClick={() => void handleOpenCamera()}
          className={`inline-flex items-center gap-1.5 rounded-md border border-[#9EC4A8] bg-[#DCEADD] font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap ${
            compact ? 'min-h-[34px] px-2.5 py-1 text-xs' : 'min-h-[36px] px-3 py-1.5 text-xs'
          }`}
        >
          <Camera className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
          <span>{dict.myFarm.cameraPhotoBtn}</span>
        </button>

        {currentPhotoUrl && (
          <button
            type="button"
            data-testid="remove-profile-photo-btn"
            onClick={() => {
              setPhotoError(null);
              onUpdatePhoto(null);
            }}
            className={`inline-flex items-center gap-1 rounded-md border border-[#F5C2C7] bg-[#FEF2F2] font-medium text-[#991B1B] hover:bg-[#FEE2E2] whitespace-nowrap ${
              compact ? 'min-h-[34px] px-2.5 py-1 text-xs' : 'min-h-[36px] px-3 py-1.5 text-xs'
            }`}
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>{dict.myFarm.removePhotoBtn}</span>
          </button>
        )}
      </div>

      {photoError && (
        <p data-testid="profile-photo-error" className="text-xs font-medium text-[#B91C1C]">
          {photoError}
        </p>
      )}

      {cameraOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#091D13]/70 p-4"
        >
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-[#9EC4A8] bg-[#E9F2EA]">
            <div className="flex items-center justify-between border-b border-[#C5D9C8] px-5 py-3.5">
              <h3 id="camera-modal-title" className="font-display text-base font-semibold text-[#14291D]">
                {dict.myFarm.cameraModalTitle}
              </h3>
              <button
                type="button"
                onClick={handleCloseCamera}
                aria-label={dict.common.closeModalAria}
                className="rounded-md p-1.5 text-[#355240] hover:bg-[#D8E7DA] hover:text-[#14291D]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {cameraError ? (
                <div className="space-y-4">
                  <div className="rounded-md border border-[#F5C2C7] bg-[#FEF2F2] p-3.5 text-xs leading-relaxed text-[#991B1B]">
                    {cameraError}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCloseCamera}
                      className="min-h-[38px] rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-4 py-2 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2]"
                    >
                      {dict.common.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseCamera();
                        mobileCamInputRef.current?.click();
                      }}
                      className="min-h-[38px] rounded-md bg-[#143D2B] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F2D20]"
                    >
                      {dict.myFarm.cameraFallbackBtn}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#14291D]">
                    {cameraStarting && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-white">
                        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                        <span>{dict.myFarm.cameraStarting}</span>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseCamera();
                        uploadInputRef.current?.click();
                      }}
                      className="min-h-[38px] rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2]"
                    >
                      {dict.myFarm.cameraFallbackBtn}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCloseCamera}
                        className="min-h-[38px] rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-3.5 py-2 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2]"
                      >
                        {dict.common.cancel}
                      </button>
                      <button
                        type="button"
                        disabled={cameraStarting}
                        onClick={handleCaptureSnapshot}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-[#143D2B] px-4 py-2 text-xs font-medium text-white hover:bg-[#0F2D20] disabled:opacity-60"
                      >
                        <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{dict.myFarm.cameraCaptureBtn}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
