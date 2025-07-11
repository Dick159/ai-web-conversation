FROM --platform=linux/amd64 node:19-bullseye-slim

WORKDIR /app

COPY . .

RUN yarn config set ignore-engines true
RUN npm config set registry https://registry.npmmirror.com/
RUN yarn config set registry https://registry.npmmirror.com/

RUN yarn install
RUN yarn build

EXPOSE 3000

CMD ["yarn","start"]
