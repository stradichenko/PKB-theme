+++
title = "Reverse Proxy Configuration for Analytics"
date = 2023-07-01T09:00:00-07:00
draft = false
tags = ["analytics", "reverse proxy", "nginx", "apache", "caddy", "traefik", "self-hosted"]
categories = ["guides", "infrastructure"]
toc = true
description = "A comprehensive guide for setting up reverse proxies for self-hosted analytics solutions"
+++

# Reverse Proxy Setup for Self-Hosted Analytics

This guide explains how to properly configure reverse proxies for your self-hosted analytics solutions. A reverse proxy sits between users and your analytics server, providing benefits like SSL termination, load balancing, and additional security.

## Comparison of Reverse Proxy Solutions

| Solution | Ease of Config | Performance | Features | SSL Support | Auto Config | Best For |
|----------|----------------|------------|----------|-------------|-------------|----------|
| [Nginx](https://nginx.org/) | Medium | Excellent | Extensive | Manual config | No | High-traffic sites, complex setups |
| [Caddy](https://caddyserver.com/) | Very Easy | Good | Good | Automatic HTTPS | Yes | Beginners, quick setup |
| [Traefik](https://traefik.io/) | Medium | Very Good | Extensive | Automatic HTTPS | Yes | Container environments |
| [HAProxy](https://www.haproxy.org/) | Complex | Excellent | Advanced | Manual config | No | High availability, load balancing |
| [Apache](https://httpd.apache.org/) | Medium | Good | Extensive | Manual config | No | Compatibility with existing Apache setups |

## General Setup Principles

When setting up a reverse proxy for analytics, consider these key principles:

1. **Secure Connections**: Always use HTTPS for both client-facing and backend connections
2. **Path Configuration**: Decide whether to use a subdomain (`analytics.yourdomain.com`) or a path (`yourdomain.com/analytics`)
3. **Headers**: Properly set headers for security and correct IP forwarding
4. **Caching**: Configure appropriate caching policies

## Nginx Configuration

Nginx is one of the most popular and performant reverse proxy options.

### Basic Setup for Plausible Analytics

```nginx
server {
    listen 443 ssl http2;
    server_name analytics.yourdomain.com;

    # SSL configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Frame-Options "DENY";
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name analytics.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### Nginx with Matomo

```nginx
server {
    listen 443 ssl http2;
    server_name matomo.yourdomain.com;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # Specific Matomo optimizations
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://localhost:8080;
        expires 1d;
        add_header Cache-Control "public, no-transform";
    }
    
    # Deny access to sensitive files
    location ~ \.(git|htaccess|ini|log)$ {
        deny all;
    }
}
```

### Nginx with Umami

```nginx
server {
    listen 443 ssl http2;
    server_name analytics.yourdomain.com;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (for real-time analytics)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Caddy Configuration

Caddy makes HTTPS extremely simple with automatic certificate management.

### Basic Caddy Setup for Plausible

```
analytics.yourdomain.com {
    reverse_proxy localhost:8000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

### Caddy with Matomo

```
matomo.yourdomain.com {
    # Increase upload limits for Matomo
    limits {
        body 10MB
    }
    
    reverse_proxy localhost:8080 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    
    # Cache static assets
    @static {
        path *.jpg *.jpeg *.png *.gif *.ico *.css *.js
    }
    header @static Cache-Control "public, max-age=86400"
    
    # Block access to sensitive files
    @sensitive {
        path *.git* *.htaccess* *.ini* *.log*
    }
    respond @sensitive 403
}
```

### Caddy with Umami

```
analytics.yourdomain.com {
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

## Traefik Configuration

Traefik works especially well with Docker containers.

### Traefik Docker Labels for Plausible

```yaml
version: '3'
services:
  plausible:
    image: plausible/analytics:latest
    # ...other plausible config...
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.plausible.rule=Host(`analytics.yourdomain.com`)"
      - "traefik.http.routers.plausible.entrypoints=websecure"
      - "traefik.http.routers.plausible.tls.certresolver=myresolver"
      - "traefik.http.services.plausible.loadbalancer.server.port=8000"

  traefik:
    image: traefik:v2.5
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./traefik/acme.json:/acme.json"
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=your@email.com"
      - "--certificatesresolvers.myresolver.acme.storage=/acme.json"
```

## Apache Configuration

Apache is still widely used and may be preferred if you already run it.

### Apache with Plausible

```apache
<VirtualHost *:443>
    ServerName analytics.yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:8000/
    ProxyPassReverse / http://localhost:8000/
    
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Real-IP "%{REMOTE_ADDR}s"
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Frame-Options "DENY"
</VirtualHost>

<VirtualHost *:80>
    ServerName analytics.yourdomain.com
    Redirect permanent / https://analytics.yourdomain.com/
</VirtualHost>
```

## Security Best Practices

When setting up reverse proxies for analytics, follow these security practices:

1. **Use Strong TLS Configuration**: Enable TLS 1.3, disable outdated protocols and ciphers
2. **Implement Security Headers**: HSTS, CSP, X-Content-Type-Options
3. **IP Filtering**: Consider restricting admin access to specific IPs
4. **Rate Limiting**: Protect against brute force attacks
5. **Web Application Firewall (WAF)**: Configure rules to protect against common attacks

### Example: Nginx with Enhanced Security

```nginx
server {
    listen 443 ssl http2;
    server_name analytics.yourdomain.com;
    
    # Strong SSL configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Strong security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Frame-Options "DENY" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=analytics:10m rate=10r/s;
    limit_req zone=analytics burst=20 nodelay;
    
    # Admin area with IP restriction
    location /admin {
        # Allow only specific IPs
        allow 192.168.1.100;  # Replace with your IP
        allow 10.0.0.1;       # Replace with additional IPs
        deny all;
        
        proxy_pass http://localhost:8000/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Regular proxy
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Setup Using Docker Networks

For Docker-based deployments, using Docker networks provides additional isolation:

```yaml
version: '3'

networks:
  frontend:
  backend:

services:
  reverse-proxy:
    image: nginx:latest
    networks:
      - frontend
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - analytics
      
  analytics:
    image: plausible/analytics:latest
    networks:
      - backend
    # No ports exposed to host, only to the internal network
    # Other plausible config...
```

## Monitoring and Troubleshooting

### Common Issues and Solutions

1. **502 Bad Gateway**
   - Check if the analytics service is running
   - Verify proxy_pass URL is correct
   - Inspect network connectivity between proxy and backend

2. **SSL Certificate Issues**
   - Ensure certificates are valid and not expired
   - Verify file paths in configuration
   - Check file permissions

3. **Slow Response Times**
   - Enable access and error logs for debugging
   - Consider adding caching for static assets
   - Check backend service resource utilization

### Logging Configuration

For effective troubleshooting, configure appropriate logging:

#### Nginx Logging

```nginx
server {
    # ...other configuration...
    
    # Detailed access and error logs
    access_log /var/log/nginx/analytics-access.log combined;
    error_log /var/log/nginx/analytics-error.log warn;
}
```

#### Apache Logging

```apache
<VirtualHost *:443>
    # ...other configuration...
    
    CustomLog ${APACHE_LOG_DIR}/analytics-access.log combined
    ErrorLog ${APACHE_LOG_DIR}/analytics-error.log
</VirtualHost>
```

## Advanced Configurations

### Caching for Performance

Properly caching static assets can significantly improve performance:

```nginx
# Cache static assets for Matomo
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=analytics_cache:10m max_size=1g inactive=60m;

server {
    # ...other configuration...
    
    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://localhost:8080;
        proxy_cache analytics_cache;
        proxy_cache_valid 200 304 60m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        add_header X-Cache-Status $upstream_cache_status;
        expires 1d;
    }
}
```

### Load Balancing for High Traffic

For high-traffic sites, set up load balancing across multiple analytics instances:

```nginx
upstream analytics_backend {
    server 10.0.0.1:8000 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:8000 max_fails=3 fail_timeout=30s;
    server 10.0.0.3:8000 max_fails=3 fail_timeout=30s backup;
}

server {
    # ...other configuration...
    
    location / {
        proxy_pass http://analytics_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Conclusion

Setting up a reverse proxy for your self-hosted analytics provides enhanced security, performance, and flexibility. Choose the proxy solution that best fits your existing infrastructure and technical experience.

For specific analytics setup instructions, refer to our guides:
- [General Analytics Setup](/docs/analytics-setup/)
- [Matomo Setup Guide](/docs/matomo-analytics-setup/)

Remember to regularly update both your analytics software and reverse proxy to maintain security and stability.
