import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Sequelize from 'sequelize'
import process from 'process'

const __filename = fileURLToPath(import.meta.url)
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const configPath = path.join(path.dirname(__filename), '../config/config.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))[env]
const db = {}

let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

const files = fs.readdirSync(path.dirname(__filename)).filter((file) => {
  return (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  )
})

for (const file of files) {
  const model = (await import(`./${file}`)).default(
    sequelize,
    Sequelize.DataTypes,
  )
  db[model.name] = model
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db
