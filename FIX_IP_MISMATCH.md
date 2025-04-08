# SEO.engineering IP Mismatch Resolution Guide

## Issue Summary
- Current DNS Records: Point to `104.197.197.191`
- Actual VM IP Address: `163.53.144.9`
- Status: **Requires Immediate Action**

## Step-by-Step Resolution

### 1. Update DNS Records

Login to Porkbun and update the following DNS A records:
- seo.engineering → `163.53.144.9`
- www.seo.engineering → `163.53.144.9`

### 2. Verify DNS Propagation

DNS changes can take up to 48 hours to fully propagate globally, but often happen much faster.

Check propagation status:
```bash
host seo.engineering
```

If this returns `163.53.144.9`, propagation is complete for your location.

### 3. Test Connectivity

Once DNS has propagated, test with:
```bash
curl -k https://seo.engineering/health
```

Expected result: "SEO.engineering Platform - Online!"

### 4. Update SSL Certificate

After DNS propagation is complete:
```bash
# Stop Nginx container
sudo docker stop seo-nginx

# Get certificates from Let's Encrypt
sudo certbot certonly --standalone -d seo.engineering -d www.seo.engineering

# Copy certificates to Nginx directory
sudo cp /etc/letsencrypt/live/seo.engineering/fullchain.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.crt
sudo cp /etc/letsencrypt/live/seo.engineering/privkey.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.key

# Start Nginx container
sudo docker start seo-nginx
```

### 5. Verify HTTPS Access

Access the platform securely:
```
https://seo.engineering/
```

The connection should be secure with a valid Let's Encrypt certificate.

## Monitoring Improvements

An IP verification system has been implemented:
- Daily checks of IP address vs. DNS records
- Location: `/home/tabs/seo-engineering/scripts/verify-ip.sh`
- Logs: `/home/tabs/seo-engineering/logs/ip-verification.log`

## Container Health Monitoring

A container health monitoring system has been implemented:
- Automatic container restarts if services fail
- Location: `/home/tabs/seo-engineering/scripts/monitor-containers.sh`
- Running as system service: `seo-container-monitor.service`
- Logs: `/home/tabs/seo-engineering/logs/container-monitor.log`

## Emergency Recovery

If immediate platform access is required before DNS propagation:
1. Use direct IP access: `https://163.53.144.9/`
2. Access with `curl -k` to bypass certificate warnings

## Contacts

For urgent assistance:
- System Administrator: admin@seo.engineering
- Cloud Provider Support: cloud-support@example.com