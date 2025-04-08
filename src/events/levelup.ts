import { Api } from 'config/api';
import { branding } from 'config/config';

import type { IPlayerData } from 'types';

import { ChillyClient } from 'client';

import { EmbedBuilder } from 'discord.js';

/**
 * Returns the XP required to level up from the current level.
 * For this system, the required XP is (currentLevel + 1) * 100.
 *
 * @param currentLevel - The user's current level.
 * @returns The XP threshold needed for the next level.
 */
function xpThreshold(currentLevel: number): number {
	return (currentLevel + 1) * 100;
}

/**
 * Handles leveling up the user.
 * This function adds the earned XP to the user's total and then
 * checks if the XP exceeds the threshold(s) for one or more level-ups.
 * For each level-up, the required XP is subtracted and a level-up notification is sent.
 *
 * @param userData - The user's data.
 * @param xpEarned - The XP earned (must be non-negative).
 * @param client - The Discord client to fetch the user for the level-up message.
 * @returns The updated user data after processing XP and potential level-ups.
 *
 * @throws Will throw an error if xpEarned is negative.
 */
export async function handleLevelUp(
	userData: IPlayerData,
	client: ChillyClient
): Promise<IPlayerData> {
	while (userData.experiencepoints >= xpThreshold(userData.currentlevel)) {
		const requiredXPForNextLevel = xpThreshold(userData.currentlevel);
		userData.experiencepoints -= requiredXPForNextLevel;
		userData.currentlevel++;

		if (userData.levelupnotification) {
			await levelUpMessage(
				client,
				userData.currentlevel,
				userData.userid
			);
		}
	}

	const success = await Api.updatePlayer(userData.username, userData.userid, {
		currentlevel: userData.currentlevel,
		experiencepoints: userData.experiencepoints,
	});

	if (!success) {
		console.error('Failed to update player data in the database.');
	}

	return userData;
}

/**
 * Sends a level-up message to the user.
 * The message includes the new level and a congratulatory message.
 *
 * @param client - The Discord client to fetch the user.
 * @param level - The new level of the user.
 * @param userId - The user’s Discord ID to send the message to.
 * @returns A Promise that resolves when the message is sent.
 */
export async function levelUpMessage(
	client: ChillyClient,
	level: number,
	userId: string
): Promise<void> {
	const embed = new EmbedBuilder()
		.setTitle('🎉 Congratulations!')
		.setDescription(
			`You’ve reached Level **${level}**! Keep up the great work!`
		)
		.setColor(branding.AccentColor)
		.setTimestamp();

	try {
		const user = await client.users.fetch(userId);
		if (!user) {
			throw new Error(`User with ID ${userId} not found.`);
		}
		await user.send({ embeds: [embed] });
	} catch (error) {
		console.error(`Error sending level-up message to ${userId}:`, error);
	}
}
