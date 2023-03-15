import dotenv from "dotenv";
dotenv.config();

const development = {
  name: "development",
  db_url: process.env.MONGO_DEV_URL,
  jwt_secret: process.env.JWT_SECRET,
};

const production = {
  name: "production",
  db_url: process.env.MONGO_PROD_URL,
  jwt_secret: process.env.JWT_SECRET,
};

export default eval(process.env.NODE_ENV) == undefined
  ? development
  : eval(process.env.NODE_ENV);
