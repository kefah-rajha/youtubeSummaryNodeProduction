"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tier = void 0;
const subscriptionTiers_js_1 = require("../models/subscriptionTiers.js");
// Initial data to populate the database with if it's empty.
const initialTiers = [
    {
        name: 'Starter',
        id: 'starter',
        icon: '/assets/icons/price-tiers/free-icon.svg',
        description: 'Ideal for individuals who want to get started with simple design tasks.',
        features: ['1 workspace', 'Limited collaboration', 'Export to PNG and SVG'],
        featured: false,
        priceId: { month: '', year: '' },
    },
    {
        name: 'Pro',
        id: 'pro',
        icon: '/assets/icons/price-tiers/basic-icon.svg',
        description: 'Enhanced design tools for scaling teams who need more flexibility.',
        features: ['Integrations', 'Unlimited workspaces', 'Advanced editing tools', 'Everything in Starter'],
        featured: true,
        priceId: { month: '', year: '' },
    },
    {
        name: 'Advanced',
        id: 'advanced',
        icon: '/assets/icons/price-tiers/pro-icon.svg',
        description: 'Powerful tools designed for extensive collaboration and customization.',
        features: [
            'Single sign on (SSO)',
            'Advanced version control',
            'Assets library',
            'Guest accounts',
            'Everything in Pro',
        ],
        featured: false,
        priceId: { month: '', year: '' },
    },
];
// Controller for tier-related operations.
exports.tier = {
    /**
     * Gets all tiers. If the database is empty, it populates it with initial data.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    getTiers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Count existing tier documents.
            const existingTiers = yield subscriptionTiers_js_1.Tier.countDocuments();
            if (existingTiers === 0) {
                // If no tiers exist, insert the initial data.
                const tiers = yield subscriptionTiers_js_1.Tier.insertMany(initialTiers);
                console.log(tiers, "tiers");
                res.status(200).json({
                    success: true,
                    count: tiers.length,
                    data: tiers
                });
            }
            else {
                // If tiers already exist, fetch them all.
                const tiers = yield subscriptionTiers_js_1.Tier.find().sort({ createdAt: 1 });
                res.status(200).json({
                    success: true,
                    count: tiers.length,
                    data: tiers
                });
            }
        }
        catch (error) {
            console.error('❌ Error seeding tiers:', error);
            res.status(500).json({
                message: `❌ Error seeding tiers:, ${error}`,
                success: false
            });
        }
    }),
    /**
     * Updates an existing tier by its database ID.
     * @param req The Express request object, containing the tier ID and update data.
     * @param res The Express response object.
     */
    updateTier: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const updateData = req.body;
            // Find and update the tier document. `new: true` returns the updated document.
            const updatedTier = yield subscriptionTiers_js_1.Tier.findOneAndUpdate({ _id: id }, updateData, { new: true, runValidators: true });
            console.log(updatedTier, "updateData");
            if (!updatedTier) {
                res.status(404).json({
                    success: false,
                    message: 'Tier not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Tier updated successfully',
                data: updatedTier
            });
        }
        catch (error) {
            // Handle validation or other database errors.
            res.status(400).json({
                success: false,
                message: 'Error updating tier',
                error: error.message
            });
        }
    }),
    /**
     * Deletes a tier by its `id` field.
     * @param req The Express request object, containing the tier ID.
     * @param res The Express response object.
     */
    deleteTier: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            // Find and delete the tier document.
            const deletedTier = yield subscriptionTiers_js_1.Tier.findOneAndDelete({ id: id });
            if (!deletedTier) {
                res.status(404).json({
                    success: false,
                    message: 'Tier not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Tier deleted successfully',
                data: deletedTier
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting tier',
                error: error.message
            });
        }
    }),
    /**
     * Gets a single tier by its database `_id`.
     * @param req The Express request object, containing the tier ID.
     * @param res The Express response object.
     */
    getTier: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            // Find a single tier by its `_id`.
            const tier = yield subscriptionTiers_js_1.Tier.findOne({ _id: id });
            if (!tier) {
                res.status(404).json({
                    success: false,
                    message: 'Tier not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: tier
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching tier',
                error: error.message
            });
        }
    }),
    /**
     * Gets all tiers without any initial population logic.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    getAllTiers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Find all tiers and sort them by creation date.
            const tiers = yield subscriptionTiers_js_1.Tier.find().sort({ createdAt: 1 });
            res.status(200).json({
                success: true,
                count: tiers.length,
                data: tiers
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching tiers',
                error: error.message
            });
        }
    })
};
