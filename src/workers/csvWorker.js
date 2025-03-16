import { parentPort, workerData } from "worker_threads"
import csvtojson from "csvtojson"
import xlsx from "xlsx"
import mongoose from "mongoose"
import dotenv from "dotenv"
import Agent from "../models/Agent.js"
import User from "../models/User.js"
import PolicyCategory from "../models/PolicyCategory.js"
import PolicyCarrier from "../models/PolicyCarrier.js"
import Policy from "../models/Policy.js"
import { toCamelCase } from "../utils/util.js"

dotenv.config()

if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

// **Maps to cache database records**
const agentCache = new Map()
const userCache = new Map()
const policyCategoryCache = new Map()
const policyCarrierCache = new Map()

// **Preload existing data into memory**
async function preloadData() {
  const [agents, users, policyCategories, policyCarriers] = await Promise.all([
    Agent.find().lean(),
    User.find().lean(),
    PolicyCategory.find().lean(),
    PolicyCarrier.find().lean(),
  ])

  agents.forEach((a) => agentCache.set(a.name, a._id))
  users.forEach((u) => userCache.set(u.userName, u._id))
  policyCategories.forEach((c) => policyCategoryCache.set(c.category_name, c._id))
  policyCarriers.forEach((c) => policyCarrierCache.set(c.carrier_name, c._id))
}

async function processRow(row, usersToInsert, policiesToInsert) {
  let agentId = agentCache.get(row.agent)
  if (!agentId) {
    const agent = await Agent.create({ name: row.agent })
    agentCache.set(row.agent, agent._id)
    agentId = agent._id
  }
  const userName = toCamelCase(row.firstname)
  let userId = userCache.get(userName)
  let user
  if (!userId) {
    user = await User.create({
      first_name: row.firstname,
      userName: userName,
      dob: row.dob,
      address: row.address,
      phone: row.phone,
      state: row.state,
      zip_code: row.zip,
      email: row.email || "",
      gender: row.gender || "",
      userType: row.userType,
    })
    userCache.set(user.userName, user._id)
  }

  let policyCategoryId = policyCategoryCache.get(row.category_name)
  if (!policyCategoryId) {
    const policyCategory = await PolicyCategory.create({ category_name: row.category_name })
    policyCategoryCache.set(row.category_name, policyCategory._id)
    policyCategoryId = policyCategory._id
  }

  let policyCarrierId = policyCarrierCache.get(row.company_name)
  if (!policyCarrierId) {
    const policyCarrier = await PolicyCarrier.create({ carrier_name: row.company_name })
    policyCarrierCache.set(row.company_name, policyCarrier._id)
    policyCarrierId = policyCarrier._id
  }

  policiesToInsert.push({
    policy_number: row.policy_number,
    policy_mode: row.policy_mode,
    premium_amount_written: row.premium_amount_written || 0,
    premium_amount: row.premium_amount || 0,
    policy_type: row.policy_type,
    policy_start_date: row.policy_start_date || null,
    policy_end_date: row.policy_end_date || null,
    category: policyCategoryId,
    carrier: policyCarrierId,
    user: user._id,
  })
}

async function processCSV() {
  await preloadData() 

  const fileExtension = workerData.filePath.split(".").pop().toLowerCase()
  let data
  if (fileExtension === "csv") {
    data = await csvtojson().fromFile(workerData.filePath)
  } else if (fileExtension === "xlsx") {
    const workbook = xlsx.readFile(workerData.filePath)
    const sheetName = workbook.SheetNames[0]
    data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])
  }

  const usersToInsert = []
  const policiesToInsert = []

  for (const row of data) {
    try {
      await processRow(row, usersToInsert, policiesToInsert)
    } catch (error) {
      console.error("Error processing row:", error)
    }
  }

  // **Bulk insert Users and Policies in one go**
  if (usersToInsert.length > 0) {
    const insertedUsers = await User.insertMany(usersToInsert)
    insertedUsers.forEach((u) => userCache.set(`${u.first_name}-${u.dob}`, u._id))
  }

  if (policiesToInsert.length > 0) {
    await Policy.insertMany(policiesToInsert)
  }
}

processCSV()
  .then(() => {
    parentPort.postMessage("CSV Processing completed")
    process.exit(0)
  })
  .catch((error) => {
    parentPort.postMessage(`Error: ${error.message}`)
    process.exit(1)
  })
