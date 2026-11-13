const MAX_ATTEMPTS = 15;
const RETRY_INTERVAL_MS = 1000;
// Intervals between re-navigations while we are still on the redirect page
// (retries at 1.5s, 4.5s and 9.5s after the first attempt).
const REDIRECT_RETRY_DELAYS_MS = [1500, 3000, 5000];
const ISSUE_URL = "https://github.com/yumebayashi/Open-Slack-in-Browser-not-App";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Slack's redirect pages (archives, ssb/redirect, app_redirect) all expose an
// "open in browser" link pointing at https://<workspace>.slack.com/messages/...
const findBrowserUrl = () => {
    const hrefs = Array.from(document.querySelectorAll("a[href]"), (a) => a.href);
    return hrefs.find((href) => href.includes("/messages/")) ??
           hrefs.find((href) => href.includes(".slack.com/")) ??
           null;
};

const waitForBrowserUrl = async () => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const url = findBrowserUrl();
        if (url) return url;

        console.info(`Browser link not found. Attempt: ${attempt}/${MAX_ATTEMPTS}.`);
        if (attempt < MAX_ATTEMPTS) await sleep(RETRY_INTERVAL_MS);
    }
    return null;
};

// Slack's redirect page also navigates to slack://... by itself. When that
// happens after our location.replace(), it appears to cancel our pending
// navigation and the tab stays on the redirect page, so navigate again while
// we are still here. A successful navigation discards this page, which stops
// the retries.
const redirectTo = async (url) => {
    const startHref = location.href;
    window.location.replace(url);
    for (const [i, delayMs] of REDIRECT_RETRY_DELAYS_MS.entries()) {
        await sleep(delayMs);
        if (location.href !== startHref) return;
        console.info(`Still on the redirect page. Retry: ${i + 1}/${REDIRECT_RETRY_DELAYS_MS.length}.`);
        window.location.replace(url);
    }
};

const init = async () => {
    const url = await waitForBrowserUrl();
    if (url) {
        await redirectTo(url);
    } else {
        alert(`An issue has occurred. Please report it by creating an issue on the GitHub repository: ${ISSUE_URL}`);
    }
};

init();
