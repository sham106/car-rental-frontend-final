import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { api, list, ApiError } from '../src/services/api.ts';
import { bookingService } from '../src/services/bookingService.ts';
const original = globalThis.fetch;
afterEach(() => { globalThis.fetch = original; });

test('API sends cookies and origin-protection headers and surfaces server errors', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/admin/bookings/one/confirm');
    assert.equal(options?.credentials, 'include');
    assert.equal(options?.method, 'POST');
    assert.equal((options?.headers as Record<string,string>)['X-Requested-With'], 'XMLHttpRequest');
    return Response.json({detail:'Vehicle is no longer available.'},{status:409});
  };
  await assert.rejects(api('/admin/bookings/one/confirm',{}), (e:unknown) => e instanceof ApiError && e.status===409 && /no longer available/.test(e.message));
});

test('list reads all server pages instead of silently truncating results', async () => {
  let requests=0;
  globalThis.fetch=async()=>{
    requests++;
    return Response.json({items:requests===1?Array.from({length:500},(_,i)=>({id:i})):[{id:500}],total:501});
  };
  assert.equal((await list('vehicles')).length,501);
  assert.equal(requests,2);
});

test('network failure does not return local demo records or report a successful save', async () => {
  globalThis.fetch=async()=>{throw new TypeError('offline');};
  await assert.rejects(api('/public/vehicles'), /Unable to reach/);
});

test('guest booking retries reuse an idempotency key and receipt lookup needs its token', async () => {
  const keys:string[]=[];
  let calls=0;
  globalThis.fetch=async(url,options)=>{
    calls++;
    const body=JSON.parse(String(options?.body));
    if(String(url).endsWith('/lookup')) {
      assert.equal(body.accessToken,'private-receipt');
      return Response.json({reference:'TEST-RECEIPT',status:'pending'});
    }
    keys.push(body.idempotencyKey);
    if(calls===1) throw new TypeError('network interruption');
    return Response.json({reference:'TEST-RECEIPT',status:'pending',accessToken:'private-receipt'});
  };
  const input={vehicleId:'v',pickupLocationId:'airport',returnLocationId:'airport',pickupDate:'2030-01-01',returnDate:'2030-01-03',customer:{firstName:'A',lastName:'B',phone:'123456789',email:'test@example.com',country:'Mauritius'}};
  await assert.rejects(bookingService.createBookingRequest(input));
  const result=await bookingService.createBookingRequest(input);
  assert.equal(keys[0],keys[1]); assert.ok(keys[0].length>=16);
  assert.equal('accessToken' in result,false);
  assert.equal(await bookingService.getBookingByReference('unknown'),null);
  assert.equal((await bookingService.getBookingByReference('TEST-RECEIPT'))?.status,'pending');
});
