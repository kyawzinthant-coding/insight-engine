FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /usr/src/app

# Copy and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the code
COPY . .

# Build TypeScript
RUN pnpm run build

EXPOSE 4000

CMD ["node", "dist/src/index.js"]
