+++
title = "Matomo Analytics Setup Guide"
date = 2023-06-10T09:00:00-07:00
draft = false
tags = ["analytics", "matomo", "privacy", "self-hosted", "documentation"]
categories = ["guides", "documentation"]
toc = true
description = "Comprehensive guide for setting up Matomo Analytics with your PKB-theme site"
+++

# Matomo Analytics for PKB-theme

This guide provides detailed instructions for integrating Matomo Analytics with your PKB-theme. Matomo is a powerful, privacy-focused alternative to Google Analytics that gives you complete control over your data.

## Why Choose Matomo?

Matomo (formerly Piwik) offers several advantages:

- **Full data ownership**: All data stays on your server
- **Privacy compliance**: Built-in GDPR, CCPA, and cookie law compliance tools
- **Feature parity**: Similar features to Google Analytics
- **No data limits**: Analyze unlimited websites and users
- **Customizable**: Extensive API and plugin system

## Installation Options

### Option 1: Docker Installation (Recommended)

1. **Create a docker-compose.yml file**:

```yaml
version: '3'
services:
  matomo:
    image: matomo:latest
    restart: always
    volumes:
      - ./matomo:/var/www/html
    environment:
      - MATOMO_DATABASE_HOST=db
    ports:
      - "8080:80"
    depends_on:
      - db

  db:
    image: mysql:5.7
    restart: always
    volumes:
      - ./db:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=change_this_password
      - MYSQL_DATABASE=matomo
      - MYSQL_USER=matomo
      - MYSQL_PASSWORD=change_this_password
```

2. **Start the containers**:

```bash
docker-compose up -d
```

3. **Access the Matomo installer**:
   - Navigate to `http://your-server:8080`
   - Follow the installation wizard

### Option 2: Manual Installation

1. **Server requirements**:
   - Web server (Apache/Nginx)
   - PHP 7.2+ with required extensions
   - MySQL/MariaDB database

2. **Download and install**:

```bash
# Create directory
mkdir -p /var/www/matomo
cd /var/www/matomo

# Download latest Matomo
wget https://builds.matomo.org/matomo.zip
unzip matomo.zip
rm matomo.zip

# Set permissions
chown -R www-data:www-data .
```

3. **Configure your web server**:

For Nginx:

```nginx
server {
    listen 80;
    server_name analytics.yourdomain.com;
    root /var/www/matomo;
    index index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

4. **Complete the web installation**

## Configuration Best Practices

### Privacy Configuration

1. **Enable anonymization**:
   - Go to **Administration → Privacy → Anonymize data**
   - Enable IP anonymization
   - Configure tracking cookie settings

2. **Set data retention policies**:
   - Go to **Administration → Privacy → Data retention**
   - Configure how long raw data is stored

3. **Create opt-out mechanism**:
   - Go to **Administration → Privacy → Users opt-out**
   - Configure and copy the opt-out iframe code

### Performance Optimization

1. **Enable archiving**:
   - Set up the cron job for report processing:

```bash
*/5 * * * * /usr/bin/php /var/www/matomo/console core:archive --url=https://analytics.yourdomain.com > /dev/null
```

2. **Database optimization**:
   - Go to **Administration → System → Database**
   - Run the optimization routinely

3. **Consider using Redis for caching**:
   - Install the Redis Server plugin
   - Configure Redis connection

## Integrating Matomo with PKB-theme

1. **Get your tracking code**:
   - In Matomo, go to **Administration → Tracking Code**
   - Note your Site ID and Matomo URL

2. **Configure your site**:
   - Add Matomo settings to your site's `config.toml`:

```toml
[params.analytics]
  matomo = true
  matomoSiteId = "1"
  matomoURL = "https://analytics.yourdomain.com/"
```

### Advanced Tracking Features

Matomo offers various advanced tracking features:

1. **Custom dimensions**:
   - Go to **Administration → Custom Dimensions**
   - Create dimensions for tracking additional data

```javascript
// Example: track user type
_paq.push(['setCustomDimension', 1, 'member']);
```

2. **Event tracking**:
   - Track user interactions:

```javascript
// Format: trackEvent(category, action, name, value)
_paq.push(['trackEvent', 'Download', 'PDF', 'whitepaper.pdf', 1]);
```

3. **Content tracking**:
   - Track which parts of your content are visible and clicked:

```javascript
_paq.push(['enableContentTracking', true]);
```

## Viewing and Analyzing Data

### Key Reports

1. **Visitors Overview**: Real-time and historical visitor data
2. **Behavior**: Page views, entry/exit pages, site search
3. **Acquisition**: Referrers, campaigns, search engines
4. **Custom Reports**: Create reports with dimensions important to you

### Creating Custom Dashboards

1. Go to **Dashboard → Dashboard Manager**
2. Click **Create new dashboard**
3. Add widgets that display your most important metrics

## Security Considerations

1. **Secure your Matomo installation**:
   - Use HTTPS
   - Set up HTTP basic authentication
   - Configure proper file permissions

2. **Regular updates**:
   - Stay current with security updates:

```bash
# For Docker:
docker-compose pull
docker-compose up -d

# For manual installations:
cd /var/www/matomo
php console core:update
```

## Troubleshooting

### Common Issues and Solutions

1. **No data being tracked**:
   - Verify tracking code installation
   - Check for JavaScript errors
   - Look for ad blockers or tracking blockers

2. **High server load**:
   - Set up proper archiving via cron
   - Increase PHP memory limits
   - Consider database optimization

3. **Missing data**:
   - Check tracking permissions
   - Verify proper SSL configuration
   - Test for JavaScript conflicts

## Conclusion

With Matomo properly set up, you gain powerful analytics capabilities while maintaining full control over your data and respecting visitor privacy. The integration with PKB-theme makes the setup process straightforward, allowing you to focus on analyzing data and improving your site rather than managing infrastructure.
