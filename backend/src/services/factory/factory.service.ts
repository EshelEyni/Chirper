import { NextFunction, Request, Response } from "express";
import { APIFeatures, QueryObj, validateIds } from "../util/util.service";
import { AppError, asyncErrorCatcher, validatePatchRequestBody } from "../error/error.service";
import { Model } from "mongoose";
import { logger } from "../logger/logger.service";

const getAll = (model: Model<any>) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(model.find(), req.query as QueryObj)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.getQuery();

    res.json({
      status: "success",
      requestedAt: new Date().toISOString(),
      results: docs.length,
      data: docs,
    });
  });

const getOne = (model: Model<any>, popOptions?: string) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const { collectionName } = model.collection;
    const dataName = collectionName.slice(0, collectionName.length - 1);
    const { id } = req.params;
    validateIds({ id, entityName: dataName });
    const query = model.findById(id);
    if (popOptions) query.populate(popOptions);
    const doc = await query.exec();
    if (!doc) throw new AppError(`No ${dataName} was found with the id: ${id}`, 404);
    res.json({
      status: "success",
      data: doc,
    });
  });

const createOne = (model: Model<any>) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

const updateOne = (model: Model<any>, allowedFields?: string[]) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const { collectionName } = model.collection;
    const dataName = collectionName.slice(0, collectionName.length - 1);
    const { id } = req.params;
    validateIds({ id, entityName: dataName });
    validatePatchRequestBody(req.body);
    if (allowedFields)
      for (const key in req.body) if (!allowedFields.includes(key)) delete req.body[key];

    const doc = await model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) throw new AppError(`No ${dataName} was found with the id: ${id}`, 404);

    res.json({
      status: "success",
      data: doc,
    });
  });

const deleteOne = (model: Model<any>) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const { collectionName } = model.collection;
    const dataName = collectionName.slice(0, collectionName.length - 1);
    const { id } = req.params;
    validateIds({ id, entityName: dataName });
    const doc = await model.findByIdAndDelete(id);
    if (!doc) throw new AppError(`No ${dataName} was found with the id: ${id}`, 404);
    logger.warn(`Deleted ${dataName} with id: ${id}`);

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

export { getAll, getOne, createOne, updateOne, deleteOne };
