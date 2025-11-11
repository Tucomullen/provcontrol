/**
 * Data Helpers for Tests
 * 
 * Funciones auxiliares para crear y limpiar datos de prueba.
 * Estas funciones pueden interactuar con la API para setup/teardown de tests.
 */

import { Page, APIRequestContext } from '@playwright/test';

/**
 * Crea un usuario de prueba a través de la API
 * 
 * @param request - APIRequestContext de Playwright
 * @param userData - Datos del usuario a crear
 * @returns Promise con los datos del usuario creado
 */
export async function createTestUser(
  request: APIRequestContext,
  userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'presidente' | 'propietario' | 'proveedor';
  }
): Promise<any> {
  const response = await request.post('/api/auth/register', {
    data: {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName || 'Test',
      lastName: userData.lastName || 'User',
      role: userData.role || 'propietario',
    },
  });

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Failed to create test user: ${error}`);
  }

  return response.json();
}

/**
 * Crea una comunidad de prueba a través de la API
 * 
 * @param request - APIRequestContext de Playwright
 * @param authToken - Token JWT del usuario autenticado
 * @param communityData - Datos de la comunidad
 * @returns Promise con los datos de la comunidad creada
 */
export async function createTestCommunity(
  request: APIRequestContext,
  authToken: string,
  communityData: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    totalUnits: number;
    description?: string;
  }
): Promise<any> {
  const response = await request.post('/api/onboarding/community', {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: communityData,
  });

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Failed to create test community: ${error}`);
  }

  return response.json();
}

/**
 * Crea una invitación de prueba
 * 
 * @param request - APIRequestContext de Playwright
 * @param authToken - Token JWT del presidente
 * @param invitationData - Datos de la invitación
 * @returns Promise con los datos de la invitación creada
 */
export async function createTestInvitation(
  request: APIRequestContext,
  authToken: string,
  invitationData: {
    communityId: string;
    role: 'presidente' | 'propietario' | 'proveedor';
    email?: string;
    propertyUnit?: string;
  }
): Promise<any> {
  const response = await request.post('/api/invitations', {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: invitationData,
  });

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Failed to create test invitation: ${error}`);
  }

  return response.json();
}

/**
 * Genera datos de prueba para una comunidad
 */
export function generateTestCommunityData() {
  const timestamp = Date.now();
  return {
    name: `Comunidad Test ${timestamp}`,
    address: 'Calle Test 123',
    city: 'Madrid',
    postalCode: '28001',
    totalUnits: 50,
    description: 'Comunidad de prueba para tests E2E',
  };
}

/**
 * Genera datos de prueba para un usuario
 */
export function generateTestUserData(role: 'presidente' | 'propietario' | 'proveedor' = 'propietario') {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@test.com`,
    password: 'Test1234!',
    firstName: 'Test',
    lastName: 'User',
    role,
  };
}

