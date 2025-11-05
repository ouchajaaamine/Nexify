FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
	bash \
	git \
	curl \
	libpng-dev \
	oniguruma-dev \
	libxml2-dev \
	zip \
	unzip \
	postgresql-dev \
	libzip-dev \
	icu-dev \
	postgresql-client \
	nginx \
	supervisor

RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd zip intl

ENV COMPOSER_ALLOW_SUPERUSER=1 \
	COMPOSER_HOME=/tmp/composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./

RUN composer install --optimize-autoloader --no-interaction --no-scripts || \
	composer install --optimize-autoloader --no-interaction --no-scripts

COPY . .

# Remove doctrine_fixtures config for production builds
RUN rm -f /var/www/html/config/packages/doctrine_fixtures.yaml

# Generate JWT RS256 keys for lexik/jwt-authentication-bundle
RUN mkdir -p config/jwt \
	&& openssl genpkey -algorithm RSA -out config/jwt/private.pem -pkeyopt rsa_keygen_bits:4096 \
	&& openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem \
	&& chmod 644 config/jwt/private.pem config/jwt/public.pem

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
COPY docker-healthcheck.sh /usr/local/bin/docker-healthcheck.sh
RUN chmod +x /usr/local/bin/docker-healthcheck.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-healthcheck.sh || true

# Copy nginx and supervisor configuration
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf
COPY php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Create necessary directories
RUN mkdir -p /var/log/supervisor /var/log/nginx /run/nginx

# Permissions for Symfony cache/logs
RUN mkdir -p /var/www/html/var/cache /var/www/html/var/log \
	&& chown -R www-data:www-data /var/www/html \
	&& chmod -R 775 /var/www/html/var \
	&& su www-data -s /bin/sh -c "php bin/console cache:clear --no-warmup --env=prod" \
	&& su www-data -s /bin/sh -c "php bin/console cache:warmup --env=prod" || true

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

