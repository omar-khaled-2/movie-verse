FROM node:20-alpine


WORKDIR /app





COPY . .


RUN npm install


RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000


EXPOSE 3000

ENTRYPOINT []

CMD ["npm","run","start:prod"]

