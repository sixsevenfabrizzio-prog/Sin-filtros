import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_SECRET_KEY,
  determineRoleFromPassword,
  canUploadVideo,
  createNewUser,
  authenticateUser,
  isShortVideo,
} from './auth.ts';
import {
  hashPassword,
  checkPasswordUniqueness,
  analyzePasswordSecurity,
} from './security.ts';

test('ADMIN_SECRET_KEY is exact Angelina1726otaku_j77', () => {
  assert.equal(ADMIN_SECRET_KEY, 'Angelina1726otaku_j77');
});

test('Password Angelina1726otaku_j77 grants exclusive admin role', () => {
  const role = determineRoleFromPassword('Angelina1726otaku_j77');
  assert.equal(role, 'admin');
});

test('Any other password only gets viewer role', () => {
  assert.equal(determineRoleFromPassword('123456'), 'viewer');
  assert.equal(determineRoleFromPassword('admin'), 'viewer');
  assert.equal(determineRoleFromPassword('password'), 'viewer');
  assert.equal(determineRoleFromPassword('angelina1726otaku_j77'), 'viewer'); // case sensitive
  assert.equal(determineRoleFromPassword('Angelina1726otaku'), 'viewer');
  assert.equal(determineRoleFromPassword(''), 'viewer');
});

test('canUploadVideo requires admin role', () => {
  assert.equal(canUploadVideo(null), false);
  assert.equal(canUploadVideo(undefined), false);
  assert.equal(
    canUploadVideo({
      id: '1',
      username: 'Juan',
      email: 'juan@test.com',
      role: 'viewer',
      createdAt: '',
    }),
    false
  );
  assert.equal(
    canUploadVideo({
      id: '2',
      username: 'SuperAdmin',
      email: 'admin@test.com',
      role: 'admin',
      createdAt: '',
    }),
    true
  );
});

test('createNewUser with admin password produces admin user with passwordHash', () => {
  const user = createNewUser('Fabrizzio', 'fabri@test.com', 'Angelina1726otaku_j77');
  assert.equal(user.role, 'admin');
  assert.equal(user.username, 'Fabrizzio');
  assert.ok(user.passwordHash);
  assert.equal(user.passwordHash, hashPassword('Angelina1726otaku_j77'));
});

test('createNewUser with standard password produces viewer user', () => {
  const user = createNewUser('Invitado', 'invitado@test.com', 'miClaveNormal123');
  assert.equal(user.role, 'viewer');
  assert.equal(user.username, 'Invitado');
  assert.equal(user.passwordHash, hashPassword('miClaveNormal123'));
});

test('checkPasswordUniqueness prevents two normal users from using the same password', () => {
  const user1 = createNewUser('Usuario1', 'u1@test.com', 'secretoUnico123');
  const user2 = createNewUser('Usuario2', 'u2@test.com', 'otraClaveDistinta456');

  const registered = [user1, user2];

  // Trying to register a new user with user1's password should fail
  const checkDuplicate = checkPasswordUniqueness('secretoUnico123', registered);
  assert.equal(checkDuplicate.isUnique, false);
  assert.equal(checkDuplicate.isAdminKey, false);
  assert.ok(checkDuplicate.message.includes('ALERTA DE SEGURIDAD'));

  // Trying a completely new password should pass
  const checkFresh = checkPasswordUniqueness('nuevaClaveInedita789', registered);
  assert.equal(checkFresh.isUnique, true);
  assert.equal(checkFresh.isAdminKey, false);
});

test('checkPasswordUniqueness ALLOWS multiple admins to use Angelina1726otaku_j77', () => {
  const admin1 = createNewUser('Admin1', 'a1@test.com', 'Angelina1726otaku_j77');
  const admin2 = createNewUser('Admin2', 'a2@test.com', 'Angelina1726otaku_j77');

  const registered = [admin1, admin2];

  // Master key is exempt from uniqueness restrictions so anyone who knows it can be admin
  const checkAdmin = checkPasswordUniqueness('Angelina1726otaku_j77', registered);
  assert.equal(checkAdmin.isUnique, true);
  assert.equal(checkAdmin.isAdminKey, true);
});

test('analyzePasswordSecurity scores admin master key with top rank', () => {
  const score = analyzePasswordSecurity('Angelina1726otaku_j77');
  assert.equal(score.score, 100);
  assert.equal(score.level, 'admin_maestro');
});

test('isShortVideo detects <= 30 seconds as Short', () => {
  assert.equal(isShortVideo(10), true);
  assert.equal(isShortVideo(15), true);
  assert.equal(isShortVideo(30), true);
  assert.equal(isShortVideo(31), false);
  assert.equal(isShortVideo(60), false);
  assert.equal(isShortVideo(734), false);
  assert.equal(isShortVideo(0), false);
});

test('authenticateUser promotes existing viewer if admin password provided', () => {
  const existingViewer = createNewUser('UsuarioRegular', 'user@test.com', '12345');
  assert.equal(existingViewer.role, 'viewer');

  const result = authenticateUser('user@test.com', 'Angelina1726otaku_j77', [existingViewer]);
  assert.equal(result.success, true);
  assert.equal(result.user?.role, 'admin');
});
