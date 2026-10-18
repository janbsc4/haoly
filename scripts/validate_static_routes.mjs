import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";

import { JSDOM } from "jsdom";

import astroConfig from "../astro.config.mjs";

const APP_SEGMENT = "study";
// The app's old home; its routes must keep forwarding old links and shortcuts.
const LEGACY_APP_SEGMENT = "app";

const expectedMetadata = {
  es: {
    description:
      "Aprende mandarín con cartas y practica tus palabras con Léi, tu compañero de conversación con IA. Con pinyin y explicaciones en español.",
    ogLocale: "es_ES",
  },
  en: {
    description:
      "Learn Mandarin with flashcards and practice your words with Léi, your AI conversation partner. With pinyin and explanations in English.",
    ogLocale: "en_US",
  },
};

function singleElement(document, selector, route) {
  const elements = document.querySelectorAll(selector);
  if (elements.length !== 1) {
    throw new Error(`${route} debe contener exactamente un elemento ${selector}.`);
  }
  return elements[0];
}

function requireAttribute(document, selector, attribute, expected, route) {
  const element = singleElement(document, selector, route);
  const actual = element.getAttribute(attribute);
  if (actual !== expected) {
    throw new Error(`${route} tiene ${selector}[${attribute}] = ${actual}; se esperaba ${expected}.`);
  }
}

function siteAndBase() {
  const site = String(astroConfig.site).replace(/\/$/, "");
  const trimmed = String(astroConfig.base).replace(/^\/+|\/+$/g, "");
  const base = trimmed ? `/${trimmed}/` : "/";
  return { site, base };
}

export function validateLocalizedRouteHtml(html, locale) {
  const { site, base } = siteAndBase();
  const route = `${base}${APP_SEGMENT}/${locale}/`;
  const canonical = `${site}${route}`;
  const metadata = expectedMetadata[locale];
  if (!metadata) throw new Error(`Locale no soportado: ${locale}`);

  const document = new JSDOM(html).window.document;
  singleElement(document, "[data-home-screen-hint]", route);
  if (document.documentElement.lang !== locale) {
    throw new Error(
      `${route} tiene html[lang] = ${document.documentElement.lang}; se esperaba ${locale}.`,
    );
  }
  requireAttribute(document, 'meta[name="description"]', "content", metadata.description, route);
  requireAttribute(document, 'link[rel="canonical"]', "href", canonical, route);
  requireAttribute(
    document,
    'meta[property="og:locale"]',
    "content",
    metadata.ogLocale,
    route,
  );
  requireAttribute(document, 'meta[property="og:url"]', "content", canonical, route);
  requireAttribute(
    document,
    'link[rel="alternate"][hreflang="x-default"]',
    "href",
    `${site}${base}`,
    route,
  );

  const localizedAssets = document.querySelectorAll(
    `[src^="${base}_astro/"], [href^="${base}_astro/"]`,
  );
  if (localizedAssets.length === 0) {
    throw new Error(`${route} no contiene recursos bajo ${base}_astro/.`);
  }

  for (const alternate of Object.keys(expectedMetadata)) {
    requireAttribute(
      document,
      `link[rel="alternate"][hreflang="${alternate}"]`,
      "href",
      `${site}${base}${APP_SEGMENT}/${alternate}/`,
      route,
    );
  }
}

export function resolveEntryFromHtml(html, saved, browserLanguages, {
  standalone = false,
  appleStandalone = false,
  storageBlocked = false,
  search = "",
  hash = "",
} = {}) {
  const script = new JSDOM(html).window.document.querySelector("script")?.textContent;
  if (!script) throw new Error("La ruta de entrada no contiene el resolver de idioma.");

  let lang = "";
  let destination = null;
  runInNewContext(script, {
    navigator: {
      languages: browserLanguages,
      language: browserLanguages[0] ?? "",
      standalone: appleStandalone,
    },
    document: { documentElement: { setAttribute: (_name, value) => { lang = value; } } },
    window: {
      localStorage: { getItem: () => {
        if (storageBlocked) throw new Error("Storage blocked");
        return saved;
      } },
      matchMedia: () => ({ matches: standalone }),
      location: { search, hash, replace: (url) => { destination = url; } },
    },
  });
  return { lang, destination };
}

export function resolveLandingLangFromHtml(html, saved, browserLanguages) {
  return resolveEntryFromHtml(html, saved, browserLanguages).lang;
}

export function validateLandingRouteHtml(html) {
  const { site, base } = siteAndBase();
  const route = base;
  const canonical = `${site}${base}`;

  const document = new JSDOM(html).window.document;
  const hintCount = document.querySelectorAll("[data-home-screen-hint]").length;
  if (hintCount !== 0) {
    throw new Error(`${route} contiene ${hintCount} sugerencias de instalación; se esperaba 0.`);
  }
  const suppressionScript = singleElement(document, "script[data-install-suppression]", route).textContent;
  let suppressed = false;
  runInNewContext(suppressionScript, { window: { addEventListener: (event, callback) => {
    if (event === "beforeinstallprompt") callback({ preventDefault: () => { suppressed = true; } });
  } } });
  if (!suppressed) {
    throw new Error(`${route} bloquea la promoción automática de instalación = false; se esperaba true.`);
  }
  if (!document.documentElement.hasAttribute("data-lang")) {
    throw new Error(`${route} debe exponer html[data-lang] para el interruptor bilingüe.`);
  }
  requireAttribute(document, 'link[rel="canonical"]', "href", canonical, route);

  const appLinks = [...document.querySelectorAll(`a[href^="${base}${APP_SEGMENT}/"]`)]
    .map((anchor) => new URL(anchor.getAttribute("href"), site).pathname);
  for (const locale of Object.keys(expectedMetadata)) {
    if (!appLinks.includes(`${base}${APP_SEGMENT}/${locale}/`)) {
      throw new Error(`${route} debe enlazar a la app en ${locale} (${base}${APP_SEGMENT}/${locale}/).`);
    }
  }
}

/** /es/ and /en/ are the landing in one language, for sharing a link in that language. */
export function validateLocalizedLandingRouteHtml(html, locale) {
  const { site, base } = siteAndBase();
  const route = `${base}${locale}/`;
  const document = new JSDOM(html).window.document;
  if (document.documentElement.lang !== locale) {
    throw new Error(`${route} tiene html[lang] = ${document.documentElement.lang}; se esperaba ${locale}.`);
  }
  requireAttribute(document, 'link[rel="canonical"]', "href", `${site}${route}`, route);
  requireAttribute(document, 'meta[property="og:url"]', "content", `${site}${route}`, route);
  requireAttribute(document, 'link[rel="alternate"][hreflang="x-default"]', "href", `${site}${base}`, route);
  for (const alternate of Object.keys(expectedMetadata)) {
    requireAttribute(document, `link[rel="alternate"][hreflang="${alternate}"]`, "href", `${site}${base}${alternate}/`, route);
  }
  if (document.querySelector('meta[name="robots"][content*="noindex"]')) {
    throw new Error(`${route} no debe llevar noindex: es una página para compartir.`);
  }
  const appLinks = [...document.querySelectorAll(`a[href^="${base}${APP_SEGMENT}/"]`)]
    .map((anchor) => new URL(anchor.getAttribute("href"), site).pathname);
  const expected = `${base}${APP_SEGMENT}/${locale}/`;
  const foreign = appLinks.filter((path) => !path.startsWith(expected));
  if (!appLinks.includes(expected) || foreign.length > 0) {
    throw new Error(`${route} debe enlazar solo a la app en ${locale} (${expected}); enlaza a ${appLinks.join(", ")}.`);
  }
}

export function validateAppEntryRouteHtml(html, segment = APP_SEGMENT) {
  const { site, base } = siteAndBase();
  const route = `${base}${segment}/`;
  const document = new JSDOM(html).window.document;
  singleElement(document, "script[data-app-launch]", route);
  requireAttribute(document, 'link[rel="manifest"]', "href", `${base}site.webmanifest`, route);
  for (const locale of Object.keys(expectedMetadata)) {
    const link = document.querySelector(`a[lang="${locale}"]`);
    const actual = link && new URL(link.getAttribute("href"), site).pathname;
    const expected = `${base}${APP_SEGMENT}/${locale}/`;
    if (actual !== expected) {
      throw new Error(`${route} tiene enlace de idioma ${locale} = ${actual}; se esperaba ${expected}.`);
    }
  }
}

export function resolveLegacyRedirectFromHtml(html, { search = "", hash = "" } = {}) {
  const script = new JSDOM(html).window.document.querySelector("script[data-legacy-redirect]")?.textContent;
  if (!script) throw new Error("La ruta antigua no contiene el script de redirección.");
  let destination = null;
  runInNewContext(script, {
    window: { location: { search, hash, replace: (url) => { destination = url; } } },
  });
  return destination;
}

export function validateLegacyLocaleRouteHtml(html, locale) {
  const { site, base } = siteAndBase();
  const route = `${base}${LEGACY_APP_SEGMENT}/${locale}/`;
  const target = `${base}${APP_SEGMENT}/${locale}/`;
  const document = new JSDOM(html).window.document;
  requireAttribute(document, 'meta[name="robots"]', "content", "noindex", route);
  requireAttribute(document, 'link[rel="canonical"]', "href", `${site}${target}`, route);
  requireAttribute(document, 'meta[http-equiv="refresh"]', "content", `0; url=${target}`, route);
  const search = "?source=homescreen";
  const hash = "#conversation";
  const expected = `${target}${search}${hash}`;
  const actual = resolveLegacyRedirectFromHtml(html, { search, hash });
  if (actual !== expected) {
    throw new Error(`${route} redirige a ${actual}; se esperaba ${expected}.`);
  }
}

export async function assertAuditsNotDeployed(
  distDirectory = resolve("dist"),
  publicDirectory = resolve("public"),
) {
  if (existsSync(resolve(publicDirectory, "audits"))) {
    throw new Error(
      "public/audits no debe existir: las auditorías se guardan en audits/ y no se despliegan.",
    );
  }
  const entries = await readdir(distDirectory, { recursive: true });
  const leaked = entries.filter((entry) => entry.split(/[\\/]/).includes("audits"));
  if (leaked.length > 0) {
    throw new Error(
      `dist contiene rutas de auditoría que no deben desplegarse: ${leaked.join(", ")}`,
    );
  }
}

export async function validateStaticRoutes(distDirectory = resolve("dist")) {
  await Promise.all(
    Object.keys(expectedMetadata).map(async (locale) => {
      const html = await readFile(resolve(distDirectory, APP_SEGMENT, locale, "index.html"), "utf8");
      validateLocalizedRouteHtml(html, locale);
    }),
  );

  const rootHtml = await readFile(resolve(distDirectory, "index.html"), "utf8");
  validateLandingRouteHtml(rootHtml);
  await Promise.all(
    Object.keys(expectedMetadata).map(async (locale) => {
      const html = await readFile(resolve(distDirectory, locale, "index.html"), "utf8");
      validateLocalizedLandingRouteHtml(html, locale);
    }),
  );
  const appEntryHtml = await readFile(resolve(distDirectory, APP_SEGMENT, "index.html"), "utf8");
  validateAppEntryRouteHtml(appEntryHtml);
  const legacyEntryHtml = await readFile(
    resolve(distDirectory, LEGACY_APP_SEGMENT, "index.html"),
    "utf8",
  );
  validateAppEntryRouteHtml(legacyEntryHtml, LEGACY_APP_SEGMENT);
  await Promise.all(
    Object.keys(expectedMetadata).map(async (locale) => {
      const html = await readFile(
        resolve(distDirectory, LEGACY_APP_SEGMENT, locale, "index.html"),
        "utf8",
      );
      validateLegacyLocaleRouteHtml(html, locale);
    }),
  );

  const rootCases = [
    ["es", ["en-US"], "es"],
    ["en", ["es-ES"], "en"],
    [null, ["es-ES", "en-US"], "es"],
    [null, ["en-US"], "en"],
    [null, ["fr-FR", "es-ES"], "es"],
    [null, ["fr-FR"], "en"],
    ["fr", ["es-ES"], "es"],
  ];
  for (const [saved, languages, expected] of rootCases) {
    const actual = resolveLandingLangFromHtml(rootHtml, saved, languages);
    if (actual !== expected) {
      throw new Error(`La raíz resolvió el idioma ${actual}; se esperaba ${expected}.`);
    }
    const expectedUrl = `${siteAndBase().base}${APP_SEGMENT}/${expected}/`;
    for (const [html, options, destination] of [
      [rootHtml, {}, null],
      [rootHtml, { standalone: true }, expectedUrl],
      [rootHtml, { appleStandalone: true }, expectedUrl],
      [appEntryHtml, {}, expectedUrl],
      [legacyEntryHtml, {}, expectedUrl],
    ]) {
      const actualUrl = resolveEntryFromHtml(html, saved, languages, options).destination;
      if (actualUrl !== destination) {
        throw new Error(`La entrada abrió ${actualUrl}; se esperaba ${destination}.`);
      }
    }
  }

  await assertAuditsNotDeployed(distDirectory);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  await validateStaticRoutes();
  console.log("Rutas estáticas validadas: landing raíz, landings /es/ y /en/, entrada de app, app localizada y redirecciones desde /app/.");
}
