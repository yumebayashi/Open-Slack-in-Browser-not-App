
const delay = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));


const findLink = () => {
    const anchors = Array.from(document.querySelectorAll("a"));
    return anchors.find(a => a.href.includes("/messages/")) ||
           anchors.find(a => a.href.includes(".slack.com/")) || null;
};

const init = async () => {
    const maxAttempts = 15;
    const waitTime = 1;
    let link = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            link = findLink();
            if (link) {
                break;
            }
            throw new Error('Link not found');
        } catch (error) {
            console.info(`Error: ${error.message}. Attempt: ${attempt}/${maxAttempts}.`);
            if (attempt < maxAttempts) {
                await delay(waitTime);
            }
        }
    }

    if (link) {
        window.location.href = link;
    } else {
        alert("An issue has occurred. Please report it by creating an issue on the GitHub repository: https://github.com/yumebayashi/Open-Slack-in-Browser-not-App");
    }
};

init();
