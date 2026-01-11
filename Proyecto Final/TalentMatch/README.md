# TalentMatch

Plataforma para la gestión de talento interno y procesos de selección.

## Código fuente
[Repositorio en GitHub](https://github.com/Mateos20013/TalentMatch)

## Mejoras implementadas
- **Principios SOLID:**
  - SRP (Responsabilidad Única): Separación de la lógica de autenticación en un servicio dedicado.
  - DIP (Inversión de Dependencias): Los controladores dependen de interfaces, no de implementaciones concretas.
- **Patrones de diseño:**
  - Singleton: `MatchingService` registrado como Singleton.
  - Repositorio: Implementación de `EmployeeRepository` para acceso a datos de empleados.

## Video explicativo
[Ver video de mejoras implementadas](ENLACE_AQUI)

## Proyecto en línea
[Ver TalentMatch desplegado](ENLACE_AQUI)

---

### ¿Cómo desplegar el proyecto?

#### Backend (.NET)
1. Sube el código a GitHub.
2. Crea una cuenta en [Render.com](https://render.com/).
3. Elige "New Web Service" y conecta tu repositorio.
4. Configura el build command: `dotnet build` y start command: `dotnet run --project Backend/InternalTalentManagement.csproj`.
5. Añade variables de entorno necesarias (por ejemplo, cadenas de conexión).
6. Espera a que Render haga el deploy y copia el enlace generado.

#### Frontend (Angular)
1. Sube el código a GitHub.
2. Usa [Vercel](https://vercel.com/) o [Netlify](https://netlify.com/).
3. Conecta tu repositorio y selecciona el directorio `Frontend`.
4. Configura el build command: `npm run build` y el output directory: `dist/`.
5. Espera a que se despliegue y copia el enlace generado.

---

### Contacto
Para dudas o sugerencias, abre un issue en el repositorio de GitHub.
