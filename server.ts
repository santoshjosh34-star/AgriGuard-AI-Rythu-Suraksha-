import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEMO_SCENARIOS } from './src/lib/demoScenarios.ts';
import { assessKisanRakshakRisk, validateRiskInputs } from './src/lib/kisanRakshakEngine.ts';
import {
  fetchLiveWeather,
  reverseGeocodeCoordinates,
} from './src/server/liveWeatherService.ts';
import {
  analyzeCropPhotoWithGemini,
  type AnalyzeCropPhotoRequest,
} from './src/server/cropVisionService.ts';
import {
  synthesizeSoftVoiceWithGemini,
  type SynthesizeVoiceRequest,
} from './src/server/voiceTtsService.ts';
import { runMasterOrchestrator, type OrchestrateRequestBody } from './src/server/orchestrator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function mapGeminiErrorResponse(err: unknown, fallback: string) {
  const rawMessage = err instanceof Error ? err.message : fallback;
  if (rawMessage.startsWith('VALIDATION_ERROR:')) {
    return {
      status: 400,
      body: {
        error: rawMessage.replace(/^VALIDATION_ERROR:\s*/, ''),
      },
    };
  }

  let cleanMessage = rawMessage;
  try {
    const parsed = JSON.parse(rawMessage) as { error?: { message?: string } };
    if (parsed?.error?.message) {
      cleanMessage = parsed.error.message;
    }
  } catch {
    // Keep rawMessage when not JSON
  }

  const isKeyIssue = /API_KEY_INVALID|GEMINI_API_KEY|PERMISSION_DENIED|403/i.test(rawMessage);
  const isOverloaded = /503|UNAVAILABLE|high demand/i.test(rawMessage);
  const isQuota = /429|RESOURCE_EXHAUSTED/i.test(rawMessage);

  const status = isKeyIssue ? 503 : isOverloaded ? 503 : isQuota ? 429 : 500;
  const hint = isKeyIssue
    ? 'Ensure GEMINI_API_KEY is configured in Settings > Secrets. AgriGuard AI never fabricates AI responses when the model is unavailable.'
    : isOverloaded
    ? 'The Gemini AI service is temporarily busy. Please wait a few seconds and try again. AgriGuard AI never fabricates simulated replies.'
    : 'AgriGuard AI never fabricates AI responses when the model is unavailable.';

  return {
    status,
    body: {
      error: cleanMessage,
      hint,
    },
  };
}

async function createServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ error: 'Invalid JSON request payload.' });
        return;
      }
      next(err);
    }
  );

  // Health & config status (never exposes actual API key)
  app.get('/api/health', (_req, res) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
        process.env.GEMINI_API_KEY.trim() !== ''
    );
    res.json({
      status: 'ok',
      service: 'AgriGuard AI Server',
      geminiConfigured: hasKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Live Open-Meteo geocoding & weather forecast endpoint
  app.get('/api/weather/live', async (req, res) => {
    try {
      const district = String(req.query.district || '').trim();
      const state = String(req.query.state || '').trim();
      const location = String(req.query.location || '').trim();
      const latRaw = req.query.lat;
      const lonRaw = req.query.lon;
      const latParam = latRaw !== undefined && latRaw !== '' ? Number(latRaw) : undefined;
      const lonParam = lonRaw !== undefined && lonRaw !== '' ? Number(lonRaw) : undefined;
      const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';

      if (
        (latParam !== undefined && !Number.isFinite(latParam)) ||
        (lonParam !== undefined && !Number.isFinite(lonParam))
      ) {
        res.status(400).json({ error: 'lat and lon query parameters must be valid numbers.' });
        return;
      }

      if ((!district || !state) && (latParam === undefined || lonParam === undefined)) {
        res.status(400).json({
          error: 'Provide district and state (or GPS lat/lon coordinates) to fetch live weather.',
        });
        return;
      }

      const result = await fetchLiveWeather({
        district: district || 'Farm Location',
        state: state || 'India',
        location,
        lat: latParam,
        lon: lonParam,
        forceRefresh,
      });

      res.json(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to fetch live meteorological data.';
      res.status(502).json({ error: message });
    }
  });

  // Reverse-geocode GPS coordinates to Indian village/district/state
  app.get('/api/location/reverse', async (req, res) => {
    try {
      const lat = Number(req.query.lat);
      const lon = Number(req.query.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        res.status(400).json({ error: 'Valid numeric lat and lon query parameters are required.' });
        return;
      }
      const resolved = await reverseGeocodeCoordinates(lat, lon);
      res.json({ location: resolved });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to resolve GPS coordinates.';
      res.status(502).json({ error: message });
    }
  });

  // Return clearly-labelled synthetic demo scenarios
  app.get('/api/scenarios', (_req, res) => {
    res.json({ scenarios: DEMO_SCENARIOS });
  });

  // Deterministic Kisan Rakshak risk engine endpoint with strict validation
  app.post('/api/kisan-rakshak/assess', (req, res) => {
    const body = req.body as { farmer?: unknown; weather?: unknown };
    if (!body || !body.farmer || !body.weather) {
      res.status(400).json({ error: 'Both farmer and weather objects are required.' });
      return;
    }

    const farmer = body.farmer as Parameters<typeof validateRiskInputs>[0];
    const weather = body.weather as Parameters<typeof validateRiskInputs>[1];
    const validation = validateRiskInputs(farmer, weather);

    if (!validation.valid) {
      res.status(400).json({
        error: 'Validation failed. Please correct highlighted fields.',
        validationErrors: validation.errors,
      });
      return;
    }

    const assessment = assessKisanRakshakRisk(
      farmer as Parameters<typeof assessKisanRakshakRisk>[0],
      weather as Parameters<typeof assessKisanRakshakRisk>[1]
    );
    res.json({ assessment });
  });

  // Master Orchestrator multi-agent function-calling endpoint
  app.post('/api/orchestrate', async (req, res) => {
    try {
      const body = req.body as Partial<OrchestrateRequestBody>;
      if (!body.query || typeof body.query !== 'string' || body.query.trim().length < 3) {
        res.status(400).json({ error: 'Please enter a valid farming question (at least 3 characters).' });
        return;
      }
      if (!body.farmer || !body.weather) {
        res.status(400).json({ error: 'Farmer profile and weather context are required.' });
        return;
      }

      const result = await runMasterOrchestrator({
        query: body.query.trim(),
        farmer: body.farmer,
        weather: body.weather,
        language: body.language || 'en',
        symptomReport: body.symptomReport,
        photoDiagnosis: body.photoDiagnosis,
        preferredModel: body.preferredModel,
      });

      res.json(result);
    } catch (err) {
      const mapped = mapGeminiErrorResponse(err, 'Unexpected server error during agent orchestration.');
      res.status(mapped.status).json(mapped.body);
    }
  });

  // Gemini Flash / Flash-Lite Multimodal Crop Photo Identification & Health Diagnosis
  app.post('/api/crop/analyze-photo', async (req, res) => {
    try {
      const body = req.body as Partial<AnalyzeCropPhotoRequest>;
      if (!body.imageDataUrl || typeof body.imageDataUrl !== 'string') {
        res.status(400).json({ error: 'Please upload or capture a crop photo first.' });
        return;
      }

      const diagnosis = await analyzeCropPhotoWithGemini({
        imageDataUrl: body.imageDataUrl,
        language: body.language || 'en',
        farmer: body.farmer,
        farmerNotes: body.farmerNotes,
        preferredModel: body.preferredModel || 'auto',
      });

      res.json({ diagnosis });
    } catch (err) {
      const mapped = mapGeminiErrorResponse(err, 'Unable to analyze crop photo with Gemini Vision.');
      res.status(mapped.status).json(mapped.body);
    }
  });

  // Soft multilingual TTS endpoint (Telugu, Hindi, English via gemini-3.8-flash-lite-tts)
  app.post('/api/voice/speak', async (req, res) => {
    try {
      const body = req.body as Partial<SynthesizeVoiceRequest>;
      if (!body.text || typeof body.text !== 'string' || body.text.trim().length < 2) {
        res.status(400).json({ error: 'Text to speak is required.' });
        return;
      }

      const lang = body.language === 'hi' || body.language === 'te' ? body.language : 'en';
      const result = await synthesizeSoftVoiceWithGemini({
        text: body.text,
        language: lang,
      });

      res.json(result);
    } catch (err) {
      const mapped = mapGeminiErrorResponse(err, 'Unable to synthesize voice audio.');
      res.status(mapped.status).json(mapped.body);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AgriGuard AI server listening on http://localhost:${port}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start AgriGuard AI server:', err);
  process.exit(1);
});
