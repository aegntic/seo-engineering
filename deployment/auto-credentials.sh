#!/bin/bash
# Automated credential generation script for SEOAutomate deployment
# This script automates the input of credentials for the main generator

# Execute the credential generator and feed it input
(
echo "seoautomate-temp.com"         # Properly formatted placeholder domain
echo "pk_test_placeholder123456"    # Placeholder Stripe public key
echo "sk_test_placeholder123456"    # Placeholder Stripe secret key
echo "whsec_placeholder123456"      # Placeholder Stripe webhook secret
echo "smtp.gmail.com"               # SMTP host
echo "587"                          # SMTP port
echo "notifications@placeholder.com" # SMTP username
echo "placeholder_password"         # SMTP password
echo "noreply@placeholder.com"      # SMTP sender
) | ./generate-credentials.sh

echo "Credential generation complete with placeholder values."
echo "Domain and other values can be updated before final deployment."
