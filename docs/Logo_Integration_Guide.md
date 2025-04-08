# Logo Integration Guide for SEO.engineering

This guide will walk you through the process of integrating the SEO.engineering logo into the frontend application.

## Prerequisites

- The SEO.engineering logo file (PNG format)
- Access to the website source code
- Docker environment for rebuilding the frontend

## Step 1: Prepare the Logo File

1. Locate the original logo file:
   ```
   /home/tabs/Downloads/SEOengineering_LOGO.png
   ```

2. Create the images directory in the website's public folder if it doesn't exist:
   ```bash
   mkdir -p /home/tabs/seo-engineering/website/public/images
   ```

3. Copy the logo file to the website's public images directory:
   ```bash
   cp /home/tabs/Downloads/SEOengineering_LOGO.png /home/tabs/seo-engineering/website/public/images/logo.png
   ```

## Step 2: Update the Navbar Component

1. Open the Navbar component file:
   ```bash
   nano /home/tabs/seo-engineering/website/src/components/Navbar.jsx
   ```

2. Replace the existing SVG logo or placeholder with the actual logo image:
   ```jsx
   // Replace this code:
   <svg className="h-8 w-auto" ... >
     <!-- SVG content -->
   </svg>

   // With this code:
   <img 
     src="/images/logo.png" 
     alt="SEO.engineering Logo" 
     className="h-8 w-auto" 
   />
   ```

3. Save the file.

## Step 3: Update the Favicon (Optional)

1. Generate favicon files from the logo:
   ```bash
   # Using ImageMagick if available
   convert /home/tabs/seo-engineering/website/public/images/logo.png -resize 32x32 /home/tabs/seo-engineering/website/public/favicon.ico
   ```

2. Update the HTML header in `index.html`:
   ```html
   <link rel="icon" href="/favicon.ico" />
   ```

## Step 4: Rebuild the Frontend

1. Rebuild the frontend Docker image:
   ```bash
   cd /home/tabs/seo-engineering
   docker compose -f deployment/docker-compose.prod.yml up -d --build website
   ```

2. Restart the Nginx container to ensure it gets the new content:
   ```bash
   docker restart seo-nginx
   ```

## Step 5: Verify the Integration

1. Open a browser and navigate to https://seo.engineering or https://localhost
2. Verify that the logo appears correctly in the navigation bar
3. Check that it looks good on both desktop and mobile views
4. Verify that the favicon appears in the browser tab (if updated)

## Troubleshooting

If the logo doesn't appear:

1. Check browser console for 404 errors
2. Verify the path to the logo file is correct
3. Make sure the Docker build process completed successfully
4. Check that the website container is running
5. Inspect the Nginx configuration to ensure it's serving static files correctly

## Additional Customization

To further enhance the branding:

1. Add the logo to the login page and other key areas
2. Use the logo colors to update theme variables
3. Add the logo to email templates and PDF reports
4. Create a consistent brand experience across all platforms