import mongoose, { FilterQuery, Model, Query, Document } from "mongoose";
import nodemailer from "nodemailer";
import config from "../../config/index";

export interface QueryObj {
  [key: string]: string | undefined;
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = { [key: string]: any };

const filterObj = (obj: AnyObject, ...allowedFields: string[]): AnyObject => {
  if (allowedFields.length === 0) return obj;
  return Object.keys(obj).reduce((newObj: AnyObject, key: string) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
    return newObj;
  }, {} as AnyObject);
};

class APIFeatures<T> {
  private query: Query<T[], T>;
  private queryObj: QueryObj;

  constructor(query: Query<T[], T>, queryString: QueryObj) {
    this.query = query;
    this.queryObj = queryString;
  }

  filter(): APIFeatures<T> {
    const queryObj: QueryObj = { ...this.queryObj };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach(el => delete queryObj[el]);
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt|exists)\b/g,
      match => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort(): APIFeatures<T> {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt _id");
    }

    return this;
  }

  limitFields(): APIFeatures<T> {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate(): APIFeatures<T> {
    const page = parseInt(this.queryObj.page ?? "1", 10);
    const limit = parseInt(this.queryObj.limit ?? "100", 10);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  getQuery(): Query<T[], T> {
    return this.query;
  }
}

const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  const transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    auth: {
      user: config.emailUsername,
      pass: config.emailPassword,
    },
  });

  const mailOptions = {
    from: "Chirper <Chirper.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transporter.sendMail(mailOptions);
};

async function queryEntityExists<T extends Document>(
  model: Model<T>,
  query: FilterQuery<T>
): Promise<boolean> {
  return !!(await model.exists(query));
}

function isValidId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export { AnyObject, APIFeatures, sendEmail, filterObj, queryEntityExists, isValidId };
