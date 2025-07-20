FROM node:22-alpine

WORKDIR /app

# 依存関係レイヤ
COPY package*.json ./
RUN npm install

# ソース
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]