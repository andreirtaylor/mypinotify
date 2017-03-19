git pull
yarn build -- --release
cd build
sudo PORT=80 node server.js
