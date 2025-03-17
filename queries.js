const Query = {
  CREATE_ITEMS_TABLE: `
      CREATE TABLE IF NOT EXISTS items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL
      );
  `,
  CREATE_COMBINATIONS_TABLE: `
      CREATE TABLE IF NOT EXISTS combinations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          combination VARCHAR(255) NOT NULL
      );
  `,
  CREATE_RESPONSES_TABLE: `
      CREATE TABLE IF NOT EXISTS responses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          combination_id INT,
          FOREIGN KEY (combination_id) REFERENCES combinations(id)
      );
  `,
  DROP_RESPONSES_TABLE: 'DROP TABLE IF EXISTS responses;',
  DROP_COMBINATIONS_TABLE: 'DROP TABLE IF EXISTS combinations;',
  DROP_ITEMS_TABLE: 'DROP TABLE IF EXISTS items;',
  INSERT_COMBINATION: 'INSERT INTO combinations (combination) VALUES (?)',
  INSERT_RESPONSE: 'INSERT INTO responses (combination_id) VALUES (?)'
};

export default Query;
