const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    department: {
      type: String,
      required: [true, 'Please add a department'],
      trim: true,
      default: 'General',
    },
    designation: {
      type: String,
      required: [true, 'Please add a designation'],
      trim: true,
      default: 'Associate',
    },
    mobile: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\d{10}$/.test(v);
        },
        message: 'Mobile number must be exactly 10 digits',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
