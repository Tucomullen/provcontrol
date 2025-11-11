/**
 * UI Helpers for Tests
 * 
 * Funciones auxiliares para interacciones comunes con la UI.
 * Estas funciones simplifican los tests y los hacen más legibles.
 */

import { Page, Locator } from '@playwright/test';

/**
 * Espera a que un elemento esté visible y habilitado
 * 
 * @param page - Página de Playwright
 * @param selector - Selector CSS o data-testid
 * @param timeout - Timeout en ms (default: 5000)
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<Locator> {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

/**
 * Espera a que un texto aparezca en la página
 * 
 * @param page - Página de Playwright
 * @param text - Texto a buscar
 * @param timeout - Timeout en ms (default: 5000)
 */
export async function waitForText(
  page: Page,
  text: string,
  timeout: number = 5000
): Promise<void> {
  await page.waitForSelector(`text=${text}`, { state: 'visible', timeout });
}

/**
 * Llena un formulario con datos
 * 
 * @param page - Página de Playwright
 * @param fields - Objeto con campos y valores { 'input[name="email"]': 'test@test.com' }
 */
export async function fillForm(
  page: Page,
  fields: Record<string, string>
): Promise<void> {
  for (const [selector, value] of Object.entries(fields)) {
    await page.fill(selector, value);
  }
}

/**
 * Navega a una ruta y espera a que cargue
 * 
 * @param page - Página de Playwright
 * @param path - Ruta a navegar (ej: '/dashboard', '/login')
 * @param waitForSelector - Selector opcional para esperar después de navegar
 */
export async function navigateTo(
  page: Page,
  path: string,
  waitForSelector?: string
): Promise<void> {
  await page.goto(path);
  
  if (waitForSelector) {
    await waitForElement(page, waitForSelector);
  } else {
    // Esperar a que la página cargue (networkidle es más estricto)
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // Si falla, al menos esperar a que el DOM esté listo
      return page.waitForLoadState('domcontentloaded');
    });
  }
}

/**
 * Espera a que un toast/notificación aparezca
 * 
 * @param page - Página de Playwright
 * @param text - Texto del toast a buscar
 * @param timeout - Timeout en ms (default: 5000)
 */
export async function waitForToast(
  page: Page,
  text: string,
  timeout: number = 5000
): Promise<void> {
  // Buscar toast por texto o por clase común de toasts
  await page.waitForSelector(
    `[role="alert"]:has-text("${text}"), .toast:has-text("${text}"), [data-testid="toast"]:has-text("${text}")`,
    { timeout }
  );
}

/**
 * Hace clic en un botón por texto
 * 
 * @param page - Página de Playwright
 * @param text - Texto del botón
 */
export async function clickButtonByText(page: Page, text: string): Promise<void> {
  await page.click(`button:has-text("${text}")`);
}

/**
 * Verifica que una URL contiene un path específico
 * 
 * @param page - Página de Playwright
 * @param path - Path a verificar
 */
export async function expectPath(page: Page, path: string): Promise<void> {
  const url = new URL(page.url());
  if (!url.pathname.includes(path)) {
    throw new Error(`Expected path to contain "${path}", but got "${url.pathname}"`);
  }
}

/**
 * Espera a que un modal/dialog esté visible
 * 
 * @param page - Página de Playwright
 * @param timeout - Timeout en ms (default: 5000)
 */
export async function waitForModal(page: Page, timeout: number = 5000): Promise<Locator> {
  // Buscar modal por roles comunes o clases
  const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]').first();
  await modal.waitFor({ state: 'visible', timeout });
  return modal;
}

/**
 * Cierra un modal/dialog
 * 
 * @param page - Página de Playwright
 */
export async function closeModal(page: Page): Promise<void> {
  // Buscar botón de cerrar (X, Cancelar, Cerrar)
  const closeButton = page
    .locator('button:has-text("Cerrar"), button:has-text("Cancelar"), [aria-label="Close"], button[aria-label*="close" i]')
    .first();
  
  if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeButton.click();
  }
}

