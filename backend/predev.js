const { execSync } = require('child_process');

const port = process.env.PORT || 5000;

const cleanPort = () => {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano`).toString();
      const lines = output.split('\r\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        // Look for TCP lines ending with :port
        if (parts.length >= 5 && (parts[0] === 'TCP' || parts[0] === 'UDP')) {
          const localAddr = parts[1];
          if (localAddr.endsWith(`:${port}`)) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && parseInt(pid) !== process.pid) {
              console.log(`[Predev] Port ${port} is occupied by process ID ${pid}. Releasing port...`);
              execSync(`taskkill /F /PID ${pid}`);
            }
          }
        }
      }
    } else {
      // macOS/Linux
      try {
        const pid = execSync(`lsof -t -i:${port}`).toString().trim();
        if (pid && parseInt(pid) !== process.pid) {
          console.log(`[Predev] Port ${port} is occupied by process ID ${pid}. Releasing port...`);
          execSync(`kill -9 ${pid}`);
        }
      } catch (e) {
        // Ignored if port is already free
      }
    }
  } catch (error) {
    // Ignored if netstat or taskkill fails due to no process found
  }
};

cleanPort();
