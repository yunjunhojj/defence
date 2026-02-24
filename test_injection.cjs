const fs = require('fs');

const code = `export default function getPayload() {
  return "<img src=x onerror=alert(1)>";
}`;
// ...

const encodedCode = btoa(unescape(encodeURIComponent(code)));

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
<script>
    window.alert = function() { console.log('CHALLENGE_SUCCESS'); };
</script>
</head>
<body>
<h2 id="greeting">Welcome!</h2>
<script type="module">
    const userCode = decodeURIComponent(escape(atob('${'USER_CODE_TEMPLATE'}')));
    const encodedJs = encodeURIComponent(userCode);
    import('data:text/javascript;charset=utf-8,' + encodedJs).then(module => {
        if (module.default) {
            console.log("Returned:", module.default());
        }
    }).catch(e => console.error(e));
</script>
</body>
</html>
`;

const finalHtml = htmlTemplate.replace('${USER_CODE_TEMPLATE}', encodedCode);

const expectedCode = decodeURIComponent(escape(atob(encodedCode)));
console.log("Encoded:", encodedCode);
console.log("Decoded exactly as:", expectedCode);

require('fs').writeFileSync('test.html', finalHtml);
console.log('test.html written');
