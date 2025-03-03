import { ItemRarity, Item, ItemType } from '../logic/item';
import { ulid } from 'ulid';

const random_id = ulid();

export const healingPotion = new Item(
	random_id,
	'Healing Potion',
	ItemType.CONSUMABLE,
	'Restores 50 HP.',
	ItemRarity.COMMON,
	10,
	20
);

export const manaPotion = new Item(
	random_id,
	'Mana Potion',
	ItemType.CONSUMABLE,
	'Restores 30 MP.',
	ItemRarity.UNCOMMON,
	5,
	20
);

export const ironSword = new Item(
	random_id,
	'Iron Sword',
	ItemType.WEAPON,
	'A basic sword made of iron.',
	ItemRarity.COMMON,
	1,
	1
);

export const leatherArmor = new Item(
	random_id,
	'Leather Armor',
	ItemType.ARMOR,
	'Light armor made from leather.',
	ItemRarity.UNCOMMON,
	1,
	1
);

export const dragonEgg = new Item(
	random_id,
	'Dragon Egg',
	ItemType.QUEST,
	'A rare item required to hatch a dragon.',
	ItemRarity.RARE,
	1,
	1
);

export const ironOre = new Item(
	random_id,
	'Iron Ore',
	ItemType.MATERIAL,
	'Ore extracted from rocks, can be smelted into iron ingots.',
	ItemRarity.COMMON,
	20,
	64
);

export const magicHerb = new Item(
	random_id,
	'Magic Herb',
	ItemType.MATERIAL,
	'A magical herb used in potion crafting.',
	ItemRarity.UNCOMMON,
	15,
	30
);

export const goldCoin = new Item(
	random_id,
	'Gold Coin',
	ItemType.MATERIAL,
	'A coin made of gold, used for trading.',
	ItemRarity.COMMON,
	50,
	999
);

export const ancientScroll = new Item(
	random_id,
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
