#!/bin/sh
# Configurar el cliente de MinIO (mc) para conectar al servidor
/usr/bin/mc alias set myminio http://minio:9000 minioadmin minioadmin

# Crear el bucket si no existe
/usr/bin/mc mb myminio/mi-bucket-archivos || true

# Configurar el bucket como PRIVADO (Seguridad para APP)
/usr/bin/mc anonymous set none myminio/mi-bucket-archivos

echo "MinIO configurado correctamente."
exit 0
