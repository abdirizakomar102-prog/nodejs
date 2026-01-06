import db from "../config/db.js";

export const getAllCustomersModel = (callback) => {
  const query = "SELECT * FROM customers";
  db.query(query, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

export const getCustomerByIdModel = (customerId, callback) => {
  const query = "SELECT * FROM customers WHERE id = ?";
  db.query(query, [customerId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

export const createCustomerModel = (data, callback) => {
  const query = "INSERT INTO customers(name,address,tell) values(?,?,?)";
  db.query(query, [data.name, data.address, data.tell], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

export const updateCustomerModel = (customerId, data, callback) => {
  const query = "UPDATE customers SET name = ?, address = ?, tell = ? WHERE id = ?";
  db.query(
    query,
    [data.name, data.address, data.tell, customerId],
    (err, results) => {
      if (err) {
        return callback(err, null);
        }
        callback(null, results);
    }
    );
};
export const deleteCustomerModel = (customerId, callback) => {
  const query = "DELETE FROM customers WHERE id = ?";
    db.query(query, [customerId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  }
    );
};

