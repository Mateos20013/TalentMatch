# TalentMatch Frontend - Angular 20

Sistema de gestión de talento interno desarrollado con Angular 20.

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
# La app estará en http://localhost:4200
```

## 🔗 Backend

El frontend se conecta al backend .NET en `http://localhost:5010`

**Usuario por defecto HR:**
- Email: `mateo@ntt.com`
- Password: `mateo123`

## 📁 Estructura

```
Frontend/
├── src/app/
│   ├── guards/          # Guards de autenticación
│   ├── models/          # Interfaces TypeScript
│   ├── pages/           # Componentes de páginas
│   ├── services/        # Servicios (Auth, API)
│   └── app.routes.ts    # Rutas con guards
├── src/environments/    # Configuración de entornos
└── src/styles.scss      # Estilos globales corporativos
```

## 🎯 Funcionalidades por Rol

### HR
- Aprobar usuarios y asignar roles
- Crear ofertas de trabajo
- Ver candidatos recomendados con scoring
- Gestionar aplicaciones

### Supervisor
- Crear evaluaciones de desempeño
- Comentar progreso de objetivos

### Employee
- Gestionar perfil
- Crear objetivos con seguimiento
- Subir certificados
- Registrar logros
- Aplicar a ofertas internas

## 🛠️ Tecnologías

- Angular 20 (Zoneless, Standalone Components)
- TypeScript (Strict Mode)
- SCSS con tema corporativo
- Signals para estado reactivo
- HttpClient para API

---

Desarrollado con buenas prácticas de programación
