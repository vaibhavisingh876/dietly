import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    quantity: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const pantrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fridge: {
      type: [itemSchema],
      default: [],
      validate: {
        validator: (items) => items.length <= 50,
        message: "Fridge cannot contain more than 50 items.",
      },
    },

    kitchen: {
      type: [itemSchema],
      default: [],
      validate: {
        validator: (items) => items.length <= 50,
        message: "Kitchen cannot contain more than 50 items.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// One pantry document per user.
pantrySchema.index(
  { userId: 1 },
  { unique: true }
);

export default mongoose.model(
  "Pantry",
  pantrySchema
);