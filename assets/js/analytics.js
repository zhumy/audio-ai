(function () {
  const config = window.AudioAIAnalytics || {};

  if (!config.enabled) {
    return;
  }

  const provider = String(config.provider || "").toLowerCase();
  const siteId = String(config.siteId || "").trim();

  function appendScript(src, attributes) {
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = src;

    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        script.setAttribute(key, value);
      }
    });

    document.head.appendChild(script);
    return script;
  }

  if (!siteId) {
    console.warn("AudioAIAnalytics is enabled, but siteId is empty.");
    return;
  }

  if (provider === "cloudflare") {
    appendScript("https://static.cloudflareinsights.com/beacon.min.js", {
      "data-cf-beacon": JSON.stringify({ token: siteId }),
    });
    return;
  }

  if (provider === "umami") {
    appendScript(config.scriptSrc || "https://cloud.umami.is/script.js", {
      "data-website-id": siteId,
    });
    return;
  }

  if (provider === "plausible") {
    appendScript(config.scriptSrc || "https://plausible.io/js/script.js", {
      "data-domain": siteId,
    });
    return;
  }

  if (provider === "ga4") {
    appendScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(siteId));
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", siteId);
    return;
  }

  console.warn("Unsupported AudioAIAnalytics provider:", provider);
})();
