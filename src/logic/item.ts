export enum ItemType {
	CONSUMABLE = 'consumable',
	EQUIPABLE = 'equipable',
	QUEST = 'quest',
	MATERIAL = 'material',
	WEAPON = 'weapon',
	ARMOR = 'armor',
}

export enum ItemRarity {
	COMMON = 'common',
	UNCOMMON = 'uncommon',
	RARE = 'rare',
	EPIC = 'epic',
	LEGENDARY = 'legendary',
}

export class Item {
	id: string;
	name: string;
	type: ItemType;
	description: string;
	rarity: ItemRarity;
	quantity: number;
	maxStack: number;

	constructor(
		id: string,
		name: string,
		type: ItemType,
		description: string,
		rarity: ItemRarity = ItemRarity.COMMON,
		quantity: number = 1,
		maxStack: number = 1
	) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.description = description;
		this.rarity = rarity;
		this.quantity = quantity;
		this.maxStack = maxStack;
	}

	updateQuantity(amount: number): void {
		this.quantity += amount;
		if (this.quantity < 0) this.quantity = 0;
		if (this.quantity > this.maxStack) this.quantity = this.maxStack;
	}

	getDetails(): string {
		return `${this.name} (${this.type}): ${this.description} | Rarity: ${this.rarity} | Quantity: ${this.quantity}/${this.maxStack}`;
	}

	canStackWith(otherItem: Item): boolean {
		return (
			this.id === otherItem.id &&
			this.type === otherItem.type &&
			this.quantity < this.maxStack
		);
	}

	use(): void {
		if (this.type === ItemType.CONSUMABLE && this.quantity > 0) {
			console.log(`Using ${this.name}...`);
			this.updateQuantity(-1);
		} else {
			console.log(`Cannot use ${this.name}.`);
		}
	}
}
