# Componentes React

Esta carpeta contiene las piezas visuales reutilizables del frontend React.

- `Logo.jsx`: identidad visual reutilizable de TEJIDO.
- `SiteHeader.jsx`: navegación principal y acceso de usuario.
- `HeroSection.jsx`: presentación inicial de TEJIDO.
- `ExploreSection.jsx`: filtros, búsqueda y estados de carga.
- `PublicationCard.jsx`: tarjeta individual de publicación.
- `Footer.jsx`: pie de página compartido entre pantallas.

`App.jsx` conserva la carga de datos y compone estas piezas. Las nuevas funcionalidades deben incorporarse aquí como componentes independientes cuando tengan una responsabilidad visual o de interacción clara.
Este directorio va a contener los componentes principales del frontend en la fase 2.

A futuro se espera separar:
- LoginModal
- PublicationCard
- PublicationDetail
- UserDashboard
- AdminModeration
- MapView
- HiloAssistant
