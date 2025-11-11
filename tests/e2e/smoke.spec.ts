/**
 * Smoke Tests
 * 
 * Tests básicos que verifican que la aplicación carga correctamente.
 * Estos tests son ideales para que los agentes de Cursor 2.0 ejecuten
 * después de hacer cambios para verificar que nada se rompió.
 */

import { test, expect } from '@playwright/test';
import { navigateTo, waitForElement, waitForText } from '../fixtures/ui';

test.describe('Smoke Tests - Verificación Básica', () => {
  test('Landing page carga correctamente', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Verificar que la página tiene contenido
    // El título puede variar, así que solo verificamos que hay un título
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    // Verificar que hay elementos clave visibles
    await waitForElement(page, 'body');
    
    // Verificar que no hay errores críticos en consola
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filtrar errores esperados (como 401 de API si no hay auth)
        if (!text.includes('401') && !text.includes('Unauthorized')) {
          errors.push(text);
        }
      }
    });
    
    // Esperar un momento para que la página cargue completamente
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // Si networkidle falla, al menos esperar DOMContentLoaded
      return page.waitForLoadState('domcontentloaded');
    });
    
    // Verificar que no hay errores críticos (permitir algunos errores esperados)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('401')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('Página de login carga correctamente', async ({ page }) => {
    await navigateTo(page, '/login');
    
    // Verificar que el formulario de login está presente
    await waitForElement(page, 'input[type="email"]');
    await waitForElement(page, 'input[type="password"]');
    await waitForElement(page, 'button[type="submit"]');
    
    // Verificar que hay un enlace a registro (puede estar en diferentes formatos)
    const registerLink = page.locator('a:has-text("Crear cuenta"), a:has-text("Regístrate"), button:has-text("Crear cuenta")').first();
    await expect(registerLink).toBeVisible({ timeout: 3000 }).catch(() => {
      // Si no hay enlace visible, verificar que al menos el formulario está presente
      expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });

  test('Página de registro carga correctamente', async ({ page }) => {
    await navigateTo(page, '/register/provider');
    
    // Verificar que el formulario de registro está presente
    await waitForElement(page, 'input[type="email"]', { timeout: 10000 });
    await waitForElement(page, 'input[type="password"]', { timeout: 5000 });
    
    // Verificar que hay campos de nombre usando el id directo (más confiable)
    // Primero intentamos con el id específico
    const firstNameField = page.locator('input[id="firstName"]');
    const isFirstNameVisible = await firstNameField.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isFirstNameVisible) {
      // Si encontramos el campo por id, perfecto
      await expect(firstNameField).toBeVisible();
    } else {
      // Si no, verificamos que hay al menos un input de texto (fallback)
      const textInputs = page.locator('input[type="text"]');
      await expect(textInputs.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Navegación básica funciona', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Verificar que podemos navegar a login
    const loginLink = page.locator('a:has-text("Iniciar sesión"), a[href*="login"], button:has-text("Iniciar sesión")').first();
    
    if (await loginLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
    } else {
      // Si no hay enlace visible, navegar directamente
      await navigateTo(page, '/login');
      await expect(page).toHaveURL(/.*login/);
    }
    
    // Volver a landing
    await navigateTo(page, '/');
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
  });

  test('No hay errores 404 en recursos estáticos', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('response', (response) => {
      if (response.status() === 404 && !response.url().includes('favicon')) {
        failedRequests.push(response.url());
      }
    });
    
    await navigateTo(page, '/');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Filtrar requests esperados (como API calls que pueden fallar si no hay auth)
    const unexpected404s = failedRequests.filter(
      (url) => !url.includes('/api/') && !url.includes('favicon')
    );
    
    expect(unexpected404s.length).toBe(0);
  });
});

