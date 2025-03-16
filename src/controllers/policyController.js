import { findPolicyByUsername, aggregatePoliciesByUser } from '../services/policyService.js'
import { AppError } from '../utils/errorHandler.js'

export const getPolicyByUsername = async (req, res, next) => {
  try {
    const { username } = req.query
    if (!username) {
      throw new AppError(400, "username query parameter is required" )
    }
    const policy = await findPolicyByUsername(username)
    res.status(200).json(policy)
  } catch (error) {
    next(error)
  }
}

export const getAggregatedPolicies = async (req, res, next) => {
  try {
    const aggregatedData = await aggregatePoliciesByUser()
    res.status(200).json(aggregatedData)
  } catch (error) {
    next(error)
  }
}
