// 1. Import file pendukung dan queue untuk memanggil sendEvent
const { sendEvent } = require("../config/queue");
const CustomerModel = require("../models/customerModel");
const ProductModel = require("../models/productModel");
const transactionModel = require("../models/transactionModel"); // Tetap mengarah ke model transaksi kamu

const transactionController = {
  
  // === 1. Mengambil Semua Data Transaksi (Halaman 14-16 PDF) ===
  getAllTransactions: async (req, res) => {
    try {
      const transactionItems = await transactionModel.getAll();
      if (transactionItems.length === 0) {
        return res.status(200).json([]); // Transaksi kosong
      }

      // Mengelompokkan item ke dalam transaksi yang sesuai dan mengambil detail produk lokal
      const transactionsMap = new Map();
      const productDetailPromises = []; 

      transactionItems.forEach((item) => {
        if (!transactionsMap.has(item.id)) {
          transactionsMap.set(item.id, {
            id: item.id,
            customer_id: item.customer_id,
            total_amount: item.total_amount,
            status: item.status,
            transaction_date: item.transaction_date,
            items: [],
          });
        }
        
        // Simpan promise untuk mengambil detail nama produk lokal
        productDetailPromises.push(
          (async () => {
            try {
              const product = await ProductModel.findById(item.product_id);
              return {
                item_id: item.item_id,
                product_id: item.product_id,
                product_name: product ? product.name : "Unknown Product",
                quantity: item.quantity,
                price_per_item: item.price_per_item,
              };
            } catch (productError) {
              console.warn(`Could not fetch product details for ID ${item.product_id}:`, productError.message);
              return {
                item_id: item.item_id,
                product_id: item.product_id,
                product_name: "Product Not Found / Service Error",
                quantity: item.quantity,
                price_per_item: item.price_per_item,
              };
            }
          })()
        );
      });

      // Jalankan semua promise pengambilan detail produk secara paralel
      const resolvedProductDetails = await Promise.all(productDetailPromises);
      
      let detailIndex = 0;
      transactionItems.forEach((item) => {
        const transaction = transactionsMap.get(item.id);
        if (transaction) {
          transaction.items.push(resolvedProductDetails[detailIndex]);
        }
        detailIndex++;
      });

      return res.status(200).json(Array.from(transactionsMap.values()));
    } catch (error) {
      console.error("Error getting all transactions:", error.message);
      return res.status(500).json({
        message: "Error getting all transactions",
        error: error.message,
      });
    }
  },

  // === 2. Fungsi Membuat Transaksi Baru (Halaman 8-10 PDF) ===
  createTransaction: async (req, res) => {
    const { customerId, items } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Customer ID and transaction items are required" });
    }

    try {
      // [Langkah 1]: Validasi Customer dengan database lokal baru
      const customer = await CustomerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found in Customer Service (Local)" });
      }

      let totalAmount = 0;
      const processedItems = [];

      // [Langkah 2]: Validasi Produk dan trigger kurangi stok ke Product Service lewat RabbitMQ
      for (const item of items) {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }

        // Catatan: Karena tabel replika products di database transaksi praktikum ini tidak mencatat field stock,
        // validasi kecukupan stok dilewati/dikontrol langsung oleh Product Service di background via antrean.
        totalAmount += item.pricePerItem * item.quantity;
        
        processedItems.push({
          productId: product.id,
          quantity: item.quantity,
          pricePerItem: item.pricePerItem,
        });

        // Kirim event asinkronus ke RabbitMQ agar Product Service mengurangi stoknya
        await sendEvent("UPDATE_PRODUCT_STOCK", {
          id: product.id,
          stock: item.quantity, // Mengirim jumlah kuantitas yang dibeli untuk dikurangi
        });
      }

      // [Langkah 3]: Buat Record Transaksi Utama
      const transactionId = await transactionModel.createTransaction(
        customerId,
        totalAmount,
        "pending"
      );

      // [Langkah 4]: Tambahkan Item Transaksi ke tabel transaction_itemss
      for (const item of processedItems) {
        await transactionModel.addTransactionItem(
          transactionId,
          item.productId,
          item.quantity,
          item.pricePerItem
        );
      }

      return res.status(201).json({ message: "Transaction created successfully", transactionId });
    } catch (error) {
      console.error("Error creating transaction:", error.message);
      return res.status(500).json({ message: "Error creating transaction", error: error.message });
    }
  },

  // === 3. Mengambil Detail Transaksi Berdasarkan ID (Halaman 10-11 PDF) ===
  getTransactionById: async (req, res) => {
    const { id } = req.params;
    try {
      const transactionItems = await transactionModel.findById(id);
      if (!transactionItems || transactionItems.length === 0) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Ambil detail nama produk untuk setiap item secara paralel dari model lokal
      const itemsWithProductDetails = await Promise.all(
        transactionItems.map(async (item) => {
          try {
            const product = await ProductModel.findById(item.product_id);
            return {
              item_id: item.item_id,
              product_id: item.product_id,
              product_name: product ? product.name : "Unknown Product", 
              quantity: item.quantity,
              price_per_item: item.price_per_item,
            };
          } catch (productError) {
            console.warn(`Could not fetch product details for ID ${item.product_id}:`, productError.message);
            return {
              item_id: item.item_id,
              product_id: item.product_id,
              product_name: "Product Not Found / Service Error",
              quantity: item.quantity,
              price_per_item: item.price_per_item,
            };
          }
        })
      );

      const transaction = {
        id: transactionItems[0].id,
        customer_id: transactionItems[0].customer_id,
        total_amount: transactionItems[0].total_amount,
        status: transactionItems[0].status,
        transaction_date: transactionItems[0].transaction_date,
        items: itemsWithProductDetails,
      };

      return res.status(200).json(transaction);
    } catch (error) {
      console.error("Error getting transaction by ID:", error.message);
      return res.status(500).json({ message: "Error getting transaction", error: error.message });
    }
  },

  // === 4. Mengambil Transaksi Berdasarkan Customer ID (Halaman 11-13 PDF) ===
  getTransactionsByCustomerId: async (req, res) => {
    const { customerId } = req.params;
    try {
      const transactionItems = await transactionModel.findByCustomerId(customerId);
      if (!transactionItems || transactionItems.length === 0) {
        return res.status(404).json({ message: "No transactions found for this customer" });
      }

      const transactionsMap = new Map();
      const productDetailPromises = [];

      transactionItems.forEach((item) => {
        if (!transactionsMap.has(item.id)) {
          transactionsMap.set(item.id, {
            id: item.id,
            customer_id: item.customer_id,
            total_amount: item.total_amount,
            status: item.status,
            transaction_date: item.transaction_date,
            items: [],
          });
        }
        
        productDetailPromises.push(
          (async () => {
            try {
              const product = await ProductModel.findById(item.product_id);
              return {
                item_id: item.item_id,
                product_id: item.product_id,
                product_name: product ? product.name : "Unknown Product",
                quantity: item.quantity,
                price_per_item: item.price_per_item,
              };
            } catch (productError) {
              console.warn(`Could not fetch product details for ID ${item.product_id}:`, productError.message);
              return {
                item_id: item.item_id,
                product_id: item.product_id,
                product_name: "Product Not Found / Service Error",
                quantity: item.quantity,
                price_per_item: item.price_per_item,
              };
            }
          })()
        );
      });

      const resolvedProductDetails = await Promise.all(productDetailPromises);
      
      let detailIndex = 0;
      transactionItems.forEach((item) => {
        const transaction = transactionsMap.get(item.id);
        if (transaction) {
          transaction.items.push(resolvedProductDetails[detailIndex]);
        }
        detailIndex++;
      });

      return res.status(200).json(Array.from(transactionsMap.values()));
    } catch (error) {
      console.error("Error getting transactions by customer ID:", error.message);
      return res.status(500).json({ message: "Error getting transactions", error: error.message });
    }
  },

  // === 5. Memperbarui Status Transaksi (Halaman 13-14 PDF) ===
  updateTransactionStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }
    
    try {
      const affectedRows = await transactionModel.updateStatus(id, status);
      if (affectedRows === 0) {
        return res.status(404).json({ message: "Transaction not found or no changes made" });
      }
      return res.status(200).json({ message: "Transaction status updated successfully" });
    } catch (error) {
      console.error("Error updating transaction status:", error);
      return res.status(500).json({ message: "Error updating transaction status" });
    }
  }
};

module.exports = transactionController;