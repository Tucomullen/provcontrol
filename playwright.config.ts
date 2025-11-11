import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * 
 * Configuración para testing E2E automatizado.
 * Los agentes de Cursor 2.0 pueden ejecutar estos tests usando los comandos npm.
 * 
 * Para ejecutar tests:
 * - npm test - Ejecutar todos los tests (headless)
 * - npm test:ui - Ejecutar con UI interactiva
 * - npm test:headed - Ver el navegador mientras se ejecutan
 * - npm test:debug - Modo debug paso a paso
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout para cada test
  timeout: 30 * 1000,
  
  // Timeout para expect assertions
  expect: {
    timeout: 5000,
  },
  
  // Ejecutar tests en paralelo (puede desactivarse si hay conflictos)
  fullyParallel: true,
  
  // Fallar el build si hay tests fallidos en CI
  forbidOnly: !!process.env.CI,
  
  // Reintentar en CI si falla
  retries: process.env.CI ? 2 : 0,
  
  // Workers en CI, todos en local
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html'],
    ['list'],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  // Compartir estado entre tests (cookies, localStorage, etc.)
  use: {
    // Base URL para todos los tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Capturar screenshot solo en fallos
    screenshot: 'only-on-failure',
    
    // Capturar video solo en fallos
    video: 'retain-on-failure',
    
    // Trace para debugging (solo en fallos)
    trace: 'retain-on-failure',
    
    // Timeout para acciones (click, fill, etc.)
    actionTimeout: 10 * 1000,
    
    // Navegación timeout
    navigationTimeout: 30 * 1000,
  },

  // Configurar proyectos para diferentes navegadores
  // Por defecto solo chromium para desarrollo rápido
  // Puedes ejecutar con --project=firefox o --project=webkit para otros navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Desactivados por defecto para ejecución más rápida
    // Descomentar cuando necesites probar en múltiples navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile viewports (opcional)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Servidor de desarrollo - se inicia automáticamente antes de los tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // Reutilizar servidor existente fuera de CI
    timeout: 120 * 1000, // Esperar hasta 120 segundos para que el servidor inicie
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

