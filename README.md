```bash
$ npm install -g log-my-request
#$ lproxy <port> <redirect-to> 
#run in background
$ lproxy 9009 https://www.google.com
$ lproxy 9009 https://www.google.com --detail
$ lproxy 9009 https://www.google.com --detail --delay 1000
```