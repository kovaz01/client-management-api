import { fetchClientDataFromExternalAPI } from '../clientService';

describe('fetchClientDataFromExternalAPI (production)', () => {
  const validPhone = '0548307769'; // Use a real phone number that is known to work in production
  const invalidPhone = '1234567890';

  it('should fetch client data for a valid phone number', async () => {
    const result = await fetchClientDataFromExternalAPI(validPhone);

    expect(result).toBeDefined();
    expect(result.bid).toBeGreaterThanOrEqual(0);
    expect(result.uid).toBeGreaterThanOrEqual(0);
    expect(result.mtcGroupID).toBeGreaterThan(0);
    expect(result.compId).toBeTruthy();
    expect(result.userName).toBeTruthy();
    expect(result.password).toBeTruthy();
    expect(result.appGuid).toBeTruthy();

    console.log('✅ Real client data:', result);
  }, 10000); // Allow up to 10 seconds for real API


});
