// Couche de données côté client : persiste chaque collection dans localStorage.
// Remplace le backend Express/PostgreSQL pour permettre un déploiement 100%
// statique (GitHub Pages) tout en gardant une vraie expérience CRUD.

export type Role = "admin" | "staff" | "student";

function uid() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readCollection<T>(key: string, seed: T[]): T[] {
	try {
		const raw = localStorage.getItem(key);
		if (raw) return JSON.parse(raw);
		localStorage.setItem(key, JSON.stringify(seed));
		return seed;
	} catch {
		return seed;
	}
}

function writeCollection<T>(key: string, items: T[]) {
	try {
		localStorage.setItem(key, JSON.stringify(items));
	} catch {
		// stockage indisponible (navigation privée…) — l'app reste utilisable en mémoire pour la session
	}
}

export class Collection<T extends { id: string }> {
	private key: string;
	private items: T[];
	private listeners = new Set<() => void>();

	constructor(key: string, seed: T[]) {
		this.key = `erp.${key}`;
		this.items = readCollection(this.key, seed);
	}

	getAll(): T[] {
		return this.items;
	}

	get(id: string): T | undefined {
		return this.items.find((i) => i.id === id);
	}

	create(data: Omit<T, "id">): T {
		const item = { ...data, id: uid() } as T;
		this.items = [item, ...this.items];
		this.persist();
		return item;
	}

	update(id: string, data: Partial<T>): T | undefined {
		let updated: T | undefined;
		this.items = this.items.map((i) => {
			if (i.id === id) {
				updated = { ...i, ...data };
				return updated;
			}
			return i;
		});
		this.persist();
		return updated;
	}

	remove(id: string) {
		this.items = this.items.filter((i) => i.id !== id);
		this.persist();
	}

	subscribe(fn: () => void) {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}

	private persist() {
		writeCollection(this.key, this.items);
		this.listeners.forEach((fn) => fn());
	}
}
