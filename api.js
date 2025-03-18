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
    if (!items || !Array.isArray(items) || items.length === 0 || !length) {
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
        
        console.log('Generated combination:', prpCombin);
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
        await dbConn.release();// dbConn.release()
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
async function prepareCombination(items, length) {
  const result = [];
  const prepareTotalyItems = {};
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let index = 0;

  items.forEach(num => {
    const itemChar = chars[index++];
    prepareTotalyItems[itemChar] = [];
    for (let i = 1; i <= num; i++) {
      prepareTotalyItems[itemChar].push(`${itemChar}${i}`);
    }
  });

  const normalizeAndFilterRepeated = (reminedArray, beginOf, internalPreparedResult, finalResult) => {
    if (internalPreparedResult.length === length) {
      finalResult.push([...internalPreparedResult]);
      return;
    }
    let x = beginOf;
    while (x < reminedArray.length) {
      let y = 0;
      while (y < reminedArray[x].length) {
        internalPreparedResult.push(reminedArray[x][y]);
        normalizeAndFilterRepeated(reminedArray, x + 1, internalPreparedResult, finalResult);
        internalPreparedResult.pop();
        y++;
      }
      x++;
    }
  };

  normalizeAndFilterRepeated(Object.values(prepareTotalyItems), 0, [], result);

  return result;
}
// console.log('---------------------', prepareCombination([1, 2, 1], 2));
// console.log('---------------------', prepareCombination([1, 2, 1], 4));
// console.log('---------------------', prepareCombination([1, 2, 1], 1));
// console.log('---------------------', prepareCombination([1, 2, 7, 13], 4));

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}

export default app;
