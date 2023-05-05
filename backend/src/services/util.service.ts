import { Query } from "mongoose";
import { MiniUser, User } from "../../../shared/interfaces/user.interface";

export interface QueryString {
  [key: string]: string | undefined;
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
}

export class APIFeatures<T> {
  private query: Query<T[], T>;
  private queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): APIFeatures<T> {
    const queryObj: QueryString = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

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

export function getMiniUser(user: User): MiniUser {
  const { _id, username, fullname, imgUrl } = user;
  return { _id, username, fullname, imgUrl };
}
