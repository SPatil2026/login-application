# --- Stage 1: Build Stage ---
FROM alpine:3.19 AS builder
RUN apk add --no-cache gcc libc-dev make openssl-dev pcre-dev zlib-dev linux-headers

WORKDIR /usr/src
COPY nginx-1.28.0 ./nginx-1.28.0
COPY nginx-sticky-module-ng ./nginx-sticky-module-ng

WORKDIR /usr/src/nginx-1.28.0

RUN ./configure \
    --with-http_ssl_module \
    --with-stream \
    --add-module=/usr/src/nginx-sticky-module-ng \
    && make \
    && make install

# --- Stage 2: Runtime Stage ---
FROM alpine:3.19
RUN apk add --no-cache pcre openssl zlib

COPY --from=builder /usr/local/nginx /usr/local/nginx

COPY certs/login-application.crt /usr/local/nginx/certs/login-application.crt
COPY certs/login-application.key /usr/local/nginx/certs/login-application.key

RUN mkdir -p /usr/local/nginx/logs && \
    ln -sf /dev/stdout /usr/local/nginx/logs/access.log && \
    ln -sf /dev/stderr /usr/local/nginx/logs/error.log

EXPOSE 80 443

CMD ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]