import type { User } from 'models/models';

const FIRST_NAMES = [
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Casey',
  'Riley',
  'Jamie',
  'Avery',
  'Quinn',
  'Skyler',
];

const LAST_NAMES = [
  'Rivera',
  'Chen',
  'Patel',
  'Kowalski',
  'Silva',
  'Nguyen',
  'Okafor',
  'Novak',
  'Haddad',
  'Larsen',
];

const randomId = (): string => `local-user-${Math.random().toString(36).slice(2, 10)}`;

const randomFrom = (list: string[]): string => list[Math.floor(Math.random() * list.length)];

export function generateRandomUser(): User {
  return {
    ID: randomId(),
    Name: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
  };
}
