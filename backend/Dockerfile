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
	postgresql-client

RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd zip intl

ENV COMPOSER_ALLOW_SUPERUSER=1 \
	COMPOSER_HOME=/tmp/composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./

RUN composer install --optimize-autoloader --no-interaction --no-scripts || \
	composer install --optimize-autoloader --no-interaction --no-scripts

COPY . .

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
COPY docker-healthcheck.sh /usr/local/bin/docker-healthcheck.sh
RUN chmod +x /usr/local/bin/docker-healthcheck.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-healthcheck.sh || true

# Permissions for Symfony cache/logs
RUN mkdir -p /var/www/html/var \
	&& chown -R www-data:www-data /var/www/html \
	&& chmod -R 755 /var/www/html \
	&& chmod -R 775 /var/www/html/var

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

