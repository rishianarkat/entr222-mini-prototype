# entr222-mini-prototype
mini prototype for entr 222 --> "agi for calendars" 

A static landing page. Run it from this folder and open http://localhost:4173:

```bash
python3 -m http.server 4173
```

## Connecting Google Calendar

The connect button signs in with Google and shows the visitor's next 7 days, with clashes flagged. It only reads events, and nothing leaves the browser tab.

Live page: https://rishianarkat.github.io/entr222-mini-prototype/

The client ID is in `config.js`, from the Google Cloud project `hours-calendar-31697`. If it's ever emptied, the button shows a labelled sample week instead. To set up a new one:

1. In the [Google Cloud console](https://console.cloud.google.com/), create a project and enable the **Google Calendar API**.
2. Set up the OAuth consent screen as **External**, add the scope `calendar.events.readonly`, add the home page and privacy policy links and `rishianarkat.github.io` as an authorized domain, then publish the app.
3. Create an OAuth client ID of type **Web application**. Under **Authorized JavaScript origins**, add `https://rishianarkat.github.io`, plus `http://localhost:4173` to test locally.
4. Paste the client ID into `config.js`.

The app is published but not verified, so anyone can connect, up to 100 users in total, and Google shows them an "unverified app" warning first (click **Advanced** to continue).
