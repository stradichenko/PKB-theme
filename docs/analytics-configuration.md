# Analytics Configuration for PKB-theme

This document describes how to configure various self-hosted analytics options for your PKB-theme website.

## Available Analytics Providers

PKB-theme supports the following privacy-focused analytics providers:

- Matomo (formerly Piwik)
- Plausible
- Umami
- Fathom Lite
- Shynet

## Configuration

Add the following to your `config.toml` or `hugo.toml` file:

```toml
[params.analytics]
  # Uncomment and configure the analytics system you want to use
  
  # Matomo Analytics
  # matomo = true
  # matomoSiteId = "1"
  # matomoURL = "https://analytics.yourdomain.com/"
  
  # Plausible Analytics
  # plausible = true
  # plausibleDomain = "yourdomain.com"
  # plausibleScriptSrc = "https://plausible.io/js/script.js"
  
  # Umami Analytics
  # umami = true
  # umamiWebsiteId = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
  # umamiScriptSrc = "https://analytics.yourdomain.com/umami.js"
  
  # Fathom Analytics
  # fathom = true
  # fathomSiteId = "ABCDEFGH"
  # fathomScriptSrc = "https://cdn.usefathom.com/script.js"
  
  # Shynet Analytics
  # shynet = true
  # shynetURL = "https://analytics.yourdomain.com"
  # shynetUUID = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
```

## Detailed Installation Guides

For detailed installation instructions, refer to these content pages:

- [General Analytics Setup](/content/docs/analytics-setup.md)
- [Matomo Setup Guide](/content/docs/matomo-analytics-setup.md)

## Privacy Considerations

All supported analytics platforms are chosen for their privacy-respecting features:
- No cross-site tracking
- Minimal or no cookies
- GDPR compliance options
- Data ownership (self-hosting)

Remember to update your site's privacy policy to reflect your analytics practices.
