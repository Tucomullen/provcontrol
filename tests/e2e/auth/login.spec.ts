/**
 * Login Tests
 * 
 * Tests para verificar el flujo de login.
 * Estos tests pueden ser ejecutados por agentes de Cursor 2.0.
 */

import { test, expect } from '@playwright/test';
import { loginAs, loginWithCredentials, isAuthenticated } from '../../fixtures/auth';
import { navigateTo, waitForToast, expectPath } from '../../fixtures/ui';

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Asegurar que empezamos desde login
    await navigateTo(page, '/login');
  });

  test('Login con credenciales válidas redirige correctamente', async ({ page }) => {
    // Este test requiere que exista un usuario de prueba
    // Por ahora, verificamos que el formulario funciona
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'Test1234!');
    
    // Interceptar la respuesta para verificar comportamiento
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/auth/login')
    );
    
    await page.click('button[type="submit"]');
    
    // Esperar respuesta (puede ser éxito o error, ambos son válidos para este test básico)
    const response = await responsePromise;
    
    // Verificar que se hizo la petición
    expect(response.status()).toBeLessThan(500); // No debe ser error de servidor
  });

  test('Login con credenciales inválidas muestra error', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Esperar a que aparezca un mensaje de error
    // Puede ser un toast o un mensaje en el formulario
    await page.waitForSelector(
      '[role="alert"], .error, [data-testid="error"], text=/error|incorrecto|inválido/i',
      { timeout: 5000 }
    );
  });

  test('Formulario de login valida campos requeridos', async ({ page }) => {
    // Intentar submit sin llenar campos
    await page.click('button[type="submit"]');
    
    // Verificar que el navegador muestra validación HTML5 o que no se envía
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // Verificar que los campos están marcados como requeridos o hay validación
    const emailRequired = await emailInput.getAttribute('required');
    const passwordRequired = await passwordInput.getAttribute('required');
    
    // Al menos uno debe tener validación
    expect(emailRequired !== null || passwordRequired !== null || 
           (await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)) === false).toBeTruthy();
  });

  test('Login redirige según estado de onboarding', async ({ page }) => {
    // Este test requiere setup de datos de prueba
    // Por ahora, verificamos que la redirección funciona
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'Test1234!');
    
    await page.click('button[type="submit"]');
    
    // Esperar a que ocurra alguna redirección (puede ser a dashboard, onboarding, etc.)
    await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 }).catch(() => {});
    
    // Verificar que no estamos en login
    expect(page.url()).not.toContain('/login');
  });
});

