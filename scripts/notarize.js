const { notarize } = require('@electron/notarize');
const fs = require('fs');
const path = require('path');
const os = require('os');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') return;

  const keyId = process.env.APPLE_API_KEY_ID;
  const issuerId = process.env.APPLE_API_ISSUER;
  const keyContent = process.env.APPLE_API_KEY;

  if (!keyId || !issuerId || !keyContent) {
    console.log('Skipping notarization — missing APPLE_API_KEY_ID, APPLE_API_ISSUER or APPLE_API_KEY');
    return;
  }

  // Write the .p8 key to a temp file — notarytool requires a file path
  const keyPath = path.join(os.tmpdir(), `AuthKey_${keyId}.p8`);
  fs.writeFileSync(keyPath, keyContent, { mode: 0o600 });

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Notarizing ${appName}...`);

  try {
    await notarize({
      tool: 'notarytool',
      appPath,
      appleApiKey: keyPath,
      appleApiKeyId: keyId,
      appleApiIssuer: issuerId,
    });
    console.log('Notarization complete.');
  } finally {
    fs.unlinkSync(keyPath);
  }
};
