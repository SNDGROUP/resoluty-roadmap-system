CREATE TABLE `phases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`pillar` enum('Google','Redes Sociais','GoHighLevel','Make.com','Ferramentas Complementares') NOT NULL,
	`description` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`color` varchar(7) NOT NULL DEFAULT '#1A237E',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phaseId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`pillar` enum('Google','Redes Sociais','GoHighLevel','Make.com','Ferramentas Complementares') NOT NULL,
	`assignee` varchar(255),
	`startDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`status` enum('A Fazer','Em Andamento','Concluído','Atrasado') NOT NULL DEFAULT 'A Fazer',
	`priority` enum('Baixa','Média','Alta','Crítica') NOT NULL DEFAULT 'Média',
	`progress` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `phases` ADD CONSTRAINT `phases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_phaseId_phases_id_fk` FOREIGN KEY (`phaseId`) REFERENCES `phases`(`id`) ON DELETE no action ON UPDATE no action;