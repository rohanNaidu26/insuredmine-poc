import Policy from '../models/Policy.js'
import User from '../models/User.js'
import PolicyCategory from "../models/PolicyCategory.js"
import PolicyCarrier from "../models/PolicyCarrier.js" 
import { toCamelCase } from '../utils/util.js'
import { AppError } from '../utils/errorHandler.js'

export const findPolicyByUsername = async (username) => {
  const userName = toCamelCase(username)
  const user = await User.findOne({ userName })
  if (!user) {
    throw new AppError(404,`No user found with userName ${username}`)
  }
  // Find policies for that user
  const policies = await Policy.find({ user: user._id })
    .populate('category')
    .populate('carrier')
    .populate('user')
  return policies
}

export const aggregatePoliciesByUser = async () => {
  const result = await Policy.aggregate([
    // Lookup user details
    {
      $lookup: {
        from: "users", // Collection name in MongoDB (lowercased & pluralized)
        localField: "user",
        foreignField: "_id",
        as: "userDetails"
      }
    },
    { $unwind: "$userDetails" }, // Convert userDetails array into object

    // Lookup category details
    {
      $lookup: {
        from: "policycategories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },

    // Lookup carrier details
    {
      $lookup: {
        from: "policycarriers",
        localField: "carrier",
        foreignField: "_id",
        as: "carrierDetails"
      }
    },
    { $unwind: { path: "$carrierDetails", preserveNullAndEmptyArrays: true } },

    // Group policies by user
    {
      $group: {
        _id: "$user", // Grouping by user ID
        user: { $first: "$userDetails" }, // Keep user details
        totalPolicies: { $sum: 1 }, // Count total policies
        totalPremiumAmount: { $sum: "$premium_amount" }, // Sum of premium amounts
        policies: {
          $push: {
            policy_number: "$policy_number",
            policy_type: "$policy_type",
            policy_start_date: "$policy_start_date",
            policy_end_date: "$policy_end_date",
            premium_amount: "$premium_amount",
            category: "$categoryDetails.category_name",
            carrier: "$carrierDetails.carrier_name"
          }
        }
      }
    },
    {
      $project: {
        _id: 0, // Hide MongoDB _id field
        user_id: "$_id",
        user_name: "$user.userName",
        email: "$user.email",
        totalPolicies: 1,
        totalPremiumAmount: 1,
        policies: 1
      }
    }
  ])

  return result
}
