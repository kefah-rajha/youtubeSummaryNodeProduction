import User from '../models/user.auth.js';

export const user = {
    // Controller function to get a paginated list of all users.
    getAllUsers: async (req: any, res: any) => {
        try {
            // Parse pagination parameters from the request.
            const pageNumber = parseInt(req.params.pageNumber as string) || 1;
            const pageSize = parseInt(req.params.pageSize as string) || 10;
            const skipItems = (pageNumber - 1) * pageSize;
            console.log(skipItems, "skipItems");

            // Extract filtering, sorting, and searching parameters from the request body.
            const { fieldSort, sort, fieldSearch, searchInput, dateRange } = req.body;
            console.log(fieldSort, sort, fieldSearch, searchInput, "fieldSort");

            // Check if no filters, search, or sorting are applied.
            if (searchInput === "" && sort === "1" && dateRange.startDate === "" && dateRange.endDate === "") {
                console.log("test11");
                // If no filters are present, fetch users with simple pagination.
                const users = await User.find({}).populate("currentSubscriptionId").skip(skipItems)
                    .limit(pageSize);
                console.log(users, "user");

                return res.status(200).json({
                    success: true,
                    data: users,
                    message: 'Users retrieved successfully'
                });
            } else {
                console.log("test22");

                // Initialize an empty query object to build the search criteria.
                const query: any = {};

                // Apply a date range filter if provided.
                if (dateRange) {
                    if (dateRange.startDate || dateRange.endDate) {
                        query.createdAt = query.createdAt || {};

                        // Set the start date for the query.
                        if (dateRange.startDate) {
                            query.createdAt.$gte = new Date(dateRange.startDate);
                        } else {
                            query.createdAt.$gte = new Date('1970-01-01');
                        }

                        // Set the end date for the query.
                        if (dateRange.endDate) {
                            query.createdAt.$lte = new Date(dateRange.endDate);
                        } else {
                            query.createdAt.$lte = new Date();
                        }
                    }
                }

                // Apply a text search filter if a search input exists.
                console.log(searchInput, fieldSearch);
                if (searchInput) {
                    if (fieldSearch) {
                        // Search in a specific field. Case-insensitive regex search is used.
                        query[fieldSearch as string] = { $regex: searchInput, $options: 'i' };
                    } else {
                        // Default search in the 'name' field if no specific field is provided.
                        query.name = { $regex: searchInput, $options: 'i' };
                    }
                }

                // Build sorting options based on request body.
                const sortOptions: Record<string, 1 | -1> = {};
                if (fieldSort) {
                    sortOptions[fieldSort] = sort === '1' ? 1 : -1;
                }
                console.log(query);

                // Execute the query with all applied filters, sorting, and pagination.
                const users = await User
                    .find(query)
                    .populate("currentSubscriptionId")
                    .sort(sortOptions)
                    .skip(skipItems)
                    .limit(pageSize)
                    .lean(); // Use .lean() for faster execution with plain JavaScript objects.
                console.log(users, "user2");

                return res.status(200).json({
                    success: true,
                    data: users,
                    message: 'Users retrieved successfully'
                });
            }
        } catch (error: unknown) {
            // Handle and return any errors that occur during the process.
            return res.status(500).json({
                message: error,
                success: false,
            });
        }
    },

    // Controller function to get the total number of users.
    getNumberUsers: async (req: any, res: any) => {
        console.log("scss");
        User.countDocuments()
            .then((count) => {
                console.log(count);
                // Return the count of all user documents.
                res.status(200).json({
                    data: count,
                    success: true,
                });
            })
            .catch((err) => {
                // Handle and return any errors.
                return res.status(500).json({
                    message: err,
                    success: false,
                });
            });
    },
};