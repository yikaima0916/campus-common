# Outlook connector setup

Campus Common connects a personal Outlook or Hotmail mailbox using delegated Microsoft Graph access. The connector requests `User.Read`, `Mail.Read`, and `offline_access` to read and synchronise mail.

## 1. Register the Microsoft application

1. In the [Microsoft Entra admin center](https://entra.microsoft.com/), open **App registrations**. Use the app dedicated to Campus Common, or register a new one named **Campus Common**.
2. Select an account type that supports personal Microsoft accounts. The connector uses the `consumers` authorisation endpoint.
3. Under **Authentication**, register the existing Worker callback and the Pages callback as **Web** redirect URIs:

   ```text
   https://campus-common.campus-companion.workers.dev/api/outlook/callback
   https://campus-common.pages.dev/api/outlook/callback
   ```

4. Under **API permissions**, add the delegated Microsoft Graph permissions `User.Read` and `Mail.Read`.
5. Copy the **Application (client) ID** from **Overview**. Under **Certificates & secrets**, create a client secret and save its **Value** when it appears.

See [app registration](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app), [redirect URIs](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-redirect-uri), and [application credentials](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials).

## 2. Configure the production Worker

Open [Cloudflare](https://dash.cloudflare.com/) → **Workers & Pages** → **campus-common** → **Settings** → **Variables and Secrets**. Add both values and deploy:

| Name | Type | Value |
| --- | --- | --- |
| `MS_CLIENT_ID` | Secret | Application (client) ID |
| `MS_CLIENT_SECRET` | Secret | Client secret **Value** |

The Worker already has `APP_ORIGIN=https://campus-common.campus-companion.workers.dev` and its own `TOKEN_KEY`. Preserve the key after connections are created because it encrypts their stored OAuth tokens. Keep all secret values in Cloudflare and verify the bindings after future releases. [Cloudflare secrets documentation](https://developers.cloudflare.com/workers/configuration/secrets/)

The `campus-common` Pages project serves the same Worker through a service binding named `CAMPUS_APP`. Upload the `pages` directory as the Pages deployment and redeploy after setting the binding. `ALTERNATE_APP_ORIGIN` enables the second OAuth callback. Both addresses use the same D1 accounts and stored Outlook connections. Users sign in on the new address to get its browser session.

## 3. Verify

1. Open [Campus Common settings](https://campus-common.campus-companion.workers.dev/?view=settings) after signing in. The **Connected email** card should show the connect form.
2. Connect the personal Outlook or Hotmail mailbox that receives forwarded school mail. Check the requested permissions on Microsoft's consent page.
3. Run **Sync now** and check that a forwarded school message appears.

Disconnecting Outlook deletes the stored authorisation for that Campus Common account. Existing structured summaries remain until the user deletes them.

## Local development

Register the local Web callback `http://localhost:8787/api/outlook/callback` if testing OAuth locally. In the git-ignored `.dev.vars`, set `APP_ORIGIN=http://localhost:8787`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, and a separate local `TOKEN_KEY` containing 32 random bytes encoded as Base64. Start the Worker with `pnpm exec wrangler dev --config wrangler.i4i.jsonc`.
