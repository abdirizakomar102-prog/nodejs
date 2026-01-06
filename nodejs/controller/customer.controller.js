import {
  getAllCustomersModel,
  getCustomerByIdModel,
  createCustomerModel,
  updateCustomerModel,
  deleteCustomerModel
} from "../model/customer.model.js";
export const getAllCustomers = (req, res) => {
  getAllCustomersModel((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
};

export const getCustomerById = (req, res) => {
  const customerId = req.params.id;
  getCustomerByIdModel(customerId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(results[0]);
  });
};

export const createCustomer = (req, res) => {
  const body = req.body;
  createCustomerModel(body, (err, results) => {
    console.log(body)
    if (err) {
      return res.status(500).json({ error: "Database insert error" });
    }
    res
      .status(201)
      .json({ message: "Customer created successfully", customerId: results.insertId });
  });
};


export const updateCustomer = (req, res) => {
  const customerId = req.params.id;
  const body = req.body;
  updateCustomerModel(customerId, body, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database update error" });
    }
    res.json({ message: "Customer updated successfully" });
  });
};

export const deleteCustomer = (req, res) => {
  const customerId = req.params.id;
  deleteCustomerModel(customerId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database delete error" });
    }
    res.json({ message: "Customer deleted successfully" });
  });
};
