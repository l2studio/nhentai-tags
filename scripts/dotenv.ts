import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({
  path: path.resolve(__dirname, '..', '.env'),
  debug: undefined
})

const override = path.resolve(__dirname, '..', '.env.override')
if (fs.existsSync(override)) {
  const config = dotenv.parse(fs.readFileSync(override))
  for (const key in config) {
    // noinspection JSUnfilteredForInLoop
    process.env[key] = config[key]
  }
}
