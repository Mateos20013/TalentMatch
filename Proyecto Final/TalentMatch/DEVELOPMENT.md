# Guía de Desarrollo - TalentMatch

## 📋 Tabla de Contenidos
1. [Inicio Rápido](#inicio-rápido)
2. [Estructura del Código](#estructura-del-código)
3. [Desarrollo Backend](#desarrollo-backend)
4. [Desarrollo Frontend](#desarrollo-frontend)
5. [Base de Datos](#base-de-datos)
6. [Debugging](#debugging)
7. [Tips y Buenas Prácticas](#tips-y-buenas-prácticas)

## 🚀 Inicio Rápido

### Opción 1: Script Automático
```powershell
.\start.ps1
```

### Opción 2: Manual

**Terminal 1 - Backend:**
```powershell
cd Backend
dotnet restore
dotnet ef database update
dotnet run
```

**Terminal 2 - Frontend:**
```powershell
cd Frontend
npm install
npm start
```

## 📁 Estructura del Código

### Backend (.NET 9)

```
Backend/
├── Controllers/
│   ├── AccountController.cs       # Login, Register, Logout
│   ├── HRController.cs            # Funciones de HR
│   ├── SupervisorController.cs    # Funciones de Supervisor
│   └── EmployeeController.cs      # Funciones de Employee
│
├── Models/                         # Entidades EF Core
│   ├── ApplicationUser.cs         # Usuario con Identity
│   ├── Objective.cs               # Objetivos
│   ├── Certificate.cs             # Certificados
│   ├── Achievement.cs             # Logros
│   ├── PerformanceReview.cs       # Evaluaciones
│   ├── JobOffer.cs                # Ofertas
│   └── JobApplication.cs          # Aplicaciones
│
├── Data/
│   ├── ApplicationDbContext.cs    # Contexto EF Core
│   └── SeedData.cs                # Datos iniciales
│
├── Services/
│   └── MatchingService.cs         # Algoritmo de matching
│
└── ViewModels/
    └── AccountViewModels.cs       # ViewModels para auth
```

### Frontend (Angular 20)

```
Frontend/src/app/
├── guards/
│   └── auth.guard.ts              # Guards de autenticación
│
├── models/
│   └── index.ts                   # Interfaces TypeScript
│
├── pages/
│   ├── login.component.ts         # Login
│   ├── register.component.ts      # Registro
│   ├── hr-dashboard.component.ts  # Dashboard HR
│   ├── supervisor-dashboard.component.ts  # Dashboard Supervisor
│   └── employee-dashboard.component.ts    # Dashboard Employee
│
├── services/
│   ├── auth.service.ts            # Autenticación
│   └── api.service.ts             # Comunicación API
│
└── app.routes.ts                  # Rutas con guards
```

## 🔧 Desarrollo Backend

### Agregar Nueva Entidad

1. **Crear modelo en `Models/`:**
```csharp
public class NuevaEntidad
{
    public int Id { get; set; }
    public string Nombre { get; set; }
    
    // Relaciones
    public string UserId { get; set; }
    public ApplicationUser User { get; set; }
}
```

2. **Agregar DbSet en `ApplicationDbContext.cs`:**
```csharp
public DbSet<NuevaEntidad> NuevasEntidades { get; set; }

protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);
    
    builder.Entity<NuevaEntidad>()
        .HasIndex(e => e.UserId);
}
```

3. **Crear migración:**
```powershell
dotnet ef migrations add AgregarNuevaEntidad
dotnet ef database update
```

### Agregar Nuevo Endpoint

1. **Crear acción en controlador:**
```csharp
[HttpGet]
[Authorize(Roles = "Employee")]
public async Task<IActionResult> MiAccion()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var datos = await _context.MiEntidad
        .Where(x => x.UserId == userId)
        .ToListAsync();
    
    return View(datos);
}
```

2. **Agregar método en `ApiService` (frontend):**
```typescript
getMisDatos(): Observable<MiEntidad[]> {
  return this.http.get<MiEntidad[]>(`${this.apiUrl}/MiControlador/MiAccion`);
}
```

## 💻 Desarrollo Frontend

### Crear Nuevo Componente

```powershell
ng generate component pages/mi-componente
```

### Agregar Nueva Ruta

En `app.routes.ts`:
```typescript
{
  path: 'mi-ruta',
  canActivate: [roleGuard(['Employee'])],
  loadComponent: () => import('./pages/mi-componente.component').then(m => m.MiComponenteComponent)
}
```

### Agregar Nueva Interface

En `models/index.ts`:
```typescript
export interface MiModelo {
  id: number;
  nombre: string;
  fecha: Date;
}
```

## 🗄️ Base de Datos

### Comandos Útiles

```powershell
# Ver migraciones
dotnet ef migrations list

# Crear migración
dotnet ef migrations add NombreMigracion

# Aplicar migraciones
dotnet ef database update

# Revertir a migración específica
dotnet ef database update MigracionAnterior

# Eliminar última migración
dotnet ef migrations remove

# Eliminar base de datos
dotnet ef database drop

# Script SQL de migración
dotnet ef migrations script
```

### Conexión PostgreSQL

Configurar en `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=internal_talent_db;Username=postgres;Password=TuPassword"
  }
}
```

## 🐛 Debugging

### Backend (.NET)

1. **Visual Studio Code:**
   - Abrir carpeta Backend
   - F5 para iniciar debugging
   - Breakpoints con F9

2. **Visual Studio 2022:**
   - Abrir `Backend.csproj`
   - F5 para iniciar debugging

### Frontend (Angular)

1. **Chrome DevTools:**
   - F12 para abrir
   - Sources → buscar archivo TypeScript
   - Agregar breakpoints

2. **VS Code:**
   - Instalar extensión "Debugger for Chrome"
   - F5 para iniciar debugging

### Ver Logs

**Backend:**
```csharp
// En controlador
_logger.LogInformation("Mensaje de log");
_logger.LogError(ex, "Error: {Message}", ex.Message);
```

**Frontend:**
```typescript
// En componente
console.log('Mensaje de log');
console.error('Error:', error);
```

## 💡 Tips y Buenas Prácticas

### Backend

1. **Usar async/await:**
```csharp
public async Task<IActionResult> MiAccion()
{
    var datos = await _context.MiEntidad.ToListAsync();
    return Ok(datos);
}
```

2. **Validar entrada:**
```csharp
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}
```

3. **Manejo de errores:**
```csharp
try
{
    // Código
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error en MiAccion");
    return StatusCode(500, "Error interno del servidor");
}
```

### Frontend

1. **Usar Signals para estado:**
```typescript
data = signal<MiTipo[]>([]);

// Actualizar
this.data.set(nuevosDatos);

// En template
{{ data().length }}
```

2. **Manejar errores en servicios:**
```typescript
this.apiService.getDatos().subscribe({
  next: (datos) => this.data.set(datos),
  error: (error) => console.error('Error:', error)
});
```

3. **Desuscribirse no necesario con async pipe:**
```html
<!-- En template -->
<div *ngFor="let item of items$ | async">
  {{ item.name }}
</div>
```

### SCSS

1. **Usar variables:**
```scss
$primary-color: #0056b3;

.button {
  background: $primary-color;
}
```

2. **Nesting:**
```scss
.card {
  padding: 1rem;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .title {
    font-size: 1.5rem;
  }
}
```

## 🔑 Variables de Entorno

### Backend - `appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "..."
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Frontend - `environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5010'
};
```

## 📝 Testing

### Backend
```powershell
dotnet test
```

### Frontend
```powershell
npm test
```

## 📦 Build para Producción

### Backend
```powershell
dotnet publish -c Release -o ./publish
```

### Frontend
```powershell
npm run build
# Archivos en Frontend/dist/
```

---

Para más información, consulta:
- [Documentación .NET](https://learn.microsoft.com/dotnet/)
- [Documentación Angular](https://angular.dev/)
- [Documentación EF Core](https://learn.microsoft.com/ef/core/)
- [Documentación PostgreSQL](https://www.postgresql.org/docs/)
