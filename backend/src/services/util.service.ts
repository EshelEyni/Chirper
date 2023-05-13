import { Query } from "mongoose";
import nodemailer from "nodemailer";
import config from "../config/index";

export interface QueryString {
  [key: string]: string | undefined;
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = { [key: string]: any };

const filterObj = (obj: AnyObject, ...allowedFields: string[]): AnyObject => {
  return Object.keys(obj).reduce((newObj: AnyObject, key: string) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
    return newObj;
  }, {} as AnyObject);
};

class APIFeatures<T> {
  private query: Query<T[], T>;
  private queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): APIFeatures<T> {
    const queryObj: QueryString = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach(el => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort(): APIFeatures<T> {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt _id");
    }

    return this;
  }

  limitFields(): APIFeatures<T> {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate(): APIFeatures<T> {
    const page = parseInt(this.queryString.page ?? "1", 10);
    const limit = parseInt(this.queryString.limit ?? "100", 10);
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

export { APIFeatures, sendEmail, filterObj };
