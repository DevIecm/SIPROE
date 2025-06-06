# Etapa 1: Build Angular app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm install -g @angular/cli
RUN ng build Front-SIPROE --configuration production

# Etapa 2: Servir con NGINX
FROM nginx:alpine

# Elimina la página por defecto de NGINX
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos de Angular compilados al contenedor NGINX
COPY --from=builder /app/dist/front-siproe/browser /usr/share/nginx/html

# Copia configuración personalizada de NGINX (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
