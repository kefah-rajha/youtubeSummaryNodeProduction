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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const user_auth_js_1 = __importDefault(require("../models/user.auth.js"));
exports.user = {
    // Controller function to get a paginated list of all users.
    getAllUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Parse pagination parameters from the request.
            const pageNumber = parseInt(req.params.pageNumber) || 1;
            const pageSize = parseInt(req.params.pageSize) || 10;
            const skipItems = (pageNumber - 1) * pageSize;
            console.log(skipItems, "skipItems");
            // Extract filtering, sorting, and searching parameters from the request body.
            const { fieldSort, sort, fieldSearch, searchInput, dateRange } = req.body;
            console.log(fieldSort, sort, fieldSearch, searchInput, "fieldSort");
            // Check if no filters, search, or sorting are applied.
            if (searchInput === "" && sort === "1" && dateRange.startDate === "" && dateRange.endDate === "") {
                console.log("test11");
                // If no filters are present, fetch users with simple pagination.
                const users = yield user_auth_js_1.default.find({}).populate("currentSubscriptionId").skip(skipItems)
                    .limit(pageSize);
                console.log(users, "user");
                return res.status(200).json({
                    success: true,
                    data: users,
                    message: 'Users retrieved successfully'
                });
            }
            else {
                console.log("test22");
                // Initialize an empty query object to build the search criteria.
                const query = {};
                // Apply a date range filter if provided.
                if (dateRange) {
                    if (dateRange.startDate || dateRange.endDate) {
                        query.createdAt = query.createdAt || {};
                        // Set the start date for the query.
                        if (dateRange.startDate) {
                            query.createdAt.$gte = new Date(dateRange.startDate);
                        }
                        else {
                            query.createdAt.$gte = new Date('1970-01-01');
                        }
                        // Set the end date for the query.
                        if (dateRange.endDate) {
                            query.createdAt.$lte = new Date(dateRange.endDate);
                        }
                        else {
                            query.createdAt.$lte = new Date();
                        }
                    }
                }
                // Apply a text search filter if a search input exists.
                console.log(searchInput, fieldSearch);
                if (searchInput) {
                    if (fieldSearch) {
                        // Search in a specific field. Case-insensitive regex search is used.
                        query[fieldSearch] = { $regex: searchInput, $options: 'i' };
                    }
                    else {
                        // Default search in the 'name' field if no specific field is provided.
                        query.name = { $regex: searchInput, $options: 'i' };
                    }
                }
                // Build sorting options based on request body.
                const sortOptions = {};
                if (fieldSort) {
                    sortOptions[fieldSort] = sort === '1' ? 1 : -1;
                }
                console.log(query);
                // Execute the query with all applied filters, sorting, and pagination.
                const users = yield user_auth_js_1.default
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
        }
        catch (error) {
            // Handle and return any errors that occur during the process.
            return res.status(500).json({
                message: error,
                success: false,
            });
        }
    }),
    // Controller function to get the total number of users.
    getNumberUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("scss");
        user_auth_js_1.default.countDocuments()
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
    }),
};
