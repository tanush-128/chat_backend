FROM node:alpine3.18

# Create app directory
WORKDIR /

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3001

ENV GOOGLE_ID  "42552123265-msoo43qqlhvchgc5hpg85iidj9a4eq4e.apps.googleusercontent.com"
ENV GOOGLE_SECRET  "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"
ENV NEXTAUTH_URL  "http://localhost:3000"
ENV NEXTAUTH_SECRET  "my_secret_2"
ENV DATABASE_URL "postgresql://tanuedu128:8cMF2lUeWxsP@ep-steep-snowflake-a16e4wvg.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

RUN npx prisma generate

CMD [ "npx", "tsx", "./socket_io.ts" ]






