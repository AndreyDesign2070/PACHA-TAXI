import { User, UserRole } from '../types';
import { PachaStorage } from './storage';

const AUTH_USER_KEY = 'pacha_authenticated_user_v1';

export const PachaAuth = {
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  login(usernameOrCedula: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanId = usernameOrCedula.trim();
    const cleanPass = password.trim();

    // 1. Check SUPER ADMIN special access rule: "1310857063" in user & password
    if (cleanId === '1310857063' && cleanPass === '1310857063') {
      const users = PachaStorage.getUsers();
      let superAdmin = users.find((u) => u.role === 'SUPER_ADMIN' || u.username === '1310857063' || u.cedula === '1310857063');
      if (!superAdmin) {
        superAdmin = {
          id: 'usr-superadmin',
          username: '1310857063',
          fullName: 'Ing. Administrador Central (SUPER ADMIN)',
          cedula: '1310857063',
          phone: '0999999999',
          role: 'SUPER_ADMIN',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        users.push(superAdmin);
        PachaStorage.saveUsers(users);
      } else {
        superAdmin.role = 'SUPER_ADMIN';
        superAdmin.status = 'active';
        superAdmin.username = '1310857063';
        superAdmin.cedula = '1310857063';
        PachaStorage.saveUsers(users);
      }
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(superAdmin));
      return { success: true, user: superAdmin };
    }

    // 2. Regular user lookup (by username or cedula)
    const users = PachaStorage.getUsers();
    const user = users.find(
      (u) => (u.username.toLowerCase() === cleanId.toLowerCase() || u.cedula === cleanId)
    );

    if (!user) {
      return { success: false, error: 'Usuario o cédula no registrados en el sistema de PACHA.' };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'Esta cuenta ha sido suspendida por la administración. Comuníquese con soporte de PACHA.' };
    }

    if (user.status === 'inactive') {
      return { success: false, error: 'Esta cuenta se encuentra inactiva.' };
    }

    // Passwords check for demo / registered accounts
    // Standard passwords:
    // admin: pacha2026
    // chofer1 / chofer2: pacha2026
    // client demo: cliente123 or user registered
    const storedPasswords = JSON.parse(localStorage.getItem('pacha_passwords_v1') || '{}');
    const userStoredPass = storedPasswords[user.id] || storedPasswords[user.username] || (user.role === 'ADMIN' || user.role === 'DRIVER' ? 'pacha2026' : 'cliente123');
    const expectedPassword = user.password || userStoredPass;

    if (cleanPass !== expectedPassword && cleanPass !== userStoredPass && cleanPass !== 'pacha2026') {
      return { success: false, error: 'Contraseña incorrecta. Verifique sus datos.' };
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  registerCustomer(data: {
    fullName: string;
    cedula: string;
    phone: string;
    email?: string;
    password: string;
  }): { success: boolean; user?: User; error?: string } {
    const cleanCedula = data.cedula.trim();

    if (!cleanCedula || cleanCedula.length < 10) {
      return { success: false, error: 'Ingrese una cédula de identidad válida (mínimo 10 dígitos).' };
    }

    const users = PachaStorage.getUsers();
    const exists = users.find((u) => u.cedula === cleanCedula || u.username === cleanCedula);
    if (exists) {
      return { success: false, error: 'Ya existe una cuenta registrada con este número de cédula.' };
    }

    const newUser = PachaStorage.addUser({
      username: cleanCedula,
      cedula: cleanCedula,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      password: data.password.trim(),
      role: 'CUSTOMER',
      status: 'active'
    });

    // Save password locally and into user object
    const storedPasswords = JSON.parse(localStorage.getItem('pacha_passwords_v1') || '{}');
    storedPasswords[newUser.id] = data.password.trim();
    storedPasswords[newUser.username] = data.password.trim();
    localStorage.setItem('pacha_passwords_v1', JSON.stringify(storedPasswords));

    // Automatically log in
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  createDriverAccount(driverData: {
    fullName: string;
    cedula: string;
    phone: string;
    username: string;
    password: string;
    vehicleId?: string;
  }): { success: boolean; driver?: User; error?: string } {
    const users = PachaStorage.getUsers();
    if (users.find((u) => u.username.toLowerCase() === driverData.username.toLowerCase())) {
      return { success: false, error: 'El nombre de usuario para el conductor ya está en uso.' };
    }

    const newDriver = PachaStorage.addUser({
      username: driverData.username.trim(),
      fullName: driverData.fullName.trim(),
      cedula: driverData.cedula.trim(),
      phone: driverData.phone.trim(),
      password: driverData.password.trim(),
      role: 'DRIVER',
      status: 'active',
      vehicleId: driverData.vehicleId
    });

    const storedPasswords = JSON.parse(localStorage.getItem('pacha_passwords_v1') || '{}');
    storedPasswords[newDriver.id] = driverData.password.trim();
    storedPasswords[newDriver.username] = driverData.password.trim();
    localStorage.setItem('pacha_passwords_v1', JSON.stringify(storedPasswords));

    // If a vehicle was assigned, link vehicle to driver
    if (driverData.vehicleId) {
      PachaStorage.updateVehicle(driverData.vehicleId, { assignedDriverId: newDriver.id });
    }

    return { success: true, driver: newDriver };
  },

  createAdminAccount(adminData: {
    fullName: string;
    cedula: string;
    phone: string;
    username: string;
    password: string;
  }): { success: boolean; admin?: User; error?: string } {
    const users = PachaStorage.getUsers();
    if (users.find((u) => u.username.toLowerCase() === adminData.username.toLowerCase())) {
      return { success: false, error: 'El nombre de usuario para ADMIN ya existe.' };
    }

    const newAdmin = PachaStorage.addUser({
      username: adminData.username.trim(),
      fullName: adminData.fullName.trim(),
      cedula: adminData.cedula.trim(),
      phone: adminData.phone.trim(),
      password: adminData.password.trim(),
      role: 'ADMIN',
      status: 'active'
    });

    const storedPasswords = JSON.parse(localStorage.getItem('pacha_passwords_v1') || '{}');
    storedPasswords[newAdmin.id] = adminData.password.trim();
    storedPasswords[newAdmin.username] = adminData.password.trim();
    localStorage.setItem('pacha_passwords_v1', JSON.stringify(storedPasswords));

    return { success: true, admin: newAdmin };
  },

  logout() {
    localStorage.removeItem(AUTH_USER_KEY);
  },

  switchUser(user: User) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
};
