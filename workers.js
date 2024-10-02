addEventListener('fetch', 
    event => {
        event.respondWith(handleRequest(event.request))
    }
)

const specialCases = {
    "*": {
        "Origin": "DELETE",
        "Referer": "DELETE"
    }
}
    
// Disclaimer HTML
const Disclaimer_HTML = `
<style>
    a {
        color: blue;
    }
</style>
<h1>Before you begin, you must read the <a href="https://docs.yyyyt.top/others/Disclaimer.html">Terms of Service</a></h1>
`
    
function handleSpecialCases(request) {
    const url = new URL(request.url);
    const rules = specialCases[url.hostname] || specialCases["*"];
    for (const [key, value] of Object.entries(rules)) {
        switch (value) {
            case "KEEP":
                break;
            case "DELETE":
                request.headers.delete(key);
                break;
            default:
                request.headers.set(key, value);
                break;
        }
    }
}

async function handleRequest(request) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
        return new Response(
            Disclaimer_HTML, {
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                },
            }
        )
    };
    const actualUrlStr = url.pathname.replace("/", "") + url.search + url.hash;
    const actualUrl = new URL(actualUrlStr);
    const modifiedRequest = new Request(
        actualUrl, {
            headers: request.headers,
            method: request.method,
            body: request.body,
            redirect: 'follow'
        }
    );
    handleSpecialCases(modifiedRequest);
    const response = await fetch(modifiedRequest);
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Cache-Control', 'public, max-age=10'); // 根据需要调整 max-age
    return modifiedResponse;
}