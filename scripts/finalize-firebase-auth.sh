#!/usr/bin/env bash
# Run AFTER you click "Get started" on Authentication in the Firebase Console
# (https://console.firebase.google.com/project/invoice-app-xi/authentication).
# That one click initializes the Auth config; this script finishes the job:
#   - enables Email link (passwordless) sign-in
#   - enables Google sign-in
#   - adds the Vercel domain to Authorized Domains
set -euo pipefail

PROJECT="invoice-app-xi"
DOMAIN="invoice-app-xi-eight.vercel.app"

TOKEN=$(gcloud auth print-access-token)

cfg_get() {
  curl -fsS -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: $PROJECT" \
    "https://identitytoolkit.googleapis.com/admin/v2/projects/$PROJECT/config"
}

echo "→ probing Auth config…"
if ! cfg_get >/tmp/fb-auth-config.json 2>/tmp/fb-auth-config.err; then
  cat /tmp/fb-auth-config.err
  echo
  echo "Auth config still missing. Click 'Get started' in the Console first:"
  echo "  https://console.firebase.google.com/project/$PROJECT/authentication"
  exit 1
fi

echo "→ enabling Email link sign-in…"
curl -fsS -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-goog-user-project: $PROJECT" \
  -H "Content-Type: application/json" \
  --data '{"signIn":{"email":{"enabled":true,"passwordRequired":false}}}' \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/$PROJECT/config?updateMask=signIn.email" \
  >/dev/null

echo "→ adding $DOMAIN to authorized domains…"
EXISTING=$(jq -c '.authorizedDomains // []' /tmp/fb-auth-config.json)
NEXT=$(jq -nc --argjson e "$EXISTING" --arg d "$DOMAIN" \
  'if ($e | index($d)) then $e else $e + [$d] end')
BODY=$(jq -nc --argjson d "$NEXT" '{authorizedDomains:$d}')
curl -fsS -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-goog-user-project: $PROJECT" \
  -H "Content-Type: application/json" \
  --data "$BODY" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/$PROJECT/config?updateMask=authorizedDomains" \
  >/dev/null

echo "→ enabling Google sign-in provider…"
# defaultSupportedIdpConfigs/google.com is the Google provider.
PROVIDER_BODY='{"name":"projects/'"$PROJECT"'/defaultSupportedIdpConfigs/google.com","enabled":true}'
curl -fsS -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-goog-user-project: $PROJECT" \
  -H "Content-Type: application/json" \
  --data "$PROVIDER_BODY" \
  "https://identitytoolkit.googleapis.com/admin/v2/projects/$PROJECT/defaultSupportedIdpConfigs/google.com?updateMask=enabled" \
  >/dev/null \
  || echo "  (Google provider PATCH failed — may need first-creation via POST or a Web SDK clientId; email-link should still work.)"

rm -f /tmp/fb-auth-config.json /tmp/fb-auth-config.err
echo "✓ done."
