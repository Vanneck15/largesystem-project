import { db } from "./erp-data";
import type { Role } from "./mock-store";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	role: Role;
}

const DEMO_PASSWORD = "demo123";

function fakeToken(userId: string) {
	return `demo.${userId}.${Date.now()}`;
}

function delay<T>(value: T, ms = 450): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
	const user = db.users.getAll().find((u) => u.email.toLowerCase() === email.toLowerCase());

	if (!user) {
		await delay(null, 400);
		throw new Error("Aucun compte ne correspond à cet email.");
	}
	if (password !== DEMO_PASSWORD) {
		await delay(null, 400);
		throw new Error("Mot de passe incorrect. (Indice : demo123)");
	}

	return delay({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: fakeToken(user.id) });
}

export async function register(name: string, email: string, password: string, role: Role): Promise<{ user: AuthUser; token: string }> {
	if (password.length < 6) {
		await delay(null, 300);
		throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
	}
	const existing = db.users.getAll().find((u) => u.email.toLowerCase() === email.toLowerCase());
	if (existing) {
		await delay(null, 300);
		throw new Error("Un compte existe déjà avec cet email.");
	}

	const created = db.users.create({ email, name, role, department: role === "student" ? "Étudiant" : "Non assigné" });
	return delay({ user: { id: created.id, email: created.email, name: created.name, role: created.role }, token: fakeToken(created.id) });
}
