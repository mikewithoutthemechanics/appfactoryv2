FROM n8nio/n8n:latest
USER root
RUN npm install -g --silent typescript
WORKDIR /data
COPY . /data
CMD ["node", "packages/server/dist/index.js"]
