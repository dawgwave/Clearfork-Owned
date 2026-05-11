problem - Your branding is not being shown to users.

The website of your home page URL "https://clearforkinsurance.com/" is not registered to you.


We require that you verify the ownership of your application homepage. If you have been flagged for an unverified homepage domain, please proceed with the best option below for your project.

Verify your existing app homepage
Follow these instructions to verify the submitted homepage belongs to you. Respond to the email you received to confirm that ownership has been verified.

Choosing a verification method
Search Console supports several different verification methods. See the table below to help choose a method that works best for you.

Method	Notes
HTML file upload	Relatively simple, but requires the ability to upload a file and publish it on your site at a specific URL. Might not be possible on a site hosting platform.
HTML tag	Relatively simple, but requires the ability to edit the HTML source code of your site's homepage. Might not be possible on a site hosting platform.
Google Analytics tracking code	Simple, if the page already has a Google Analytics tracking code for a Google Analytics account that you can access. If the page does not have a tracking code, you must add one (which may require creating a Google Analytics account if you don't already have one).
Google Tag Manager	Simple if the page already has a Google Tag Manager snippet for a Google Tag Manager account that you can access. If the page does not have a snippet, you must add one (which may require creating a Tag Manager account if you don't already have one).
Google Sites or Blogger account	Use the recommended method for each platform.
Domain name provider	More complex, but is the only way to verify a Domain property. If your domain provider is listed in the verification wizard, then this is a simple process. Domain properties are useful because they include data for all protocol (http/https) and subdomain variations of your property.


Question: considering I am using a google workspace / google cloud account for setting up emailing from tthe server, as well as ability to sign in with a google account,

should I use the "Google Analytics tracking code" option ? if so, where do I create or find the tracking code ?

---

## Answer (Clearfork site)

**What’s wrong:** OAuth consent branding needs proof you control `https://clearforkinsurance.com/`. Changing the support email alone does not fix that—you must **verify the site in Google Search Console** (or satisfy Google’s equivalent domain check).

**Using “Google Analytics tracking code” verification:** Use it only if (1) production actually loads **your** GA4 property (`NEXT_PUBLIC_GA_ID` → Measurement ID `G-…` from Analytics **Admin → Data streams → Web**), and (2) the Google account you verify with (e.g. `david@protectdfw.com`) has access (typically Admin/Editor) to **that same** GA4 property in [Google Analytics](https://analytics.google.com/).

**Often easiest for this codebase:** Search Console → property URL prefix `https://clearforkinsurance.com/` → method **HTML tag** → put the verification string in **`GOOGLE_SITE_VERIFICATION`** on the server → redeploy so root layout emits the meta tag → click verify.

**Alternative:** **Google Tag Manager** verification—the live site already loads container `GTM-TWSK72C5`; if your Google user has access to that container in [Tag Manager](https://tagmanager.google.com/), use that method.

**After verification:** In Cloud Console → OAuth consent screen, set **Application home page** to `https://clearforkinsurance.com/` and **Authorized domains** to include `clearforkinsurance.com`.