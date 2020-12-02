import { DomainSchemaModel } from "@starname-explorer/shared";
import { DefinedError } from "ajv";
import { Request, Response } from "express";

import validateDomainPageReq from "../../validators/domainPageRequest";

export class DomainsController {
  getDomains(req: Request, res: Response): void {
    console.log(req.query);
    if (!validateDomainPageReq(req.query)) {
      for (const err of validateDomainPageReq.errors as DefinedError[]) {
        console.log(err);
      }
      res.status(400).send(JSON.stringify(validateDomainPageReq.errors));
      return;
    }

    try {
      if (req.query.id != null) {
        const domainId = req.params.id;
        DomainSchemaModel.findWithPages(
          { _id: domainId },
          {
            page: 1,
            limit: 1,
            // populate: "starnames",
          },
        ).then(
          (page) => res.json(page),
          (reason) => console.error(reason),
        );
      } else {
        DomainSchemaModel.findWithPages(
          { $or: [{ domain: new RegExp(req.query.query) }, { admin: new RegExp(req.query.query) }] },
          {
            page: req.query.page,
            limit: req.query.limit,
            // populate: "starnames",
            sort: { [req.query.sortColumn]: req.query.sortOrder },
          },
        ).then(
          (page) => res.json(page),
          (reason) => console.error(reason),
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
}
