# AdminExpress — Componente de Login (Proyecto estudiantil)

Repositorio con un ejercicio práctico para recrear el componente de login "AdminExpress" usando HTML y CSS.

Este proyecto está pensado para entregar como actividad de clase: estructura clara, estilos responsivos y pequeños detalles de accesibilidad.

## Qué incluye
- `index.html` — estructura HTML semántica del componente (panel de marca + formulario de login).
- `styles.css` — estilos principales, variables CSS, layout responsive y media queries.

## Objetivos de la entrega
- Practicar HTML semántico y formularios accesibles.
- Usar CSS moderno (variables, flexbox, grid) para resolver el layout.
- Aplicar media queries para una interfaz responsive (móvil → tablet → escritorio).

## Cómo ejecutar 

Se puede abrir `index.html` directamente en el navegador (doble clic). Para probar con un servidor local (recomendado para pruebas de responsive), usa Python desde PowerShell:

```powershell
# Ejecución Proyecto
Set-Location -Path "c:\Users\mateo\Documents\Septimo Semestre\Ingeneria WEB\Actividad en Clase Armado Web de un componente de Login en HTML y CSS"
python -m http.server 8000
# Url para entrar en el navegador:
http://localhost:8000/index.html
```

## Cómo probar responsive
1. Abre la página en el navegador.
2. Abre las herramientas de desarrollo (F12) y activa la vista de dispositivos.
3. Prueba anchos típicos: 375px (móvil), 768px (tablet), >=900px (escritorio).



## Resumen de la entrega 

- Autor: Mateo 
- Archivos: `index.html`, `styles.css`, `README.md`.
- Tema: Componente de Login inspirado en "AdminExpress". Implementación mobile-first, accesibilidad básica (labels, atributos ARIA en el toggle), y uso de SVG inline.
- Qué evaluar: estructura semántica del HTML, uso de variables CSS y layout responsivo, y la calidad visual a los distintos tamaños.


