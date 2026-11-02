# entr222-mini-prototype
mini prototype for entr 222 --> "agi for calendars" 

A static landing page. Run it from this folder and open http://localhost:4173:

```bash
python3 -m http.server 4173
```

## Connecting Google Calendar

The connect button signs in with Google and shows the visitor's next 7 days, with clashes flagged. It only reads events, and nothing leaves the browser tab.

Until a client ID is set, the button shows a labelled sample week. To turn on the real thing:

1. In the [Google Cloud console](https://console.cloud.google.com/), create a project and enable the **Google Calendar API**.
2. Set up the OAuth consent screen as **External**, add the scope `calendar.events.readonly`, and add each person who will try it (your Google account included) as a **test user**.
3. Create an OAuth client ID of type **Web application**. Under **Authorized JavaScript origins**, add `http://localhost:4173` and any URL you host the page on.
4. Paste the client ID into `config.js`.

While the app is in testing mode, only listed test users can connect, and Google shows them an "unverified app" warning.
