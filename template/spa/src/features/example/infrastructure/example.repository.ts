import type { Example } from "../domain/example.schema";
import type { IExampleRepository } from "../domain/IExampleRepository";

/**
 * An in-memory repository.
 *
 * This is the seam, not a shortcut. `localStorage` means the template runs with no
 * backend, so `npm run dev` works on the first minute — and because the use case
 * depends on the interface rather than on this class, swapping it for a real HTTP
 * client touches one file and nothing else.
 *
 * It is also the reason the E2E suite can run at all: no server, no fixtures, no
 * database to reset between tests.
 */
const STORAGE_KEY = "sdd.examples";

export function createMemoryExampleRepository(
  storage: Storage = globalThis.localStorage,
): IExampleRepository {
  const read = (): Example[] => {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Example[]) : [];
    } catch {
      // Corrupt storage must not take the app down. An empty list is a recoverable
      // state; a thrown parse error during render is not.
      return [];
    }
  };

  const write = (examples: Example[]): void => {
    storage.setItem(STORAGE_KEY, JSON.stringify(examples));
  };

  return {
    async list() {
      return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async save(example) {
      write([...read(), example]);
      return example;
    },
  };
}
