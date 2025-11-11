/**
 * Register Provider Tests
 * 
 * Tests para el flujo de registro de proveedor y creación de perfil.
 */

import { test, expect } from '@playwright/test';
import { navigateTo, fillForm, waitForElement, clickButtonByText } from '../../fixtures/ui';

test.describe('Register Provider Tests', () => {
  test('Registro de proveedor redirige a creación de perfil', async ({ page }) => {
    await navigateTo(page, '/register/provider');
    
    const timestamp = Date.now();
    const testEmail = `provider-${timestamp}@test.com`;
    
    // Llenar formulario de registro
    await fillForm(page, {
      'input[type="email"]': testEmail,
      'input[name*="firstName"], input[placeholder*="Nombre" i]': 'Carlos',
      'input[name*="lastName"], input[placeholder*="Apellido" i]': 'Proveedor',
      'input[type="password"]': 'Test1234!',
      'input[name*="confirmPassword"], input[placeholder*="Confirmar" i]': 'Test1234!',
    });
    
    // Submit
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/auth/register')
    );
    
    await page.click('button[type="submit"]');
    
    const response = await responsePromise;
    
    if (response.ok()) {
      // Debe redirigir a creación de perfil
      await page.waitForURL((url) => url.pathname.includes('create-provider-profile'), {
        timeout: 10000,
      });
      
      // Verificar que el formulario de perfil está presente
      await waitForElement(page, 'input[placeholder*="Empresa" i], input[name*="companyName"]', {
        timeout: 5000,
      });
    }
  });

  test('Formulario de perfil de proveedor carga correctamente', async ({ page }) => {
    // Este test asume que ya estamos autenticados como proveedor
    // En un test completo, primero haríamos login/registro
    await navigateTo(page, '/onboarding/create-provider-profile');
    
    // Verificar que el formulario está presente
    await waitForElement(page, 'input[placeholder*="Empresa" i], input[name*="companyName"]');
    await waitForElement(page, 'select, [role="combobox"]'); // Selector de categoría
  });
});

