#!/bin/sh
# Configurar el cliente de MinIO (mc) para conectar al servidor
/usr/bin/mc alias set myminio http://minio:9000 minioadmin minioadmin

# Crear buckets si no existen
/usr/bin/mc mb myminio/public-assets || true
/usr/bin/mc mb myminio/private-assets || true

# Configurar políticas
# Permite lectura pública para logos y fotos
/usr/bin/mc anonymous set download myminio/public-assets
# Bloqueo total para archivos privados
/usr/bin/mc anonymous set none myminio/private-assets

echo "MinIO configurado correctamente con public-assets y private-assets."
exit 0
