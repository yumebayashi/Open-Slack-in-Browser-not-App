const MAX_ATTEMPTS = 15;
const RETRY_INTERVAL_MS = 1000;
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

const init = async () => {
    const url = await waitForBrowserUrl();
    if (url) {
        window.location.replace(url);
    } else {
        alert(`An issue has occurred. Please report it by creating an issue on the GitHub repository: ${ISSUE_URL}`);
    }
};

init();
