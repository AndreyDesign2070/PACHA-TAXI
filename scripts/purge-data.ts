import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const b64Key = 'QUl6YVN5QmM4VUJCb0Z5S0E1SDlCMXhOeVpLU0QydHRyb1poUnM=';
const apiKey = Buffer.from(b64Key, 'base64').toString('utf-8');

const firebaseConfig = {
  projectId: config.projectId,
  appId: config.appId,
  apiKey: apiKey,
  authDomain: config.authDomain,
  firestoreDatabaseId: config.firestoreDatabaseId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  oAuthClientId: config.oAuthClientId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, config.firestoreDatabaseId);

async function purge() {
  console.log('--- PURGING FIRESTORE DATA TO ZERO ---');

  // 1. Purge Bookings
  const bkSnap = await getDocs(collection(db, 'bookings'));
  console.log(`Found ${bkSnap.size} bookings in Firestore.`);
  for (const d of bkSnap.docs) {
    await deleteDoc(d.ref);
    console.log(`Deleted booking: ${d.id}`);
  }

  // 2. Purge Shipments
  const shSnap = await getDocs(collection(db, 'shipments'));
  console.log(`Found ${shSnap.size} shipments in Firestore.`);
  for (const d of shSnap.docs) {
    await deleteDoc(d.ref);
    console.log(`Deleted shipment: ${d.id}`);
  }

  // 3. Purge Notifications
  const notifSnap = await getDocs(collection(db, 'notifications'));
  console.log(`Found ${notifSnap.size} notifications in Firestore.`);
  for (const d of notifSnap.docs) {
    await deleteDoc(d.ref);
    console.log(`Deleted notification: ${d.id}`);
  }

  // 4. Purge Vehicles
  const vehSnap = await getDocs(collection(db, 'vehicles'));
  console.log(`Found ${vehSnap.size} vehicles in Firestore.`);
  for (const d of vehSnap.docs) {
    await deleteDoc(d.ref);
    console.log(`Deleted vehicle: ${d.id}`);
  }

  // 5. Purge Users except SUPER_ADMIN
  const usrSnap = await getDocs(collection(db, 'users'));
  console.log(`Found ${usrSnap.size} users in Firestore.`);
  for (const d of usrSnap.docs) {
    const data = d.data();
    if (data.username === '1310857063' || data.cedula === '1310857063' || data.role === 'SUPER_ADMIN' || d.id === 'usr-superadmin') {
      console.log(`Keeping SuperAdmin user doc: ${d.id}`);
    } else {
      await deleteDoc(d.ref);
      console.log(`Deleted user: ${d.id} (${data.fullName || data.username})`);
    }
  }

  // 6. Ensure Super Admin is correctly registered in Firestore
  const superAdminDoc = {
    id: 'usr-superadmin',
    username: '1310857063',
    fullName: 'Ing. Administrador Central (SUPER ADMIN)',
    cedula: '1310857063',
    phone: '0999999999',
    role: 'SUPER_ADMIN',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'users', 'usr-superadmin'), superAdminDoc, { merge: true });
  console.log('Super Admin user verified in Firestore.');

  console.log('--- PURGE COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

purge().catch((err) => {
  console.error('Error during purge:', err);
  process.exit(1);
});
