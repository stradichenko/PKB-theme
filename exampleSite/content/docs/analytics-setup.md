+++
title = "Self-Hosted Analytics for PKB-theme"
date = 2023-06-01T09:00:00-07:00
draft = false
tags = ["analytics", "privacy", "self-hosted", "documentation", "setup"]
categories = ["guides", "documentation"]
toc = true
description = "A comprehensive guide for implementing privacy-focused, FOSS analytics in your PKB-theme site"
+++

# Self-Hosted Analytics for PKB-theme

This guide helps you implement visitor analytics for your PKB-theme using privacy-respecting, FOSS (Free and Open Source Software) solutions. Unlike commercial analytics platforms that collect excessive data and track users across sites, these tools focus on essential metrics while respecting user privacy.

## Analytics Solutions Comparison

| Solution | Technologies | Size | Privacy Features | Complexity | Key Advantages | Limitations |
|----------|--------------|------|-----------------|------------|----------------|-------------|
| [Plausible](https://plausible.io/) | Elixir/PostgreSQL | <1KB | No cookies, GDPR compliant | Easy | Lightweight script, simple dashboard | Limited segmentation compared to Matomo |
| [Umami](https://umami.is/) | Next.js/PostgreSQL | ~2KB | No cookies, GDPR compliant | Easy | Easy deployment options, multiple users | Fewer features than Matomo |
| [Matomo](https://matomo.org/) | PHP/MySQL | ~20KB | Configurable tracking, opt-out | Medium | Feature-rich, similar to GA | Requires more resources |
| [Fathom Lite](https://github.com/usefathom/fathom) | Go/SQLite | ~1KB | Minimal data collection | Easy | Extremely lightweight | Limited features |
| [Shynet](https://github.com/milesmcc/shynet) | Python/Django | ~0KB* | Can work without JS | Medium | Works with JS disabled | Less intuitive interface |

*Shynet can use tracking pixels instead of JavaScript

## Setup Instructions

### Plausible Analytics

1. **Install Plausible**

   Using Docker Compose:

   ```yaml
   version: '3'
   services:
     plausible:
       image: plausible/analytics:latest
       restart: always
       ports:
         - "8000:8000"
       environment:
         - BASE_URL=https://plausible.yourdomain.com
         - SECRET_KEY_BASE=your_secret_key_base
       volumes:
         - ./data:/data
       depends_on:
         - postgres
         - clickhouse
     
     postgres:
       image: postgres:14
       restart: always
       volumes:
         - ./postgres-data:/var/lib/postgresql/data
       environment:
         - POSTGRES_PASSWORD=postgres
   
     clickhouse:
       image: clickhouse/clickhouse-server:22.6
       restart: always
       volumes:
         - ./clickhouse-data:/var/lib/clickhouse
       environment:
         - CLICKHOUSE_DB=plausible
   ```

2. **Set up a reverse proxy** with Nginx or Caddy to secure your Plausible instance.

3. **Integrate with PKB-theme**: Add to your `config.toml`:

   ```toml
   [params.analytics]
     plausible = true
     plausibleDomain = "yourdomain.com"
     plausibleScriptSrc = "https://plausible.yourdomain.com/js/script.js"
   ```

### Umami Analytics

1. **Install Umami**:

   Using Docker Compose:

   ```yaml
   version: '3'
   services:
     umami:
       image: ghcr.io/umami-software/umami:postgresql-latest
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: postgresql://umami:umami@db:5432/umami
         DATABASE_TYPE: postgresql
         HASH_SALT: your-random-string
       restart: always
       depends_on:
         - db
     
     db:
       image: postgres:14-alpine
       environment:
         POSTGRES_DB: umami
         POSTGRES_USER: umami
         POSTGRES_PASSWORD: umami
       volumes:
         - ./umami-db-data:/var/lib/postgresql/data
       restart: always
   ```

2. **Configure Umami**:
   - Access the Umami dashboard at `http://your-server:3000`
   - Create your admin account
   - Add your website to get the tracking code

3. **Integrate with PKB-theme**: Add to your `config.toml`:

   ```toml
   [params.analytics]
     umami = true
     umamiWebsiteId = "your-website-id"
     umamiScriptSrc = "https://analytics.yourdomain.com/umami.js"
   ```

### Matomo Analytics

1. **Install Matomo**:

   Using Docker Compose:

   ```yaml
   version: '3'
   services:
     matomo:
       image: matomo:latest
       restart: always
       ports:
         - "8080:80"
       environment:
         - MATOMO_DATABASE_HOST=db
       volumes:
         - ./matomo:/var/www/html
       depends_on:
         - db
     
     db:
       image: mysql:5.7
       restart: always
       volumes:
         - ./mysql:/var/lib/mysql
       environment:
         - MYSQL_ROOT_PASSWORD=your_root_password
         - MYSQL_DATABASE=matomo
         - MYSQL_USER=matomo
         - MYSQL_PASSWORD=your_matomo_password
   ```

2. **Configure Matomo**:
   - Complete the web-based installation wizard
   - Configure privacy settings to comply with your policies
   - Get your tracking code

3. **Integrate with PKB-theme**: Add to your `config.toml`:

   ```toml
   [params.analytics]
     matomo = true
     matomoSiteId = "1"
     matomoURL = "https://analytics.yourdomain.com/"
   ```

## Privacy Configuration Best Practices

- **Data Minimization**: Only collect what you need
- **Retention Policies**: Set up automatic data deletion after a certain period
- **IP Anonymization**: Truncate IPs for better privacy
- **Clear Disclosures**: Add a privacy policy explaining your analytics
- **No Cross-Site Tracking**: Never track users across different websites

## Advanced Usage

### Custom Event Tracking

For user interactions like downloads or link clicks, add custom event tracking:

```javascript
// For Plausible
plausible('Download', {props: {type: 'PDF', name: 'example.pdf'}});

// For Umami
umami.track('Download', {type: 'PDF', name: 'example.pdf'});

// For Matomo
_paq.push(['trackEvent', 'Download', 'PDF', 'example.pdf']);
```

### Filtering Bots and Self-Visits

Most self-hosted analytics solutions let you filter out your own visits and bot traffic. Check the documentation for your chosen platform for specific instructions.

## Troubleshooting

- **No Data Showing**: Verify your site ID and script URL are correct
- **Tracking Script Blocked**: Some ad blockers may block analytics scripts
- **Resource Constraints**: For high-traffic sites, ensure your hosting has adequate resources

## Conclusion

Self-hosted analytics give you complete control over your data while respecting visitor privacy. Choose the solution that best matches your needs, technical abilities, and hosting resources.
