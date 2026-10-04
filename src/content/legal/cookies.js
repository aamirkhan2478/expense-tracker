export const cookiePolicy = {
  slug: "cookies",
  title: "Cookie Policy",
  lastUpdated: "January 12, 2026",
  intro:
    "SpendWise uses a deliberately small number of cookies and browser storage entries. They exist to keep you signed in and remember your display preferences. SpendWise sets no advertising cookies, no analytics cookies, and no third-party tracking cookies.",
  sections: [
    {
      id: "what-are-cookies",
      heading: "What cookies and local storage are",
      blocks: [
        {
          type: "p",
          text: "Cookies are small text files a website asks your browser to store and send back on later requests. Browser local storage works similarly but is kept under the site's own storage area rather than sent with every request. SpendWise uses both, strictly to manage your session and preferences.",
        },
      ],
    },
    {
      id: "cookies-we-set",
      heading: "Cookies SpendWise sets",
      blocks: [
        {
          type: "p",
          text: "All of the following are first-party cookies set by the SpendWise instance you are using. None are used for advertising or analytics.",
        },
        {
          type: "ul",
          items: [
            "token — Holds your signed session token so you stay logged in. It is marked HttpOnly, which means page scripts cannot read it, and it is marked Secure in production so browsers send it over HTTPS only. SameSite is set to Lax. It expires after 24 hours, or after 30 days if you sign in with “remember me”.",
            "_token — Holds the same session token as token, for browsers and setups where the HttpOnly cookie is not readable by the app shell. It is readable by scripts and is used only to keep your session active and to sync sign-in state across tabs. It expires on the same schedule as token.",
          ],
        },
        {
          type: "p",
          text: "Signing out clears both cookies immediately. If your session token expires, or the app detects an expired token, both cookies are cleared and you are returned to the sign-in page.",
        },
      ],
    },
    {
      id: "local-storage",
      heading: "Browser storage entries",
      blocks: [
        {
          type: "p",
          text: "SpendWise also stores a few values in your browser's local storage. These never leave your device unless the app sends them as part of an authenticated request:",
        },
        {
          type: "ul",
          items: [
            "token — A copy of your session token, kept so the interface can tell whether you are signed in and so sign-in state can be synchronised across browser tabs.",
            "user — Basic profile details for the signed-in user, used to render the interface.",
            "spendwise-settings — Your display preferences, such as currency, date format, and rows per page. Clearing your browser storage removes these and the app returns to its defaults.",
          ],
        },
      ],
    },
    {
      id: "no-tracking",
      heading: "No tracking or advertising cookies",
      blocks: [
        {
          type: "p",
          text: "SpendWise does not embed advertising networks, third-party analytics scripts, tracking pixels, or social widgets. It does not build a behavioural profile of you, and it does not share or sell your activity with data brokers. Because the application serves its own pages without third-party trackers, no cross-site tracking cookies are created.",
        },
      ],
    },
    {
      id: "managing-cookies",
      heading: "How to manage or delete cookies",
      blocks: [
        {
          type: "p",
          text: "You can clear cookies and site data through your browser's settings at any time. Doing so signs you out of SpendWise and resets your display preferences to their defaults; your account and financial records are unaffected, because those live in the application database rather than in your browser. Most browsers also offer a per-site “block cookies” option, but blocking them will prevent SpendWise from keeping you signed in.",
        },
      ],
    },
    {
      id: "cookie-changes",
      heading: "Changes to this policy",
      blocks: [
        {
          type: "p",
          text: "If SpendWise's use of cookies changes, this page will be updated and the revision date at the top will change.",
        },
      ],
    },
    {
      id: "cookie-contact",
      heading: "Contact",
      blocks: [
        {
          type: "p",
          text: "Questions about cookies can be sent to the support address on the Contact page.",
        },
      ],
    },
  ],
};

export default cookiePolicy;
