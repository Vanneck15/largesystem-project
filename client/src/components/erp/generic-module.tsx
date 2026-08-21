import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, PackageOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Collection } from "@/lib/mock-store";

export type FieldType = "text" | "number" | "date" | "select" | "textarea";

export interface FieldConfig {
	key: string;
	label: string;
	type: FieldType;
	options?: { label: string; value: string }[];
	required?: boolean;
	placeholder?: string;
}

export interface ColumnConfig<T> {
	key: string;
	label: string;
	render?: (row: T) => React.ReactNode;
	className?: string;
}

export interface ModuleConfig<T extends { id: string }> {
	title: string;
	description: string;
	collection: Collection<T>;
	columns: ColumnConfig<T>[];
	fields: FieldConfig[];
	searchKeys: (keyof T)[];
	statusKey?: keyof T;
	statusVariants?: Record<string, string>;
	emptyLabel?: string;
}

const DEFAULT_STATUS_LABELS: Record<string, string> = {
	active: "Actif",
	inactive: "Inactif",
	terminated: "Fin de contrat",
	pending: "En attente",
	approved: "Approuvé",
	rejected: "Rejeté",
	paid: "Payée",
	overdue: "En retard",
	cancelled: "Annulée",
	present: "Présent",
	absent: "Absent",
	late: "En retard",
	completed: "Terminée",
	paused: "En pause",
	midterm: "Partiel",
	final: "Final",
	quiz: "Quiz",
	card: "Carte bancaire",
	cash: "Espèces",
	bank_transfer: "Virement",
	sick: "Maladie",
	vacation: "Vacances",
	personal: "Personnel",
	maternity: "Maternité/Paternité",
	email: "Email",
	social_media: "Réseaux sociaux",
	print: "Print",
	digital: "Digital",
	office_supplies: "Fournitures de bureau",
	equipment: "Équipement",
	furniture: "Mobilier",
	warehouse: "Entrepôt",
	office: "Bureau",
	lab: "Laboratoire",
	utilities: "Charges",
	supplies: "Fournitures",
	marketing: "Marketing",
};

const DEFAULT_STATUS_COLORS: Record<string, string> = {
	active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
	approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
	paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
	completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
	present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",

	pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
	late: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
	paused: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",

	overdue: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
	rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
	absent: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
	inactive: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
	cancelled: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
	terminated: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function GenericModule<T extends { id: string }>({ config }: { config: ModuleConfig<T> }) {
	const { collection, columns, fields, searchKeys, statusKey, statusVariants } = config;
	const [, forceRender] = useState(0);
	const [search, setSearch] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formState, setFormState] = useState<Record<string, string>>({});
	const { toast } = useToast();

	useEffect(() => {
		return collection.subscribe(() => forceRender((n) => n + 1));
	}, [collection]);

	const rows = collection.getAll();

	const filtered = useMemo(() => {
		if (!search.trim()) return rows;
		const term = search.toLowerCase();
		return rows.filter((row) =>
			searchKeys.some((key) => String((row as any)[key] ?? "").toLowerCase().includes(term))
		);
	}, [rows, search, searchKeys]);

	function openCreate() {
		setEditingId(null);
		const initial: Record<string, string> = {};
		fields.forEach((f) => (initial[f.key] = ""));
		setFormState(initial);
		setDialogOpen(true);
	}

	function openEdit(row: T) {
		setEditingId(row.id);
		const initial: Record<string, string> = {};
		fields.forEach((f) => (initial[f.key] = String((row as any)[f.key] ?? "")));
		setFormState(initial);
		setDialogOpen(true);
	}

	function handleDelete(row: T) {
		if (!confirm(`Supprimer cet élément ?`)) return;
		collection.remove(row.id);
		toast({ title: "Supprimé", description: "L'élément a été supprimé avec succès." });
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const missing = fields.filter((f) => f.required && !formState[f.key]?.trim());
		if (missing.length > 0) {
			toast({
				title: "Champs requis manquants",
				description: `Merci de renseigner : ${missing.map((f) => f.label).join(", ")}`,
				variant: "destructive",
			});
			return;
		}

		const payload: Record<string, any> = { ...formState };
		fields.forEach((f) => {
			if (f.type === "number" && payload[f.key] !== "") {
				payload[f.key] = Number(payload[f.key]);
			}
		});

		if (editingId) {
			collection.update(editingId, payload as Partial<T>);
			toast({ title: "Mis à jour", description: "Les modifications ont été enregistrées." });
		} else {
			collection.create(payload as Omit<T, "id">);
			toast({ title: "Ajouté", description: "Le nouvel élément a été créé avec succès." });
		}
		setDialogOpen(false);
	}

	const variants = statusVariants ?? DEFAULT_STATUS_COLORS;

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-2xl font-bold">{config.title}</h2>
					<p className="text-sm text-muted-foreground">{config.description}</p>
				</div>
				<Button onClick={openCreate} data-testid={`button-add-${config.title}`}>
					<Plus className="w-4 h-4 mr-2" />
					Ajouter
				</Button>
			</div>

			<div className="relative max-w-sm">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<Input
					placeholder="Rechercher…"
					className="pl-9"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<Card>
				<CardContent className="p-0">
					{filtered.length === 0 ? (
						<div className="text-center py-16">
							<PackageOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
							<p className="text-muted-foreground">
								{rows.length === 0 ? (config.emptyLabel ?? "Aucun élément pour le moment.") : "Aucun résultat pour cette recherche."}
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									{columns.map((col) => (
										<TableHead key={col.key}>{col.label}</TableHead>
									))}
									<TableHead className="w-24 text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.map((row) => (
									<TableRow key={row.id} data-testid={`row-${row.id}`}>
										{columns.map((col) => {
											const raw = (row as any)[col.key];
											if (col.render) {
												return <TableCell key={col.key} className={col.className}>{col.render(row)}</TableCell>;
											}
											if (statusKey && col.key === statusKey) {
												return (
													<TableCell key={col.key}>
														<Badge className={variants[raw] ?? ""} variant="secondary">
															{DEFAULT_STATUS_LABELS[raw] ?? String(raw)}
														</Badge>
													</TableCell>
												);
											}
											const display = typeof raw === "string" && DEFAULT_STATUS_LABELS[raw] ? DEFAULT_STATUS_LABELS[raw] : raw;
											return <TableCell key={col.key} className={col.className}>{display ?? "—"}</TableCell>;
										})}
										<TableCell className="text-right">
											<div className="flex justify-end gap-1">
												<Button variant="ghost" size="icon" onClick={() => openEdit(row)} data-testid={`button-edit-${row.id}`}>
													<Pencil className="w-4 h-4" />
												</Button>
												<Button variant="ghost" size="icon" onClick={() => handleDelete(row)} data-testid={`button-delete-${row.id}`}>
													<Trash2 className="w-4 h-4 text-red-500" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{editingId ? "Modifier" : "Ajouter"} — {config.title}</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						{fields.map((field) => (
							<div key={field.key} className="space-y-2">
								<Label htmlFor={field.key}>
									{field.label}
									{field.required && <span className="text-red-500"> *</span>}
								</Label>
								{field.type === "select" ? (
									<Select
										value={formState[field.key] ?? ""}
										onValueChange={(v) => setFormState((s) => ({ ...s, [field.key]: v }))}
									>
										<SelectTrigger id={field.key}>
											<SelectValue placeholder={field.placeholder ?? "Choisir…"} />
										</SelectTrigger>
										<SelectContent>
											{field.options?.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : field.type === "textarea" ? (
									<Textarea
										id={field.key}
										value={formState[field.key] ?? ""}
										onChange={(e) => setFormState((s) => ({ ...s, [field.key]: e.target.value }))}
										placeholder={field.placeholder}
									/>
								) : (
									<Input
										id={field.key}
										type={field.type}
										value={formState[field.key] ?? ""}
										onChange={(e) => setFormState((s) => ({ ...s, [field.key]: e.target.value }))}
										placeholder={field.placeholder}
									/>
								)}
							</div>
						))}
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
								Annuler
							</Button>
							<Button type="submit">{editingId ? "Enregistrer" : "Ajouter"}</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
