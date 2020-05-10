# @stage Application build
# This stage build Sapper application.
FROM mhart/alpine-node:12
WORKDIR /app
COPY . .
RUN npm install --no-audit --unsafe-perm

# @stage Run Sapper application
# This stage just exposes port, on which our application
# will run, and runs Sapper application. Nothing special.
EXPOSE 3000
CMD ["node", "index.js"]