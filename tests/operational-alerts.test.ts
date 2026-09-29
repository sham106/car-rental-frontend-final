import assert from 'node:assert/strict';
import { test } from 'node:test';
import { notificationPath, sortAlerts } from '../src/utils/operationalAlerts.ts';
import type { AdminNotification } from '../src/types/admin.ts';

test('unresolved alerts sort by urgency then deadline, regardless of seen state', () => {
  const base = {id:'a',title:'Alert',type:'service_due',description:'',timestamp:'',read:false} as AdminNotification;
  const sorted = sortAlerts([
    {...base,id:'missing',priority:'missing'}, {...base,id:'upcoming',priority:'upcoming',daysRemaining:5},
    {...base,id:'overdue',priority:'overdue',read:true,daysRemaining:-2},
    {...base,id:'older',priority:'overdue',daysRemaining:-5}, {...base,id:'today',priority:'due_today'},
  ]);
  assert.deepEqual(sorted.map(a=>a.id), ['older','overdue','today','upcoming','missing']);
});

test('notification routing preserves car-specific admin links without allowing external URLs', () => {
  const notification = {linkTo:'/admin/fleet?vehicleId=car'} as AdminNotification;
  assert.equal(notificationPath(notification),'/admin/fleet?vehicleId=car');
  assert.equal(notificationPath({...notification,linkTo:'https://other.example'}),'/admin');
  assert.equal(notificationPath({...notification,linkTo:'/admin-elsewhere'}),'/admin');
});
