FROM node:20-bookworm-slim

# System dependencies required by Chrome + chromedriver
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    chromium \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium
ENV CHROME_BIN=/usr/bin/chromium

WORKDIR /e2e
COPY tests/package.json ./
RUN npm install --no-audit --no-fund && npm cache clean --force

COPY tests/ ./tests/

# Point selenium-webdriver to the system chromium
RUN sed -i 's|/usr/bin/chromedriver|/usr/lib/chromium/chromedriver|g' \
      /usr/lib/node_modules/selenium-webdriver/lib/chromium.js 2>/dev/null || true

ENTRYPOINT ["node", "/e2e/tests/app.test.js"]
