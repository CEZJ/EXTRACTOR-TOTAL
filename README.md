<h1 align="center">PROYECTO PARA ASEGURADORA</h1>

<div align="center">
  <img width="576" height="314" alt="Adobe Express - gif" src="https://github.com/user-attachments/assets/c077f738-9352-4faf-a0e6-37575edfbe57" />
</div>

## 📌 ¿Qué es lo que hace?

Este proyecto es un **automatizador inteligente de extracción de datos** desarrollado en Python. Su objetivo principal es leer, procesar y extraer información crítica de decenas de pólizas, facturas, proformas y avisos de cobranza en formato PDF pertenecientes a las principales compañías aseguradoras (Pacífico, Rímac, Protecta, Sanitas, Mapfre y La Positiva).

Debido a que cada aseguradora maneja formatos, tablas y nomenclaturas completamente distintas, el script actúa como un "cazador" dinámico que identifica y extrae:
* RUC / DNI
* Número de Póliza o Contrato
* Número de Documento (Facturas, Proformas, Avisos)
* Fechas de Vigencia (Inicio y Término)
* Fecha de Emisión
* Prima Total / Importe a Pagar (identificando la moneda y símbolos)

Una vez procesada la información, el sistema consolida y exporta todos los registros hacia un reporte automatizado en Excel (`Reporte_Polizas.xlsx`), con un diseño estructurado, estilizado y listo para su análisis.

## 🚀 Características Principales

* **Inteligencia Artificial (OCR) Integrada:** Implementa la librería `EasyOCR` como plan de respaldo para "leer" documentos escaneados o imágenes incrustadas dentro de los PDFs cuando no existe texto estructurado seleccionable.
* **Cazadores Regex (Expresiones Regulares) Avanzados:** Diseñados para ser inmunes a la "basura visual". Los algoritmos saltan espacios en blanco irregulares, caracteres especiales (como "N°") y desajustes de columnas, realizando búsquedas profundas de hasta 800 caracteres de distancia.
* **Interfaz Gráfica Amigable:** Utiliza `tkinter` para desplegar una ventana nativa de Windows que permite al usuario seleccionar de forma sencilla los archivos PDF a procesar por lotes.
* **Formato Automático de Excel:** Gracias a `openpyxl`, el archivo resultante no es un documento plano, sino un reporte profesional con anchos de columna ajustados, colores en la cabecera, alternancia de colores en las filas y filtros activados por defecto.

## 🛠️ Tecnologías Utilizadas

* **Python:** Lenguaje base de la automatización.
* **pdfplumber:** Lectura precisa y extracción de texto estructurado de PDFs.
* **EasyOCR & Numpy:** Procesamiento de imágenes y reconocimiento óptico de caracteres impulsado por IA.
* **pandas:** Estructuración ágil de los datos extraídos en DataFrames.
* **openpyxl:** Manipulación y diseño dinámico de las hojas de cálculo en Excel.
* **re (Regex):** Lógica matemática principal para la búsqueda de patrones de datos.


