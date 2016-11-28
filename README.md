# Edgar
A web-based VR experience using Cardboard.

## Requirements
### Apache server
```Shell
$ sudo apt-get update
$ sudo apt-get install apache2
```

### Node.js
```Shell
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Installation

Clone the project and put it inside your Apache folder: `/var/www/public` by default.

```Shell
$ cd <Apache folder>/Edgar

$ npm install

$ npm run build
```
