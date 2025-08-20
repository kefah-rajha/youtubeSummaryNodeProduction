import { Request, Response } from 'express';
import { Tier } from '../models/subscriptionTiers';

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
export const tier = {
    /**
     * Gets all tiers. If the database is empty, it populates it with initial data.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    getTiers: async (req: Request, res: Response): Promise<void> => {
        try {
            // Count existing tier documents.
            const existingTiers: number = await Tier.countDocuments();

            if (existingTiers === 0) {
                // If no tiers exist, insert the initial data.
                const tiers = await Tier.insertMany(initialTiers);
                console.log(tiers, "tiers");
                res.status(200).json({
                    success: true,
                    count: tiers.length,
                    data: tiers
                });
            } else {
                // If tiers already exist, fetch them all.
                const tiers = await Tier.find().sort({ createdAt: 1 });
                res.status(200).json({
                    success: true,
                    count: tiers.length,
                    data: tiers
                });
            }
        } catch (error) {
            console.error('❌ Error seeding tiers:', error);
            res.status(500).json({ // Changed status to 500 for server-side errors.
                message: `❌ Error seeding tiers:, ${error}`,
                success: false
            });
        }
    },

    /**
     * Updates an existing tier by its database ID.
     * @param req The Express request object, containing the tier ID and update data.
     * @param res The Express response object.
     */
    updateTier: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Find and update the tier document. `new: true` returns the updated document.
            const updatedTier = await Tier.findOneAndUpdate(
                { _id: id },
                updateData,
                { new: true, runValidators: true }
            );
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
        } catch (error: any) {
            // Handle validation or other database errors.
            res.status(400).json({
                success: false,
                message: 'Error updating tier',
                error: error.message
            });
        }
    },

    /**
     * Deletes a tier by its `id` field.
     * @param req The Express request object, containing the tier ID.
     * @param res The Express response object.
     */
    deleteTier: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            
            // Find and delete the tier document.
            const deletedTier = await Tier.findOneAndDelete({ id: id });

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
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Error deleting tier',
                error: error.message
            });
        }
    },

    /**
     * Gets a single tier by its database `_id`.
     * @param req The Express request object, containing the tier ID.
     * @param res The Express response object.
     */
    getTier: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Find a single tier by its `_id`.
            const tier = await Tier.findOne({ _id: id });

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
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Error fetching tier',
                error: error.message
            });
        }
    },

    /**
     * Gets all tiers without any initial population logic.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    getAllTiers: async (req: Request, res: Response): Promise<void> => {
        try {
            // Find all tiers and sort them by creation date.
            const tiers = await Tier.find().sort({ createdAt: 1 });

            res.status(200).json({
                success: true,
                count: tiers.length,
                data: tiers
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Error fetching tiers',
                error: error.message
            });
        }
    }
};