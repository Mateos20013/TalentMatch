# TalentMatch - Sistema de Gestión de Talento Interno

Sistema web empresarial full-stack para la gestión del talento y desarrollo profesional dentro de la empresa.

## 🚀 Tecnologías

### Backend (.NET 9)
- **ASP.NET Core MVC** - Framework web
- **Entity Framework Core 9** - ORM para PostgreSQL
- **Identity Framework** - Autenticación y roles
- **PostgreSQL** - Base de datos

### Frontend (Angular 20)
- **Angular 20 Standalone** - Framework moderno
- **TypeScript** - Lenguaje tipado
- **SCSS** - Estilos con variables corporativas
- **Signals** - Estado reactivo
- **HttpClient** - Comunicación con API

## ⚡ Inicio Rápido

### 1. Backend
```powershell
cd Backend
dotnet restore
dotnet ef database update
dotnet run
# Backend en http://localhost:5010
```

### 2. Frontend
```powershell
cd Frontend
npm install
npm start
# Frontend en http://localhost:4200
```

### 3. Login

**HR (Recursos Humanos):**
- Email: `mateo@ntt.com`
- Password: `Mateo@123`

**Empleado (para pruebas):**
- Email: `mateos20013@ntt.com`
- Password: `Mateo@123`

## 📋 Características por Rol

### 🔷 HR (Recursos Humanos)
- ✅ Aprobar usuarios y asignar roles
- ✅ Crear ofertas de trabajo
- ✅ Ver candidatos recomendados (match automático)
- ✅ Gestionar aplicaciones

### 🔷 Supervisor
- ✅ Evaluar desempeño (6 métricas)
- ✅ Comentar progreso de objetivos

### 🔷 Employee (Empleado)
- ✅ Gestionar perfil personal
- ✅ Crear objetivos con seguimiento
- ✅ Subir certificados (PDFs)
- ✅ Registrar logros (impacto 1-10)
- ✅ Aplicar a ofertas internas
- ✅ Ver evaluaciones de desempeño

## 🎯 Algoritmo de Matching

El sistema calcula automáticamente un **Match Score** para candidatos:

```
Score = Performance (40%) + Experiencia (20%) + Logros (20%) + Certificados (20%)
```

Solo muestra candidatos con Score ≥ 50%

## 🗄️ Base de Datos

**PostgreSQL** con las siguientes tablas:
- AspNetUsers (Identity + campos personalizados)
- Objectives (objetivos con status y progreso)
- ObjectiveProgress (seguimiento de objetivos)
- Certificates (certificaciones con archivos)
- Achievements (logros con impacto)
- PerformanceReviews (evaluaciones 6 métricas)
- JobOffers (ofertas de trabajo)
- JobApplications (aplicaciones con match score)

**Configuración en appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=internal_talent_db;Username=postgres;Password=AWSDjikl291020"
  }
}
```

## 📁 Estructura del Proyecto

```
TalentMatch/
├── Backend/                    # .NET 9 MVC
│   ├── Controllers/            # API Controllers
│   │   ├── AccountController.cs
│   │   ├── HRController.cs
│   │   ├── SupervisorController.cs
│   │   └── EmployeeController.cs
│   ├── Models/                 # Entidades EF Core
│   ├── Data/                   # DbContext y SeedData
│   ├── Services/               # MatchingService
│   ├── Views/                  # Razor Views (legacy)
│   └── wwwroot/css/            # SCSS compilado
│
└── Frontend/                   # Angular 20
    ├── src/app/
    │   ├── guards/             # AuthGuard, RoleGuard
    │   ├── models/             # Interfaces TypeScript
    │   ├── pages/              # Componentes standalone
    │   │   ├── login.component.ts
    │   │   ├── register.component.ts
    │   │   ├── hr-dashboard.component.ts
    │   │   ├── supervisor-dashboard.component.ts
    │   │   └── employee-dashboard.component.ts
    │   ├── services/           # AuthService, ApiService
    │   └── app.routes.ts       # Rutas con guards
    └── src/styles.scss         # Tema corporativo
```

## 🎨 Diseño UI

- **Color Primario:** #0056b3 (azul corporativo)
- **SCSS Modular** con variables y mixins
- **Responsive Design** para móviles
- **Cards Modernas** con animaciones
- **Tema Profesional** empresarial

## 🔐 Seguridad

- **Identity Framework** - Autenticación robusta
- **Role-Based Authorization** - 3 roles (HR, Supervisor, Employee)
- **Guards en Angular** - Protección de rutas
- **Password Hashing** - Bcrypt automático
- **CSRF Protection** - Tokens anti-forgery
- **EF Core Parametrizado** - Prevención SQL Injection

## 🚀 Flujo de Trabajo

### 1. Registro
1. Usuario se registra (rol Employee por defecto)
2. IsApproved = false (pendiente)
3. HR aprueba y asigna rol definitivo

### 2. Empleado
1. Completa perfil (posición, departamento, experiencia)
2. Crea objetivos y registra progreso
3. Sube certificados (con PDFs)
4. Registra logros con impacto
5. Aplica a ofertas internas

### 3. Supervisor
1. Evalúa desempeño (6 métricas: Técnicas, Comunicación, Trabajo en Equipo, Resolución de Problemas, Productividad, Liderazgo)
2. Comenta progreso de objetivos

### 4. HR
1. Crea oferta de trabajo
2. Sistema recomienda candidatos automáticamente
3. Revisa aplicaciones ordenadas por match score
4. Actualiza estados (Pending → Under Review → Accepted/Rejected)

## 📝 Comandos Útiles

### Backend
```powershell
dotnet build                              # Compilar
dotnet run                                # Ejecutar
dotnet ef migrations add MigracionName    # Nueva migración
dotnet ef database update                 # Aplicar migraciones
dotnet ef database drop                   # Eliminar BD
```

### Frontend
```powershell
npm install          # Instalar dependencias
npm start            # Servidor desarrollo
npm run build        # Build producción
ng generate c nombre # Nuevo componente
```

## 🧪 Pruebas

### Como HR (mateo@ntt.com / mateo123)
1. Ver usuarios pendientes
2. Aprobar usuario como Employee/Supervisor
3. Crear oferta de trabajo
4. Ver candidatos recomendados

### Como Empleado Nuevo
1. Registrarse en `/register`
2. Esperar aprobación de HR
3. Login después de aprobación
4. Completar perfil en `/employee`

### Probar Matching
1. Como Employee: agregar logros, certificados
2. Como HR: crear oferta con requisitos
3. Sistema calcula match automáticamente
4. HR ve lista ordenada por score

## 📊 Modelo de Datos Clave

### ApplicationUser (extiende IdentityUser)
- FullName, Position, Department, YearsOfExperience
- IsApproved (control de HR)

### Objective
- Title, Description, Deadline
- Status (Pending, InProgress, Completed, Cancelled)

### PerformanceReview
- 6 métricas (1-10): TechnicalSkills, Communication, Teamwork, ProblemSolving, Productivity, Leadership
- OverallScore calculado automáticamente

### JobOffer
- MinYearsExperience, MinPerformanceScore
- Status (Open, Closed, Cancelled)

### JobApplication
- MatchScore calculado automáticamente
- Status (Pending, UnderReview, Accepted, Rejected)

## 🏗️ Arquitectura

- **Patrón MVC** en backend
- **Standalone Components** en Angular
- **Service Layer** (MatchingService)
- **Dependency Injection** nativa .NET y Angular
- **SOLID Principles**
- **Code-First** con EF Core

## 📄 API Endpoints

### Auth
- `POST /Account/Login`
- `POST /Account/Register`
- `POST /Account/Logout`

### HR
- `GET /HR/PendingUsers`
- `POST /HR/ApproveUser`
- `POST /HR/CreateJobOffer`
- `GET /HR/RecommendedCandidates/{id}`
- `POST /HR/UpdateApplicationStatus`

### Supervisor
- `POST /Supervisor/CreateReview`
- `GET /Supervisor/EmployeeObjectives/{id}`
- `POST /Supervisor/CommentObjectiveProgress`

### Employee
- `GET /Employee/Profile`
- `POST /Employee/UpdateProfile`
- `POST /Employee/CreateObjective`
- `POST /Employee/CreateCertificate`
- `POST /Employee/CreateAchievement`
- `POST /Employee/ApplyToJob/{id}`

---

**Desarrollado con** ❤️ **usando .NET 9, Angular 20 y PostgreSQL**  
**Proyecto Académico** - Séptimo Semestre Ingeniería Web
