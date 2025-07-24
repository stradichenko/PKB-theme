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

```mermaid
flowchart TB
 subgraph subGraph0["PKB-theme Project"]
        PKB["/home/gespitia/projects/PKB-theme/"]
        CONFIG_TOML["config/_default/hugo.toml<br>🔧 Analytics Configuration"]
        SEO_YML["data/seo.yml<br>🚀 Performance Config"]
  end
 subgraph subGraph1["Core Docker Configuration"]
        DOCKER_COMPOSE["docker-compose.yml<br>🐳 Container Orchestration"]
        DOCKER_OVERRIDE["docker-compose.override.yml<br>🔧 Development Overrides"]
        ENV_FILE[".env<br>🔐 Environment Variables"]
  end
 subgraph subGraph2["Database Configuration"]
        POSTGRES_CONF["postgresql.conf<br>🗄️ Database Tuning"]
        POSTGRES_INIT["postgres-init/01-init.sql<br>📊 Database Setup"]
  end
 subgraph subGraph3["Cache Configuration"]
        REDIS_CONF["redis.conf<br>⚡ Cache Settings"]
  end
 subgraph subGraph4["Backup & Monitoring"]
        BACKUP_SCRIPT["backup-script.sh<br>💾 Database Backup"]
        BACKUP_CLEANUP["backup-cleanup.sh<br>🧹 Cleanup Script"]
        MONITOR_SCRIPT["monitor-matomo.sh<br>📊 Health Check"]
  end
 subgraph subGraph5["Runtime Directories (Auto-created)"]
        CONFIG_DIR["config/<br>📁 Matomo Config"]
        LOGS_DIR["logs/<br>📋 Application Logs"]
        PLUGINS_DIR["plugins/<br>🔌 Custom Plugins"]
        BACKUPS_DIR["backups/<br>💾 Database Backups"]
  end
 subgraph subGraph6["Existing Config Files"]
        MATOMO_CONFIG["config/config.ini.php<br>⚙️ Matomo Settings (Auto-generated)"]
        GLOBAL_CONFIG["config/global.ini.php<br>📋 Global Settings (Read-only)"]
        PLUGIN_CONFIGS["plugins/*/config/<br>🔌 Plugin Configurations"]
  end
 subgraph subGraph7["Matomo Analytics Project"]
        MATOMO_ROOT["/home/gespitia/projects/matomo-analytics/"]
        subGraph1
        subGraph2
        subGraph3
        subGraph4
        subGraph5
        subGraph6
  end
 subgraph subGraph8["System Configuration (Optional)"]
        NGINX_CONF["nginx-analytics.conf<br>🌐 Reverse Proxy"]
        SYSTEM_NGINX["/etc/nginx/sites-available/<br>📁 System Nginx Config"]
        SYSTEMD_SERVICE["/etc/systemd/system/matomo-docker.service<br>🔄 Auto-start Service"]
        CRON_JOBS["/etc/cron.d/matomo<br>⏰ Scheduled Tasks"]
  end
 subgraph subGraph9["Project Structure Overview"]
        subGraph0
        subGraph7
        subGraph8
  end

    PKB --> CONFIG_TOML & SEO_YML
    MATOMO_ROOT --> DOCKER_COMPOSE & DOCKER_OVERRIDE & ENV_FILE & POSTGRES_CONF & POSTGRES_INIT & REDIS_CONF & BACKUP_SCRIPT & BACKUP_CLEANUP & MONITOR_SCRIPT
    MATOMO_ROOT -.-> CONFIG_DIR & LOGS_DIR & PLUGINS_DIR & BACKUPS_DIR
    CONFIG_DIR --> MATOMO_CONFIG & GLOBAL_CONFIG
    PLUGINS_DIR --> PLUGIN_CONFIGS
    NGINX_CONF -.-> SYSTEM_NGINX
    ENV_FILE -.-> DOCKER_COMPOSE
    POSTGRES_CONF -.-> DOCKER_COMPOSE
    REDIS_CONF -.-> DOCKER_COMPOSE
    BACKUP_SCRIPT -.-> DOCKER_COMPOSE & CRON_JOBS
    BACKUP_CLEANUP -.-> DOCKER_COMPOSE
    POSTGRES_INIT -.-> DOCKER_COMPOSE
    CONFIG_TOML -.-> NGINX_CONF
    NGINX_CONF -.-> SYSTEMD_SERVICE
    MONITOR_SCRIPT -.-> CRON_JOBS
    
     CONFIG_TOML:::pkb
     SEO_YML:::pkb
     DOCKER_COMPOSE:::coreConfig
     DOCKER_OVERRIDE:::coreConfig
     ENV_FILE:::coreConfig
     POSTGRES_CONF:::dbConfig
     POSTGRES_INIT:::dbConfig
     REDIS_CONF:::cacheConfig
     BACKUP_SCRIPT:::monitoring
     BACKUP_CLEANUP:::monitoring
     MONITOR_SCRIPT:::monitoring
     CONFIG_DIR:::runtime
     LOGS_DIR:::runtime
     PLUGINS_DIR:::runtime
     BACKUPS_DIR:::runtime
     MATOMO_CONFIG:::existing
     GLOBAL_CONFIG:::existing
     PLUGIN_CONFIGS:::existing
     NGINX_CONF:::system
     SYSTEMD_SERVICE:::system
     CRON_JOBS:::system
     
    classDef coreConfig fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef dbConfig fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef cacheConfig fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef monitoring fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef runtime fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef existing fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    classDef system fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef pkb fill:#e0f2f1,stroke:#00695c,stroke-width:2px
```

## Diagram Internet to files
```mermaid
flowchart TB


```

Here are the suggested file locations and names for each configuration:

## Directory tree

```bash
/home/gespitia/projects/
├── PKB-theme/
│   ├── config/_default/
│   │   └── hugo.toml                  # Analytics configuration
│   └── data/
│       └── seo.yml                    # Performance & preconnect settings
│
├── matomo-analytics/
│   ├── docker-compose.yml             # ✅ Container orchestration
│   ├── docker-compose.override.yml    # 🆕 Development overrides
│   ├── .env                           # ✅ Environment variables (passwords/secrets)
│   ├── postgresql.conf                # ✅ PostgreSQL performance tuning
│   ├── redis.conf                     # ✅ Redis cache configuration
│   ├── backup-script.sh               # 🆕 Database backup automation
│   ├── backup-cleanup.sh              # 🆕 Backup cleanup script
│   ├── monitor-matomo.sh              # ✅ Health monitoring script
│   ├── nginx-analytics.conf           # 🆕 Nginx proxy config (renamed from 'server {')
│   │
│   ├── config/                        # ✅ Auto-created by Matomo
│   │   ├── config.ini.php             # ✅ Matomo configuration (auto-generated)
│   │   └── global.ini.php             # ✅ Global settings (read-only)
│   │
│   ├── logs/                          # ✅ Application logs directory
│   │   └── (log files...)
│   │
│   ├── plugins/                       # ✅ Custom Matomo plugins
│   │   ├── Actions/config/config.php  # ✅ Plugin configurations
│   │   ├── API/config/config.php      # ✅ (many plugin configs exist)
│   │   └── (other plugin files...)
│   │
│   ├── backups/                       # 🆕 Database backup storage
│   │   └── (backup files...)
│   │
│   └── postgres-init/                 # ✅ PostgreSQL initialization
│       └── 01-init.sql                # ✅ Database setup script
│
└── (other projects...)

# Legend:
# ✅ = Files that already exist in your setup
# 🆕 = New files to be created
```

## FIle Creation Commands
```bash
# 1. Create main directory structure
mkdir -p /home/gespitia/projects/matomo-analytics/{config,logs,plugins,backups,postgres-init}

# 2. Create core configuration files
touch /home/gespitia/projects/matomo-analytics/.env
touch /home/gespitia/projects/matomo-analytics/docker-compose.yml
touch /home/gespitia/projects/matomo-analytics/docker-compose.override.yml
touch /home/gespitia/projects/matomo-analytics/postgresql.conf
touch /home/gespitia/projects/matomo-analytics/redis.conf

# 3. Create scripts
touch /home/gespitia/projects/matomo-analytics/backup-script.sh
touch /home/gespitia/projects/matomo-analytics/backup-cleanup.sh
touch /home/gespitia/projects/matomo-analytics/monitor-matomo.sh

# 4. Create PostgreSQL init script
touch /home/gespitia/projects/matomo-analytics/postgres-init/01-init.sql

# 5. Set permissions for scripts
chmod +x /home/gespitia/projects/matomo-analytics/backup-script.sh
chmod +x /home/gespitia/projects/matomo-analytics/monitor-matomo.sh

# 6. System files (require sudo)
sudo touch /etc/nginx/sites-available/matomo-analytics
sudo touch /etc/systemd/system/matomo-docker.service
sudo touch /etc/cron.d/matomo

# 7. <YOUR-SITE> integration (files already exist, just need modification)
# Edit: /home/gespitia/projects/<YOUR-SITE>/config/_default/hugo.toml
# Edit: /home/gespitia/projects/<YOUR-SITE>/data/seo.yml
```

```bash
# Copy the theme files to modify:
curl -L -o config/_default/params.toml https://github.com/stradichenko/PKB-theme/raw/main/config/_default/params.toml
curl -L -o data/seo.yml https://github.com/stradichenko/PKB-theme/raw/main/data.seo.yml
```


## File Locations and Names
**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projects/matomo-analytics/docker-compose.yml</code></summary>

```yaml
version: '3.8'

services:
  matomo:
    image: matomo:5-apache
    restart: unless-stopped
    volumes:
      - ./config:/var/www/html/config:rw
      - ./logs:/var/www/html/logs:rw
      - ./plugins:/var/www/html/plugins:rw
    environment:
      - MATOMO_DATABASE_HOST=db
      - MATOMO_DATABASE_ADAPTER=PDO\PGSQL
      - MATOMO_DATABASE_TABLES_PREFIX=matomo_
      - MATOMO_DATABASE_USERNAME=matomo
      - MATOMO_DATABASE_PASSWORD=${DB_PASSWORD}       # ensure DB_PASSWORD is set in .env
      - MATOMO_DATABASE_DBNAME=matomo
      - MATOMO_DATABASE_PORT=5432
      - MATOMO_GENERAL_SALT=${MATOMO_SALT}            # ensure MATOMO_SALT is set in .env
      - PHP_MEMORY_LIMIT=768M
      - PHP_MAX_EXECUTION_TIME=300
      - PHP_UPLOAD_MAX_FILESIZE=50M
      - PHP_POST_MAX_SIZE=50M
      - MATOMO_ASSUME_SECURE_PROTOCOL=1
      - MATOMO_FORCE_SSL=1
      - MATOMO_PROXY_CLIENT_HEADERS=HTTP_X_FORWARDED_FOR,HTTP_X_REAL_IP
      - MATOMO_PROXY_HOST_HEADERS=HTTP_X_FORWARDED_HOST
      - MATOMO_TRUSTED_HOSTS=analytics.yourdomain.com,localhost # ! Modify this line with your domain
    ports:
      - "127.0.0.1:8080:80"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -fs http://localhost/matomo.php || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - matomo_network
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
    logging:
      driver: json-file
      options:
        max-size: 10m
        max-file: '3'

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d:ro
      - ./postgresql.conf:/etc/postgresql/postgresql.conf:ro
    environment:
      - POSTGRES_DB=matomo
      - POSTGRES_USER=matomo
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    command:
      - postgres
      - -c
      - config_file=/etc/postgresql/postgresql.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U matomo -d matomo"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - matomo_network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    logging:
      driver: json-file
      options:
        max-size: 10m
        max-file: '3'

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
    networks:
      - matomo_network
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'
    logging:
      driver: json-file
      options:
        max-size: 10m
        max-file: '3'

  db-backup:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - ./backups:/backups
      - ./backup-script.sh:/backup-script.sh:ro
      - ./backup-cleanup.sh:/backup-cleanup.sh:ro
    environment:
      - PGPASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=matomo
      - POSTGRES_USER=matomo
      - POSTGRES_HOST=db
      - BACKUP_RETENTION_DAYS=30
      - BACKUP_COMPRESSION=gzip
      - TZ=Europe/Madrid                             # ensure cron runs at local times
    command: >
      sh -c "
        apk add --no-cache dcron gzip &&
        echo '0 2 * * * /backup-script.sh' | crontab - &&
        echo '0 3 * * 0 /backup-cleanup.sh' | crontab - &&
        crond -f
      "
    depends_on:
      - db
    networks:
      - matomo_network

volumes:
  db_data:
  redis_data:

networks:
  matomo_network:
    driver: bridge

```
</details>

### analytics-proxy.conf
Handles external web traffic on port 80. Forwards requests to your Dockerized Matomo instance. Sets the proper headers that Matomo expects when behind a proxy.

**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projects/matomo-analytics/analytics-proxy.conf</code></summary>

```conf
server {
    listen 80;
    server_name analytics.your-domain.com;  # Change to your subdomain
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Handle WebSocket connections
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Additional headers for Matomo
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```


## Understanding the Network Setup (Simple Explanation)

### What are Ports?
Think of your server like a building with many doors. Each door has a number (the port):
- **Port 80** = Main entrance (where websites normally live)
- **Port 8080** = Back door (where your Matomo container runs)
- **Port 443** = Secure entrance (for HTTPS websites)

### What is a Proxy?
A proxy is like a receptionist at the main entrance:
1. Visitors come to your main door (Port 80)
2. The receptionist (Nginx proxy) takes their request
3. The receptionist walks to the back door (Port 8080) where Matomo lives
4. Gets the response from Matomo
5. Brings it back to the visitor at the main entrance

### Why Do You Need This?
```
Internet → Port 80 (Nginx) → Port 8080 (Docker Matomo)
```

**Without proxy:** Visitors would need to type `yoursite.com:8080` (ugly and confusing)
**With proxy:** Visitors type `analytics.yoursite.com` (clean and professional)

### Your Current Setup
- **Docker Matomo** runs on `127.0.0.1:8080` (only accessible from your server)
- **Nginx proxy** runs on port 80 (accessible from internet)
- **Domain** `analytics.krotanote.xyz` points to your server's IP address

### analytics-proxy.conf
**File Location:** `/home/<USER>/projects/matomo-analytics/analytics-proxy.conf`

```nginx
server {
    listen 80;
    server_name analytics.your-domain.com;  # Change to your subdomain
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Handle WebSocket connections
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Additional headers for Matomo
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```
</details>


### Backup Strategy
**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projects/matomo-analytics/docker-compose.override.yml</code></summary>

```yml
version: '3.8'

services:
  matomo:
    # Development settings
    environment:
      - MATOMO_DEV_MODE=1             # Enable Matomo developer mode
      - PHP_DISPLAY_ERRORS=1          # Show PHP errors in browser
    volumes:
      # Add development plugins or tools
      - ./dev-plugins:/var/www/html/plugins/dev:rw
    ports:
      - "8081:80"  # Use a different port for local development

  db:
    # Development database settings
    environment:
      - POSTGRES_LOG_STATEMENT=all    # Log all SQL statements for debugging
    ports:
      - "5434:5432"  # Use a different port for PostgreSQL development
```
</details>


### 1. Environment Configuration
**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projects/matomo-analytics/.env</code></summary>

```
DB_PASSWORD=your_secure_database_password_here
MATOMO_SALT=your_random_salt_string_here_minimum_32_characters
```
</details>


### 2. PostgreSQL Configuration
**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projects/matomo-analytics/postgresql.conf</code></summary>

```conf
# PostgreSQL configuration optimized for Matomo
shared_preload_libraries = 'pg_stat_statements'
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4
```
</details>


### 3. Redis Configuration
**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projectsmatomo-analytics/redis.conf</code></summary>

```
# Redis configuration for Matomo caching
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes
```
</details>

### 4. Database Backup Script
**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projects/matomo-analytics/backup-script.sh</code></summary>

```bash
#!/bin/sh

# Matomo PostgreSQL backup script
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="matomo_backup_${DATE}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "matomo_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```
</details>

### 5. Initial PostgreSQL Setup
**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projects/matomo-analytics/postgres-init/01-init.sql</code></summary>

```sql
-- Initialize Matomo database with proper settings
ALTER DATABASE matomo SET timezone TO 'UTC';
ALTER DATABASE matomo SET log_statement TO 'none';
ALTER DATABASE matomo SET log_min_duration_statement TO 1000;

-- Create extensions for better performance
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```
</details>

### 6. HUGO Configuration
**Suggested File Location:** <details> <summary><code>&lt;YOUR-SITE&gt;/config/_default/hugo.toml</code></summary>

```
[params.analytics]
  matomo = true
  matomoSiteId = "1"
  matomoURL = "https://analytics.yourdomain.com/"
  # Optional: Enable additional features
  matomoTrackErrors = true
  matomoEnableLinkTracking = true
  matomoRequireConsent = false  # Set to true if you need GDPR compliance
```
</details>

### 7. Reverse Proxy Configuration (Nginx)
**Suggested File Location:** <details> <summary><code>/etc/nginx/sites-available/matomo-analytics</code></summary>
**File Name:** `matomo-analytics`

```bash
server {
    listen 80;
    listen [::]:80;

    server_name analytics.yourdomain.com;  # ### CHANGE THIS to your actual subdomain

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name analytics.yourdomain.com;  # ### CHANGE THIS to your actual subdomain

    root /var/www/html/matomo;  # ### CHANGE THIS if your Matomo files are in a different location

    index index.php;

    access_log /var/log/nginx/matomo.access.log;
    error_log /var/log/nginx/matomo.error.log;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/analytics.yourdomain.com/fullchain.pem; # ### CHANGE THIS to your Let's Encrypt cert path
    ssl_certificate_key /etc/letsencrypt/live/analytics.yourdomain.com/privkey.pem; # ### CHANGE THIS to your cert key path
    include /etc/letsencrypt/options-ssl-nginx.conf; # ### Optional if using Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;   # ### Optional if using Certbot

    # Security headers
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "sameorigin" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;  # ### CHANGE THIS if using a different PHP version
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|ttf|otf|eot)$ {
        expires 7d;
        access_log off;
        add_header Cache-Control "public";
    }

    location ~ /\.ht {
        deny all;
    }
}
```
</details>

### 8. Matomo Configuration File

*(Note: This file is auto-created by Matomo during installation)*
**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projects/matomo-analytics/config/config.ini.php</code></summary>

```php
<?php
; <?php exit; ?> DO NOT REMOVE THIS LINE
; file automatically generated or modified by Matomo; you can manually override the default values in global.ini.php by redefining them in this file.
[database]
host = "db"
username = "matomo"
password = "your_db_password"
dbname = "matomo"
tables_prefix = "matomo_"
adapter = "PDO\PGSQL"
port = 5432
charset = "utf8"

[General]
salt = "your_matomo_salt"
trusted_hosts[] = "analytics.yourdomain.com"
force_ssl = 1
assume_secure_protocol = 1
proxy_client_headers[] = HTTP_X_FORWARDED_FOR
proxy_client_headers[] = HTTP_X_REAL_IP
proxy_host_headers[] = HTTP_X_FORWARDED_HOST

[Plugins]
Plugins[] = "CoreAdminHome"
Plugins[] = "CoreHome"
Plugins[] = "CoreVisualizations"
Plugins[] = "Proxy"
Plugins[] = "API"
Plugins[] = "Widgetize"
Plugins[] = "Transitions"
Plugins[] = "LanguagesManager"
Plugins[] = "Actions"
Plugins[] = "Dashboard"
Plugins[] = "MultiSites"
Plugins[] = "Referrers"
Plugins[] = "UserLanguage"
Plugins[] = "DevicesDetection"
Plugins[] = "Goals"
Plugins[] = "Ecommerce"
Plugins[] = "SEO"
Plugins[] = "Events"
Plugins[] = "UserCountry"
Plugins[] = "GeoIp2"
Plugins[] = "VisitsSummary"
Plugins[] = "VisitFrequency"
Plugins[] = "VisitTime"
Plugins[] = "VisitorInterest"
Plugins[] = "RssWidget"
Plugins[] = "Feedback"
Plugins[] = "Monolog"
Plugins[] = "Login"
Plugins[] = "TwoFactorAuth"
Plugins[] = "UsersManager"
Plugins[] = "SitesManager"
Plugins[] = "Installation"
Plugins[] = "CoreUpdater"
Plugins[] = "CoreConsole"
Plugins[] = "ScheduledReports"
Plugins[] = "UserCountryMap"
Plugins[] = "Live"
Plugins[] = "PrivacyManager"
Plugins[] = "ImageGraph"
Plugins[] = "Annotations"
Plugins[] = "MobileMessaging"
Plugins[] = "Overlay"
Plugins[] = "SegmentEditor"
Plugins[] = "Insights"
Plugins[] = "Morpheus"
Plugins[] = "Contents"
Plugins[] = "BulkTracking"
Plugins[] = "Resolution"
Plugins[] = "DevicePlugins"
Plugins[] = "Heartbeat"
Plugins[] = "Intl"
Plugins[] = "Marketplace"
Plugins[] = "ProfessionalServices"
Plugins[] = "UserId"
Plugins[] = "CustomJsTracker"
Plugins[] = "Tour"

[Cache]
backend = redis
cache_backend = redis

[RedisCache]
host = "redis"
port = 6379
timeout = 0.0
password = ""
database = 14

[log]
log_writers[] = file
log_level = WARN
logger_file_path = /var/www/html/logs
```
</details>

### 9. Systemd Service for Auto-restart
**Suggested File Location:** <details> <summary><code>/etc/systemd/system/matomo-docker.service</code></summary>

```bash
[Unit]
Description=Matomo Analytics Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/your/matomo/directory
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```
</details>

### 10. Monitoring Script
**Suggested File Location:** <details> <summary><code>/home/&lt;USER&gt;/projects/matomo-analytics/monitor-matomo.sh</code></summary>

```bash
#!/bin/bash

# Matomo health monitoring script
MATOMO_URL="https://analytics.yourdomain.com/matomo.php"
HEALTHCHECK_URL="http://127.0.0.1:8080/matomo.php"
SLACK_WEBHOOK="your_slack_webhook_url"

# Check if Matomo is responding
if ! curl -f -s "$HEALTHCHECK_URL" > /dev/null; then
    echo "Matomo is down! Sending alert..."
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 Matomo Analytics is DOWN! Please check the server."}' \
        "$SLACK_WEBHOOK"
    
    # Restart containers
    cd /path/to/your/matomo/directory
    docker-compose restart
fi

# Check disk space
DISK_USAGE=$(df -h /var/lib/docker | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "Disk usage is high: $DISK_USAGE%"
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"⚠️ Matomo server disk usage is at $DISK_USAGE%\"}" \
        "$SLACK_WEBHOOK"
fi
```
</details>


### 11. Cron Jobs Setup
**Suggested File Location:** <details><summary><code>/etc/cron.d/matomo</code></summary>

```bash
# Matomo archiving (every 5 minutes)
*/5 * * * * www-data /usr/bin/docker exec matomo_matomo_1 php /var/www/html/console core:archive --url=https://analytics.yourdomain.com > /dev/null 2>&1 # <--- change this

# Health check (every 5 minutes)
*/5 * * * * root /path/to/monitor-matomo.sh #<--- change this

# Log rotation (daily)
0 2 * * * root /usr/bin/docker exec matomo_matomo_1 find /var/www/html/logs -name "*.log" -mtime +30 -delete
```
</details>

---


Great, thanks for the full project layout—it gives important context. Let's break down the **SSL configuration lines** and then explain how to use **Certbot** to get the required certificates for your Nginx + Matomo setup.

---

## 🔐 Explanation of SSL lines (in `matomo-analytics` Nginx config)

```nginx
ssl_certificate /etc/letsencrypt/live/analytics.yourdomain.com/fullchain.pem; 
# ^ Full chain of your domain's SSL certificate (includes intermediate CAs)

ssl_certificate_key /etc/letsencrypt/live/analytics.yourdomain.com/privkey.pem;
# ^ Private key corresponding to the certificate above

include /etc/letsencrypt/options-ssl-nginx.conf;
# ^ Optional best-practices SSL settings file generated by Certbot

ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
# ^ Optional strong Diffie-Hellman parameters file (for added security)
```

### 🔸 These are **required** for Nginx to support HTTPS using a **Let’s Encrypt certificate**.

---

## 🛠️ What is Certbot?



* **Certbot** is a tool that automatically obtains SSL certificates for your domain via [Let's Encrypt](https://letsencrypt.org/).
* Can automatically configure Nginx or Apache.
* Automatically renews your certificates before they expire (usually every 90 days)..

### ✅ How to set up Certbot for your Matomo project

Let’s assume your Matomo instance is **accessible via `https://analytics.example.com`** and that domain is properly pointed to your server.

### **Install Certbot and the Nginx plugin**

For Fedora:

```bash
sudo dnf install certbot python3-certbot-nginx
```

### 2. **Temporarily run Nginx without SSL**

Before Certbot can get a certificate, Nginx must be serving **HTTP (port 80)** for your domain.

Edit `/etc/nginx/sites-available/matomo-analytics` and make sure:

```nginx
server {
    listen 80;
    server_name analytics.example.com;  # Replace with your actual domain

    location / {
        proxy_pass http://localhost:PORT;  # Point to your Matomo container (check docker-compose port)
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/matomo-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```


### 3. **Run Certbot**

Use Certbot to automatically get and configure SSL:

```bash
sudo certbot --nginx -d analytics.example.com
```

If successful, Certbot will:

* Obtain a free certificate from Let’s Encrypt
* Automatically update your Nginx config to use the lines like:

  ```nginx
  ssl_certificate /etc/letsencrypt/live/analytics.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/analytics.example.com/privkey.pem;
  ```


### 4. **Test HTTPS access**

Visit: `https://analytics.example.com`

You should see your Matomo interface with a padlock 🔒.

---

### 5. **Set up automatic renewal**

Let’s Encrypt certificates expire every 90 days. Certbot installs a systemd timer or cron job to automatically renew them.

You can manually test it with:

```bash
sudo certbot renew --dry-run
```

---

## 👀 Summary of What You Need to Change

In your Nginx config:

```nginx
# Change these placeholders:
ssl_certificate /etc/letsencrypt/live/analytics.yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/analytics.yourdomain.com/privkey.pem;

# To this (after Certbot finishes):
ssl_certificate /etc/letsencrypt/live/analytics.example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/analytics.example.com/privkey.pem;
```

In your DNS:

* Make sure `analytics.example.com` points to your server's **public IP address**
---


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

4. **Complete the web installation

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

## Data Flow: Internet to Database

```mermaid
flowchart TD
    VISITOR[👤 Website Visitor<br/>analytics.krotanote.xyz]
    DNS[🔗 DNS Resolution<br/>Domain → Server IP]
    NGINX[📡 Nginx Reverse Proxy<br/>Port 80/443 → Port 8080]
    MATOMO[🔧 Matomo Container<br/>PHP/Apache on Port 8080]
    REDIS[⚡ Redis Container<br/>Cache Layer]
    DATABASE[🗄️ PostgreSQL Container<br/>Data Storage]
    
    CONFIG[⚙️ config/ folder<br/>Matomo Settings]
    LOGS[📋 logs/ folder<br/>Application Logs]
    PLUGINS[🔌 plugins/ folder<br/>Plugin Code]
    BACKUPS[💾 backups/ folder<br/>Database Backups]

    VISITOR -->|1. Request| DNS
    DNS -->|2. Route| NGINX
    NGINX -->|3. Proxy| MATOMO
    MATOMO -->|4. Cache| REDIS
    MATOMO -->|5. Store Data| DATABASE
    MATOMO -->|6. Read Config| CONFIG
    MATOMO -->|7. Write Logs| LOGS
    MATOMO -->|8. Load Plugins| PLUGINS
    DATABASE -->|9. Backup| BACKUPS
```

### Understanding the Data Flow

1. **Visitor Request**: User types `analytics.krotanote.xyz` in browser
2. **DNS Resolution**: Domain points to your server's IP address  
3. **Reverse Proxy**: Nginx receives request on port 80/443, forwards to Docker container on port 8080
4. **Matomo Processing**: Container serves the Matomo interface and processes tracking data
5. **Caching Layer**: Redis stores frequently accessed data for performance
6. **Database Storage**: PostgreSQL stores all visitor tracking data permanently
7. **Configuration**: Matomo reads settings from mounted config files
8. **Logging**: Application writes access/error logs to mounted log directory
9. **Plugin System**: Custom plugins loaded from mounted plugins directory
10. **Backup Process**: Automated backups save database to mounted backup directory

### Data Path Summary
```
Internet → DNS → Nginx (Port 80/443) → Docker Matomo (Port 8080) → Redis + PostgreSQL
                                    ↓
                              Host File System (config/, logs/, plugins/, backups/)
```

This flow shows how your containerized setup isolates services while maintaining data persistence through volume mounts.
    %% Styling
    classDef visitor fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef network fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef container fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef storage fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef data fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class VISITOR,BROWSER visitor
    class DNS,NGINX network
    class MATOMO_CONTAINER,REDIS_CONTAINER,DB_CONTAINER container
    class CONFIG_FILES,LOG_FILES,PLUGIN_FILES storage
    class BACKUP_FILES data
```

### Understanding the Data Flow

1. **Visitor Request**: User types `analytics.krotanote.xyz` in browser
2. **DNS Resolution**: Domain points to your server's IP address
3. **Reverse Proxy**: Nginx receives request on port 80/443, forwards to Docker container on port 8080
4. **Matomo Response**: Container serves the Matomo interface with tracking JavaScript
5. **JavaScript Execution**: Browser runs tracking code, sends analytics data back
6. **Caching Layer**: Redis stores frequently accessed data for performance
7. **Database Storage**: PostgreSQL stores all visitor tracking data permanently
8. **Configuration**: Matomo reads settings from mounted config files
9. **Logging**: Application writes access/error logs to mounted log directory
10. **Plugin System**: Custom plugins loaded from mounted plugins directory
11. **Backup Process**: Automated backups save database to mounted backup directory

This flow shows how your containerized setup isolates services while maintaining data persistence through volume mounts.
