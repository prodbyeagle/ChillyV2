import { ItemRarity, Item, ItemType } from '../logic/item';

export const healingPotion = new Item(
	'healingPotion001',
	'Healing Potion',
	ItemType.CONSUMABLE,
	'Restores 50 HP.',
	ItemRarity.COMMON,
	10,
	20
);

export const manaPotion = new Item(
	'manaPotion001',
	'Mana Potion',
	ItemType.CONSUMABLE,
	'Restores 30 MP.',
	ItemRarity.UNCOMMON,
	5,
	20
);

export const ironSword = new Item(
	'ironSword001',
	'Iron Sword',
	ItemType.WEAPON,
	'A basic sword made of iron.',
	ItemRarity.COMMON,
	1,
	1
);

export const leatherArmor = new Item(
	'leatherArmor001',
	'Leather Armor',
	ItemType.ARMOR,
	'Light armor made from leather.',
	ItemRarity.UNCOMMON,
	1,
	1
);

export const dragonEgg = new Item(
	'dragonEgg001',
	'Dragon Egg',
	ItemType.QUEST,
	'A rare item required to hatch a dragon.',
	ItemRarity.RARE,
	1,
	1
);

export const ironOre = new Item(
	'ironOre001',
	'Iron Ore',
	ItemType.MATERIAL,
	'Ore extracted from rocks, can be smelted into iron ingots.',
	ItemRarity.COMMON,
	20,
	64
);

export const magicHerb = new Item(
	'magicHerb001',
	'Magic Herb',
	ItemType.MATERIAL,
	'A magical herb used in potion crafting.',
	ItemRarity.UNCOMMON,
	15,
	30
);

export const goldCoin = new Item(
	'goldCoin001',
	'Gold Coin',
	ItemType.MATERIAL,
	'A coin made of gold, used for trading.',
	ItemRarity.COMMON,
	50,
	999
);

export const ancientScroll = new Item(
	'ancientScroll001',
	'Ancient Scroll',
	ItemType.QUEST,
	'An ancient scroll containing mysterious knowledge.',
	ItemRarity.EPIC,
	1,
	1
);

export const allItems = [
	healingPotion,
	manaPotion,
	ironSword,
	leatherArmor,
	dragonEgg,
	ironOre,
	magicHerb,
	goldCoin,
	ancientScroll,
];
