import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Query from './queries.js';
dotenv.config();

const app = express();
app.use(bodyParser.json());

// SOURCE: https://sidorares.github.io/node-mysql2/docs#using-connection-pools
const dbPoolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) ?? 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

app.post('/generate', async (req, res) => {
  try {
    const { items, length } = req.body;
    if (!items || !length) {
        return res.status(400).send('Invalid input');
    }

    const [dbConn, prpCombin] = await Promise.all([
      dbConnection(),
      prepareCombination(items, length)
    ]);
  
    await dbConn.beginTransaction();
    return await new Promise(async (resolve, reject) => {
      try {
        const [result] = await dbConn.query(Query.INSERT_COMBINATION, [JSON.stringify(prpCombin)]);
        const combinationId = result.insertId;
        await dbConn.query(Query.INSERT_RESPONSE, [combinationId]);
        
        resolve([
          await dbConn.commit(),
          res.json({ id: combinationId, combination: prpCombin })
        ]);
      } catch (error) {
        console.error(error);
        reject([
          await dbConn.rollback(),
          res.status(500).send('Internal Server Error')
        ]);
      } finally {
        await dbConn.end();// dbConn.release()
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
})

async function dbConnection() {
  return await new Promise(async (resolve, reject) => {
    try {
      const pool = await mysql.createPool(dbPoolConfig);      
      resolve(await pool.getConnection());
    } catch (error) {
      reject(new Error(error));
    }
  });
}
async function prepareCombination(items, length) {// items = [1, 2, 3, 4, 5], length = 3
  const result = [];
  const prepareTotalyItems = {};
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let index = 0;

  items.forEach(num => {
    const itemChar = chars[index++];// because we have not 0
    prepareTotalyItems[itemChar] = [];
    for (let i = 1; i <= num; i++) {// because item have not 0 number
      prepareTotalyItems[itemChar].push(`${itemChar}${i}`);
    }
  });

  // -------> filter totaly items and ensure result have not repeated items
  const filterTotalyItems = (index, length, prefix, totalyItems) => {// here use closure function
    if (prefix.length === length * 2) { // Each item has 2 characters
      result.push(prefix);
      return;
    }

    if (index >= chars.length) {
      return;
    }

    const itemChar = chars[index];
    const items = totalyItems[itemChar];
    if (!items) {
      return;
    }

    for (let i = 0; i < items.length; i++) {
      filterTotalyItems(index + 1, length, prefix + items[i], totalyItems);
    }
  }

  console.log('prepareTotalyItems:', prepareTotalyItems);
  filterTotalyItems(0, length, '', prepareTotalyItems);
  console.log('result:', result);
  // <------- filter totaly items and ensure result have not repeated items

  return result;
}
console.log('---------------------', prepareCombination([1, 2, 1], 2));

const PORT = process.env.APP_PORT || 3000;
const HOST = process.env.APP_HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
