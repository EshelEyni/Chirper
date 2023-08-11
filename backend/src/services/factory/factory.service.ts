import { NextFunction, Request, Response } from "express";
import { APIFeatures, QueryObj, validateIds } from "../util/util.service";
import { AppError, asyncErrorCatcher, validatePatchRequestBody } from "../error/error.service";
import { Model as ModelType } from "mongoose";
import { logger } from "../logger/logger.service";

const getAll = (Model: ModelType<any>) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(Model.find(), req.query as QueryObj)
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

const getOne = (Model: ModelType<any>, popOptions?: string) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const { collectionName } = Model.collection;
    const dataName = collectionName.slice(0, collectionName.length - 1);
    const { id } = req.params;
    validateIds({ id, entityName: dataName });
    const query = Model.findById(id);
    if (popOptions) query.populate(popOptions);
    const doc = await query.exec();
    if (!doc) throw new AppError(`No ${dataName} was found with the id: ${id}`, 404);
    res.json({
      status: "success",
      data: doc,
    });
  });

const createOne = (Model: ModelType<any>) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

const updateOne = (Model: ModelType<any>, allowedFields?: string[]) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const { collectionName } = Model.collection;
    const dataName = collectionName.slice(0, collectionName.length - 1);
    const { id } = req.params;
    validateIds({ id, entityName: dataName });
    validatePatchRequestBody(req.body);
    if (allowedFields)
      for (const key in req.body) if (!allowedFields.includes(key)) delete req.body[key];

    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) throw new AppError(`No ${dataName} was found with the id: ${id}`, 404);

    res.json({
      status: "success",
      data: doc,
    });
  });

const deleteOne = (Model: ModelType<any>) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const { collectionName } = Model.collection;
    const dataName = collectionName.slice(0, collectionName.length - 1);
    const { id } = req.params;
    validateIds({ id, entityName: dataName });
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) throw new AppError(`No ${dataName} was found with the id: ${id}`, 404);
    logger.warn(`Deleted ${dataName} with id: ${id}`);

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

export { getAll, getOne, createOne, updateOne, deleteOne };
