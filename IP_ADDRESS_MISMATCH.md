# SEO.engineering IP Address Mismatch

## Diagnosis

We've identified a critical configuration issue:

- **Current DNS Records**: Point to `104.197.197.191`
- **Actual VM IP Address**: `163.53.144.9`

This mismatch is preventing connectivity to the SEO.engineering platform.

## Solution

### Step 1: Update DNS Records at Porkbun

1. Log in to your Porkbun account
2. Navigate to the DNS settings for seo.engineering
3. Update the following A records:
   - `seo.engineering` → `163.53.144.9`
   - `www.seo.engineering` → `163.53.144.9`

### Step 2: Verify DNS Propagation

DNS changes can take 24-48 hours to fully propagate, but often complete much faster.
You can verify propagation using:

```bash
host seo.engineering
```

Wait until this command shows the updated IP address.

### Step 3: Temporary Direct Access

While waiting for DNS propagation, you can access your platform directly via IP:

```
https://163.53.144.9/health
```

Note: Your browser will show a security warning due to the self-signed certificate.

### Step 4: Obtain Let's Encrypt SSL Certificate

Once DNS propagation is complete, obtain a proper SSL certificate:

```bash
cd /home/tabs/seo-engineering
sudo docker-compose stop nginx
sudo certbot certonly --standalone -d seo.engineering -d www.seo.engineering
sudo cp /etc/letsencrypt/live/seo.engineering/fullchain.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.crt
sudo cp /etc/letsencrypt/live/seo.engineering/privkey.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.key
sudo docker-compose start nginx
```

## Prevention

To prevent this issue in the future:

1. **Document VM IP Changes**: Whenever the VM's IP address changes, update DNS records immediately.
2. **Regular IP Verification**: Add a scheduled task to verify IP address matches DNS records.
3. **Monitoring Alert**: Configure a monitoring alert for IP address changes.

## Technical Details

- **VM Public IP**: 163.53.144.9 (verify with `curl ifconfig.me`)
- **DNS Configuration**: seo.engineering A record currently points to 104.197.197.191
- **Networking**: All required ports (80, 443) are open in the UFW firewall

## Support

For immediate assistance with this issue, contact the system administrator or cloud provider.
