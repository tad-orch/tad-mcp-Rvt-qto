FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
ENV REVIT_BRIDGE_URL=http://host.docker.internal:55234/mcp
CMD ["node", "dist/server.stdio.js"]
