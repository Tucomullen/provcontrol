/**
 * Authentication Helpers for Tests
 * 
 * Funciones auxiliares para autenticación en tests E2E.
 * Estas funciones pueden ser usadas por agentes de Cursor 2.0 para
 * realizar login rápido en tests.
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role: 'presidente' | 'propietario' | 'proveedor';
  firstName?: string;
  lastName?: string;
}

/**
 * Usuarios de prueba predefinidos
 * Estos usuarios deben existir en la base de datos de prueba
 */
export const testUsers: Record<string, TestUser> = {
  presidente: {
    email: 'presidente@test.com',
    password: 'Test1234!',
    role: 'presidente',
    firstName: 'Juan',
    lastName: 'Presidente',
  },
  propietario: {
    email: 'propietario@test.com',
    password: 'Test1234!',
    role: 'propietario',
    firstName: 'María',
    lastName: 'Propietaria',
  },
  proveedor: {
    email: 'proveedor@test.com',
    password: 'Test1234!',
    role: 'proveedor',
    firstName: 'Carlos',
    lastName: 'Proveedor',
  },
};

/**
 * Realiza login como un tipo de usuario específico
 * 
 * @param page - Página de Playwright
 * @param userType - Tipo de usuario ('presidente', 'propietario', 'proveedor')
 * @returns Promise que resuelve cuando el login está completo
 */
export async function loginAs(page: Page, userType: keyof typeof testUsers): Promise<void> {
  const user = testUsers[userType];
  
  await page.goto('/login');
  
  // Esperar a que el formulario esté visible
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  
  // Llenar formulario
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Esperar a que la navegación ocurra (redirección después de login)
  await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
}

/**
 * Realiza login con credenciales personalizadas
 * 
 * @param page - Página de Playwright
 * @param email - Email del usuario
 * @param password - Contraseña
 * @returns Promise que resuelve cuando el login está completo
 */
export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');
  
  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  await page.click('button[type="submit"]');
  
  await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
}

/**
 * Verifica que el usuario está autenticado
 * 
 * @param page - Página de Playwright
 * @returns Promise que resuelve a true si está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Verificar que no estamos en la página de login
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    return false;
  }
  
  // Verificar que hay elementos que solo aparecen cuando estás autenticado
  // (ajustar según tu aplicación)
  try {
    await page.waitForSelector('[data-testid="user-menu"], [data-testid="sidebar"], nav', {
      timeout: 3000,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Realiza logout
 * 
 * @param page - Página de Playwright
 * @returns Promise que resuelve cuando el logout está completo
 */
export async function logout(page: Page): Promise<void> {
  // Buscar botón de logout (ajustar selector según tu UI)
  const logoutButton = page.locator('button:has-text("Cerrar sesión"), [data-testid="logout"]').first();
  
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/login', {
      timeout: 5000,
    });
  }
}

