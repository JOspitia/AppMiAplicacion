#!/bin/sh

# Función para esperar a MinIO
wait_for_minio() {
  echo "Esperando a que el servicio MinIO esté listo..."
  # Intentamos configurar el alias. Reintentará hasta que el servidor responda y las credenciales sean válidas.
  until /usr/bin/mc alias set myminio http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" > /dev/null 2>&1; do
    echo "MinIO NO está listo o las credenciales son incorrectas... reintentando en 2s"
    sleep 2
  done
  echo "MinIO está listo y autenticado correctamente."
}

# Ejecutar espera
wait_for_minio

# Crear buckets si no existen
echo "Creando buckets..."
/usr/bin/mc mb myminio/public-assets || true
/usr/bin/mc mb myminio/private-assets || true

# Configurar políticas
# Permite lectura pública para logos y fotos (public-assets)
echo "Configurando política pública para public-assets..."
/usr/bin/mc anonymous set download myminio/public-assets

# Bloqueo total para archivos privados (private-assets)
echo "Configurando política privada para private-assets..."
/usr/bin/mc anonymous set none myminio/private-assets

echo "MinIO configurado correctamente con public-assets y private-assets."
exit 0
