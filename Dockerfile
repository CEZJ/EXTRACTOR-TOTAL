# Usamos una versión ligera de Python
FROM python:3.10-slim

# Directorio de trabajo
WORKDIR /code

# Instalamos herramientas del sistema operativo necesarias para leer imágenes (OpenCV/OCR)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copiamos las librerías e instalamos
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copiamos tu código (main.py)
COPY . /code

# Hugging Face EXIGE usar el puerto 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]