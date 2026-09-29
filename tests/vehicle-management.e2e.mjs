import { chromium } from '../.review-tools/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://localhost:3002';
const today=new Date().toLocaleDateString('en-CA',{timeZone:'Indian/Mauritius'});
const day=n=>new Date(new Date(today+'T00:00:00Z').getTime()+n*86400000).toISOString().slice(0,10);
const data=async()=>(await context.request.get(base+'/api/admin/data')).json();
const reg='FLOW '+Date.now();
try {
 await page.goto(base+'/admin/fleet');
 await page.getByLabel('Work email').fill('admin@example.com');await page.getByLabel('Password',{exact:true}).fill('a-good-test-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.getByRole('button',{name:/Add.*Vehicle|Add.*Car|New Vehicle/i}).first().click();
 for(const [placeholder,value] of [['e.g. Toyota','Toyota'],['e.g. Corolla Cross','Workflow Yaris'],['e.g. 2841 JL 23',reg],['17-character VIN','JTDBR32E720123456']]) await page.getByPlaceholder(placeholder,{exact:true}).fill(value);
 for(const [label,value] of [['Color','Silver'],['Engine number','ENGINE-123'],['Purchase date',day(-365)],['Purchase value (Rs)','750000']]) await page.getByLabel(label,{exact:true}).fill(value);
 await page.locator('label').filter({hasText:'Current Odometer Mileage'}).locator('..').locator('input').fill('1000');
 await page.getByRole('button',{name:'Add owner without leaving this form'}).click();
 const owner=page.getByRole('dialog',{name:'Add owner'});await owner.getByLabel('Owner name',{exact:true}).fill('Workflow Owner '+reg);await owner.getByRole('button',{name:'Save',exact:true}).click();await owner.waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Save & Continue to Vehicle Profile'}).click();
 await page.getByRole('region',{name:'Vehicle setup checklist'}).waitFor();
 let state=await data();const vehicle=state.vehicles.find(v=>v.registrationNumber===reg);
 assert.ok(vehicle);assert.equal(vehicle.published,false);assert.equal(vehicle.purchaseValue,750000);assert.equal(vehicle.engineNumber,'ENGINE-123');assert.ok(vehicle.ownerName.includes('Workflow Owner'));
 console.log('PASS registration, inline owner, purchase details and hidden listing');
 for(const type of ['Fitness Certificate','Insurance','MVL','Licence']) {
  await page.getByRole('button',{name:'360° Overview',exact:true}).click();
  const card=page.getByRole('region',{name:'Vehicle setup checklist'}).getByRole('heading',{name:type,exact:true}).locator('..');await card.getByRole('button',{name:'Add certificate'}).click();
  await page.getByLabel('Issue date',{exact:true}).fill(today);await page.getByLabel('Expiry date',{exact:true}).fill(day(365));
  if(type==='Insurance') for(const [label,value] of [['Insurance Company','Workflow Insurance'],['Policy Number','POL-FLOW'],['Broker (optional)','Workflow Broker'],['Insurance Premium (Rs)','12500']]) await page.getByLabel(label,{exact:true}).fill(value);
  await page.getByLabel('Document file').setInputFiles({name:'certificate.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n%%EOF')});await page.getByRole('button',{name:'Upload Document',exact:true}).click();await page.getByRole('heading',{name:'Upload Fleet Document'}).waitFor({state:'hidden'});
 }
 state=await data();const certs=state.compliance.filter(c=>c.vehicleId===vehicle.id);assert.equal(certs.length,4);assert.equal(state.documents.filter(d=>d.vehicleId===vehicle.id).length,4);const policy=certs.find(c=>c.complianceType==='Insurance');assert.equal(policy.company,'Workflow Insurance');assert.equal(policy.broker,'Workflow Broker');assert.equal(policy.premium,12500);assert.equal((await context.request.get(base+policy.documentUrl)).status(),200);
 console.log('PASS all four certificates, insurance details and private file viewing');
 await page.getByRole('button',{name:'Record Service',exact:true}).click();
 for(const [label,value] of [['Service date',day(-30)],['Service mileage (km)','800'],['Garage / Workshop','Workflow Garage'],['Maintenance details','Oil and filter change; brakes inspected.'],['Mileage next service (km)','10800']]) await page.getByLabel(label,{exact:true}).fill(value);
 await page.getByRole('button',{name:/Save Maintenance|Record Maintenance|Save Service|Record Service/}).last().click();await page.getByRole('heading',{name:'Record Fleet Maintenance'}).waitFor({state:'hidden'});
 state=await data();assert.equal(state.vehicles.find(v=>v.id===vehicle.id).mileage,1000);assert.equal(state.vehicles.find(v=>v.id===vehicle.id).nextServiceMileage,10800);console.log('PASS historical service updates schedule without reducing current odometer');
 await page.getByRole('button',{name:'Assign Vehicle',exact:true}).click();await page.getByLabel('Assigned to',{exact:true}).fill('Workflow Custodian');await page.getByLabel('Assignment reason',{exact:true}).fill('Fleet inspection');await page.getByRole('button',{name:'Confirm Assignment',exact:true}).click();await page.getByRole('heading',{name:'Assign Fleet Vehicle'}).waitFor({state:'hidden'});
 state=await data();const assignment=state.assignments.find(a=>a.vehicleId===vehicle.id);assert.equal(assignment.assignedTo,'Workflow Custodian');assert.equal(assignment.mileageOut,1000);console.log('PASS assignment uses the selected car and current mileage');
 await page.goto(base+'/admin/compliance');const row=page.locator('tr').filter({hasText:reg}).filter({hasText:'POL-FLOW'});await row.getByRole('button',{name:'Renew / File'}).click();await page.getByRole('heading',{name:'Renew Certification'}).waitFor();assert.equal(await page.getByLabel('Insurance Company',{exact:true}).inputValue(),'Workflow Insurance');assert.equal(await page.getByLabel('Broker (optional)',{exact:true}).inputValue(),'Workflow Broker');assert.equal(await page.getByLabel('Expiry date',{exact:true}).inputValue(),'');console.log('PASS renewal retains vehicle and policy context and requires new dates');
 await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.goto(base+'/admin/fleet');await page.locator('tr').filter({hasText:reg}).getByText('Toyota Workflow Yaris',{exact:true}).click();await page.getByRole('region',{name:'Vehicle setup checklist'}).waitFor();await page.setViewportSize({width:390,height:844});await page.screenshot({path:'.review-tools/vehicle-workflow-mobile.png',fullPage:true});assert.equal(errors.length,0,errors.join('\n'));console.log('PASS no runtime errors; mobile screenshot saved');
 await page.getByRole('link',{name:'Manage assignments / returns'}).click();
 await page.waitForURL('**/admin/assignments?q=*');
 assert.equal(await page.getByPlaceholder(/Search custodian|Search assignee|Search assignments|Search name/i).inputValue(),reg);
 console.log('PASS profile opens assignments with this car prefiltered');
} catch(error) {await page.screenshot({path:'.review-tools/vehicle-workflow-failure.png',fullPage:true});throw error;}
finally {await browser.close();}
