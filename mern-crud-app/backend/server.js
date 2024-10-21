const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'D:/mern_projects/mern-crud-app/backend/uploads'); // Path where files will be saved
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Add a unique timestamp to avoid file name conflicts
    },
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
      const fileTypes = /jpeg|jpg|png|gif/; // Supported file extensions
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = fileTypes.test(file.mimetype);

      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb('Error: Only images are allowed'); // Reject files that don't match
      }
    }
  });
  app.use('/uploads', express.static('D:/mern_projects/mern-crud-app/backend/uploads'));

// MongoDB connection URI
const uri = 'mongodb://localhost:27017/users'; // Adjust the database name accordingly

// Connect to MongoDB
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
.then(() => {
    console.log('MongoDB database connection established successfully');
})
.catch(err => console.error('MongoDB connection error:', err));

// Personal Information Schema Creation
const customerInfoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile_number: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    gender: { type: String, required: true },
    hobbie: { type: [String], required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    file: { type: String, required: true },
}, { timestamps: true });

const CustomerInfo = mongoose.model('CustomerInfo', customerInfoSchema);

// Set up storage engine for multer


// Set up multer


// Routes

// Add new personal info
app.post('/personal_info/add', upload.single('file'), async (req, res) => {
    debugger;

    console.log('Request body:', req.body); // Log the request body
    let hobbiesArray;
    try {
        hobbiesArray = JSON.parse(req.body.hobbie);
    } catch (error) {
        return res.status(400).json({ error: 'Invalid hobbie format' });
    }



    const newCustomerInfo = new CustomerInfo({
        name: req.body.name,
        email: req.body.email,
        mobile_number: req.body.mobile_number,
        city: req.body.city,
        state: req.body.state,
        gender: req.body.gender,
        hobbie: hobbiesArray, // Save the array directly
        address: req.body.address,
        pincode: req.body.pincode,
        file: req.file ? req.file.filename : null,
    });

    newCustomerInfo.save()
        .then(customerInfo => res.status(201).json(customerInfo))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Get all personal info entries
app.get('/personal_info', (req, res) => {
    debugger;
    CustomerInfo.find()
        .then(customerInfos => res.json(customerInfos))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Edit personal info
app.put('/personal_info/edit/:id', upload.single('file'), (req, res) => {
    const customerInfoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(customerInfoId)) {
        return res.status(400).json({ error: 'Invalid Personal Info ID' });
    }

    // Parse hobbie if it's in JSON string format
    let hobbiesArray;
    try {
        hobbiesArray = JSON.parse(req.body.hobbie);
    } catch (error) {
        return res.status(400).json({ error: 'Invalid hobbie format' });
    }

    const updatedData = {
        name: req.body.name,
        email: req.body.email,
        mobile_number: req.body.mobile_number,
        city: req.body.city,
        state: req.body.state,
        gender: req.body.gender,
        hobbie: hobbiesArray, // Save the array directly
        address: req.body.address,
        pincode: req.body.pincode,
        file: req.file ? req.file.filename : null, // Save new filename if file is uploaded
    };

    CustomerInfo.findByIdAndUpdate(customerInfoId, updatedData, { new: true })
        .then(updatedCustomerInfo => {
            if (!updatedCustomerInfo) {
                return res.status(404).json({ error: 'Personal info not found' });
            }
            res.json(updatedCustomerInfo);
        })
        .catch(err => res.status(500).json('Error: ' + err));
});



// Delete personal info
app.delete('/personal_info/delete/:id', (req, res) => {
    const customerInfoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(customerInfoId)) {
        return res.status(400).json({ error: 'Invalid Personal Info ID' });
    }

    CustomerInfo.findByIdAndDelete(customerInfoId)
        .then(deletedCustomerInfo => {
            if (!deletedCustomerInfo) {
                return res.status(404).json({ error: 'Customer info not found' });
            }
            res.json({ message: 'Personal info deleted successfully' });
        })
        .catch(err => res.status(500).json({ error: 'Server error', details: err }));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
