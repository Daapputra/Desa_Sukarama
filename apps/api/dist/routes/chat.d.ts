import { FastifyInstance } from 'fastify';
export declare function stripMarkdown(text: string): string;
export declare function hasRepetitionLoop(text: string): boolean;
export declare function chatRoutes(fastify: FastifyInstance): Promise<void>;
