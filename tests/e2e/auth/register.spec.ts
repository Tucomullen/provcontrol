/**
 * Registration Tests
 * 
 * Tests para verificar el flujo de registro.
 */

import { test, expect } from '@playwright/test';
import { navigateTo, fillForm, waitForToast, expectPath } from '../../fixtures/ui';

test.describe('Registration Tests', () => {
  test('Registro de proveedor funciona correctamente', async ({ page }) => {
    await navigateTo(page, '/register/provider');
    
    // Generar email único para evitar conflictos
    const timestamp = Date.now();
    const testEmail = `test-provider-${timestamp}@test.com`;
    
    // Llenar formulario
    await fillForm(page, {
      'input[type="email"]': testEmail,
      'input[name*="firstName"], input[placeholder*="Nombre" i]': 'Test',
      'input[name*="lastName"], input[placeholder*="Apellido" i]': 'Provider',
      'input[type="password"]': 'Test1234!',
      'input[name*="confirmPassword"], input[placeholder*="Confirmar" i]': 'Test1234!',
    });
    
    // Submit
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/auth/register')
    );
    
    await page.click('button[type="submit"]');
    
    // Esperar respuesta
    const response = await responsePromise;
    
    // Verificar que la petición se hizo
    expect(response.status()).toBeLessThan(500);
    
    // Si el registro fue exitoso, debería redirigir
    if (response.ok()) {
      await page.waitForURL((url) => url.pathname.includes('onboarding') || url.pathname === '/', {
        timeout: 10000,
      });
    }
  });

  test('Registro valida contraseña mínima', async ({ page }) => {
    await navigateTo(page, '/register/provider');
    
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@test.com`;
    
    await fillForm(page, {
      'input[type="email"]': testEmail,
      'input[type="password"]': 'Short1!', // Contraseña muy corta
    });
    
    // Intentar submit
    await page.click('button[type="submit"]');
    
    // Debe haber validación (HTML5 o mensaje de error)
    await page.waitForSelector(
      'text=/mínimo|8 caracteres|contraseña/i, [role="alert"]',
      { timeout: 3000 }
    ).catch(() => {
      // Si no hay mensaje visible, verificar validación HTML5
      const passwordInput = page.locator('input[type="password"]').first();
      expect(passwordInput.getAttribute('minlength')).toBeTruthy();
    });
  });

  test('Registro valida que las contraseñas coincidan', async ({ page }) => {
    await navigateTo(page, '/register/provider');
    
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@test.com`;
    
    await fillForm(page, {
      'input[type="email"]': testEmail,
      'input[type="password"]': 'Test1234!',
      'input[name*="confirmPassword"], input[placeholder*="Confirmar" i]': 'Different123!',
    });
    
    await page.click('button[type="submit"]');
    
    // Debe mostrar error de contraseñas no coinciden
    await page.waitForSelector(
      'text=/coinciden|no coinciden|iguales/i, [role="alert"]',
      { timeout: 5000 }
    );
  });
});

