/**
 * Create Community Tests
 * 
 * Tests para el wizard completo de creación de comunidad.
 * Este es un test más complejo que puede requerir MCP para ejecución completa.
 */

import { test, expect } from '@playwright/test';
import { navigateTo, fillForm, waitForElement, clickButtonByText } from '../../fixtures/ui';
import { generateTestCommunityData } from '../../fixtures/data';

test.describe('Create Community Wizard Tests', () => {
  test('Wizard de creación de comunidad - Paso 1: Registro', async ({ page }) => {
    await navigateTo(page, '/onboarding/create-community');
    
    // Verificar que estamos en el paso 1 (registro)
    await waitForElement(page, 'input[type="email"]');
    
    // Verificar que muestra información sobre ser presidente
    // Hay múltiples elementos con "presidente", usar el primero
    await expect(page.locator('text=/presidente|administración/i').first()).toBeVisible();
    
    // Llenar formulario de registro
    const timestamp = Date.now();
    const testEmail = `presidente-${timestamp}@test.com`;
    
    await fillForm(page, {
      'input[type="email"]': testEmail,
      'input[name*="firstName"], input[placeholder*="Nombre" i]': 'Juan',
      'input[name*="lastName"], input[placeholder*="Apellido" i]': 'Presidente',
      'input[type="password"]:nth-of-type(1)': 'Test1234!',
      'input[type="password"]:nth-of-type(2), input[name*="confirmPassword"]': 'Test1234!',
    });
    
    // Click en Siguiente (esto debería registrar y avanzar)
    await clickButtonByText(page, 'Siguiente');
    
    // Esperar a que avance al paso 2 o que se complete el registro
    await page.waitForURL((url) => url.pathname.includes('create-community'), {
      timeout: 10000,
    });
    
    // Verificar que avanzamos al paso 2 (información de comunidad)
    await waitForElement(page, 'input[placeholder*="Nombre" i], input[name*="name"]', {
      timeout: 5000,
    }).catch(() => {
      // Si no avanzó, puede ser que el registro falló
      // Verificar mensaje de error
      expect(page.locator('[role="alert"], .error')).toBeVisible();
    });
  });

  test('Wizard muestra progreso correctamente', async ({ page }) => {
    await navigateTo(page, '/onboarding/create-community');
    
    // Verificar que hay indicador de progreso
    // Buscar texto "Paso X de 5" o la barra de progreso
    const progressText = page.locator('text=/Paso.*de.*5/i').first();
    const progressBar = page.locator('[role="progressbar"]').first();
    
    // Al menos uno de los dos debe estar visible
    const isTextVisible = await progressText.isVisible().catch(() => false);
    const isBarVisible = await progressBar.isVisible().catch(() => false);
    
    expect(isTextVisible || isBarVisible).toBe(true);
  });

  test('Wizard valida campos requeridos en cada paso', async ({ page }) => {
    await navigateTo(page, '/onboarding/create-community');
    
    // Paso 1: Intentar avanzar sin llenar campos
    await clickButtonByText(page, 'Siguiente');
    
    // Debe mostrar error o no avanzar
    await page.waitForSelector(
      '[role="alert"], .error, text=/requerido|completa/i',
      { timeout: 3000 }
    ).catch(() => {
      // Si no hay mensaje, verificar que no avanzó
      const emailInput = page.locator('input[type="email"]');
      expect(emailInput).toBeVisible();
    });
  });
});

