# ETAPA 1: Construcción de Angular
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# ETAPA 2: Servidor de archivos estáticos (Nginx)
FROM nginx:alpine
# Copiamos la configuración que creamos para el puerto 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copiamos los archivos generados por Angular (ajusta la ruta según tu angular.json)
COPY --from=build /app/dist/frontend-app/browser /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
