import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Query from './queries.js';
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

export async function up() {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query(Query.CREATE_ITEMS_TABLE);
    await connection.query(Query.CREATE_COMBINATIONS_TABLE);
    await connection.query(Query.CREATE_RESPONSES_TABLE);
    await connection.end();
}

export async function down() {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query(Query.DROP_RESPONSES_TABLE);
    await connection.query(Query.DROP_COMBINATIONS_TABLE);
    await connection.query(Query.DROP_ITEMS_TABLE);
    await connection.end();
}

const command = process.argv[2] ?? 'up';
(async () => {
    try {
      switch (command) {
        case 'up':
          await up();
          console.log('Migration up completed');
          break;
        case 'down':
          await down();
          console.log('Migration down completed');
          break;
        default:
          console.log('Invalid command. Use "up" or "down".');
          break
      }
    } catch (err) {
        console.error(`Migration ${command} failed`, err);
    }
})();
