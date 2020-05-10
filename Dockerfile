# @stage Application build
# This stage build Sapper application.
FROM mhart/alpine-node:12 AS build-app
WORKDIR /app
COPY . .
RUN npm install --no-audit --unsafe-perm

# @stage Copying files and modules
# This stage only needs the compiled Sapper application
# and the runtime dependencies.
FROM mhart/alpine-node:slim-12
WORKDIR /app
COPY --from=build-app . .

# @stage Run Sapper application
# This stage just exposes port, on which our application
# will run, and runs Sapper application. Nothing special.
EXPOSE 3000
CMD ["node", "index.js"]