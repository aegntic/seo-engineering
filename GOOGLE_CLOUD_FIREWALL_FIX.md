# SEO.engineering Google Cloud Firewall Fix

## Current Status

We've confirmed:
- Your VM IP address is correctly set to `104.197.197.191`
- DNS records are correctly configured to point to this IP
- Docker containers are running properly on the VM
- Local access to services works (tested via localhost)
- External access is failing (cannot connect to 104.197.197.191)

The most likely culprit is the Google Cloud VPC firewall rules.

## Required Firewall Rules

Based on your VM's network interface details, you need to ensure the following ingress (incoming) traffic is allowed:

| Protocol | Ports | Source IPs | Description |
|----------|-------|------------|-------------|
| TCP | 80 | 0.0.0.0/0 | HTTP traffic |
| TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
| TCP | 22 | [Your IP] | SSH access (optional) |

## Steps to Configure Firewall in Google Cloud Console

1. **Navigate to VPC Network Firewall Rules**
   - In Google Cloud Console, go to "VPC network" → "Firewall"
   - Or navigate directly to: https://console.cloud.google.com/networking/firewalls

2. **Create a New Firewall Rule**
   - Click "CREATE FIREWALL RULE"
   - Name: `allow-web-traffic`
   - Network: select your network (default)
   - Direction of traffic: Ingress
   - Action on match: Allow
   - Targets: All instances in the network
   - Source filter: IP ranges
   - Source IP ranges: `0.0.0.0/0` (to allow traffic from anywhere)
   - Protocols and ports: 
     - Select "Specified protocols and ports"
     - Check "TCP" and enter ports: `80,443`

3. **Create Rule**
   - Click "Create" to save the rule

4. **Verify the Rule**
   - After creation, the rule should appear in your firewall rules list
   - Status should be "Enabled"

## Verification Steps

After applying the firewall rules, verify external access:

1. Open a browser and navigate to:
   ```
   https://104.197.197.191/health
   ```
   (You'll see a certificate warning - this is normal with self-signed certificates)

2. Accept the security warning and verify you see:
   ```
   SEO.engineering Platform - Online!
   
   Status: Operational
   Deployed: 2025-04-08
   SSL: Enabled
   ```

3. Once confirmed, test your domain:
   ```
   https://seo.engineering/health
   ```

## Next Steps After Firewall Fix

Once external access is working:

1. Obtain Let's Encrypt SSL certificates:
   ```bash
   cd /home/tabs/seo-engineering
   sudo docker-compose stop nginx
   sudo certbot certonly --standalone -d seo.engineering -d www.seo.engineering
   sudo cp /etc/letsencrypt/live/seo.engineering/fullchain.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.crt
   sudo cp /etc/letsencrypt/live/seo.engineering/privkey.pem /home/tabs/seo-engineering/nginx/ssl/seo.engineering.key
   sudo docker-compose start nginx
   ```

2. Verify the website is now accessible with proper certificates:
   ```
   https://seo.engineering/
   ```

## Support

If you continue to experience issues after applying these firewall rules, additional debugging may be needed to investigate network configuration or VPC settings.
