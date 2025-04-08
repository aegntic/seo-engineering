# SSL Certificate Renewal Guide
**Last Updated:** April 8, 2025

## Certificate Information

- **Domain:** seo.engineering (and www.seo.engineering)
- **Provider:** Porkbun
- **Expires:** July 7, 2025
- **Certificate Location:** `/home/tabs/seo-engineering/nginx/ssl/seo.engineering.crt`
- **Key Location:** `/home/tabs/seo-engineering/nginx/ssl/seo.engineering.key`

## Renewal Steps

When you receive a renewal alert (21 days before expiration), follow these simple steps:

### Option 1: Renewal through Porkbun (Recommended)

1. **Log in to Porkbun account**
2. Go to domain management for seo.engineering
3. Navigate to SSL/TLS certificates section
4. Download the new SSL bundle (zip file)
5. Extract the new certificate files
6. Copy them to your server:
   ```bash
   # Copy via SCP, or download directly to server
   scp seo.engineering-ssl-bundle.zip admin@104.197.197.191:~/
   ```
7. Extract and install:
   ```bash
   unzip seo.engineering-ssl-bundle.zip -d ~/ssl-temp
   cp ~/ssl-temp/domain.cert.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.crt
   cp ~/ssl-temp/private.key.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.key
   ```
8. Restart Nginx:
   ```bash
   docker restart seo-nginx
   ```

### Option 2: Let's Encrypt (If Porkbun option unavailable)

1. Stop Nginx:
   ```bash
   docker stop seo-nginx
   ```
2. Get certificate:
   ```bash
   sudo certbot certonly --standalone -d seo.engineering -d www.seo.engineering
   ```
3. Copy certificates:
   ```bash
   sudo cp /etc/letsencrypt/live/seo.engineering/fullchain.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.crt
   sudo cp /etc/letsencrypt/live/seo.engineering/privkey.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.key
   ```
4. Start Nginx:
   ```bash
   docker start seo-nginx
   ```

## Verification

After installation, verify the certificate works:

1. Wait 5 minutes for Nginx to fully reload
2. Visit https://seo.engineering in your browser
3. Check the certificate details (click the lock icon)
4. Confirm the new expiration date

## Troubleshooting

If issues occur:

1. Check Nginx logs:
   ```bash
   docker logs seo-nginx
   ```
2. Verify file permissions:
   ```bash
   ls -la /home/tabs/seo-engineering/nginx/ssl/
   ```
3. Test Nginx configuration:
   ```bash
   docker exec seo-nginx nginx -t
   ```

## Monitoring

A monitoring script is in place and will:
- Check certificate expiry weekly (every Monday at 9 AM)
- Send an alert to admin@seo.engineering when 21 days remain
- Log results to /home/tabs/seo-engineering/logs/ssl-check.log

For manual checking, run:
```bash
/home/tabs/seo-engineering/scripts/check-ssl-expiry.sh
```
