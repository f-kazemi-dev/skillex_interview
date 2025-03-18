const Query = {
  CREATE_ITEMS_TABLE: `
      CREATE TABLE IF NOT EXISTS items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          items LONGTEXT NOT NULL,
          length INT NOT NULL,
          prepared_items LONGTEXT NOT NULL
      );
  `,
  CREATE_COMBINATIONS_TABLE: `
      CREATE TABLE IF NOT EXISTS combinations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          item_id INT NOT NULL,
          combinations LONGTEXT NOT NULL,
          FOREIGN KEY (item_id) REFERENCES items(id)
      );
  `,
  CREATE_RESPONSES_TABLE: `
      CREATE TABLE IF NOT EXISTS responses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          combination_id INT NOT NULL,
          response LONGTEXT NOT NULL,
          FOREIGN KEY (combination_id) REFERENCES combinations(id)
      );
  `,
  DROP_RESPONSES_TABLE: 'DROP TABLE IF EXISTS responses;',
  DROP_COMBINATIONS_TABLE: 'DROP TABLE IF EXISTS combinations;',
  DROP_ITEMS_TABLE: 'DROP TABLE IF EXISTS items;',
  INSERT_ITEMS: 'INSERT INTO items (items, length, prepared_items) VALUES (?, ?, ?)',
  INSERT_COMBINATION: 'INSERT INTO combinations (item_id, combinations) VALUES (?, ?)',
  INSERT_RESPONSE: 'INSERT INTO responses (combination_id, response) VALUES (?, ?)'
};

export default Query;
