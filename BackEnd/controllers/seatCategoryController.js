const SeatCategory = require("../models/SeatCategory");

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await SeatCategory.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const existingCategory = await SeatCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = new SeatCategory({ name });
        await category.save();

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error: error.message });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await SeatCategory.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error: error.message });
    }
};

// Seed initial categories if none exist
exports.seedCategories = async () => {
    try {
        const count = await SeatCategory.countDocuments();
        if (count === 0) {
            const initialCategories = [
                "Central Longside Lower",
                "Longside Lower",
                "Shortside Lower",
                "Central Longside Upper",
                "Longside Upper",
                "Shortside Upper",
                "Away Section",
                "VIP Packages"
            ];

            await SeatCategory.insertMany(initialCategories.map(name => ({ name })));
            console.log("Seeded initial seat categories");
        }
    } catch (error) {
        console.error("Error seeding categories:", error);
    }
};
