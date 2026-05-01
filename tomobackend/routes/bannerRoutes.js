const express = require("express");
const router = express.Router();
const multer = require("multer");
const Banner = require("../models/Banner");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { getUploadSubdir, getUploadsRoot } = require("../utils/uploadsPath");
const {
  hasCloudinaryConfig,
  uploadBufferToCloudinary,
  uploadDataUriToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinaryStorage");

// ✅ Create upload directory if not exists
const uploadDir = getUploadSubdir("banners");

// ✅ Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const defaultPalettes = [
  ["#ff7a18", "#af002d"],
  ["#36d1dc", "#5b86e5"],
  ["#f7971e", "#ffd200"],
  ["#8e2de2", "#4a00e0"],
  ["#11998e", "#38ef7d"],
];

const occasionThemes = [
  {
    pattern: /diwali|deepavali/i,
    label: "Diwali",
    badge: "DIWALI SPECIAL",
    palette: ["#f59e0b", "#f97316"],
    layout: "diwali",
  },
  {
    pattern: /holi/i,
    label: "Holi",
    badge: "HOLI CELEBRATION",
    palette: ["#ff4d6d", "#3a86ff"],
  },
  {
    pattern: /eid|ramadan/i,
    label: "Eid",
    badge: "EID OFFER",
    palette: ["#0f766e", "#22c55e"],
  },
  {
    pattern: /christmas|xmas/i,
    label: "Christmas",
    badge: "CHRISTMAS DEAL",
    palette: ["#0f9b0f", "#1db954"],
  },
  {
    pattern: /new year/i,
    label: "New Year",
    badge: "NEW YEAR BLAST",
    palette: ["#5b2be0", "#f59e0b"],
  },
  {
    pattern: /republic day/i,
    label: "Republic Day",
    badge: "REPUBLIC DAY",
    palette: ["#ff9933", "#138808"],
  },
  {
    pattern: /independence day/i,
    label: "Independence Day",
    badge: "INDEPENDENCE DAY",
    palette: ["#ff7a18", "#16a34a"],
  },
  {
    pattern: /valentine/i,
    label: "Valentine's Day",
    badge: "VALENTINE SPECIAL",
    palette: ["#ec4899", "#be123c"],
  },
  {
    pattern: /women'?s day/i,
    label: "Women's Day",
    badge: "WOMEN'S DAY",
    palette: ["#a855f7", "#ec4899"],
  },
  {
    pattern: /mother'?s day|father'?s day|parents day/i,
    label: "Family Day",
    badge: "SPECIAL DAY",
    palette: ["#f97316", "#ef4444"],
  },
  {
    pattern: /black friday/i,
    label: "Black Friday",
    badge: "BLACK FRIDAY",
    palette: ["#111827", "#2563eb"],
  },
];

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const pickDefaultPalette = (text = "") => {
  const hash = Array.from(text).reduce((total, character) => total + character.charCodeAt(0), 0);
  return defaultPalettes[hash % defaultPalettes.length];
};

const buildOccasionContext = (offerText = "", occasion = "") => {
  const mergedText = `${offerText} ${occasion}`.trim();
  const matchedTheme = occasionThemes.find((theme) => theme.pattern.test(mergedText));

  if (matchedTheme) {
    return {
      label: matchedTheme.label,
      badge: matchedTheme.badge,
      palette: matchedTheme.palette,
      layout: matchedTheme.layout,
      raw: mergedText,
    };
  }

  if (occasion && occasion.trim()) {
    return {
      label: occasion.trim().slice(0, 30),
      badge: "SPECIAL OFFER",
      palette: pickDefaultPalette(occasion),
      layout: null,
      raw: occasion.trim(),
    };
  }

  return {
    label: "Everyday Offer",
    badge: "LIMITED OFFER",
    palette: pickDefaultPalette(offerText),
    layout: null,
    raw: "",
  };
};

const getCouponCodeFromText = (offerText = "") => {
  const tokens = String(offerText || "")
    .toUpperCase()
    .match(/\b[A-Z0-9]{4,12}\b/g);

  if (!tokens?.length) return "TOMOX";

  const withDigit = tokens.find((token) => /\d/.test(token));
  if (withDigit) return withDigit;

  const filtered = tokens.find((token) => !["FLAT", "OFFER", "DEAL", "SAVE"].includes(token));
  return filtered || "TOMOX";
};

const getOfferHighlight = (offerText = "", fallback = "SPECIAL OFFER") => {
  const percentMatch = String(offerText).match(/(\d{1,2}|100)\s*%/);
  if (percentMatch?.[0]) {
    return `${percentMatch[0].replace(/\s+/g, "")} OFF`;
  }

  const amountMatch = String(offerText).match(/(?:₹|RS\.?|INR)\s*(\d{2,5})/i);
  if (amountMatch?.[1]) {
    return `SAVE ₹${amountMatch[1]}`;
  }

  return fallback;
};

const parseGeminiJson = (rawText = "") => {
  const normalized = rawText.replace(/```json|```/g, "").trim();
  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) return null;

  try {
    return JSON.parse(normalized.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
};

const isValidHexColor = (value = "") => /^#[0-9A-F]{6}$/i.test(String(value));

const normalizeBannerType = (bannerType = "") => {
  const normalized = String(bannerType || "").trim().toLowerCase();
  if (normalized === "promotion") return "promotion";
  if (normalized === "festive offer") return "festive offer";
  return "offer";
};

const buildOfferTextFromFields = ({ flatOff, minAmount }) => {
  const percent = String(flatOff || "").replace(/\D/g, "").slice(0, 3);
  const amount = String(minAmount || "").replace(/\D/g, "").slice(0, 6);

  if (percent && amount) return `FLAT ${percent}% OFF ON ABOVE ₹${amount}`;
  if (percent) return `FLAT ${percent}% OFF`;
  if (amount) return `OFFERS ON ABOVE ₹${amount}`;
  return "";
};

const buildFallbackCouponCode = ({ bannerType, flatOff, minAmount, occasion, offerText }) => {
  const percent = String(flatOff || "").replace(/\D/g, "").slice(0, 2) || "10";
  const amount = String(minAmount || "").replace(/\D/g, "").slice(-3) || "500";
  const typePrefix =
    bannerType === "promotion" ? "PR" : bannerType === "festive offer" ? "FS" : "OF";
  const occasionPrefix =
    String(occasion || offerText || "TOMOX")
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 3) || "TMX";
  return `${occasionPrefix}${typePrefix}${percent}${amount}`.slice(0, 12);
};

const getAiCouponCode = async ({ bannerType, flatOff, minAmount, occasion, offerText, fallbackCode }) => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) return fallbackCode;

  try {
    const prompt = `Return ONLY JSON: {"couponCode":"..."}.\nCreate a short coupon code (6-12 alphanumeric uppercase) using these fields.\nBanner type: ${bannerType}\nFlat off: ${flatOff}\nOn above amount: ${minAmount}\nOccasion: ${occasion}\nOffer text: ${offerText}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 80,
          },
        }),
      }
    );

    if (!response.ok) return fallbackCode;

    const data = await response.json();
    const textOutput =
      data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("\n") || "";
    const parsed = parseGeminiJson(textOutput);
    const code = String(parsed?.couponCode || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 12);

    return code || fallbackCode;
  } catch {
    return fallbackCode;
  }
};

const getReferenceStyleHints = async (referenceImageDataUrl = "") => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) return null;

  const dataUrlMatch = String(referenceImageDataUrl || "").match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/
  );
  if (!dataUrlMatch) return null;

  const mimeType = dataUrlMatch[1];
  const base64Data = dataUrlMatch[2].replace(/\s+/g, "");
  if (!base64Data) return null;

  try {
    const prompt = `Analyze this banner image style and return ONLY JSON with keys: colors, layout, badge, occasionLabel, styleNotes.\nRules:\n- colors: array of exactly 2 hex colors\n- layout: one of \"diwali\", \"sale-card\", or \"default\"\n- badge: short uppercase text max 18 chars\n- occasionLabel: short title max 24 chars if visible in image, else empty\n- styleNotes: max 80 chars, summarize composition style`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 140,
          },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const textOutput =
      data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("\n") || "";
    const parsed = parseGeminiJson(textOutput);
    if (!parsed) return null;

    const firstColor = isValidHexColor(parsed?.colors?.[0]) ? parsed.colors[0] : null;
    const secondColor = isValidHexColor(parsed?.colors?.[1]) ? parsed.colors[1] : null;
    const rawLayout = String(parsed?.layout || "").toLowerCase();
    const normalizedLayout = rawLayout === "diwali" || rawLayout === "sale-card" ? rawLayout : null;

    return {
      colors: firstColor && secondColor ? [firstColor, secondColor] : null,
      layout: normalizedLayout,
      badge: String(parsed?.badge || "").toUpperCase().slice(0, 18),
      occasionLabel: String(parsed?.occasionLabel || "").slice(0, 24),
      styleNotes: String(parsed?.styleNotes || "").slice(0, 80),
    };
  } catch {
    return null;
  }
};

const inferBannerIntentFromPrompt = (promptText = "") => {
  const rawPrompt = String(promptText || "").trim();
  const normalized = rawPrompt.toLowerCase();

  const occasionMatch = occasionThemes.find((entry) => entry.pattern.test(rawPrompt));
  const hasBirthday = /birthday|bday|launch(ing)? day|anniversary/i.test(rawPrompt);
  const isCollab = /collab|collaboration|partnership/i.test(normalized);
  const isPromotion = /promotion|promotional|promote|campaign/i.test(normalized);
  const isProfessional = /professional|proffesional|corporate|formal/i.test(normalized);
  const isFestive = /festive|festival|celebration|birthday|diwali|holi|eid|christmas|new year/i.test(normalized);

  const extractedOffer =
    rawPrompt.match(/(?:with\s+)?offer\s*[:\-]?\s*(.*)$/i)?.[1]?.trim() || rawPrompt;

  const couponFromPrompt =
    rawPrompt.match(/(?:coupon|code|promo(?:\s*code)?)\s*[:\-]?\s*([A-Za-z0-9]{4,12})/i)?.[1] || "";

  const bannerType = isCollab ? "collaburation" : isPromotion ? "promotion" : "offers";
  const theme = isProfessional ? "proffesional" : isFestive ? "festive" : "promotinal";
  const occasion = occasionMatch
    ? occasionMatch.label
    : hasBirthday
      ? "Birthday"
      : "";

  return {
    prompt: rawPrompt,
    offerText: extractedOffer,
    occasion,
    bannerType,
    theme,
    couponHint: couponFromPrompt.toUpperCase(),
  };
};

const getAiBannerTheme = async (offerText, couponCode, occasionContext, bannerType, theme, styleNotes = "") => {
  const fallbackPalette = occasionContext.palette;
  const cleanBannerType = String(bannerType || "offers").trim().slice(0, 20);
  const cleanTheme = String(theme || "festive").trim().slice(0, 20);
  const fallback = {
    headline: couponCode || "TOMOX OFFER",
    subtitle: offerText || `${occasionContext.label} ${cleanBannerType} ${cleanTheme}`,
    colors: fallbackPalette,
    badge: occasionContext.badge,
    occasionLabel: occasionContext.label,
  };

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) return fallback;

  try {
    const prompt = `You are a marketing designer assistant. Return ONLY JSON with keys: headline, subtitle, colors, badge, occasionLabel.\nBanner type: ${cleanBannerType}\nTheme style: ${cleanTheme}\nOffer text: ${offerText}\nCoupon code: ${couponCode}\nOccasion: ${occasionContext.raw || occasionContext.label}\nReference style notes: ${styleNotes || "none"}\nRules:\n- headline max 24 chars\n- subtitle max 60 chars\n- colors must be array of exactly 2 hex colors\n- badge max 18 chars\n- occasionLabel max 24 chars\n- Match wording to banner type and theme style.\n- If occasion is a festival or national day, theme text and colors accordingly.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 180,
          },
        }),
      }
    );

    if (!response.ok) return fallback;

    const data = await response.json();
    const textOutput =
      data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("\n") || "";
    const parsed = parseGeminiJson(textOutput);
    if (!parsed) return fallback;

    const firstColor = /^#[0-9A-F]{6}$/i.test(parsed?.colors?.[0])
      ? parsed.colors[0]
      : fallback.colors[0];
    const secondColor = /^#[0-9A-F]{6}$/i.test(parsed?.colors?.[1])
      ? parsed.colors[1]
      : fallback.colors[1];

    return {
      headline: String(parsed.headline || fallback.headline).slice(0, 18),
      subtitle: String(parsed.subtitle || fallback.subtitle).slice(0, 52),
      colors: [firstColor, secondColor],
      badge: String(parsed.badge || fallback.badge).slice(0, 18),
      occasionLabel: String(parsed.occasionLabel || fallback.occasionLabel).slice(0, 24),
    };
  } catch {
    return fallback;
  }
};

const buildTomoxBrandLockup = ({ x, y, width, height, fontSize, bg = "#111827", text = "#f59e0b" }) => {
  const centerX = x + width / 2;
  const textY = y + height / 2 + fontSize * 0.35;

  return `
  <rect x="${x}" y="${y}" rx="44" ry="44" width="${width}" height="${height}" fill="${bg}"/>
  <text x="${centerX}" y="${textY}" text-anchor="middle" fill="${text}" font-family="Inter, Arial" font-size="${fontSize}" font-weight="900">TomoX</text>`;
};

const buildDiwaliBannerSvg = ({ headline, subtitle, offerText, couponCode, badge, occasionLabel }) => {
  const safeHeadline = escapeXml(headline || "Diwali Offer");
  const safeSubtitle = escapeXml(subtitle || offerText || "Celebrate with festive savings");
  const safeCoupon = escapeXml(couponCode || "TOMOX");
  const safeBadge = escapeXml(badge || "DIWALI SPECIAL");
  const safeOccasion = escapeXml(occasionLabel || "Diwali");
  const safeHighlight = escapeXml(getOfferHighlight(offerText, safeBadge));
  const brandLockup = buildTomoxBrandLockup({
    x: 2480,
    y: 90,
    width: 760,
    height: 130,
    fontSize: 72,
    bg: "rgba(17,24,39,0.95)",
    text: "#fbbf24",
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="3500" height="930" viewBox="0 0 3500 930" role="img" aria-label="Diwali promotion banner">
  <defs>
    <linearGradient id="diwaliBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#facc15"/>
      <stop offset="45%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <radialGradient id="medallion" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#fffce8"/>
      <stop offset="70%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </radialGradient>
  </defs>

  <rect width="3500" height="930" fill="url(#diwaliBg)"/>
${brandLockup}
  <circle cx="620" cy="170" r="120" fill="rgba(255,255,255,0.20)"/>
  <circle cx="2920" cy="190" r="140" fill="rgba(255,255,255,0.18)"/>
  <circle cx="300" cy="760" r="180" fill="rgba(255,255,255,0.12)"/>
  <circle cx="3210" cy="760" r="170" fill="rgba(255,255,255,0.12)"/>

  <g transform="translate(0,20)">
    <line x1="340" y1="0" x2="340" y2="170" stroke="#7c2d12" stroke-width="8"/>
    <polygon points="300,170 380,170 360,250 320,250" fill="#7e22ce"/>
    <circle cx="340" cy="206" r="18" fill="#facc15"/>

    <line x1="620" y1="0" x2="620" y2="160" stroke="#7c2d12" stroke-width="8"/>
    <polygon points="580,160 660,160 640,240 600,240" fill="#9333ea"/>
    <circle cx="620" cy="196" r="18" fill="#fde047"/>

    <line x1="2880" y1="0" x2="2880" y2="170" stroke="#7c2d12" stroke-width="8"/>
    <polygon points="2840,170 2920,170 2900,250 2860,250" fill="#7e22ce"/>
    <circle cx="2880" cy="206" r="18" fill="#facc15"/>

    <line x1="3160" y1="0" x2="3160" y2="160" stroke="#7c2d12" stroke-width="8"/>
    <polygon points="3120,160 3200,160 3180,240 3140,240" fill="#9333ea"/>
    <circle cx="3160" cy="196" r="18" fill="#fde047"/>
  </g>

  <circle cx="1750" cy="480" r="305" fill="url(#medallion)" stroke="#7c2d12" stroke-width="14"/>
  <circle cx="1750" cy="480" r="262" fill="none" stroke="#a16207" stroke-width="5" stroke-dasharray="9 12"/>

  <text x="1750" y="375" text-anchor="middle" fill="#7c2d12" font-family="Georgia, serif" font-size="86" font-style="italic" font-weight="700">${safeOccasion}</text>
  <text x="1750" y="455" text-anchor="middle" fill="#111827" font-family="Inter, Arial" font-size="132" font-weight="900">${safeHighlight}</text>
  <text x="1750" y="515" text-anchor="middle" fill="#111827" font-family="Inter, Arial" font-size="42" font-weight="700">USE CODE: ${safeCoupon}</text>
  <text x="1750" y="575" text-anchor="middle" fill="#4b5563" font-family="Inter, Arial" font-size="40" font-weight="600">${safeHeadline}</text>
  <text x="1750" y="630" text-anchor="middle" fill="#6b7280" font-family="Inter, Arial" font-size="34">${safeSubtitle}</text>

  <rect x="1240" y="690" rx="28" ry="28" width="1020" height="108" fill="rgba(17,24,39,0.88)"/>
  <text x="1750" y="760" text-anchor="middle" fill="#fbbf24" font-family="Inter, Arial" font-size="48" font-weight="800">${safeBadge} • TomoX</text>

  <g transform="translate(410,720)">
    <path d="M0 60 C30 10, 90 10, 120 60 C95 85, 25 85, 0 60 Z" fill="#fb923c"/>
    <ellipse cx="60" cy="50" rx="16" ry="25" fill="#fde047"/>
  </g>
  <g transform="translate(2970,720)">
    <path d="M0 60 C30 10, 90 10, 120 60 C95 85, 25 85, 0 60 Z" fill="#fb923c"/>
    <ellipse cx="60" cy="50" rx="16" ry="25" fill="#fde047"/>
  </g>
</svg>`;
};

const buildFestiveSaleCardSvg = ({ headline, subtitle, offerText, couponCode, badge, colors, occasionLabel }) => {
  const safeHeadline = escapeXml(headline || "BIGGEST FESTIVE SALE");
  const safeSubtitle = escapeXml(subtitle || offerText || "ON ALL PRODUCTS");
  const safeCoupon = escapeXml(couponCode || "TOMOX");
  const safeBadge = escapeXml(badge || "FESTIVE OFFER");
  const safeOccasion = escapeXml(occasionLabel || "Festive Offer");
  const safeHighlight = escapeXml(getOfferHighlight(offerText, safeBadge));
  const [startColor, endColor] = colors;
  const brandLockup = buildTomoxBrandLockup({
    x: 2460,
    y: 72,
    width: 760,
    height: 130,
    fontSize: 72,
    bg: "rgba(17,24,39,0.92)",
    text: "#fbbf24",
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="3500" height="930" viewBox="0 0 3500 930" role="img" aria-label="Festive sale banner">
  <defs>
    <linearGradient id="festiveBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${startColor}"/>
      <stop offset="100%" stop-color="${endColor}"/>
    </linearGradient>
  </defs>

  <rect width="3500" height="930" fill="url(#festiveBg)"/>
${brandLockup}
  <circle cx="280" cy="120" r="16" fill="#fde047"/>
  <circle cx="460" cy="90" r="12" fill="#ffffff"/>
  <circle cx="620" cy="138" r="14" fill="#fde68a"/>
  <circle cx="3240" cy="140" r="16" fill="#fde047"/>
  <circle cx="3070" cy="96" r="12" fill="#ffffff"/>
  <circle cx="2900" cy="142" r="14" fill="#fde68a"/>

  <g transform="translate(900,210) rotate(-8 860 250)">
    <rect x="0" y="0" width="1720" height="500" rx="28" ry="28" fill="#fffdf7" stroke="rgba(17,24,39,0.18)" stroke-width="4"/>
    <text x="860" y="138" text-anchor="middle" fill="#334155" font-family="Inter, Arial" font-size="58" font-weight="700">${safeOccasion}</text>
    <text x="860" y="234" text-anchor="middle" fill="#111827" font-family="Inter, Arial" font-size="92" font-weight="900">${safeHeadline}</text>
    <text x="860" y="335" text-anchor="middle" fill="#dc2626" font-family="Inter, Arial" font-size="132" font-weight="900">${safeHighlight}</text>
    <text x="860" y="405" text-anchor="middle" fill="#475569" font-family="Inter, Arial" font-size="42" font-weight="700">${safeSubtitle}</text>
    <text x="860" y="462" text-anchor="middle" fill="#0f172a" font-family="Inter, Arial" font-size="40" font-weight="800">USE CODE: ${safeCoupon}</text>
  </g>

  <g transform="translate(300,760)">
    <path d="M0 60 C28 10, 92 10, 120 60 C96 86, 24 86, 0 60 Z" fill="#fb923c"/>
    <ellipse cx="60" cy="46" rx="15" ry="24" fill="#fde047"/>
  </g>
  <g transform="translate(3080,760)">
    <path d="M0 60 C28 10, 92 10, 120 60 C96 86, 24 86, 0 60 Z" fill="#fb923c"/>
    <ellipse cx="60" cy="46" rx="15" ry="24" fill="#fde047"/>
  </g>
</svg>`;
};

const buildOfferBannerSvg = ({ headline, subtitle, offerText, couponCode, badge, colors, occasionLabel, layout }) => {
  const safeHeadline = escapeXml(headline || couponCode || "TOMOX OFFER");
  const safeSubtitle = escapeXml(subtitle || offerText || "Limited time promotion");
  const safeCoupon = escapeXml(couponCode || "TOMOX");
  const safeBadge = escapeXml(badge || "LIMITED OFFER");
  const safeOffer = escapeXml(String(offerText || "").slice(0, 72));
  const safeOccasion = escapeXml(occasionLabel || "Everyday Offer");
  const [startColor, endColor] = colors;
  const brandLockup = buildTomoxBrandLockup({
    x: 2440,
    y: 100,
    width: 760,
    height: 130,
    fontSize: 72,
  });

  if (layout === "diwali") {
    return buildDiwaliBannerSvg({
      headline,
      subtitle,
      offerText,
      couponCode,
      badge,
      occasionLabel,
    });
  }

  if (layout === "sale-card") {
    return buildFestiveSaleCardSvg({
      headline,
      subtitle,
      offerText,
      couponCode,
      badge,
      colors,
      occasionLabel,
    });
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="3500" height="640" viewBox="0 0 3500 640" role="img" aria-label="TomoX promotion banner">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${startColor}"/>
      <stop offset="100%" stop-color="${endColor}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.34)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.08)"/>
    </linearGradient>
  </defs>

  <rect width="3500" height="640" fill="url(#bg)"/>
  <circle cx="3100" cy="170" r="320" fill="rgba(255,255,255,0.12)"/>
  <circle cx="320" cy="560" r="260" fill="rgba(255,255,255,0.10)"/>
  <circle cx="1750" cy="120" r="140" fill="rgba(255,255,255,0.10)"/>

  <rect x="420" y="98" rx="68" ry="68" width="1810" height="444" fill="url(#glass)" stroke="rgba(255,255,255,0.40)" stroke-width="2"/>
  <rect x="462" y="126" rx="24" ry="24" width="420" height="62" fill="#111827"/>
  <text x="494" y="169" fill="#f59e0b" font-family="Inter, Arial" font-weight="700" font-size="36">${safeBadge}</text>

  <text x="462" y="298" fill="#ffffff" font-family="Inter, Arial" font-size="118" font-weight="900">${safeHeadline}</text>
  <text x="462" y="372" fill="rgba(255,255,255,0.95)" font-family="Inter, Arial" font-size="58" font-weight="700">${safeCoupon}</text>
  <text x="462" y="442" fill="rgba(255,255,255,0.92)" font-family="Inter, Arial" font-size="42" font-weight="600">${safeSubtitle}</text>
  <text x="462" y="495" fill="rgba(255,255,255,0.88)" font-family="Inter, Arial" font-size="34">${safeOffer}</text>

${brandLockup}

  <rect x="2440" y="270" rx="30" ry="30" width="760" height="96" fill="rgba(255,255,255,0.14)"/>
  <text x="2588" y="334" fill="#ffffff" font-family="Inter, Arial" font-size="52" font-weight="800">${safeOccasion}</text>

  <rect x="2440" y="402" rx="30" ry="30" width="760" height="136" fill="rgba(17,24,39,0.88)"/>
  <text x="2478" y="468" fill="#ffffff" font-family="Inter, Arial" font-size="42" font-weight="700">Promo Code</text>
  <text x="2478" y="522" fill="#fbbf24" font-family="Inter, Arial" font-size="66" font-weight="900">${safeCoupon}</text>
</svg>`;
};

const createAiBannerPayload = async ({
  prompt,
  offerText,
  link,
  occasion,
  bannerType,
  theme,
  flatOff,
  minAmount,
  referenceImageDataUrl,
}) => {
  const inferred = inferBannerIntentFromPrompt(prompt);
  const normalizedBannerType = normalizeBannerType(bannerType || inferred.bannerType);
  const constructedOfferText = buildOfferTextFromFields({ flatOff, minAmount });
  const cleanOfferText = String(offerText || constructedOfferText || inferred.offerText || "").trim();
  if (!cleanOfferText) {
    return { error: "Offer fields are required" };
  }

  const cleanOccasion = String(
    occasion || inferred.occasion || (normalizedBannerType === "festive offer" ? "Festive Offer" : "")
  )
    .trim()
    .slice(0, 30);
  const cleanBannerType = normalizedBannerType;
  const cleanTheme = String(
    theme || inferred.theme || (cleanBannerType === "promotion" ? "promotinal" : "festive")
  )
    .trim()
    .slice(0, 20) || "festive";
  const occasionContext = buildOccasionContext(cleanOfferText, cleanOccasion);
  const fallbackCoupon = buildFallbackCouponCode({
    bannerType: cleanBannerType,
    flatOff,
    minAmount,
    occasion: cleanOccasion,
    offerText: cleanOfferText,
  });
  const couponCode = await getAiCouponCode({
    bannerType: cleanBannerType,
    flatOff,
    minAmount,
    occasion: cleanOccasion,
    offerText: cleanOfferText,
    fallbackCode: inferred.couponHint || fallbackCoupon || getCouponCodeFromText(cleanOfferText),
  });

  const referenceStyle = await getReferenceStyleHints(referenceImageDataUrl);
  const aiTheme = await getAiBannerTheme(
    cleanOfferText,
    couponCode,
    occasionContext,
    cleanBannerType,
    cleanTheme,
    referenceStyle?.styleNotes
  );
  const resolvedOccasion =
    referenceStyle?.occasionLabel || aiTheme.occasionLabel || occasionContext.label;
  const resolvedLayout =
    referenceStyle?.layout ||
    occasionContext.layout ||
    (cleanBannerType === "festive offer" ? "sale-card" : null);
  const svg = buildOfferBannerSvg({
    headline: aiTheme.headline,
    subtitle: aiTheme.subtitle,
    offerText: cleanOfferText,
    couponCode,
    badge: referenceStyle?.badge || aiTheme.badge,
    colors: referenceStyle?.colors || aiTheme.colors,
    occasionLabel: resolvedOccasion,
    layout: resolvedLayout,
  });

  return {
    title: aiTheme.headline || couponCode,
    link: (link || "/offers").trim() || "/offers",
    sourceText: cleanOfferText,
    occasion: resolvedOccasion,
    bannerType: cleanBannerType,
    theme: cleanTheme,
    palette: aiTheme.colors,
    svg,
  };
};

// ✅ GET all banners
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch banners", error });
  }
});

router.post("/ai-preview", async (req, res) => {
  try {
    const payload = await createAiBannerPayload({
      prompt: req.body.prompt,
      offerText: req.body.offerText,
      link: req.body.link,
      occasion: req.body.occasion,
      bannerType: req.body.bannerType,
      theme: req.body.theme,
      flatOff: req.body.flatOff,
      minAmount: req.body.minAmount,
      referenceImageDataUrl: req.body.referenceImageDataUrl,
    });

    if (payload.error) {
      return res.status(400).json({ message: payload.error });
    }

    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(payload.svg).toString("base64")}`;
    return res.json({
      title: payload.title,
      link: payload.link,
      sourceText: payload.sourceText,
      occasion: payload.occasion,
      bannerType: payload.bannerType,
      theme: payload.theme,
      palette: payload.palette,
      imageDataUrl: dataUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate AI banner preview", error });
  }
});

router.post("/ai-add", async (req, res) => {
  try {
    const payload = await createAiBannerPayload({
      prompt: req.body.prompt,
      offerText: req.body.offerText,
      link: req.body.link,
      occasion: req.body.occasion,
      bannerType: req.body.bannerType,
      theme: req.body.theme,
      flatOff: req.body.flatOff,
      minAmount: req.body.minAmount,
      referenceImageDataUrl: req.body.referenceImageDataUrl,
    });

    if (payload.error) {
      return res.status(400).json({ message: payload.error });
    }

    const fileName = `ai-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.svg`;

    let image = `/uploads/banners/${fileName}`;
    let imagePublicId = null;

    if (hasCloudinaryConfig()) {
      const dataUri = `data:image/svg+xml;base64,${Buffer.from(payload.svg).toString("base64")}`;
      const cloudResult = await uploadDataUriToCloudinary({
        dataUri,
        folder: "tomox/banners",
        publicId: fileName.replace(/\.svg$/i, ""),
        resourceType: "image",
      });
      image = cloudResult.secure_url;
      imagePublicId = cloudResult.public_id;
    } else {
      fs.writeFileSync(path.join(uploadDir, fileName), payload.svg, "utf8");
    }

    const banner = new Banner({
      image,
      imagePublicId,
      title: payload.title,
      link: payload.link,
      sourceText: payload.sourceText,
      occasion: payload.occasion,
      bannerType: payload.bannerType,
      theme: payload.theme,
      isAiGenerated: true,
      palette: payload.palette,
    });

    await banner.save();
    return res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: "Failed to add AI banner", error });
  }
});

// ✅ POST upload a new banner
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    let image = null;
    let imagePublicId = null;

    if (hasCloudinaryConfig()) {
      const unique = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
      const cloudResult = await uploadBufferToCloudinary({
        buffer: req.file.buffer,
        folder: "tomox/banners",
        publicId: unique,
        resourceType: "image",
      });
      image = cloudResult.secure_url;
      imagePublicId = cloudResult.public_id;
    } else {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      fs.writeFileSync(path.join(uploadDir, fileName), req.file.buffer);
      image = `/uploads/banners/${fileName}`;
    }

    const banner = new Banner({
      image,
      imagePublicId,
      title: req.body.title,
      link: req.body.link,
      sourceText: req.body.sourceText,
      occasion: req.body.occasion,
      isAiGenerated: false,
    });

    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: "Failed to upload banner", error });
  }
});

// ✅ DELETE a banner by ID
router.delete("/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    if (banner.imagePublicId && hasCloudinaryConfig()) {
      await deleteFromCloudinary(banner.imagePublicId, "image");
    } else {
      const relativeImagePath = String(banner.image || "")
        .replace(/^\//, "")
        .replace(/^uploads\//, "");
      const filePath = path.join(getUploadsRoot(), relativeImagePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await banner.deleteOne();
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete banner", error });
  }
});

module.exports = router;
